// worker en segundo plano cada 8 segundos
setInterval(() => {
    self.postMessage("TOCA_SINCRONIZAR");
}, 8000);