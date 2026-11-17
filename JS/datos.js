const Ponis = [
  {
    id: "twilight", nombre: "Twilight Sparkle", tipo: "Magia",
    vida: 4, magia: 5, defensa: 3,
    sprite: "ASSETS/ponis/twilight.png", retrato: "ASSETS/retratos/twilight.png", mira: "derecha",
    habilidades: [
      { id: "chispa",  nombre: "Chispa mágica",     icono: "✨", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0, precision: 100, pp: 25},
      { id: "escudo",  nombre: "Escudo de amistad", icono: "🛡️", costo: 1, tipo: "escudo", base: 4,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "armonia", nombre: "Luz de armonía",    icono: "💖", costo: 2, tipo: "cura",   base: 6,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "cometa",  nombre: "Cometa arcano",     icono: "☄️", costo: 2, tipo: "daño",   base: 21, enfriamiento: 0, precision: 75, pp: 5},
      { id: "brisa",   nombre: "Brisa arcana",      icono: "🌬️", costo: 0, tipo: "energia", base: 1, enfriamiento: 3, precision: 100, pp: 5}
    ]
  },
  {
    id: "rainbow-dash", nombre: "Rainbow Dash", tipo: "Velocidad",
    vida: 3, magia: 6, defensa: 1,
    sprite: "ASSETS/ponis/rainbow-dash.png", retrato: "ASSETS/retratos/rainbow-dash.png", mira: "derecha",
    habilidades: [
      { id: "estela",    nombre: "Estela veloz",    icono: "💨", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0, precision: 100, pp: 25},
      { id: "giro",      nombre: "Giro defensivo",  icono: "🌀", costo: 1, tipo: "escudo", base: 5,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "respiro",   nombre: "Respiro",         icono: "🍃", costo: 2, tipo: "cura",   base: 3,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "rainboom",  nombre: "Sonic Rainboom",  icono: "🌈", costo: 2, tipo: "daño",   base: 19, enfriamiento: 0, precision: 75, pp: 8},
      { id: "relampago", nombre: "Relámpago",       icono: "⚡", costo: 0, tipo: "daño",   base: 7,  enfriamiento: 3, precision: 100, pp: 6}
    ]
  },
  {
    id: "fluttershy", nombre: "Fluttershy", tipo: "Naturaleza",
    vida: 5, magia: 2, defensa: 4,
    sprite: "ASSETS/ponis/fluttershy.png", retrato: "ASSETS/retratos/fluttershy.png", mira: "derecha",
    habilidades: [
      { id: "ternura",  nombre: "Rayo de ternura",   icono: "🌸", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0, precision: 100, pp: 25},
      { id: "alas",     nombre: "Alas protectoras",  icono: "🪽", costo: 1, tipo: "escudo", base: 4,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "canto",    nombre: "Canto sanador",     icono: "🎶", costo: 2, tipo: "cura",   base: 9,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "mirada",   nombre: "Mirada paralizante", icono: "👁️", costo: 2, tipo: "daño",   base: 15,  enfriamiento: 0, precision: 80, pp: 5, extra: "debilitar"},
      { id: "susurro",  nombre: "Susurro animal",    icono: "🐰", costo: 0, tipo: "cura",   base: 11,  enfriamiento: 3, precision: 100, pp: 5}
    ]
  },
  {
    id: "pinkie-pie", nombre: "Pinkie Pie", tipo: "Fiesta",
    vida: 6, magia: 3, defensa: 3,
    sprite: "ASSETS/ponis/pinkie-pie.png", retrato: "ASSETS/retratos/pinkie-pie.png", mira: "derecha",
    habilidades: [
      { id: "globo",    nombre: "Globo explosivo",   icono: "🎈", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0, precision: 100, pp: 25},
      { id: "confeti",  nombre: "Confeti protector", icono: "🎊", costo: 1, tipo: "escudo", base: 3,  enfriamiento: 0, precision: 100, pp: 8},
      { id: "pastel",   nombre: "Pastel de fiesta",  icono: "🎂", costo: 2, tipo: "cura",   base: 7,  enfriamiento: 0, precision: 100, pp: 8},
      { id: "canon",    nombre: "Cañón de fiesta",   icono: "🎉", costo: 2, tipo: "daño",   base: 23, enfriamiento: 0, precision: 60, pp: 5},
      { id: "sorpresa", nombre: "¡Fiesta sorpresa!", icono: "🥳", costo: 0, tipo: "debilitar", base: 0, enfriamiento: 2, precision: 100, pp: 10}
    ]
  },
  {
    id: "rarity", nombre: "Rarity", tipo: "Cristal",
    vida: 3, magia: 5, defensa: 5,
    sprite: "ASSETS/ponis/rarity.png", retrato: "ASSETS/retratos/rarity.png", mira: "derecha",
    habilidades: [
      { id: "gema",     nombre: "Gema afilada",      icono: "💎", costo: 1, tipo: "daño",   base: 9,  enfriamiento: 0, precision: 100, pp: 25},
      { id: "barrera",  nombre: "Barrera de cristal", icono: "🔷", costo: 1, tipo: "escudo", base: 6,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "brillo",   nombre: "Brillo regenerador", icono: "🌟", costo: 2, tipo: "cura",   base: 5,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "lluvia",   nombre: "Lluvia de gemas",   icono: "💠", costo: 2, tipo: "daño",   base: 19, enfriamiento: 0, precision: 75, pp: 8},
      { id: "destello", nombre: "Destello de moda",  icono: "💅", costo: 0, tipo: "escudo", base: 9,  enfriamiento: 3, precision: 100, pp: 5}
    ]
  },
  {
    id: "applejack", nombre: "Applejack", tipo: "Fuerza",
    vida: 6, magia: 2, defensa: 4,
    sprite: "ASSETS/ponis/applejack.png", retrato: "ASSETS/retratos/applejack.png", mira: "derecha",
    habilidades: [
      { id: "coz",      nombre: "Coz de manzano",    icono: "🍎", costo: 1, tipo: "daño",   base: 10,  enfriamiento: 0, precision: 100, pp: 25},
      { id: "postura",  nombre: "Postura firme",     icono: "🪵", costo: 1, tipo: "escudo", base: 2,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "sidra",    nombre: "Sidra reconfortante", icono: "🍏", costo: 2, tipo: "cura", base: 5,  enfriamiento: 0, precision: 100, pp: 10},
      { id: "estampida", nombre: "Lazo y estampida", icono: "🤠", costo: 2, tipo: "daño",   base: 25, enfriamiento: 0, precision: 60, pp: 5},
      { id: "fuerza",   nombre: "Fuerza del campo",  icono: "💪", costo: 0, tipo: "potenciar", base: 0, enfriamiento: 2, precision: 100, pp: 5}
    ]
  }
];

// Enemigo exclusivo del modo Desafío (a partir de la ronda 6)
const Lobo = {
  id: "lobo-madera", nombre: "Lobo de madera", tipo: "Bestia",
  vida: 6, magia: 3, defensa: 1,
  sprite: "ASSETS/ponis/lobo-madera.png", retrato: "ASSETS/retratos/lobo-madera.png", mira: "izquierda",
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
