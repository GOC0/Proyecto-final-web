// sincronizacion automatica por websocket a /ws/formularios
export class ManejadorSync {
    constructor(db, onActualizarUI) {
        this.db = db
        this.onActualizarUI = onActualizarUI
        this.socket = null
        this.LLAVE_SESION_ACTIVA = "censo_sesion_activa" // misma llave que auth.js
        this.iniciarWorker()
        this.conectarWebSocket()
    }

    obtenerToken() {
        const raw = sessionStorage.getItem(this.LLAVE_SESION_ACTIVA)
        return raw ? JSON.parse(raw).token : null
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

      // evita crear un segundo socket si ya hay uno abierto o conectandose
      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
          console.log("ya existe una conexion activa o en progreso, no se crea otra")
          return
      }

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

          this.socket.onmessage = async (e) => {
              try {
                  const resp = JSON.parse(e.data)
                  if (resp.status === "OK" && resp.id) {
                      await this.db.marcarSincronizado(resp.id)
                      if (this.onActualizarUI) this.onActualizarUI()
                  } else if (resp.status === "ERROR") {
                      console.warn("servidor rechazo formulario:", resp.motivo || resp.id)
                  }
              } catch (err) {
                  console.log("respuesta no-JSON del servidor:", e.data)
              }
          }

          this.socket.onclose = () => {
              this.socket = null // limpia la referencia para que la proxima llamada sepa que no hay conexion activa
              if (navigator.onLine) {
                  setTimeout(() => this.conectarWebSocket(), 3000)
              }
          }
      } catch (e) {
          console.error("error conectando socket:", e)
      }
  }

  async sincronizarTodo() {
      if (!navigator.onLine) {
          console.log("sin conexion, no se puede sincronizar")
          return
      }

      // si el socket no esta listo, intenta conectar y deja que onopen dispare la sincronizacion
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          console.log("socket no listo, reintentando conexion...")
          this.conectarWebSocket()
          return
      }

      const token = this.obtenerToken()
      if (!token) {
          console.log("no hay sesion activa, no se puede sincronizar")
          return
      }

      const encuestas = await this.db.obtenerTodas()
      const pendientes = encuestas.filter(e => !e.sincronizado)
      if (pendientes.length === 0) return

      for (const item of pendientes) {
          const formulario = {
              nombre: item.nombre,
              sector: item.sector,
              nivelEscolar: item.nivelEscolar,
              usuarioRegis: item.usuarioRegis,
              foto: item.foto || "",
              latitude: String(item.latitude || ""),
              longitude: String(item.longitude || "")
          }
          const payload = { token: token, id: item.id, data: formulario }
          console.log("enviando al servidor:", payload)
          this.socket.send(JSON.stringify(payload))
      }
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