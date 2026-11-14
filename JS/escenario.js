// ===== Escenario pixel-art =====
// Dibuja el fondo en un canvas de baja resolución (320x180) que el CSS escala con
// "image-rendering: pixelated". Cambia según la hora (día/noche) y el clima:
//   despejado, nublado, niebla, lluvia, nieve y tormenta (con relámpagos).
const Escenario = (() => {
  const W = 320, H = 180;
  let canvas, ctx, pal;
  let estado = { esDia: true, categoria: "despejado", intensidad: 2, decor: "campo" };
  let particulas = [], nubes = [], estrellas = [];
  let cuadro = 0, relampago = 0, proximoRelampago = 60, rayo = null;

  // ---------- Colores ----------
  const aRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const aHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const mezclar = (a, b, t) => {
    const x = aRgb(a), y = aRgb(b);
    return aHex(x.map((v, i) => v + (y[i] - v) * t));
  };

  function crearPaleta(esDia, cat) {
    const base = esDia
      ? { cieloA: "#5fb4ee", cieloB: "#cdeefc", lejos: "#8fd0a4", cerca: "#5faa6e", suelo: "#59a867", sueloOsc: "#3f8a54",
          tronco: "#7a4a2a", copa: "#3f9a55", copaClara: "#5cba6c", piedra: "#cfc8e8", nube: "#ffffff", astro: "#ffe27a", luz: "#ffffff" }
      : { cieloA: "#1b1448", cieloB: "#5d3f93", lejos: "#3a3a78", cerca: "#2c2f66", suelo: "#2f5a5e", sueloOsc: "#223f4f",
          tronco: "#3d2748", copa: "#25405e", copaClara: "#2f5576", piedra: "#5a4f96", nube: "#6a5a9e", astro: "#fff2c2", luz: "#ffe27a" };
    const gris = esDia ? "#8f9bab" : "#27263f";
    const t = { despejado: 0, nublado: 0.55, niebla: 0.35, lluvia: 0.65, nieve: 0.4, tormenta: 0.85 }[cat] || 0;
    const p = { ...base };
    ["cieloA", "cieloB", "lejos", "cerca", "suelo", "sueloOsc", "copa", "copaClara", "nube"].forEach((k) => {
      p[k] = mezclar(base[k], gris, t);
    });
    if (cat === "nieve") { // el suelo y las colinas se cubren de blanco
      p.suelo = mezclar(p.suelo, "#f2f7ff", 0.75);
      p.sueloOsc = mezclar(p.sueloOsc, "#d7e4f4", 0.7);
      p.cerca = mezclar(p.cerca, "#e8f0fb", 0.6);
      p.lejos = mezclar(p.lejos, "#dfe9f7", 0.55);
      p.nube = mezclar(p.nube, "#ffffff", 0.4);
    }
    return p;
  }

  // ---------- Elementos ----------
  function aleatorioSemilla(semilla) { // generador repetible para posiciones fijas
    let s = semilla;
    return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  }

  function crearElementos() {
    const r = aleatorioSemilla(7);
    estrellas = Array.from({ length: 70 }, () => ({ x: Math.floor(r() * W), y: Math.floor(r() * 90), f: Math.floor(r() * 8) }));
    const cantidad = { despejado: 3, niebla: 3, nieve: 6, nublado: 8, lluvia: 9, tormenta: 10 }[estado.categoria] || 3;
    nubes = Array.from({ length: cantidad }, (_, i) => ({
      x: (i * (W + 80)) / cantidad - 40, y: 8 + Math.floor(r() * 44),
      s: 0.8 + r() * 0.9, v: 0.05 + r() * 0.12
    }));
    particulas = [];
    const n = estado.categoria === "lluvia" || estado.categoria === "tormenta"
      ? [0, 70, 120, 190][estado.categoria === "tormenta" ? 3 : estado.intensidad]
      : estado.categoria === "nieve" ? [0, 70, 110, 170][estado.intensidad] : 0;
    for (let i = 0; i < n; i++) {
      particulas.push({ x: Math.random() * W, y: Math.random() * H, v: 2.4 + Math.random() * 2.2, ph: Math.random() * 6 });
    }
  }

  // ---------- Dibujo ----------
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  function circulo(cx, cy, radio, color) {
    ctx.fillStyle = color;
    for (let dy = -radio; dy <= radio; dy++) {
      const w = Math.floor(Math.sqrt(radio * radio - dy * dy));
      ctx.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  }

  function cielo() {
    const bandas = 18;
    for (let i = 0; i < bandas; i++) {
      rect(0, (i * H) / bandas, W, Math.ceil(H / bandas) + 1, mezclar(pal.cieloA, pal.cieloB, i / (bandas - 1)));
    }
  }

  function astros() {
    const despejado = estado.categoria === "despejado";
    if (!estado.esDia && (despejado || estado.categoria === "niebla")) {
      estrellas.forEach((e) => {
        if ((cuadro + e.f) % 8 < 6) rect(e.x, e.y, 1, 1, estado.categoria === "niebla" ? "#9d90c9" : "#fff6d6");
      });
    }
    if (despejado) {
      const cx = 268, cy = 30;
      circulo(cx, cy, estado.esDia ? 15 : 14, mezclar(pal.astro, pal.cieloB, 0.55)); // resplandor
      circulo(cx, cy, estado.esDia ? 10 : 9, pal.astro);
      if (!estado.esDia) { // cráteres de la luna
        rect(cx - 4, cy - 3, 3, 3, "#e2d6a0"); rect(cx + 2, cy + 2, 3, 2, "#e2d6a0"); rect(cx + 1, cy - 5, 2, 2, "#e2d6a0");
      }
    }
  }

  function dibujarNubes() {
    nubes.forEach((n) => {
      const s = n.s, x = n.x, y = n.y;
      const sombra = mezclar(pal.nube, pal.cieloA, 0.35);
      [[0, 6, 34, 8], [6, 2, 22, 8], [14, -2, 14, 6]].forEach(([dx, dy, w, h]) => {
        rect(x + dx * s, y + dy * s + 2, w * s, h * s, sombra);
        rect(x + dx * s, y + dy * s, w * s, h * s, pal.nube);
      });
    });
  }

  function colinas(color, base, amp, frec, fase) {
    ctx.fillStyle = color;
    for (let x = 0; x < W; x++) {
      const y = Math.round((base + Math.sin(x * frec + fase) * amp + Math.sin(x * frec * 2.3 + fase * 1.7) * amp * 0.35) / 2) * 2;
      ctx.fillRect(x, y, 1, H - y);
    }
  }

  function arbol(x, suelo, tam, oscuro) {
    const tronco = oscuro ? mezclar(pal.tronco, "#000000", 0.3) : pal.tronco;
    rect(x - 2 * tam, suelo - 26 * tam, 4 * tam, 26 * tam, tronco);
    const cy = suelo - 40 * tam, r = Math.round(17 * tam);
    circulo(x, cy, r, oscuro ? mezclar(pal.copa, "#000000", 0.25) : pal.copa);
    circulo(x - r / 3, cy - r / 3, Math.round(r * 0.55), pal.copaClara);
  }

  function castillo(x, y) {
    const c = pal.piedra, oscuro = mezclar(c, "#000000", 0.25);
    rect(x, y - 22, 40, 22, c);
    [[x - 6, 32], [x + 16, 40], [x + 36, 30]].forEach(([tx, alto]) => {
      rect(tx, y - alto, 9, alto, c);
      for (let i = 0; i < 6; i++) rect(tx + i, y - alto - 2 - i, 9 - i * 2 > 0 ? 9 - i * 2 : 1, 1, oscuro); // techo en punta
    });
    if (!estado.esDia) { rect(x + 10, y - 14, 3, 4, pal.luz); rect(x + 26, y - 14, 3, 4, pal.luz); rect(x + 19, y - 30, 3, 4, pal.luz); }
  }

  function ruina(x, suelo) {
    const c = mezclar(pal.piedra, "#000000", 0.15);
    rect(x - 26, suelo - 46, 10, 46, c); rect(x + 16, suelo - 46, 10, 46, c);
    for (let dx = -16; dx <= 16; dx++) {
      const alto = Math.round(Math.sqrt(Math.max(0, 16 * 16 - dx * dx)));
      rect(x + dx, suelo - 46 - alto, 1, 6, c);
    }
    rect(x - 26, suelo - 30, 3, 2, mezclar(c, "#000000", 0.3)); rect(x + 20, suelo - 18, 3, 2, mezclar(c, "#000000", 0.3));
  }

  function seta(x, suelo) {
    rect(x, suelo - 4, 2, 4, "#e8dcc0");
    rect(x - 2, suelo - 7, 6, 3, estado.esDia ? "#e0607f" : "#f0a0d0");
    if (!estado.esDia) rect(x - 1, suelo - 8, 4, 1, "#ffd6f0");
  }

  function decorado(suelo) {
    if (estado.decor === "bosque") {
      colinas(mezclar(pal.lejos, "#000000", 0.15), 96, 6, 0.03, 1);
      ruina(160, suelo - 2);
      [10, 52, 270, 312].forEach((x, i) => {
        rect(x - 6, 0, 12, suelo + 4, mezclar(pal.tronco, "#000000", 0.35));
        circulo(x, 18, 26, mezclar(pal.copa, "#000000", 0.35));
        circulo(x + (i % 2 ? -14 : 14), 34, 16, mezclar(pal.copa, "#000000", 0.3));
        for (let k = 0; k < 4; k++) rect(x - 16 + k * 9, 40, 1, 14 + ((k * 7 + i * 5) % 18), mezclar(pal.copa, "#000000", 0.2));
      });
    } else {
      colinas(pal.lejos, 108, 8, 0.022, 0.5);
      castillo(254, 116);
      colinas(pal.cerca, 124, 6, 0.035, 2);
      arbol(26, suelo + 6, 1.15, false);
      arbol(296, suelo + 6, 1.25, false);
    }
  }

  function suelo(y) {
    rect(0, y, W, H - y, pal.suelo);
    rect(0, y, W, 2, pal.sueloOsc);
    for (let x = 0; x < W; x += 7) rect(x + ((x * 13) % 5), y + 6 + ((x * 7) % 14), 2, 1, pal.sueloOsc); // briznas de pasto
    if (estado.decor === "bosque") { [60, 148, 236, 300].forEach((x) => seta(x, y + 6)); }
    else if (estado.categoria !== "nieve") {
      [[40, "#ffe27a"], [70, "#f19bc6"], [250, "#f19bc6"], [286, "#ffe27a"]].forEach(([x, col]) => { rect(x, y + 14, 3, 3, col); rect(x + 1, y + 17, 1, 3, pal.sueloOsc); });
    }
  }

  function niebla() {
    ctx.save();
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 6; i++) {
      const x = ((cuadro * (0.2 + i * 0.05) + i * 90) % (W + 160)) - 120;
      rect(x, 88 + i * 14, 150, 9, "#f2f2fa");
    }
    ctx.globalAlpha = 0.18;
    rect(0, 0, W, H, "#e6e8f0");
    ctx.restore();
  }

  function precipitacion() {
    const nieve = estado.categoria === "nieve";
    ctx.fillStyle = nieve ? "#ffffff" : "rgba(196,214,255,0.75)";
    particulas.forEach((p) => {
      if (nieve) {
        p.y += p.v * 0.3; p.x += Math.sin(cuadro * 0.08 + p.ph) * 0.4;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      } else {
        p.y += p.v * 2; p.x -= 1.2;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 4);
      }
      if (p.y > H) { p.y = -6; p.x = Math.random() * (W + 40); }
      if (p.x < -4) p.x = W + 2;
    });
  }

  function tormenta() {
    if (estado.categoria !== "tormenta") return;
    if (cuadro >= proximoRelampago) {
      relampago = 7;
      proximoRelampago = cuadro + 50 + Math.random() * 110;
      let x = 40 + Math.random() * 240, y = 0;
      rayo = [];
      while (y < 120) { rayo.push([Math.round(x), y]); x += (Math.random() - 0.5) * 16; y += 8 + Math.random() * 6; }
    }
    if (relampago > 0) {
      ctx.save();
      ctx.globalAlpha = 0.14 * relampago;
      rect(0, 0, W, H, "#ffffff");
      ctx.restore();
      if (rayo && relampago > 3) rayo.forEach(([x, y]) => rect(x, y, 2, 10, "#fffbd0"));
      relampago--;
    }
  }

  function dibujar() {
    const sueloY = estado.decor === "bosque" ? 116 : 134;
    cielo();
    astros();
    dibujarNubes();
    decorado(sueloY);
    suelo(sueloY);
    if (estado.categoria === "niebla") niebla();
    if (particulas.length) precipitacion();
    tormenta();
  }

  // ---------- Animación ----------
  let ultimo = 0;
  function bucle(t) {
    if (t - ultimo > 90) { // ~11 cuadros por segundo: estilo retro y poco consumo
      ultimo = t; cuadro++;
      nubes.forEach((n) => { n.x += n.v * 3; if (n.x > W + 20) n.x = -60 * n.s; });
      dibujar();
    }
    requestAnimationFrame(bucle);
  }

  function configurar(nuevo) {
    const cambioClima = ["esDia", "categoria", "intensidad"].some((k) => nuevo[k] !== undefined && nuevo[k] !== estado[k]);
    estado = { ...estado, ...nuevo };
    pal = crearPaleta(estado.esDia, estado.categoria);
    if (cambioClima || !nubes.length) crearElementos();
    if (ctx) dibujar();
  }

  function iniciar(elemento) {
    canvas = elemento;
    canvas.width = W; canvas.height = H;
    ctx = canvas.getContext("2d");
    configurar({});
    requestAnimationFrame(bucle);
  }

  return { iniciar, configurar };
})();
