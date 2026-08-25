// clase para conectar websocket y worker con javalin 7
export class ManejadorSync {
    constructor(db, onActualizarUI) {
        this.db = db;
        this.onActualizarUI = onActualizarUI;
        this.socket = null;
        this.iniciarWorker();
        this.conectarWebSocket();
    }

    // lanza el worker en segundo plano
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

    // abre websocket al endpoint /ws/formularios de tu companero
    conectarWebSocket() {
        if (!navigator.onLine) return;

        const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
        this.socket = new WebSocket(`${proto}//${window.location.host}/ws/formularios`);

        this.socket.onopen = () => {
            console.log("websocket conectado a /ws/formularios");
            this.sincronizarTodo();
        };

        this.socket.onmessage = (e) => {
            console.log("javalin respondio: " + e.data);
        };

        this.socket.onclose = () => {
            // reintenta conexion cada 4 seg
            setTimeout(() => this.conectarWebSocket(), 4000);
        };
    }

    // envia solo los campos que jackson necesita en formulario java
    async sincronizarTodo() {
        if (!navigator.onLine) return;

        const encuestas = await this.db.obtenerTodas();
        const pendientes = encuestas.filter(e => !e.sincronizado);

        for (const item of pendientes) {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                // objeto limpio exacto para Formulario.java
                const payload = {
                    nombre: item.nombre,
                    sector: item.sector,
                    nivelEscolar: item.nivelEscolar,
                    usuarioRegis: item.usuarioRegis,
                    foto: item.foto || "",
                    latitude: String(item.latitude || ""),
                    longitude: String(item.longitude || "")
                };

                this.socket.send(JSON.stringify(payload));
                await this.db.marcarSincronizado(item.id);
            }
        }

        if (this.onActualizarUI) this.onActualizarUI();
    }
}