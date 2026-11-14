// ===== Arranque del juego =====
(function arrancar() {
  // Precarga de imágenes para que no "aparezcan" a medias al cambiar de pantalla
  [...Ponis, Lobo].forEach((p) => { new Image().src = p.sprite; new Image().src = p.retrato; });

  Modal.iniciar();
  Menu.iniciar();
  Modos.iniciar();
  SeleccionPoni.iniciarEventos();
  Cartas.iniciarEventos();
  Batalla.iniciarEventos();

  // Escenario y clima: el fondo se redibuja cada vez que Open-Meteo (o los Ajustes) cambian el clima
  Escenario.iniciar($("#escenario"));
  Clima.alCambiar((estado) => {
    Escenario.configurar(estado);
    ChipClima.actualizar();
  });
  Escenario.configurar(Clima.actual());
  ChipClima.actualizar();
  setInterval(ChipClima.actualizar, 15000); // el reloj del chip avanza solo
  Clima.iniciar();

  // Pantalla de inicio: botón COMENZAR o cualquier tecla
  const entrar = () => {
    if (Pantallas.actual === "inicio" && !Modal.abierto()) Pantallas.mostrar("menu");
  };
  $("#btn-comenzar").addEventListener("click", entrar);
  document.addEventListener("keydown", entrar);

  Pantallas.mostrar("inicio");
})();
