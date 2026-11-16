// ===== Configuración general del juego =====
// Cambia estos valores para ajustar el clima, las reglas y la dificultad.
const Config = {
  // Ubicación que usa Open-Meteo si el navegador no da (o no permite) la ubicación real
  ubicacionPorDefecto: { lat: 21.1236, lon: -101.686, nombre: "León, Guanajuato" },
  intervaloClimaMs: 10 * 60 * 1000,   // cada cuánto se vuelve a consultar el clima

  // Reglas de batalla
  energiaPorTurno: 3,
  energiaMaxima: 5,                    // tope con mejoras de energía
  costoCambioPoni: 1,                  // energía que cuesta cambiar de poni en Duelo
  energiaPrimerTurnoDuelo: [2, 4],     // energía del primer turno de [jugador 1, jugador 2] (compensa la ventaja de ir primero)
  tamanoEquipoDuelo: 3,
  permitirPonisRepetidosEnDuelo: true, // false = el jugador 2 no puede repetir los ponis del jugador 1

  // Modo Desafío (rondas infinitas)
  desafio: {
    crecimientoVida: 1.1,              // la vida del rival se multiplica por 1.1 en cada ronda (crecimiento exponencial)
    crecimientoPoder: 1.05,            // el daño/curación/escudo del rival se multiplica por 1.05 en cada ronda
    curacionEntreRondas: 0.4,          // % de vida máxima que recupera tu poni al vencer una ronda
    rondasConPonis: 5                  // tras vencer a los 5 ponis restantes, los rivales son lobos
  },

  // Claves de localStorage
  claves: {
    ajustes: "mlp_ajustes",
    record: "mlp_record",
    partida: "mlp_partida",
    ubicacion: "mlp_ubicacion",
    poniMenu: "mlp_poni_menu"   // poni que se muestra en el menú principal
  }
};