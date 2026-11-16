// ===== Arranque del juego =====
(function arrancar() {
  // Precarga de imágenes para que no "aparezcan" a medias al cambiar de pantalla
  [...Ponis, Lobo].forEach((p) => { new Image().src = p.sprite; new Image().src = p.retrato; });
  new Image().src = "ASSETS/titulo-juego.png";
  // Los 12 fondos (6 pantallas x día/noche) se descargan al terminar de cargar la página
  window.addEventListener("load", () => {
    ["inicio", "menu", "modos", "ponis", "cartas", "batalla"].forEach((pantalla) =>
      ["dia", "noche"].forEach((momento) => { new Image().src = `ASSETS/Fondos/${pantalla}-${momento}.png`; }));
  });

  Modal.iniciar();
  Menu.iniciar();
  Modos.iniciar();
  SeleccionPoni.iniciarEventos();
  Cartas.iniciarEventos();
  Batalla.iniciarEventos();

  // Escenario y clima: el fondo se actualiza cada vez que Open-Meteo (o los Ajustes) cambian el clima
  Escenario.iniciar($("#escenario"));
  Clima.alCambiar((estado) => {
    Escenario.configurar(estado);
    ChipClima.actualizar();
  });
  Escenario.configurar(Clima.actual());
  ChipClima.actualizar();
  setInterval(ChipClima.actualizar, 15000); // el reloj del chip avanza solo
  Clima.iniciar();

  // Pantalla de inicio: botón COMENZAR o cualquier tecla (menos las de navegación o modificadoras)
  const TECLAS_IGNORADAS = ["Tab", "Shift", "Control", "Alt", "Meta", "CapsLock", "Escape"];
  const entrar = (e) => {
    if (Pantallas.actual !== "inicio" || Modal.abierto()) return;
    if (e.type === "keydown" && (TECLAS_IGNORADAS.includes(e.key) || e.target.closest?.("#btn-ajustes-inicio"))) return;
    Pantallas.mostrar("menu");
  };
  $("#btn-comenzar").addEventListener("click", entrar);
  document.addEventListener("keydown", entrar);

  // Botón Ajustes de la pantalla de inicio (abre la misma ventana que el del menú principal)
  $("#btn-ajustes-inicio").addEventListener("click", () => Ajustes.abrir());

  Pantallas.mostrar("inicio");
})();