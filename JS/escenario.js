const Escenario = (() => {
  const W = 320, H = 180; // resolución del canvas; el CSS lo escala con "pixelated"
  let canvas, ctx;
  let estado = { esDia: true, categoria: "despejado", intensidad: 2, pantalla: "inicio" };
  let particulas = [], nubes = [];
  let cuadro = 0, relampago = 0, proximoRelampago = 60, rayo = null;

  // VISIBILIDAD = Zona de cielo y nubes
  const ZONAS = {
    inicio: { y0: 8, y1: 62, alfa: 1, escala: 1 },
    menu:   { y0: 6, y1: 44, alfa: 1, escala: 1 },
    modos:  { y0: 6, y1: 50, alfa: 1, escala: 1 },
    ponis:  { y0: 8, y1: 52, alfa: 1, escala: 1 },
    cartas: { y0: 8, y1: 80, alfa: 1, escala: 1 },
    batalla: { y0: 4, y1: 34, alfa: 0.5, escala: 0.75 }
  };

  // Color de la nube segun clima [nube, sombra]
  const COLORES_NUBE = {
    dia: {
      despejado: ["#ffffff", "#d3e6f7"], nublado: ["#d5dbe4", "#aab4c4"], niebla: ["#eceff5", "#cfd6e2"],
      lluvia: ["#a3aec0", "#7d899e"], nieve: ["#f1f5fb", "#d4deec"], tormenta: ["#6f7a8d", "#4e586b"]
    },
    noche: {
      despejado: ["#dccdf8", "#b9a5ea"], nublado: ["#9a8cc9", "#7a6cae"], niebla: ["#bcb1e2", "#a094cf"],
      lluvia: ["#766ba6", "#5a5088"], nieve: ["#d2c8f0", "#b3a6e0"], tormenta: ["#524a7e", "#3b3562"]
    }
  };

  // ELEMENTOS
  function crearElementos() {
    const zona = ZONAS[estado.pantalla] || ZONAS.inicio;
    const cantidad = { despejado: 3, niebla: 3, nieve: 6, nublado: 8, lluvia: 9, tormenta: 10 }[estado.categoria] || 3;
    nubes = Array.from({ length: cantidad }, (_, i) => ({
      x: (i * (W + 80)) / cantidad - 40,
      y: zona.y0 + Math.random() * (zona.y1 - zona.y0),
      s: (0.7 + Math.random() * 0.9) * zona.escala,
      v: 0.05 + Math.random() * 0.12
    }));

    particulas = [];
    const total = estado.categoria === "lluvia" || estado.categoria === "tormenta"
      ? [0, 70, 120, 190][estado.categoria === "tormenta" ? 3 : estado.intensidad]
      : estado.categoria === "nieve" ? [0, 70, 110, 170][estado.intensidad] : 0;
    for (let i = 0; i < total; i++) {
      particulas.push({ x: Math.random() * W, y: Math.random() * H, v: 2.4 + Math.random() * 2.2, ph: Math.random() * 6 });
    }
  }

  // DIBUJO
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  function dibujarNubes() {
    const zona = ZONAS[estado.pantalla] || ZONAS.inicio;
    const [color, sombra] = COLORES_NUBE[estado.esDia ? "dia" : "noche"][estado.categoria] || COLORES_NUBE.dia.despejado;
    ctx.save();
    ctx.globalAlpha = zona.alfa;
    nubes.forEach((n) => {
      [[0, 6, 34, 8], [6, 2, 22, 8], [14, -2, 14, 6]].forEach(([dx, dy, w, h]) => {
        rect(n.x + dx * n.s, n.y + dy * n.s + 2, w * n.s, h * n.s, sombra);
        rect(n.x + dx * n.s, n.y + dy * n.s, w * n.s, h * n.s, color);
      });
    });
    ctx.restore();
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
    ctx.fillStyle = nieve ? "#ffffff" : estado.esDia ? "rgba(232,240,255,0.85)" : "rgba(196,214,255,0.75)";
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
    ctx.clearRect(0, 0, W, H); // canvas transparente
    dibujarNubes();
    if (estado.categoria === "niebla") niebla();
    if (particulas.length) precipitacion();
    tormenta();
  }

  // ANIMACION
  let ultimo = 0;
  function bucle(t) {
    if (t - ultimo > 90) { // 11 fps aprox.
      ultimo = t; cuadro++;
      const zona = ZONAS[estado.pantalla] || ZONAS.inicio;
      nubes.forEach((n) => { n.x += n.v * 3; if (n.x > W + 20) { n.x = -60 * n.s; n.y = zona.y0 + Math.random() * (zona.y1 - zona.y0); } });
      dibujar();
    }
    requestAnimationFrame(bucle);
  }

  // Trae: esDia, categoria, intensidad o pantalla
  function configurar(nuevo) {
    const cambio = ["esDia", "categoria", "intensidad", "pantalla"].some((k) => nuevo[k] !== undefined && nuevo[k] !== estado[k]);
    estado = { ...estado, ...nuevo };
    const juego = document.getElementById("juego");
    juego.dataset.momento = estado.esDia ? "dia" : "noche"; // indica al CSS que fondo usar
    juego.dataset.clima = estado.categoria;                  // indica el velo segun clima
    if (cambio || !nubes.length) crearElementos();
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