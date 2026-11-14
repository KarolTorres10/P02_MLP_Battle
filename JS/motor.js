// ===== Motor de batalla =====
// Lógica pura del juego: no toca el DOM, así que se puede probar por separado.
//
// Un "combatiente" es un poni (o lobo) con vida, escudo, estados y habilidades.
// Una "batalla" tiene dos "lados"; cada lado tiene un equipo de combatientes y uno activo.
//   Desafío: lado 0 = tu poni (1 combatiente), lado 1 = el rival controlado por la IA.
//   Duelo:   lado 0 = jugador 1 (3 ponis), lado 1 = jugador 2 (3 ponis).
const Motor = (() => {
  const MULT_POTENCIADO = 1.5;  // el siguiente ataque hace +50%
  const MULT_DEBILITADO = 0.6;  // los ataques de un combatiente debilitado hacen -40%

  const factorMagia = (magia) => 0.7 + 0.1 * magia;

  // ---------- Creación ----------
  // opciones: { escala:{vida,poder}, mejoras:[ids], vida }
  function crearCombatiente(def, opciones = {}) {
    const escala = opciones.escala || { vida: 1, poder: 1 };
    const c = {
      id: def.id, nombre: def.nombre, tipo: def.tipo,
      sprite: def.sprite, retrato: def.retrato, mira: def.mira,
      magia: def.magia, defensa: def.defensa, poder: escala.poder,
      vidaMax: Math.round((20 + 5 * def.vida) * escala.vida),
      vida: 0, escudo: 0,
      bonos: { danio: 0, cura: 0, escudo: 0, energia: 0, robovida: 0, regen: 0 },
      estados: { potenciado: false, debilitado: false },
      enfriamiento: {},
      habilidades: def.habilidades,
      mejoras: []
    };
    (opciones.mejoras || []).forEach((id) => aplicarMejora(c, id));
    c.vida = opciones.vida != null ? Math.max(1, Math.min(c.vidaMax, opciones.vida)) : c.vidaMax;
    return c;
  }

  function aplicarMejora(c, id) {
    const mejora = MejorasPorId[id];
    if (!mejora) return;
    const e = mejora.efecto;
    if (e.vidaMax) c.vidaMax += e.vidaMax;
    if (e.magia) c.magia += e.magia;
    if (e.defensa) c.defensa += e.defensa;
    ["danio", "cura", "escudo", "energia", "robovida", "regen"].forEach((k) => {
      if (e[k]) c.bonos[k] += e[k];
    });
    c.mejoras.push(id);
  }

  function crearBatalla({ modo, lados }) {
    return {
      modo,
      lados: lados.map((l) => ({
        nombre: l.nombre, esIA: Boolean(l.esIA),
        equipo: l.equipo, activo: l.activo || 0, energia: 0
      })),
      turno: 0, ronda: 0, terminada: false, ganador: null
    };
  }

  // ---------- Consultas ----------
  const activo = (lado) => lado.equipo[lado.activo];
  const energiaMax = (c) => Math.min(Config.energiaMaxima, Config.energiaPorTurno + c.bonos.energia);

  // Valor base de una habilidad según las estadísticas del combatiente
  function valorHabilidad(c, h) {
    switch (h.tipo) {
      case "daño":
      case "cura": {
        const bono = h.tipo === "daño" ? c.bonos.danio : c.bonos.cura;
        return Math.max(1, Math.round(h.base * factorMagia(c.magia) * c.poder) + bono);
      }
      case "escudo": return Math.max(1, Math.round((h.base + c.defensa / 2) * c.poder) + c.bonos.escudo);
      case "energia": return h.base;
      default: return 0;
    }
  }

  // Valor que se aplicaría ahora mismo (incluye estados potenciado/debilitado)
  function valorActual(c, h) {
    const v = valorHabilidad(c, h);
    if (h.tipo !== "daño") return v;
    let mult = 1;
    if (c.estados.potenciado) mult *= MULT_POTENCIADO;
    if (c.estados.debilitado) mult *= MULT_DEBILITADO;
    return Math.max(1, Math.round(v * mult));
  }

  function textoEfecto(c, h) {
    const v = valorActual(c, h);
    switch (h.tipo) {
      case "daño": return `${v} de daño${h.extra === "debilitar" ? " + debilita" : ""}`;
      case "escudo": return `${v} de escudo`;
      case "cura": return `Cura ${v}`;
      case "energia": return `+${v} energía`;
      case "potenciar": return "Siguiente ataque +50%";
      case "debilitar": return "Rival -40% daño";
      default: return "";
    }
  }

  // Daño más alto que puede hacer con una sola habilidad (para el icono de espada del HUD)
  function ataqueMaximo(c) {
    const danos = c.habilidades.filter((h) => h.tipo === "daño").map((h) => valorHabilidad(c, h));
    return danos.length ? Math.max(...danos) : 0;
  }

  function puedeUsar(b, idx) {
    if (b.terminada) return false;
    const lado = b.lados[b.turno];
    const c = activo(lado);
    const h = c.habilidades[idx];
    if (!h || c.vida <= 0) return false;
    if (lado.energia < h.costo) return false;
    if ((c.enfriamiento[h.id] || 0) > 0) return false;
    if (h.tipo === "cura" && c.vida >= c.vidaMax) return false; // no tiene sentido curar con la vida llena
    return true;
  }

  // ---------- Acciones ----------
  function infligir(objetivo, cantidad) {
    const absorbido = Math.min(objetivo.escudo, cantidad);
    objetivo.escudo -= absorbido;
    const alVida = cantidad - absorbido;
    objetivo.vida = Math.max(0, objetivo.vida - alVida);
    return { absorbido, alVida };
  }

  function curar(c, cantidad) {
    const real = Math.min(cantidad, c.vidaMax - c.vida);
    c.vida += real;
    return real;
  }

  // Usa la habilidad idx del combatiente activo del lado en turno. Devuelve la lista de eventos
  // (la interfaz los usa para animar) o null si no se pudo usar.
  function usarHabilidad(b, idx) {
    if (!puedeUsar(b, idx)) return null;
    const miLado = b.turno, suLado = 1 - b.turno;
    const lado = b.lados[miLado], rival = b.lados[suLado];
    const c = activo(lado), objetivo = activo(rival);
    const h = c.habilidades[idx];
    const eventos = [{ t: "usa", lado: miLado, habilidad: h }];

    lado.energia -= h.costo;
    if (h.enfriamiento) c.enfriamiento[h.id] = h.enfriamiento;

    switch (h.tipo) {
      case "daño": {
        const total = valorActual(c, h);
        c.estados.potenciado = false;
        const r = infligir(objetivo, total);
        eventos.push({ t: "daño", lado: suLado, total, absorbido: r.absorbido, alVida: r.alVida });
        if (c.bonos.robovida > 0) {
          const real = curar(c, Math.round(total * c.bonos.robovida));
          if (real > 0) eventos.push({ t: "cura", lado: miLado, cantidad: real });
        }
        if (h.extra === "debilitar" && objetivo.vida > 0) {
          objetivo.estados.debilitado = true;
          eventos.push({ t: "estado", lado: suLado, texto: "¡Debilitado!" });
        }
        if (objetivo.vida <= 0) eventos.push({ t: "cae", lado: suLado });
        break;
      }
      case "escudo": {
        const v = valorActual(c, h);
        c.escudo += v;
        eventos.push({ t: "escudo", lado: miLado, cantidad: v });
        break;
      }
      case "cura": {
        const real = curar(c, valorActual(c, h));
        eventos.push({ t: "cura", lado: miLado, cantidad: real });
        break;
      }
      case "energia":
        lado.energia += h.base;
        eventos.push({ t: "energia", lado: miLado, cantidad: h.base });
        break;
      case "potenciar":
        c.estados.potenciado = true;
        eventos.push({ t: "estado", lado: miLado, texto: "¡Potenciado!" });
        break;
      case "debilitar":
        objetivo.estados.debilitado = true;
        eventos.push({ t: "estado", lado: suLado, texto: "¡Debilitado!" });
        break;
    }
    return eventos;
  }

  // Cambia el poni activo. gratis=true se usa cuando el activo cae y hay que reemplazarlo.
  function cambiarPoni(b, ladoIdx, idx, gratis = false) {
    const lado = b.lados[ladoIdx];
    const nuevo = lado.equipo[idx];
    if (!nuevo || nuevo.vida <= 0 || idx === lado.activo) return false;
    if (!gratis) {
      if (b.terminada || b.turno !== ladoIdx || lado.energia < Config.costoCambioPoni) return false;
      lado.energia -= Config.costoCambioPoni;
    }
    lado.activo = idx;
    return true;
  }

  function iniciarTurno(b) {
    const lado = b.lados[b.turno];
    const c = activo(lado);
    if (b.turno === 0) b.ronda += 1;
    const max = energiaMax(c);
    // En el primer turno de cada jugador del Duelo la energía es fija (compensa la ventaja de ir primero)
    const primerTurnoDuelo = b.modo === "duelo" && b.ronda === 1;
    lado.energia = primerTurnoDuelo ? Config.energiaPrimerTurnoDuelo[b.turno] : max;
    // Los enfriamientos avanzan un turno propio
    lado.equipo.forEach((p) => {
      Object.keys(p.enfriamiento).forEach((k) => { p.enfriamiento[k] = Math.max(0, p.enfriamiento[k] - 1); });
    });
    // El escudo base (por Defensa) se renueva al empezar el turno
    c.escudo = Math.round((c.defensa / 2) * c.poder);
  }

  // Termina el turno del lado actual y pasa al otro. Devuelve eventos (regeneración).
  function finTurno(b) {
    const lado = b.lados[b.turno];
    const c = activo(lado);
    const eventos = [];
    if (c.vida > 0 && c.bonos.regen > 0) {
      const real = curar(c, c.bonos.regen);
      if (real > 0) eventos.push({ t: "cura", lado: b.turno, cantidad: real });
    }
    c.estados.debilitado = false;
    b.turno = 1 - b.turno;
    return eventos;
  }

  function necesitaCambio(b, ladoIdx) {
    const lado = b.lados[ladoIdx];
    return activo(lado).vida <= 0 && lado.equipo.some((p) => p.vida > 0);
  }

  function revisarFin(b) {
    const vivos = b.lados.map((l) => l.equipo.some((p) => p.vida > 0));
    if (!vivos[0] || !vivos[1]) {
      b.terminada = true;
      b.ganador = vivos[0] ? 0 : 1;
    }
    return b.terminada;
  }

  // ---------- Inteligencia artificial (rivales del Desafío) ----------
  // Devuelve { tipo:"habilidad", idx } o { tipo:"fin" }
  function decidirIA(b) {
    const lado = b.lados[b.turno];
    const c = activo(lado);
    const r = activo(b.lados[1 - b.turno]);
    const usables = c.habilidades
      .map((h, idx) => ({ h, idx, v: valorActual(c, h) }))
      .filter((x) => puedeUsar(b, x.idx));
    if (!usables.length) return { tipo: "fin" };

    const por = (tipo) => usables.filter((x) => x.h.tipo === tipo);
    const danos = por("daño").sort((a, z) => z.v - a.v);
    const elegir = (x) => ({ tipo: "habilidad", idx: x.idx });

    // 1. Si puede rematar al rival, lo hace
    const remate = danos.find((x) => x.v >= r.vida + r.escudo);
    if (remate) return elegir(remate);
    // 2. Cura si le queda poca vida
    if (c.vida / c.vidaMax < 0.45 && por("cura").length) return elegir(por("cura")[0]);
    // 3. Utilidades gratuitas o baratas
    if (por("energia").length) return elegir(por("energia")[0]);
    if (por("potenciar").length && !c.estados.potenciado && danos.length) return elegir(por("potenciar")[0]);
    if (por("debilitar").length && !r.estados.debilitado) return elegir(por("debilitar")[0]);
    // 4. A veces se cubre con escudo
    if (por("escudo").length && c.escudo < 6 && Math.random() < 0.35) return elegir(por("escudo")[0]);
    // 5. Ataca con lo más fuerte que pueda pagar
    if (danos.length) return elegir(danos[0]);
    // 6. Lo que quede
    const resto = por("escudo")[0] || por("cura")[0];
    return resto ? elegir(resto) : { tipo: "fin" };
  }

  // ---------- Modo Desafío ----------
  // Las estadísticas del rival crecen de forma exponencial con la ronda.
  function escalaRonda(ronda) {
    return {
      vida: Math.pow(Config.desafio.crecimientoVida, ronda - 1),
      poder: Math.pow(Config.desafio.crecimientoPoder, ronda - 1)
    };
  }

  // Rondas 1-5: los ponis restantes (en el orden sorteado). Desde la 6: lobos.
  function crearRivalDesafio(ronda, ordenPonis) {
    const def = ronda <= Config.desafio.rondasConPonis ? PonisPorId[ordenPonis[ronda - 1]] : Lobo;
    return crearCombatiente(def, { escala: escalaRonda(ronda) });
  }

  // Elige 3 mejoras distintas con probabilidad según su peso
  function sortearMejoras(combatiente, cantidad = 3) {
    let pool = Mejoras.filter((m) => !(m.efecto.energia && energiaMax(combatiente) >= Config.energiaMaxima));
    const elegidas = [];
    while (elegidas.length < cantidad && pool.length) {
      const total = pool.reduce((s, m) => s + m.peso, 0);
      let tirada = Math.random() * total;
      const idx = pool.findIndex((m) => (tirada -= m.peso) < 0);
      const m = pool.splice(idx < 0 ? 0 : idx, 1)[0];
      elegidas.push(m);
    }
    return elegidas;
  }

  const barajar = (lista) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  return {
    crearCombatiente, aplicarMejora, crearBatalla,
    activo, energiaMax, valorHabilidad, valorActual, textoEfecto, ataqueMaximo,
    puedeUsar, usarHabilidad, cambiarPoni, iniciarTurno, finTurno,
    necesitaCambio, revisarFin, decidirIA,
    escalaRonda, crearRivalDesafio, sortearMejoras, barajar
  };
})();
