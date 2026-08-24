// Verifica cada 10 segundos si debe sincronizar
setInterval(() => {
    self.postMessage("VERIFICAR_SYNC");
}, 10000);