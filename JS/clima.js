// API: https://open-meteo.com/en/docs
// "current" = temperatura, código del clima (WMO) e is_day (1 = día, 0 = noche).
const Clima = (() => {
  const ETIQUETAS = {
    despejado: "Despejado", nublado: "Nublado", niebla: "Niebla",
    lluvia: "Lluvia", nieve: "Nieve", tormenta: "Tormenta"
  };

  // Códigos WMO = categoría del escenario
  function categoriaDesdeCodigo(codigo) {
    if (codigo === 0 || codigo === 1) return "despejado";
    if (codigo === 2 || codigo === 3) return "nublado";
    if (codigo === 45 || codigo === 48) return "niebla";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return "lluvia";
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return "nieve";
    if ([95, 96, 99].includes(codigo)) return "tormenta";
    return "despejado";
  }

  // 1 = ligera, 2 = moderada, 3 = fuerte (control de gotas y copos)
  function intensidadDesdeCodigo(codigo) {
    if ([51, 56, 61, 71, 77, 80, 85].includes(codigo)) return 1;
    if ([55, 57, 65, 67, 75, 82, 86, 99].includes(codigo)) return 3;
    return 2;
  }

  // captura asincronica de dia/noche segun hora del dispositivo
  const esDiaPorHora = (fecha = new Date()) => fecha.getHours() >= 7 && fecha.getHours() < 19;

  let auto = {
    esDia: esDiaPorHora(), categoria: "despejado", intensidad: 1,
    temperatura: null, zona: null, fuente: "estimado", codigo: null
  };
  let ajustes = Object.assign(
    { manual: false, esDia: true, categoria: "despejado"},
    Almacen.leer(Config.claves.ajustes, {})
  );
  const oyentes = new Set();

  // ESTADO A USAR: (Open-Meteo) o manual desde ajustes
  function actual() {
    if (ajustes.manual) {
      return { esDia: ajustes.esDia, categoria: ajustes.categoria, intensidad: 2, temperatura: null, zona: auto.zona, fuente: "manual" };
    }
    return { ...auto };
  }
  const emitir = () => oyentes.forEach((fn) => fn(actual()));

  // Hora local (HH:MM)
  function horaTexto() {
    const opciones = { hour: "2-digit", minute: "2-digit", hour12: false };
    try {
      return new Date().toLocaleTimeString("es-MX", { ...opciones, timeZone: auto.zona || undefined });
    } catch {
      return new Date().toLocaleTimeString("es-MX", opciones);
    }
  }

  // Ubicacion
  function obtenerUbicacion() {
    const guardada = Almacen.leer(Config.claves.ubicacion);
    if (guardada && Date.now() - guardada.t < 24 * 60 * 60 * 1000) return Promise.resolve(guardada);
    return new Promise((resolve) => {
      const respaldo = () => resolve({ ...Config.ubicacionPorDefecto });
      if (!navigator.geolocation) return respaldo();
      const limite = setTimeout(respaldo, 6000); // no obtiene permiso
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(limite);
          const u = { lat: pos.coords.latitude, lon: pos.coords.longitude, t: Date.now() };
          Almacen.guardar(Config.claves.ubicacion, u);
          resolve(u);
        },
        () => { clearTimeout(limite); respaldo(); },
        { timeout: 5000, maximumAge: 60 * 60 * 1000 }
      );
    });
  }

  async function consultar(u) {
    const url = "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${Number(u.lat).toFixed(4)}&longitude=${Number(u.lon).toFixed(4)}` +
      "&current=temperature_2m,weather_code,is_day&timezone=auto";
    const control = new AbortController();
    const limite = setTimeout(() => control.abort(), 8000);
    try {
      const respuesta = await fetch(url, { signal: control.signal });
      if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
      const datos = await respuesta.json();
      const c = datos.current;
      auto = {
        esDia: c.is_day === 1,
        categoria: categoriaDesdeCodigo(c.weather_code),
        intensidad: intensidadDesdeCodigo(c.weather_code),
        temperatura: Math.round(c.temperature_2m),
        zona: datos.timezone || null,
        fuente: "Open-Meteo",
        codigo: c.weather_code
      };
    } finally {
      clearTimeout(limite);
    }
  }

  async function refrescar() {
    try {
      await consultar(await obtenerUbicacion());
    } catch {
      // ASINCRONICO = Se conserva el ultimo clima registrado y se estima la hora
      auto = { ...auto, esDia: esDiaPorHora(), fuente: "estimado", temperatura: null };
    }
    emitir();
  }

  function iniciar() {
    refrescar();
    setInterval(refrescar, Config.intervaloClimaMs);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refrescar(); });
  }

  function guardarAjustes(nuevos) {
    ajustes = { ...ajustes, ...nuevos };
    Almacen.guardar(Config.claves.ajustes, ajustes);
    emitir();
  }

  const icono = (e) => ({
    despejado: e.esDia ? "☀️" : "🌙", nublado: "☁️", niebla: "🌫️",
    lluvia: "🌧️", nieve: "❄️", tormenta: "⛈️"
  }[e.categoria] || "☀️");

  return {
    ETIQUETAS, iniciar, refrescar, actual, horaTexto, icono, categoriaDesdeCodigo,
    alCambiar: (fn) => oyentes.add(fn),
    ajustes: () => ({ ...ajustes }),
    guardarAjustes
  };
})();
