// ===== Pantalla de batalla =====
// Conecta el motor (reglas) con el DOM: dibuja HUD y cartas, anima los ataques y
// controla el orden de los turnos (humano, IA, cambio de poni, fin del combate).
const Batalla = {
  b: null,            // estado del motor
  ocupado: true,      // true mientras hay animaciones o turno del rival: bloquea los botones
  pausado: false,
  sesion: 0,          // se incrementa al salir de la batalla para cancelar bucles pendientes
  equiposDuelo: null, // ids de los equipos, para la revancha

  // ---------- Inicio ----------
  iniciarDesafio(run) {
    const jugador = Desafio.combatiente();
    const rival = Motor.crearRivalDesafio(run.ronda, run.orden);
    this.empezar({
      modo: "desafio",
      lados: [
        { nombre: "Tú", equipo: [jugador] },
        { nombre: rival.nombre, esIA: true, equipo: [rival] }
      ]
    });
  },

  iniciarDuelo(idsJ1, idsJ2) {
    this.equiposDuelo = [idsJ1, idsJ2];
    const crear = (ids) => ids.map((id) => Motor.crearCombatiente(PonisPorId[id]));
    this.empezar({
      modo: "duelo",
      lados: [
        { nombre: "Jugador 1", equipo: crear(idsJ1) },
        { nombre: "Jugador 2", equipo: crear(idsJ2) }
      ]
    });
  },

  empezar(config) {
    this.sesion += 1;
    this.pausado = false;
    this.ocupado = true;
    this.b = Motor.crearBatalla(config);
    $("#juego").dataset.modo = config.modo;
    $$("#hud-a .hud-retrato img, #hud-b .hud-retrato img").forEach((i) => i.removeAttribute("src"));
    $$(".luchador .anim").forEach((a) => (a.className = "anim"));
    $("#flotantes").innerHTML = "";
    Pantallas.mostrar("batalla");
    this.render();
    this.comenzarTurno();
  },

  // ---------- Dibujo ----------
  indiceMano() { return this.b.modo === "desafio" ? 0 : this.b.turno; },

  render() {
    this.renderLado(0);
    this.renderLado(1);
    this.renderMano();
    this.renderBanner();
  },

  renderLado(i) {
    const b = this.b;
    const lado = b.lados[i];
    const c = Motor.activo(lado);
    const hud = $(i === 0 ? "#hud-a" : "#hud-b");

    const retrato = $(".hud-retrato img", hud);
    if (retrato.getAttribute("src") !== c.retrato) retrato.src = c.retrato;
    $(".hud-nombre", hud).textContent = b.modo === "duelo" ? `J${i + 1} · ${c.nombre}` : c.nombre;

    const pct = Math.max(0, (c.vida / c.vidaMax) * 100);
    const relleno = $(".barra-relleno", hud);
    relleno.style.width = pct + "%";
    relleno.classList.toggle("bajo", pct < 30);
    $(".barra-texto", hud).textContent = `${c.vida}/${c.vidaMax}`;
    $(".hud-escudo b", hud).textContent = c.escudo;
    $(".hud-ataque b", hud).textContent = Motor.ataqueMaximo(c);

    // Minirretratos del equipo (solo Duelo); los de tu equipo sirven para cambiar de poni
    const equipo = $(".hud-equipo", hud);
    if (lado.equipo.length > 1) {
      const puedeCambiar = b.modo === "duelo" && !this.ocupado && b.turno === i && lado.energia >= Config.costoCambioPoni && !b.terminada;
      equipo.innerHTML = lado.equipo.map((p, k) => {
        const clases = ["mini", k === lado.activo ? "activo" : "", p.vida <= 0 ? "caido" : "", puedeCambiar && p.vida > 0 && k !== lado.activo ? "cambiable" : ""].join(" ");
        return `<button class="${clases}" type="button" data-lado="${i}" data-idx="${k}" title="${escapar(p.nombre)} (${p.vida}/${p.vidaMax})"><img src="${p.retrato}" alt=""></button>`;
      }).join("");
    } else {
      equipo.innerHTML = "";
    }

    // Luchador en el campo
    const caja = $(i === 0 ? "#luchador-a" : "#luchador-b");
    const img = $("img", caja);
    if (img.getAttribute("src") !== c.sprite) {
      img.src = c.sprite;
      $(".anim", caja).className = "anim"; // al entrar un poni nuevo se quita la animación de caída
    }
    const vaALaDerecha = i === 0; // el lado A mira a la derecha, el B a la izquierda
    img.classList.toggle("volteado", vaALaDerecha ? c.mira === "izquierda" : c.mira === "derecha");
    caja.classList.toggle("lobo", c.id === "lobo-madera");
    $(".estados", caja).textContent = (c.estados.potenciado ? "🔥" : "") + (c.estados.debilitado ? "💧" : "");
  },

  renderMano() {
    const b = this.b;
    const idx = this.indiceMano();
    const lado = b.lados[idx];
    const c = Motor.activo(lado);
    const miTurno = b.turno === idx && !this.ocupado && !b.terminada;

    $("#mano").innerHTML = c.habilidades.map((h, i) => {
      const espera = c.enfriamiento[h.id] || 0;
      const usable = miTurno && Motor.puedeUsar(b, i);
      const titulo = `${h.nombre}: ${Motor.textoEfecto(c, h)}${h.enfriamiento ? ` · se puede usar cada ${h.enfriamiento} turnos` : ""}`;
      return `
        <button class="carta-hab ${usable ? "" : "no-usable"}" type="button" data-idx="${i}" title="${escapar(titulo)}">
          <div class="cabecera"><span class="costo">${h.costo}</span><span class="nombre-hab">${escapar(h.nombre)}</span></div>
          <div class="icono-hab">${h.icono}</div>
          <div class="efecto-hab">${escapar(Motor.textoEfecto(c, h))}</div>
          <span class="tecla">${i + 1}</span>
          ${espera > 0 ? `<div class="espera">⏳<br>${espera}</div>` : ""}
        </button>`;
    }).join("");

    $("#energia-valor").textContent = `${lado.energia}/${Math.max(Motor.energiaMax(c), lado.energia)}`;
    $("#btn-fin-turno").disabled = !miTurno;
  },

  renderBanner() {
    const b = this.b;
    const banner = $("#banner");
    if (b.modo === "desafio") {
      banner.textContent = b.turno === 0 ? `TU TURNO · ${b.ronda}` : `TURNO RIVAL · ${b.ronda}`;
    } else {
      banner.textContent = `TURNO J${b.turno + 1} · ${b.ronda}`;
    }
    banner.classList.toggle("rival", b.turno === 1);
  },

  // ---------- Utilidades de animación ----------
  async espera(ms) {
    await esperar(ms);
    while (this.pausado) await esperar(120);
  },

  posX: (lado) => (lado === 0 ? 23 : 77), // posición horizontal (cqw) de cada luchador

  anuncio(texto, ms = 900) {
    const el = $("#anuncio");
    el.textContent = texto;
    el.classList.remove("is-hidden");
    clearTimeout(this.tAnuncio);
    this.tAnuncio = setTimeout(() => el.classList.add("is-hidden"), ms);
  },

  flotante(lado, texto, clase, desfase = 0) {
    const el = document.createElement("div");
    el.className = `flotante ${clase}`;
    el.textContent = texto;
    el.style.left = this.posX(lado) + "cqw";
    el.style.top = 13 + desfase + "cqw";
    $("#flotantes").appendChild(el);
    setTimeout(() => el.remove(), 1300);
  },

  animacion(lado, clase, ms) {
    const anim = $(".anim", $(lado === 0 ? "#luchador-a" : "#luchador-b"));
    anim.classList.remove(clase);
    void anim.offsetWidth; // reinicia la animación CSS
    anim.classList.add(clase);
    if (clase !== "derrotado") setTimeout(() => anim.classList.remove(clase), ms);
  },

  proyectil(lado, icono) {
    return new Promise((resolver) => {
      const p = document.createElement("div");
      p.className = "proyectil";
      p.textContent = icono;
      p.style.left = this.posX(lado) + "cqw";
      $("#campo").appendChild(p);
      void p.offsetWidth;
      p.style.left = this.posX(1 - lado) + "cqw";
      setTimeout(() => { p.remove(); resolver(); }, 430);
    });
  },

  // Reproduce los eventos que devuelve el motor
  async animar(eventos, sesion) {
    const uso = eventos.find((e) => e.t === "usa");
    if (uso) this.anuncio(uso.habilidad.nombre);

    const golpe = eventos.find((e) => e.t === "daño");
    if (uso && golpe) {
      this.animacion(uso.lado, uso.lado === 0 ? "ataca-a" : "ataca-b", 500);
      await this.proyectil(uso.lado, uso.habilidad.icono);
      if (sesion !== this.sesion) return;
    }
    this.render(); // la vida y el escudo se actualizan justo al impactar

    for (const e of eventos) {
      switch (e.t) {
        case "daño":
          this.animacion(e.lado, "golpeado", 520);
          this.flotante(e.lado, e.alVida > 0 ? `-${e.alVida}` : "¡Bloqueado!", "dano");
          if (e.absorbido > 0 && e.alVida > 0) this.flotante(e.lado, `🛡️-${e.absorbido}`, "escudo", 4);
          break;
        case "cura": this.flotante(e.lado, `+${e.cantidad}`, "cura"); break;
        case "escudo": this.flotante(e.lado, `+${e.cantidad} 🛡️`, "escudo"); break;
        case "energia": this.flotante(e.lado, `+${e.cantidad} ⚡`, "energia"); break;
        case "estado": this.flotante(e.lado, e.texto, "estado"); break;
        case "cae": this.animacion(e.lado, "derrotado", 900); break;
      }
    }
    await this.espera(eventos.some((e) => e.t === "cae") ? 1000 : 650);
  },

  // ---------- Turnos ----------
  async comenzarTurno() {
    const sesion = this.sesion;
    const b = this.b;
    Motor.iniciarTurno(b);
    this.ocupado = true;
    this.render();
    const lado = b.lados[b.turno];
    if (b.modo === "duelo") {
      this.anuncio(`¡Turno del ${lado.nombre}!`, 1000);
      await this.espera(1000);
      if (sesion !== this.sesion) return;
    }
    if (lado.esIA) {
      await this.turnoIA(sesion);
    } else {
      this.ocupado = false;
      this.render();
    }
  },

  async turnoIA(sesion) {
    const b = this.b;
    await this.espera(800);
    for (let i = 0; i < 12; i++) {
      if (sesion !== this.sesion) return;
      const accion = Motor.decidirIA(b);
      if (accion.tipo === "fin") break;
      const eventos = Motor.usarHabilidad(b, accion.idx);
      if (!eventos) break;
      await this.animar(eventos, sesion);
      if (sesion !== this.sesion) return;
      if (await this.resolverCaidas(sesion)) return;
      await this.espera(350);
    }
    if (sesion !== this.sesion) return;
    await this.pasarTurno(sesion);
  },

  async jugar(idx) {
    const b = this.b;
    if (!b || this.ocupado || b.terminada || Pantallas.actual !== "batalla") return;
    if (b.turno !== this.indiceMano() || !Motor.puedeUsar(b, idx)) return;
    const sesion = this.sesion;
    this.ocupado = true;
    const eventos = Motor.usarHabilidad(b, idx);
    this.renderMano();
    await this.animar(eventos, sesion);
    if (sesion !== this.sesion) return;
    if (await this.resolverCaidas(sesion)) return;
    this.ocupado = false;
    this.render();
  },

  async finTurno() {
    const b = this.b;
    if (!b || this.ocupado || b.terminada || b.turno !== this.indiceMano()) return;
    await this.pasarTurno(this.sesion);
  },

  async pasarTurno(sesion) {
    this.ocupado = true;
    const eventos = Motor.finTurno(this.b);
    if (eventos.length) await this.animar(eventos, sesion);
    if (sesion !== this.sesion) return;
    await this.comenzarTurno();
  },

  // Cambio de poni pagando energía (Duelo)
  cambiar(ladoIdx, idx) {
    const b = this.b;
    if (!b || b.modo !== "duelo" || this.ocupado || b.terminada) return;
    if (Motor.cambiarPoni(b, ladoIdx, idx)) {
      this.anuncio(`¡Va ${Motor.activo(b.lados[ladoIdx]).nombre}!`, 900);
      this.render();
    } else {
      Aviso.mostrar(`Cambiar de poni cuesta ${Config.costoCambioPoni} de energía.`);
    }
  },

  // Tras cada acción: ¿terminó la batalla? ¿hay que reemplazar a un poni caído?
  // Devuelve true si el flujo debe detenerse (batalla terminada o salida del juego).
  async resolverCaidas(sesion) {
    const b = this.b;
    if (Motor.revisarFin(b)) {
      await this.terminar(sesion);
      return true;
    }
    for (const i of [0, 1]) {
      if (Motor.necesitaCambio(b, i) && !b.lados[i].esIA) {
        const idx = await this.elegirReemplazo(i);
        if (sesion !== this.sesion) return true;
        Motor.cambiarPoni(b, i, idx, true);
        this.anuncio(`¡Entra ${Motor.activo(b.lados[i]).nombre}!`, 1000);
        this.render();
        await this.espera(700);
      }
    }
    return sesion !== this.sesion;
  },

  elegirReemplazo(ladoIdx) {
    const lado = this.b.lados[ladoIdx];
    return new Promise((resolver) => {
      const opciones = lado.equipo
        .map((p, k) => ({ p, k }))
        .filter(({ p }) => p.vida > 0)
        .map(({ p, k }) => `
          <button class="opcion-poni" type="button" data-idx="${k}">
            <img src="${p.retrato}" alt=""><span>${escapar(p.nombre)}</span><small>${p.vida}/${p.vidaMax} ♥</small>
          </button>`).join("");
      Modal.mostrar({
        titulo: `${lado.nombre}: tu poni cayó`,
        html: `<p class="mb-4">Elige al siguiente poni de tu equipo:</p><div class="equipo-cambio">${opciones}</div>`,
        cerrable: false
      });
      $$("#modal-cuerpo .opcion-poni").forEach((boton) => {
        boton.addEventListener("click", () => {
          Modal.cerrar(false);
          resolver(Number(boton.dataset.idx));
        });
      });
    });
  },

  // ---------- Fin del combate ----------
  async terminar(sesion) {
    const b = this.b;
    this.ocupado = true;
    this.render();
    await this.espera(900);
    if (sesion !== this.sesion) return;

    if (b.modo === "desafio") {
      if (b.ganador === 0) {
        this.anuncio("¡Ronda superada!", 1600);
        await this.espera(1700);
        if (sesion !== this.sesion) return;
        Desafio.victoria(Motor.activo(b.lados[0]).vida);
      } else {
        Desafio.derrota();
      }
    } else {
      const ganador = b.lados[b.ganador].nombre;
      Modal.mostrar({
        titulo: "¡Fin del duelo!",
        html: `<p class="is-size-4">🏆 <strong>¡Gana el ${escapar(ganador)}!</strong></p><p>Duró ${b.ronda} turnos por jugador.</p>`,
        cerrable: false,
        botones: [
          { texto: "Revancha", clase: "is-primary", accion: () => this.iniciarDuelo(...this.equiposDuelo) },
          { texto: "Menú principal", clase: "is-light", accion: () => Pantallas.mostrar("menu") }
        ]
      });
    }
  },

  // ---------- Pausa ----------
  pausar() {
    if (this.pausado || !this.b || this.b.terminada || Modal.abierto()) return;
    this.pausado = true;
    const reanudar = () => { this.pausado = false; };
    Modal.mostrar({
      titulo: "Pausa",
      texto: this.b.modo === "desafio"
        ? "Si sales, tu partida del Desafío queda guardada al inicio de esta ronda."
        : "Si sales, se pierde el duelo en curso.",
      alCerrar: reanudar,
      botones: [
        { texto: "Reanudar", clase: "is-primary", accion: reanudar },
        {
          texto: "Salir al menú", clase: "is-danger is-light",
          accion: () => { this.sesion += 1; this.pausado = false; Pantallas.mostrar("menu"); }
        }
      ]
    });
  },

  // ---------- Eventos ----------
  iniciarEventos() {
    $("#mano").addEventListener("click", (e) => {
      const carta = e.target.closest(".carta-hab");
      if (carta) this.jugar(Number(carta.dataset.idx));
    });
    $("#btn-fin-turno").addEventListener("click", () => this.finTurno());
    $("#btn-pausa").addEventListener("click", () => this.pausar());
    $("#pantalla-batalla").addEventListener("click", (e) => {
      const mini = e.target.closest(".mini.cambiable");
      if (mini) this.cambiar(Number(mini.dataset.lado), Number(mini.dataset.idx));
    });
    // Atajos: 1-5 usan habilidades, Enter o E terminan el turno, P pausa
    document.addEventListener("keydown", (e) => {
      if (Pantallas.actual !== "batalla" || Modal.abierto()) return;
      if (/^[1-9]$/.test(e.key)) this.jugar(Number(e.key) - 1);
      else if (e.key === "Enter" || e.key.toLowerCase() === "e") this.finTurno();
      else if (e.key.toLowerCase() === "p") this.pausar();
    });
  }
};
