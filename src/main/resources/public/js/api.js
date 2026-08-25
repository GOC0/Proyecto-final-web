// servicio para consumir los endpoints rest con jwt de javalin
export class ManejadorAPI {
    constructor(auth) {
        this.auth = auth
    }

    // get /api/formularios/mis-formularios
    async obtenerMisFormularios() {
        const sesion = this.auth.obtenerUsuarioActual()
        if (!sesion || !sesion.token) {
            return { exito: false, mensaje: "no hay token de sesion activo" }
        }

        try {
            const resp = await fetch("/api/formularios/mis-formularios", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${sesion.token}`
                }
            })

            if (resp.status === 401) {
                return { exito: false, mensaje: "token jwt invalido o expirado" }
            }

            if (resp.ok) {
                const datos = await resp.json()
                return { exito: true, datos: datos }
            }

            return { exito: false, mensaje: "error del servidor al obtener formularios" }
        } catch (e) {
            return { exito: false, mensaje: "no se pudo conectar con el endpoint rest" }
        }
    }

    // post /api/formularios
    async crearFormularioAPI(formulario) {
        const sesion = this.auth.obtenerUsuarioActual()
        if (!sesion || !sesion.token) {
            return { exito: false, mensaje: "debes iniciar sesion para enviar a la api" }
        }

        try {
            // payload exacto para Formulario.java
            const payload = {
                nombre: formulario.nombre,
                sector: formulario.sector,
                nivelEscolar: formulario.nivelEscolar,
                foto: formulario.foto || "",
                latitude: String(formulario.latitude || ""),
                longitude: String(formulario.longitude || "")
            }

            const resp = await fetch("/api/formularios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sesion.token}`
                },
                body: JSON.stringify(payload)
            })

            if (resp.status === 401) {
                return { exito: false, mensaje: "token jwt no autorizado" }
            }

            if (resp.status === 201 || resp.ok) {
                const creado = await resp.json()
                return { exito: true, datos: creado }
            }

            return { exito: false, mensaje: "error al guardar formulario por api rest" }
        } catch (e) {
            return { exito: false, mensaje: "error de conexion con /api/formularios" }
        }
    }
}