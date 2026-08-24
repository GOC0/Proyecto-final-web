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
                if (e.data === "VERIFICAR_SYNC" && navigator.onLine) {
                    this.sincronizarTodo();
                }
            };
        }
    }

    conectarWebSocket() {
        if (!navigator.onLine) return;

        const protocolo = window.location.protocol === "https:" ? "wss:" : "ws:";
        this.socket = new WebSocket(`${protocolo}//${window.location.host}/ws/sincronizacion`);

        this.socket.onopen = () => {
            console.log("WebSocket Javalin 7 conectado");
            this.sincronizarTodo();
        };

        this.socket.onmessage = (e) => {
            console.log("Servidor responde:", e.data);
        };

        this.socket.onclose = () => {
            setTimeout(() => this.conectarWebSocket(), 5000);
        };
    }

    async sincronizarTodo() {
        if (!navigator.onLine) return;

        const encuestas = await this.db.obtenerTodas();
        const pendientes = encuestas.filter(e => !e.sincronizado);

        for (const item of pendientes) {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(item));
                await this.db.marcarSincronizado(item.id);
            }
        }

        if (this.onActualizarUI) this.onActualizarUI();
    }
}