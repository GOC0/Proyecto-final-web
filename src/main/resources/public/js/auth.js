// clase de autenticacion real conectada a mongodb con cache en web storage
export class ManejadorAuth {
    constructor() {
        this.LLAVE_SESION_ACTIVA = "censo_sesion_activa"
        this.LLAVE_USUARIOS_CACHE = "censo_usuarios_validados_servidor"
    }

    // login real: valida contra el backend en mongo o contra el cache si esta offline
    async login(usuario, password, rolSeleccionado) {
        // 1 si hay internet validamos directo con javalin y mongodb
        if (navigator.onLine) {
            try {
                const body = new URLSearchParams()
                body.append("usuario", usuario)
                body.append("password", password)

                const resp = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: body.toString()
                })

                // si el backend responde 401 o falla
                if (resp.status === 401) {
                    return { exito: false, mensaje: "credenciales invalidas en el servidor mongo" }
                }

                // si el servidor respondio bien guardamos en web storage para cuando se caiga la red
                const sesion = {
                    usuario: usuario,
                    rol: rolSeleccionado || "ENCUESTADOR",
                    token: "jwt-server-" + btoa(usuario + ":" + Date.now()),
                    fechaAuth: new Date().toISOString()
                }

                this.guardarUsuarioEnCache(usuario, password, sesion.rol)
                sessionStorage.setItem(this.LLAVE_SESION_ACTIVA, JSON.stringify(sesion))
                return { exito: true, sesion: sesion, modo: "online" }

            } catch (error) {
                console.log("error conectando al servidor intentando login offline con cache")
            }
        }

        // 2 si no hay internet o se cayo la red validamos con web storage (req 10)
        const usuariosValidados = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS_CACHE) || "[]")
        const usuarioEncontrado = usuariosValidados.find(u => u.usuario === usuario && u.password === password)

        if (usuarioEncontrado) {
            const sesion = {
                usuario: usuarioEncontrado.usuario,
                rol: usuarioEncontrado.rol,
                token: "token-offline-" + btoa(usuario + ":" + Date.now()),
                fechaAuth: new Date().toISOString()
            }
            sessionStorage.setItem(this.LLAVE_SESION_ACTIVA, JSON.stringify(sesion))
            return { exito: true, sesion: sesion, modo: "offline" }
        } else {
            return {
                exito: false,
                mensaje: "este usuario nunca se ha autenticado en el servidor. conectate a internet para el primer acceso"
            }
        }
    }

    // guarda en localstorage solo los usuarios que el backend aprobo
    guardarUsuarioEnCache(usuario, password, rol) {
        let lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS_CACHE) || "[]")
        lista = lista.filter(u => u.usuario !== usuario)
        lista.push({ usuario, password, rol })
        localStorage.setItem(this.LLAVE_USUARIOS_CACHE, JSON.stringify(lista))
    }

    // creacion de usuario en el servidor javalin
    async crearUsuarioServidor(usuario, password) {
        if (!navigator.onLine) {
            return { exito: false, mensaje: "se requiere internet para registrar usuarios en la base de datos" }
        }

        try {
            const body = new URLSearchParams()
            body.append("usuario", usuario)
            body.append("password", password)

            const resp = await fetch("/crearUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString()
            })

            if (resp.status === 409) {
                return { exito: false, mensaje: "el usuario ya existe en mongodb" }
            }

            if (resp.ok || resp.status === 201) {
                // preguardamos en cache para permitir login offline posterior
                this.guardarUsuarioEnCache(usuario, password, "ENCUESTADOR")
                return { exito: true, mensaje: "usuario creado correctamente en el servidor" }
            }

            return { exito: false, mensaje: "error del servidor al crear usuario" }
        } catch (e) {
            return { exito: false, mensaje: "no se pudo conectar con el servidor javalin" }
        }
    }

    // cambio de rol en el servidor (patch /cambiarRol)
    async cambiarRolServidor(usuario, nuevoRol) {
        if (!navigator.onLine) {
            return { exito: false, mensaje: "debes estar online para cambiar roles en el backend" }
        }

        try {
            const body = new URLSearchParams()
            body.append("usuario", usuario)
            body.append("rol", nuevoRol)

            const resp = await fetch("/cambiarRol", {
                method: "PATCH",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString()
            })

            if (resp.ok) {
                // actualizamos en cache
                const lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS_CACHE) || "[]")
                const target = lista.find(u => u.usuario === usuario)
                if (target) {
                    target.rol = nuevoRol
                    localStorage.setItem(this.LLAVE_USUARIOS_CACHE, JSON.stringify(lista))
                }
                return { exito: true, mensaje: "rol actualizado en mongodb" }
            } else {
                const errorMsg = await resp.text()
                return { exito: false, mensaje: errorMsg || "error al cambiar rol" }
            }
        } catch (e) {
            return { exito: false, mensaje: "error de conexion con el servidor" }
        }
    }

    // eliminacion de usuario (delete /eliminarUsuario)
    async eliminarUsuarioServidor(usuario) {
        if (!navigator.onLine) {
            return { exito: false, mensaje: "debes estar online para eliminar usuarios de mongodb" }
        }

        try {
            const body = new URLSearchParams()
            body.append("usuario", usuario)

            const resp = await fetch("/eliminarUsuario", {
                method: "DELETE",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString()
            })

            if (resp.ok) {
                let lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS_CACHE) || "[]")
                lista = lista.filter(u => u.usuario !== usuario)
                localStorage.setItem(this.LLAVE_USUARIOS_CACHE, JSON.stringify(lista))
                return { exito: true, mensaje: "usuario eliminado de mongodb" }
            } else {
                const errorMsg = await resp.text()
                return { exito: false, mensaje: errorMsg || "no tienes permisos para eliminar" }
            }
        } catch (e) {
            return { exito: false, mensaje: "error de conexion con el servidor" }
        }
    }

    // cierre de sesion
    async logout() {
        if (navigator.onLine) {
            try {
                await fetch("/cerrarSession", { method: "POST" })
            } catch (e) {}
        }
        sessionStorage.removeItem(this.LLAVE_SESION_ACTIVA)
    }

    obtenerUsuarioActual() {
        const raw = sessionStorage.getItem(this.LLAVE_SESION_ACTIVA)
        return raw ? JSON.parse(raw) : null
    }

    estaAutenticado() {
        return this.obtenerUsuarioActual() !== null
    }
}