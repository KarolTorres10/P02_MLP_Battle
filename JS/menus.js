// PANTALLAS Y MENUS

// Inicio, menú principal, modos de juego, seleccion de poni, selección de mejoras,
// flujo del modo Desafío, ajustes y la ventana emergente reutilizable.

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));
const escapar = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// AVISO breve dentro del juego
const Aviso = {
  temporizador: null,
  mostrar(texto, ms = 2400) {
    const el = $("#aviso");
    el.textContent = texto;
    el.classList.remove("is-hidden");
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => el.classList.add("is-hidden"), ms);
  }
};

// VENTANA EMERGENTE (modal de Bulma)
const Modal = {
  cerrable: true,
  alCerrar: null,
  abierto: () => $("#modal").classList.contains("is-active"),
  // botones: [{ texto, clase, accion, cerrar }]
  mostrar({ titulo, texto, html, botones = [], cerrable = true, alCerrar = null }) {
    $("#modal-titulo").textContent = titulo || "";
    $("#modal-cuerpo").innerHTML = html !== undefined ? html : `<p>${escapar(texto || "")}</p>`;
    const pie = $("#modal-pie");
    pie.innerHTML = "";
    botones.forEach((b) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "button " + (b.clase || "is-primary");
      boton.textContent = b.texto;
      boton.addEventListener("click", () => {
        if (b.cerrar !== false) Modal.cerrar(false);
        if (b.accion) b.accion();
      });
      pie.appendChild(boton);
    });
    pie.classList.toggle("is-hidden", botones.length === 0);
    $("#modal-x").classList.toggle("is-hidden", !cerrable);
    this.cerrable = cerrable;
    this.alCerrar = alCerrar;
    $("#modal").classList.add("is-active");
    const primero = pie.querySelector("button");
    if (primero) primero.focus();
  },
  // ejecutarAlCerrar = false cuando se cierra con un boton de la propia ventana
  cerrar(ejecutarAlCerrar = true) {
    $("#modal").classList.remove("is-active");
    const fn = this.alCerrar;
    this.alCerrar = null;
    if (ejecutarAlCerrar && fn) fn();
  },
  iniciar() {
    const pedirCierre = () => { if (Modal.cerrable) Modal.cerrar(true); };
    $("#modal-x").addEventListener("click", pedirCierre);
    $("#modal .modal-background").addEventListener("click", pedirCierre);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && Modal.abierto()) pedirCierre();
    });
  }
};

// CAMBIO DE PANTALLA
const Pantallas = {
  actual: "inicio",
  mostrar(nombre) {
    $$(".pantalla").forEach((p) => p.classList.toggle("is-hidden", p.id !== "pantalla-" + nombre));
    this.actual = nombre;
    $("#juego").dataset.pantalla = nombre;
    Escenario.configurar({ pantalla: nombre }); // el fondo y las nubes dependen de la pantalla
    if (nombre === "menu") Menu.actualizar();
  }
};

// CHIP DE HORA Y CLIMA
const ChipClima = {
  actualizar() {
    const e = Clima.actual();
    const temperatura = e.temperatura !== null && e.temperatura !== undefined ? ` · ${e.temperatura} °C` : "";
    const nota = e.fuente === "manual" ? " (manual)" : e.fuente === "estimado" ? " (estimado)" : "";
    $("#chip-clima").innerHTML =
      `<span class="icono">${Clima.icono(e)}</span><b>${Clima.horaTexto()}</b>` +
      `<span>${Clima.ETIQUETAS[e.categoria]}${temperatura}${nota}</span>`;
  }
};

// MENU PRINCIPAL
const Menu = {
  // Una partida guardada solo sirve si sus datos son coherentes
  partidaGuardada() {
    const p = Almacen.leer(Config.claves.partida);
    const valida = p && PonisPorId[p.ponyId] && Array.isArray(p.mejoras) && Number.isInteger(p.ronda) && p.ronda >= 1 &&
      Array.isArray(p.orden) && p.orden.length === 5 && p.orden.every((id) => PonisPorId[id]);
    return valida ? p : null;
  },
  // Poni en pantalla menu (lo elige el jugador y se guarda en localStorage)
  poniId() {
    const id = Almacen.leer(Config.claves.poniMenu, "twilight");
    return PonisPorId[id] && id !== "lobo-madera" ? id : "twilight";
  },
  aplicarPoni() {
    const p = PonisPorId[this.poniId()];
    const img = $("#menu-poni");
    if (img.getAttribute("src") !== p.sprite) img.src = p.sprite;
    img.alt = p.nombre;
  },
  fijarPoni(id) {
    Almacen.guardar(Config.claves.poniMenu, id);
    this.aplicarPoni();
    const img = $("#menu-poni");
    img.classList.remove("cambio");
    void img.offsetWidth; // reinicia la animación de rebote
    img.classList.add("cambio");
  },
  abrirSelectorPoni() {
    const actual = this.poniId();
    const opciones = Ponis.map((p) => `
      <button class="opcion-poni ${p.id === actual ? "actual" : ""}" type="button" data-id="${p.id}">
        <img src="${p.retrato}" alt=""><span>${escapar(p.nombre)}</span>
      </button>`).join("");
    Modal.mostrar({
      titulo: "Elige a tu poni del menú",
      html: `<p class="mb-4">¿Quién te acompaña en el menú principal?</p><div class="equipo-cambio">${opciones}</div>`,
      botones: [{ texto: "Cerrar", clase: "is-light" }]
    });
    $$("#modal-cuerpo .opcion-poni").forEach((boton) => {
      boton.addEventListener("click", () => {
        this.fijarPoni(boton.dataset.id);
        Modal.cerrar(false);
      });
    });
  },
  actualizar() {
    this.aplicarPoni();
    const partida = this.partidaGuardada();
    $("#menu-continuar-texto").textContent = partida ? `Continuar · Ronda ${partida.ronda}` : "Continuar";
    const record = Almacen.record();
    const nombre = record && PonisPorId[record.poni] ? PonisPorId[record.poni].nombre : "";
    $("#menu-pie").textContent = record
      ? `★ Récord del Desafío: ronda ${record.ronda} (${nombre}) ★`
      : "★ Ponyville · Aún sin récord ★";
  },
  iniciar() {
    $("#menu-continuar").addEventListener("click", () => {
      const partida = this.partidaGuardada();
      if (partida) Desafio.reanudar(partida);
      else Modal.mostrar({
        titulo: "Sin partida guardada",
        texto: "Todavía no tienes una partida del modo Desafío para continuar. Empieza una en Nueva aventura → Desafíos.",
        botones: [{ texto: "Entendido", clase: "is-primary" }]
      });
    });
    $("#menu-nueva").addEventListener("click", () => Pantallas.mostrar("modos"));
    $("#menu-personajes").addEventListener("click", () => SeleccionPoni.iniciar("consulta"));
    $("#menu-ajustes").addEventListener("click", () => Ajustes.abrir());
    $("#menu-cambiar-poni").addEventListener("click", () => this.abrirSelectorPoni());
    $("#menu-atras").addEventListener("click", () => Pantallas.mostrar("inicio"));
  }
};

// MODOS DE JUEGO
const Modos = {
  seleccionado: "duelo",
  marcar(modo) {
    this.seleccionado = modo;
    $$(".tarjeta-modo").forEach((t) => t.classList.toggle("sel", t.dataset.modo === modo));
  },
  iniciar() {
    $$(".tarjeta-modo").forEach((tarjeta) => {
      tarjeta.addEventListener("click", () => {
        if (tarjeta.dataset.modo === "historia") {
          Modal.mostrar({
            titulo: "Modo bloqueado 🔒",
            texto: "El modo Historia no está disponible por el momento. ¡Muy pronto podrás explorar Equestria!",
            botones: [{ texto: "Entendido", clase: "is-primary" }]
          });
        } else {
          this.marcar(tarjeta.dataset.modo);
        }
      });
    });
    $("#modos-continuar").addEventListener("click", () => SeleccionPoni.iniciar(this.seleccionado));
    $("#modos-atras").addEventListener("click", () => Pantallas.mostrar("menu"));
    this.marcar("duelo");
  }
};

// SELECCION DE PONI
const SeleccionPoni = {
  modo: null,
  jugador: 1,
  picks: { 1: [], 2: [] },
  enfocado: null,

  iniciar(modo) {
    this.modo = modo;
    this.jugador = 1;
    this.picks = { 1: [], 2: [] };
    this.enfocado = Ponis[0].id;
    $("#pantalla-ponis").dataset.modo = modo;
    this.construirGrid();
    this.actualizar();
    Pantallas.mostrar("ponis");
  },

  construirGrid() {
    $("#ponis-grid").innerHTML = Ponis.map((p) => `
      <div class="column is-4">
        <button class="tarjeta-poni" data-id="${p.id}" type="button">
          <span class="marca">★</span>
          <div class="retrato"><img src="${p.retrato}" alt=""></div>
          <span class="nombre">${escapar(p.nombre)}</span>
        </button>
      </div>`).join("");
  },

  bloqueado(id) {
    return this.modo === "duelo" && this.jugador === 2 && !Config.permitirPonisRepetidosEnDuelo && this.picks[1].includes(id);
  },

  elegidos() {
    return this.modo === "desafio" ? this.picks[1] : this.picks[this.jugador];
  },

  segmentos(valor) {
    return Array.from({ length: 6 }, (_, i) => `<i class="${i < valor ? "on" : ""}"></i>`).join("");
  },

  actualizar() {
    const titulos = { desafio: "ELIGE TU PONI", consulta: "PERSONAJES", duelo: `JUGADOR ${this.jugador}: ELIGE 1 A ${Config.tamanoEquipoDuelo} PONIS` };
    $("#ponis-titulo").textContent = titulos[this.modo];

    const elegidos = this.elegidos();
    $$(".tarjeta-poni").forEach((t) => {
      t.classList.toggle("enfocado", t.dataset.id === this.enfocado);
      t.classList.toggle("elegido", this.modo !== "consulta" && elegidos.includes(t.dataset.id));
      t.classList.toggle("bloqueado", this.bloqueado(t.dataset.id));
    });

    const p = PonisPorId[this.enfocado];
    const sprite = $("#ponis-sprite");
    sprite.src = p.sprite;
    sprite.alt = p.nombre;
    $("#ficha-nombre").textContent = p.nombre;
    $("#ficha-tipo").textContent = p.tipo;
    $("#stat-vida").innerHTML = this.segmentos(p.vida);
    $("#stat-magia").innerHTML = this.segmentos(p.magia);
    $("#stat-defensa").innerHTML = this.segmentos(p.defensa);

    // En "Personajes" también se listan las habilidades del poni
    const lista = $("#ficha-habilidades");
    lista.classList.toggle("is-hidden", this.modo !== "consulta");
    if (this.modo === "consulta") {
      const c = Motor.crearCombatiente(p);
      lista.innerHTML = p.habilidades.map((h) =>
        `<div><span class="costo">${h.costo}</span><span>${h.icono} ${escapar(h.nombre)}</span><small>${escapar(Motor.textoEfecto(c, h))}</small></div>`
      ).join("");
    }

    // Equipo del Duelo (3 huecos) y botón de confirmar
    const equipo = $("#ponis-equipo");
    equipo.classList.toggle("is-hidden", this.modo !== "duelo");
    equipo.innerHTML = Array.from({ length: Config.tamanoEquipoDuelo }, (_, i) => {
      const id = elegidos[i];
      return id ? `<div class="hueco lleno"><img src="${PonisPorId[id].retrato}" alt=""></div>` : `<div class="hueco"></div>`;
    }).join("");

    const confirmar = $("#ponis-confirmar");
    if (this.modo === "duelo") {
      confirmar.disabled = elegidos.length < 1; // se puede desde un poni hasta tres
      confirmar.textContent = `★ CONFIRMAR (${elegidos.length}/${Config.tamanoEquipoDuelo}) ★`;
    } else {
      confirmar.disabled = this.modo === "desafio" && elegidos.length !== 1;
      confirmar.textContent = "★ CONFIRMAR ★";
    }
  },

  clic(id) {
    if (this.bloqueado(id)) {
      Aviso.mostrar("El jugador 1 ya eligió a ese poni.");
      return;
    }
    this.enfocado = id;
    if (this.modo === "desafio") {
      this.picks[1] = [id];
    } else if (this.modo === "duelo") {
      const lista = this.picks[this.jugador];
      const i = lista.indexOf(id);
      if (i >= 0) lista.splice(i, 1);
      else if (lista.length < Config.tamanoEquipoDuelo) lista.push(id);
      else Aviso.mostrar(`Tu equipo ya tiene ${Config.tamanoEquipoDuelo} ponis. Quita uno para cambiarlo.`);
    }
    this.actualizar();
  },

  confirmar() {
    if (this.modo === "desafio") {
      Desafio.nuevo(this.picks[1][0]);
    } else if (this.modo === "duelo") {
      if (this.jugador === 1) {
        this.jugador = 2;
        this.enfocado = Ponis[0].id;
        this.actualizar();
        Aviso.mostrar("¡Ahora elige el jugador 2!");
      } else {
        Batalla.iniciarDuelo(this.picks[1], this.picks[2]);
      }
    }
  },

  atras() {
    if (this.modo === "duelo" && this.jugador === 2) {
      this.jugador = 1;
      this.actualizar();
    } else {
      Pantallas.mostrar(this.modo === "consulta" ? "menu" : "modos");
    }
  },

  iniciarEventos() {
    $("#ponis-grid").addEventListener("click", (e) => {
      const tarjeta = e.target.closest(".tarjeta-poni");
      if (tarjeta) this.clic(tarjeta.dataset.id);
    });
    $("#ponis-confirmar").addEventListener("click", () => this.confirmar());
    $("#ponis-atras").addEventListener("click", () => this.atras());
  }
};

// Selección de mejoras ("cartas") del Desafío
const Cartas = {
  seleccion: null,

  mostrar(run) {
    this.seleccion = null;
    const def = PonisPorId[run.ponyId];
    const c = Desafio.combatiente();
    $("#cartas-sprite").src = def.sprite;
    $("#cartas-nombre").textContent = `${def.nombre} · ${c.vida}/${c.vidaMax} ♥`;
    $("#cartas-ronda").textContent = `Ronda ${run.ronda}`;
    $("#cartas-lista").innerHTML = run.opciones.map((id) => {
      const m = MejorasPorId[id];
      return `
        <div class="column is-4">
          <button class="carta-mejora" data-id="${m.id}" type="button">
            <span class="insignia">${escapar(m.insignia)}</span>
            <span class="visto">✔</span>
            <div class="icono">${m.icono}</div>
            <div class="nombre">${escapar(m.nombre)}</div>
            <div class="descripcion">${escapar(m.texto)}</div>
          </button>
        </div>`;
    }).join("");
    $("#cartas-confirmar").disabled = true;
    Pantallas.mostrar("cartas");
  },

  elegir(id) {
    this.seleccion = id;
    $$(".carta-mejora").forEach((c) => c.classList.toggle("sel", c.dataset.id === id));
    $("#cartas-confirmar").disabled = false;
  },

  iniciarEventos() {
    $("#cartas-lista").addEventListener("click", (e) => {
      const carta = e.target.closest(".carta-mejora");
      if (carta) this.elegir(carta.dataset.id);
    });
    $("#cartas-confirmar").addEventListener("click", () => {
      if (this.seleccion) Desafio.aplicarMejora(this.seleccion);
    });
    $("#cartas-atras").addEventListener("click", () => Pantallas.mostrar("ponis"));
  }
};

// FLUJO DEL MODO DESAFIO
// run = { ponyId, mejoras:[ids], vida, ronda, orden:[ids de los 5 ponis rivales],
//         fase: "mejora" | "batalla", opciones:[ids de mejoras ofrecidas] }
const Desafio = {
  run: null,

  nuevo(ponyId) {
    const otros = Ponis.filter((p) => p.id !== ponyId).map((p) => p.id);
    this.run = { ponyId, mejoras: [], vida: null, ronda: 1, orden: Motor.barajar(otros), fase: "mejora", opciones: [], pociones: Config.pocion.desafio };
    this.ofrecerMejoras();
  },

  reanudar(partida) {
    this.run = partida;
    if (partida.fase === "batalla") Batalla.iniciarDesafio(this.run);
    else if (partida.opciones && partida.opciones.length) Cartas.mostrar(this.run);
    else this.ofrecerMejoras();
  },

  combatiente() {
    return Motor.crearCombatiente(PonisPorId[this.run.ponyId], { mejoras: this.run.mejoras, vida: this.run.vida });
  },

  // Sortea 3 mejoras, las guarda (para que recargar la página no permita sortear de nuevo) y las muestra
  ofrecerMejoras() {
    this.run.fase = "mejora";
    this.run.opciones = Motor.sortearMejoras(this.combatiente()).map((m) => m.id);
    Almacen.guardar(Config.claves.partida, this.run);
    Cartas.mostrar(this.run);
  },

  // La mejora elegida se aplica de forma permanente al poni
  aplicarMejora(id) {
    const m = MejorasPorId[id];
    this.run.mejoras.push(id);
    this.run.pociones = (this.run.pociones ?? Config.pocion.desafio) + (m.efecto.pociones || 0); // "Poción" se suma a la mochila
    if (m.efecto.vidaMax && this.run.vida !== null) this.run.vida += m.efecto.vidaMax;
    this.run.fase = "batalla";
    this.run.opciones = [];
    Almacen.guardar(Config.claves.partida, this.run);
    Batalla.iniciarDesafio(this.run);
  },

  // Ronda ganada: el poni recupera parte de la vida y aparecen las mejoras
  victoria(vidaFinal, pociones) {
    this.run.pociones = pociones; // se guarda lo de la mochila para la siguiente ronda
    const def = PonisPorId[this.run.ponyId];
    const vidaMax = Motor.crearCombatiente(def, { mejoras: this.run.mejoras }).vidaMax;
    this.run.vida = Math.min(vidaMax, vidaFinal + Math.round(vidaMax * Config.desafio.curacionEntreRondas));
    this.run.ronda += 1;
    this.ofrecerMejoras();
  },

  derrota() {
    const { ponyId, ronda } = this.run;
    const nuevoRecord = Almacen.registrarRecord(ronda, ponyId);
    const record = Almacen.record();
    Almacen.borrar(Config.claves.partida);
    Modal.mostrar({
      titulo: "Derrota",
      html: `<p>Tu poni cayó en la <strong>ronda ${ronda}</strong>.</p>` +
        (nuevoRecord ? `<p>🏆 ¡Nuevo récord!</p>` : record ? `<p>Tu récord es la ronda ${record.ronda}.</p>` : ""),
      cerrable: false,
      botones: [
        { texto: "Reintentar", clase: "is-primary", accion: () => this.nuevo(ponyId) },
        { texto: "Menú principal", clase: "is-light", accion: () => Pantallas.mostrar("menu") }
      ]
    });
  }
};

// AJUSTES

// MUSICA DE FONDO
const Musica = {
  el: $("#musica-fondo"),
  pista: -1,
  iniciar() {
    this.el.volume = 0.3;
    this.el.muted = Almacen.leer(Config.claves.musica, false);
    this.elegir(Almacen.leer(Config.claves.pista, 0));
  },
  elegir(i) {
    i = Config.pistas[i] ? i : 0;
    if (i === this.pista) return;
    const sonaba = !this.el.paused;
    this.pista = i;
    Almacen.guardar(Config.claves.pista, i);
    this.el.src = Config.pistas[i].archivo;
    if (sonaba) this.reproducir();
  },
  reproducir() { if (this.el.paused) this.el.play().catch(() => {}); },
  silenciar(si) { this.el.muted = si; Almacen.guardar(Config.claves.musica, si); }
};

// AJUSTES (clima y musica)
// La pausa de la batalla reutiliza la ventana:
// opc = { titulo, texto, botones, alCerrar }
const Ajustes = {
  abrir(opc = {}) {
    const a = Clima.ajustes();
    const opciones = (lista, elegido) => lista.map(([v, t]) =>
      `<option value="${v}" ${String(v) === String(elegido) ? "selected" : ""}>${escapar(t)}</option>`).join("");
    Modal.mostrar({
      titulo: opc.titulo || "Ajustes",
      alCerrar: opc.alCerrar,
      botones: opc.botones || [{ texto: "Cerrar", clase: "is-light" }],
      html: `
        ${opc.texto ? `<p class="mb-4">${escapar(opc.texto)}</p>` : ""}
        <label class="label" for="aj-modo">Clima del escenario</label>
        <div class="select"><select id="aj-modo">${opciones([["auto", "Automático (Open-Meteo)"], ["manual", "Manual"]], a.manual ? "manual" : "auto")}</select></div>
        <p class="help mb-3" id="aj-estado"></p>
        <div id="aj-manual" class="${a.manual ? "" : "is-hidden"}">
          <label class="label" for="aj-dia">Momento del día</label>
          <div class="select mb-3"><select id="aj-dia">${opciones([["dia", "Día"], ["noche", "Noche"]], a.esDia ? "dia" : "noche")}</select></div>
          <label class="label" for="aj-clima">Clima</label>
          <div class="select mb-3"><select id="aj-clima">${opciones(Object.entries(Clima.ETIQUETAS), a.categoria)}</select></div>
        </div>
        <label class="label" for="aj-pista">Música de fondo</label>
        <div class="select"><select id="aj-pista">${opciones(Config.pistas.map((p, i) => [i, p.nombre]), Musica.pista)}</select></div>
        <button id="aj-musica" class="button is-dark is-light ml-2" type="button">Música: ${Musica.el.muted ? "OFF" : "ON"}</button>
        <div class="mt-4">
          <button id="aj-actualizar" class="button is-info is-light" type="button">Actualizar clima ahora</button>
          <button id="aj-borrar" class="button is-danger is-light" type="button">Borrar datos guardados</button>
        </div>`
    });

    const estado = () => {
      const e = Clima.actual();
      $("#aj-estado").textContent = `Ahora: ${Clima.ETIQUETAS[e.categoria]}, ${e.esDia ? "de día" : "de noche"} · Fuente: ${e.fuente}`;
    };
    estado();
    $("#modal-cuerpo").onchange = (ev) => {
      if (ev.target.id === "aj-pista") return Musica.elegir(Number(ev.target.value));
      $("#aj-manual").classList.toggle("is-hidden", $("#aj-modo").value !== "manual");
      Clima.guardarAjustes({ manual: $("#aj-modo").value === "manual", esDia: $("#aj-dia").value === "dia", categoria: $("#aj-clima").value });
      ChipClima.actualizar();
      estado();
    };
    $("#aj-musica").onclick = (ev) => {
      Musica.silenciar(!Musica.el.muted);
      ev.target.textContent = `Música: ${Musica.el.muted ? "OFF" : "ON"}`;
    };
    $("#aj-actualizar").onclick = async () => {
      $("#aj-estado").textContent = "Consultando Open-Meteo...";
      await Clima.refrescar();
      estado();
    };
    $("#aj-borrar").onclick = () => Modal.mostrar({
      titulo: "¿Borrar datos guardados?",
      texto: "Se eliminarán la partida del Desafío, el récord y los ajustes. Esta acción no se puede deshacer.",
      botones: [
        { texto: "Sí, borrar", clase: "is-danger", accion: () => { Almacen.borrarTodo(); location.reload(); } },
        { texto: "Cancelar", clase: "is-light", accion: () => Ajustes.abrir(opc) }
      ]
    });
  }
};