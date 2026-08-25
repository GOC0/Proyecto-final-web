// sincronizacion por websocket con fallback rest /registrarFormulario
export class ManejadorSync {
    constructor(db, onActualizarUI) {
        this.db = db;
        this.onActualizarUI = onActualizarUI;
        this.socket = null;
        this.iniciarWorker();
        this.conectarWebSocket();
    }

    iniciarWorker() {
        if (window.Worker) {
            this.worker = new Worker("js/worker.js");
            this.worker.onmessage = (e) => {
                if (e.data === "TOCA_SINCRONIZAR" && navigator.onLine) {
                    this.sincronizarTodo();
                }
            };
        }
    }

    conectarWebSocket() {
        if (!navigator.onLine) return;

        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        this.socket = new WebSocket(`${proto}//${window.location.host}/ws/formularios`);

        this.socket.onopen = () => {
            console.log("websocket javalin conectado fino");
            this.sincronizarTodo();
        };

        this.socket.onmessage = (e) => {
            console.log("servidor respondio: " + e.data);
        };

        this.socket.onclose = () => {
            setTimeout(() => this.conectarWebSocket(), 4000);
        };
    }

    async sincronizarTodo() {
        if (!navigator.onLine) return;

        const encuestas = await this.db.obtenerTodas();
        const pendientes = encuestas.filter(e => !e.sincronizado);

        for (const item of pendientes) {
            const payload = {
                nombre: item.nombre,
                sector: item.sector,
                nivelEscolar: item.nivelEscolar,
                usuarioRegis: item.usuarioRegis,
                foto: item.foto || "",
                latitude: String(item.latitude || ""),
                longitude: String(item.longitude || "")
            };

            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(payload));
                await this.db.marcarSincronizado(item.id);
            } else {
                // envio por ruta post /registrarFormulario
                try {
                    const body = new URLSearchParams();
                    body.append("nombre", item.nombre);
                    body.append("sector", item.sector);
                    body.append("nivel", item.nivelEscolar);
                    body.append("foto", item.foto || "");
                    body.append("latitude", String(item.latitude || ""));
                    body.append("longitude", String(item.longitude || ""));

                    const res = await fetch("/registrarFormulario", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: body.toString()
                    });
                    if (res.ok) {
                        await this.db.marcarSincronizado(item.id);
                    }
                } catch (err) {}
            }
        }

        if (this.onActualizarUI) this.onActualizarUI();
    }

    // ruta delete /eliminarForm
    async eliminarFormServidor(id) {
        if (navigator.onLine) {
            try {
                const body = new URLSearchParams();
                body.append("id", String(id));
                await fetch("/eliminarForm", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: body.toString()
                });
            } catch (e) {}
        }
    }
}