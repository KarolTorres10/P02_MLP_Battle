// ===== Acceso a localStorage con JSON =====
// Todo va dentro de try/catch: si el navegador bloquea localStorage el juego sigue funcionando.
const Almacen = {
  leer(clave, porDefecto = null) {
    try {
      const texto = localStorage.getItem(clave);
      return texto === null ? porDefecto : JSON.parse(texto);
    } catch {
      return porDefecto;
    }
  },
  guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch {
      return false;
    }
  },
  borrar(clave) {
    try { localStorage.removeItem(clave); } catch { /* sin acceso a localStorage */ }
  },
  borrarTodo() {
    Object.values(Config.claves).forEach((c) => Almacen.borrar(c));
  },

  // --- Récord del modo Desafío ---
  record() {
    return Almacen.leer(Config.claves.record, null); // { ronda, poni }
  },
  registrarRecord(ronda, poni) {
    const actual = Almacen.record();
    if (!actual || ronda > actual.ronda) {
      Almacen.guardar(Config.claves.record, { ronda, poni });
      return true; // nuevo récord
    }
    return false;
  }
};
