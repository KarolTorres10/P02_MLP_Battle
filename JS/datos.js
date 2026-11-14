// ===== Datos del juego (ponis, habilidades, mejoras) =====
// Habilidad: { id, nombre, icono, costo, tipo, base, enfriamiento, extra? }
//   tipo:  daño | escudo | cura | energia | potenciar | debilitar
//   base:  valor base. El valor final depende de las estadísticas del poni (ver motor.js)
//   enfriamiento: turnos propios que hay que esperar para volver a usarla (0 = sin espera)
//   extra: efecto adicional opcional ("debilitar")
// Estadísticas (1 a 6): vida -> vida máx. = 20 + 5 x vida | magia -> potencia daño y curación | defensa -> escudo

const Ponis = [
  {
    id: "twilight", nombre: "Twilight Sparkle", tipo: "Magia",
    vida: 4, magia: 5, defensa: 3,
    sprite: "IMG/ponis/twilight.png", retrato: "IMG/retratos/twilight.png", mira: "derecha",
    habilidades: [
      { id: "chispa",  nombre: "Chispa mágica",     icono: "✨", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0 },
      { id: "escudo",  nombre: "Escudo de amistad", icono: "🛡️", costo: 1, tipo: "escudo", base: 3,  enfriamiento: 0 },
      { id: "armonia", nombre: "Luz de armonía",    icono: "💖", costo: 2, tipo: "cura",   base: 6,  enfriamiento: 0 },
      { id: "cometa",  nombre: "Cometa arcano",     icono: "☄️", costo: 2, tipo: "daño",   base: 16, enfriamiento: 0 },
      { id: "brisa",   nombre: "Brisa arcana",      icono: "🌬️", costo: 0, tipo: "energia", base: 1, enfriamiento: 3 }
    ]
  },
  {
    id: "rainbow-dash", nombre: "Rainbow Dash", tipo: "Velocidad",
    vida: 4, magia: 4, defensa: 1,
    sprite: "IMG/ponis/rainbow-dash.png", retrato: "IMG/retratos/rainbow-dash.png", mira: "derecha",
    habilidades: [
      { id: "estela",    nombre: "Estela veloz",    icono: "💨", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0 },
      { id: "giro",      nombre: "Giro defensivo",  icono: "🌀", costo: 1, tipo: "escudo", base: 3,  enfriamiento: 0 },
      { id: "respiro",   nombre: "Respiro",         icono: "🍃", costo: 2, tipo: "cura",   base: 5,  enfriamiento: 0 },
      { id: "rainboom",  nombre: "Sonic Rainboom",  icono: "🌈", costo: 2, tipo: "daño",   base: 17, enfriamiento: 0 },
      { id: "relampago", nombre: "Relámpago",       icono: "⚡", costo: 0, tipo: "daño",   base: 7,  enfriamiento: 3 }
    ]
  },
  {
    id: "fluttershy", nombre: "Fluttershy", tipo: "Naturaleza",
    vida: 5, magia: 2, defensa: 4,
    sprite: "IMG/ponis/fluttershy.png", retrato: "IMG/retratos/fluttershy.png", mira: "derecha",
    habilidades: [
      { id: "ternura",  nombre: "Rayo de ternura",   icono: "🌸", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0 },
      { id: "alas",     nombre: "Alas protectoras",  icono: "🪽", costo: 1, tipo: "escudo", base: 4,  enfriamiento: 0 },
      { id: "canto",    nombre: "Canto sanador",     icono: "🎶", costo: 2, tipo: "cura",   base: 9,  enfriamiento: 0 },
      { id: "mirada",   nombre: "Mirada paralizante", icono: "👁️", costo: 2, tipo: "daño",   base: 12,  enfriamiento: 0, extra: "debilitar" },
      { id: "susurro",  nombre: "Susurro animal",    icono: "🐰", costo: 0, tipo: "cura",   base: 6,  enfriamiento: 3 }
    ]
  },
  {
    id: "pinkie-pie", nombre: "Pinkie Pie", tipo: "Fiesta",
    vida: 6, magia: 3, defensa: 3,
    sprite: "IMG/ponis/pinkie-pie.png", retrato: "IMG/retratos/pinkie-pie.png", mira: "derecha",
    habilidades: [
      { id: "globo",    nombre: "Globo explosivo",   icono: "🎈", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0 },
      { id: "confeti",  nombre: "Confeti protector", icono: "🎊", costo: 1, tipo: "escudo", base: 3,  enfriamiento: 0 },
      { id: "pastel",   nombre: "Pastel de fiesta",  icono: "🎂", costo: 2, tipo: "cura",   base: 7,  enfriamiento: 0 },
      { id: "canon",    nombre: "Cañón de fiesta",   icono: "🎉", costo: 2, tipo: "daño",   base: 16, enfriamiento: 0 },
      { id: "sorpresa", nombre: "¡Fiesta sorpresa!", icono: "🥳", costo: 0, tipo: "debilitar", base: 0, enfriamiento: 3 }
    ]
  },
  {
    id: "rarity", nombre: "Rarity", tipo: "Cristal",
    vida: 4, magia: 5, defensa: 5,
    sprite: "IMG/ponis/rarity.png", retrato: "IMG/retratos/rarity.png", mira: "derecha",
    habilidades: [
      { id: "gema",     nombre: "Gema afilada",      icono: "💎", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0 },
      { id: "barrera",  nombre: "Barrera de cristal", icono: "🔷", costo: 1, tipo: "escudo", base: 3,  enfriamiento: 0 },
      { id: "brillo",   nombre: "Brillo regenerador", icono: "🌟", costo: 2, tipo: "cura",   base: 6,  enfriamiento: 0 },
      { id: "lluvia",   nombre: "Lluvia de gemas",   icono: "💠", costo: 2, tipo: "daño",   base: 16, enfriamiento: 0 },
      { id: "destello", nombre: "Destello de moda",  icono: "💅", costo: 0, tipo: "escudo", base: 2,  enfriamiento: 3 }
    ]
  },
  {
    id: "applejack", nombre: "Applejack", tipo: "Fuerza",
    vida: 6, magia: 2, defensa: 4,
    sprite: "IMG/ponis/applejack.png", retrato: "IMG/retratos/applejack.png", mira: "derecha",
    habilidades: [
      { id: "coz",      nombre: "Coz de manzano",    icono: "🍎", costo: 1, tipo: "daño",   base: 10,  enfriamiento: 0 },
      { id: "postura",  nombre: "Postura firme",     icono: "🪵", costo: 1, tipo: "escudo", base: 3,  enfriamiento: 0 },
      { id: "sidra",    nombre: "Sidra reconfortante", icono: "🍏", costo: 2, tipo: "cura", base: 7,  enfriamiento: 0 },
      { id: "estampida", nombre: "Lazo y estampida", icono: "🤠", costo: 2, tipo: "daño",   base: 17, enfriamiento: 0 },
      { id: "fuerza",   nombre: "Fuerza del campo",  icono: "💪", costo: 0, tipo: "potenciar", base: 0, enfriamiento: 3 }
    ]
  }
];

// Enemigo exclusivo del modo Desafío (a partir de la ronda 6)
const Lobo = {
  id: "lobo-madera", nombre: "Lobo de madera", tipo: "Bestia",
  vida: 6, magia: 3, defensa: 1,
  sprite: "IMG/ponis/lobo-madera.png", retrato: "IMG/retratos/lobo-madera.png", mira: "izquierda",
  habilidades: [
    { id: "zarpazo",  nombre: "Zarpazo",           icono: "🐾", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0 },
    { id: "corteza",  nombre: "Corteza",           icono: "🪵", costo: 1, tipo: "escudo", base: 3,  enfriamiento: 0 },
    { id: "mordisco", nombre: "Mordisco de raíz",  icono: "🦷", costo: 2, tipo: "daño",   base: 16, enfriamiento: 0 },
    { id: "aullido",  nombre: "Aullido",           icono: "🌕", costo: 0, tipo: "potenciar", base: 0, enfriamiento: 3 }
  ]
};

// Mejoras permanentes del modo Desafío (las cartas de "Elige una mejora")
// efecto: vidaMax, magia, defensa, danio, cura, escudo, energia, robovida, regen (se suman al poni)
// peso: probabilidad relativa de aparecer
const Mejoras = [
  { id: "corazon",    nombre: "Corazón fuerte",      icono: "❤️", insignia: "+8",  texto: "+8 de vida máxima (y curas 8)",              efecto: { vidaMax: 8 },   peso: 3 },
  { id: "magia",      nombre: "Magia creciente",     icono: "🔮", insignia: "+1",  texto: "+1 de Magia: más daño y curación",           efecto: { magia: 1 },     peso: 3 },
  { id: "defensa",    nombre: "Piel de cristal",     icono: "🛡️", insignia: "+2",  texto: "+2 de Defensa: más escudo cada turno",       efecto: { defensa: 2 },   peso: 3 },
  { id: "danio",      nombre: "Garra afilada",       icono: "⚔️", insignia: "+3",  texto: "+3 de daño en todos tus ataques",            efecto: { danio: 3 },     peso: 3 },
  { id: "cura",       nombre: "Luz sanadora",        icono: "💚", insignia: "+3",  texto: "+3 a todas tus curaciones",                  efecto: { cura: 3 },      peso: 2 },
  { id: "escudo",     nombre: "Escudo brillante",    icono: "🔷", insignia: "+3",  texto: "+3 a todos tus escudos",                     efecto: { escudo: 3 },    peso: 2 },
  { id: "energia",    nombre: "Reserva de energía",  icono: "🔋", insignia: "+1",  texto: "+1 de energía en cada turno",                efecto: { energia: 1 },   peso: 1 },
  { id: "vampirismo", nombre: "Mordisco vital",      icono: "🩸", insignia: "20%", texto: "Recuperas el 20% del daño que infliges",     efecto: { robovida: 0.2 }, peso: 1.5 },
  { id: "regen",      nombre: "Brote de vida",       icono: "🌱", insignia: "+2",  texto: "Recuperas 2 de vida al final de cada turno", efecto: { regen: 2 },     peso: 2 }
];

const PonisPorId = Object.fromEntries([...Ponis, Lobo].map((p) => [p.id, p]));
const MejorasPorId = Object.fromEntries(Mejoras.map((m) => [m.id, m]));
