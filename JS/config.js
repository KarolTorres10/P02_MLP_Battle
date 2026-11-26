// CONFIGURACION GENERAL DEL JUEGO

const Config = {
  // Ubicacion de respaldo
  ubicacionPorDefecto: { lat: 21.1236, lon: -101.686, nombre: "León, Guanajuato" },
  intervaloClimaMs: 10 * 60 * 1000,   // tiempo para volver a consultar el clima

  // Reglas de batalla
  energiaPorTurno: 3,
  energiaMaxima: 5,                    // tope con mejoras de energia
  pocion: { cura: 35, duelo: 3, desafio: 1 }, // mochila: pociones
  energiaPrimerTurnoDuelo: [2, 3],     // energia del primer turno de [jugador 1, jugador 2]
  tamanoEquipoDuelo: 3,
  permitirPonisRepetidosEnDuelo: true, // false = el jugador 2 no puede repetir los ponis del jugador 1

  // Modo Desafio
  desafio: {
    crecimientoVida: 1.1,              // vida del rival multiplicada por cada ronda (exponencial)
    crecimientoPoder: 1.05,            // daño/curacion/escudo rival multiplicado por cada ronda
    curacionEntreRondas: 0.4,          // % de vida máxima que recupera el jugador al pasar de ronda
    rondasConPonis: 5                  // tras vencer a los 5 ponis comienzan a aparecer lobos
  },

  // Pistas de musica
  pistas: [
    { nombre: "MLP Theme song", archivo: "ASSETS/Audio/My Little Pony Theme Song (Extended) (Instrumental).mp3"},
    { nombre: "Éxtasis", archivo: "ASSETS/Audio/EXTASIS - @ELMILLONARIOBM FT @elcarteldesantatv (Audio Oficial).mp3"},
    { nombre: "Mis ojos lloran por ti", archivo: "ASSETS/Audio/Big Boy — Mis Ojos Lloran Por Ti [Letra].mp3"},
    { nombre: "Rompe", archivo: "ASSETS/Audio/Daddy Yankee - Rompe (Lyrics).mp3"},
    { nombre: "Duro 2 horas", archivo: "ASSETS/Audio/Duro 2 horas - Faraón Love Shady (Vídeo Oficial).mp3"},
    { nombre: "Vaquero", archivo: "ASSETS/Audio/Vaquero (Remix).mp3"},
    { nombre: "Bad romance", archivo: "ASSETS/Audio/Lady Gaga - Bad Romance (Official Music Video).mp3"}
  ],

  // Claves de localStorage
  claves: {
    ajustes: "mlp_ajustes",
    record: "mlp_record",
    partida: "mlp_partida",
    ubicacion: "mlp_ubicacion",
    poniMenu: "mlp_poni_menu",   // poni que se muestra en el menú principal
    musica: "mlp_musica_silenciada",
    pista: "mlp_pista_musica"
  }
};