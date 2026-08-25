// sincronizacion automatica por websocket a /ws/formularios
export class ManejadorSync {
    constructor(db, onActualizarUI) {
        this.db = db
        this.onActualizarUI = onActualizarUI
        this.socket = null
        this.iniciarWorker()
        this.conectarWebSocket()
    }

    iniciarWorker() {
        if (window.Worker) {
            this.worker = new Worker("js/worker.js")
            this.worker.onmessage = (e) => {
                if (e.data === "TOCA_SINCRONIZAR" && navigator.onLine) {
                    this.sincronizarTodo()
                }
            }
        }
    }

    conectarWebSocket() {
        if (!navigator.onLine) return

        const puerto = window.location.port ? window.location.port : "7000"
        const host = window.location.hostname || "localhost"
        const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
        const urlSocket = `${proto}//${host}:${puerto}/ws/formularios`

        try {
            this.socket = new WebSocket(urlSocket)

            this.socket.onopen = () => {
                console.log("websocket conectado a /ws/formularios")
                this.sincronizarTodo()
            }

            this.socket.onmessage = (e) => {
                console.log("servidor javalin respondio:", e.data)
            }

            this.socket.onclose = () => {
                setTimeout(() => this.conectarWebSocket(), 3000)
            }
        } catch (e) {
            console.error("error conectando socket:", e)
        }
    }

    // envia solo las variables exactas que Formulario.java espera en el backend
    async sincronizarTodo() {
        if (!navigator.onLine) return

        const encuestas = await this.db.obtenerTodas()
        const pendientes = encuestas.filter(e => !e.sincronizado)

        if (pendientes.length === 0) return

        for (const item of pendientes) {
            const payload = {
                nombre: item.nombre,
                sector: item.sector,
                nivelEscolar: item.nivelEscolar,
                usuarioRegis: item.usuarioRegis,
                foto: item.foto || "",
                latitude: String(item.latitude || ""),
                longitude: String(item.longitude || "")
            }

            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                console.log("enviando al servidor:", payload)
                this.socket.send(JSON.stringify(payload))
                await this.db.marcarSincronizado(item.id)
            }
        }

        if (this.onActualizarUI) this.onActualizarUI()
    }

    async eliminarFormServidor(id) {
        if (navigator.onLine) {
            try {
                const body = new URLSearchParams()
                body.append("id", String(id))
                await fetch("/eliminarForm", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: body.toString()
                })
            } catch (e) {}
        }
    }
}