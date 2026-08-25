// autenticacion conectada a mongodb con roles compatibles Usuario y Administrador
export class ManejadorAuth {
    constructor() {
        this.LLAVE_SESION_ACTIVA = "censo_sesion_activa"
        this.LLAVE_USUARIOS_CACHE = "censo_usuarios_validados_servidor"
        this.crearAdminPorDefecto()
    }

    // usuario base en cache
    crearAdminPorDefecto() {
        if (!localStorage.getItem(this.LLAVE_USUARIOS_CACHE)) {
            const iniciales = [
                { usuario: "admin", password: "123", rol: "Administrador" },
                { usuario: "encuestador1", password: "123", rol: "Usuario" }
            ]
            localStorage.setItem(this.LLAVE_USUARIOS_CACHE, JSON.stringify(iniciales))
        }
    }

    // login que consulta a javalin
   async login(usuario, password) {
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

               if (resp.status === 401) {
                   return { exito: false, mensaje: "credenciales invalidas en el servidor" }
               }

               if (!resp.ok) {
                   return { exito: false, mensaje: "error del servidor" }
               }

               // usar los datos reales que manda el servidor, no inventarlos
               const datos = await resp.json()

               const sesion = {
                   usuario: datos.usuario,
                   rol: datos.rol,
                   token: datos.token,
                   fechaAuth: new Date().toISOString()
               }

               this.guardarUsuarioEnCache(usuario, password, datos.rol)
               sessionStorage.setItem(this.LLAVE_SESION_ACTIVA, JSON.stringify(sesion))
               return { exito: true, sesion: sesion, modo: "online" }

           } catch (err) {
               console.log("servidor offline validando con cache local")
           }
       }

       // fallback offline (esto queda igual)
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
               mensaje: "usuario no encontrado en cache. inicia sesion online una vez primero"
           }
       }
   }

    guardarUsuarioEnCache(usuario, password, rol) {
        let lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS_CACHE) || "[]")
        lista = lista.filter(u => u.usuario !== usuario)
        lista.push({ usuario, password, rol: rol || "Usuario" })
        localStorage.setItem(this.LLAVE_USUARIOS_CACHE, JSON.stringify(lista))
    }

    // registra en mongo con rol Usuario por defecto
    async crearUsuarioServidor(usuario, password) {
        if (!navigator.onLine) {
            return { exito: false, mensaje: "se requiere conexion para registrar usuarios" }
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

            if (resp.ok || resp.status === 201 || resp.redirected) {
                this.guardarUsuarioEnCache(usuario, password, "Usuario")
                return { exito: true, mensaje: "usuario creado con rol Usuario" }
            }

            return { exito: false, mensaje: "error del servidor al crear usuario" }
        } catch (e) {
            return { exito: false, mensaje: "no se pudo conectar al servidor" }
        }
    }

    // ruta patch /cambiarRol
    async cambiarRolServidor(usuario, nuevoRol) {
        const sesion = this.obtenerUsuarioActual()
        if (!sesion || sesion.rol !== "Administrador") {
            return { exito: false, mensaje: "permiso denegado: solo el Administrador puede cambiar roles" }
        }

        if (!navigator.onLine) {
            return { exito: false, mensaje: "debes estar online para cambiar roles" }
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
                const lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS_CACHE) || "[]")
                const target = lista.find(u => u.usuario === usuario)
                if (target) {
                    target.rol = nuevoRol
                    localStorage.setItem(this.LLAVE_USUARIOS_CACHE, JSON.stringify(lista))
                }
                return { exito: true, mensaje: "rol actualizado correctamente" }
            } else {
                const errorMsg = await resp.text()
                return { exito: false, mensaje: errorMsg || "error al cambiar rol" }
            }
        } catch (e) {
            return { exito: false, mensaje: "error de conexion al servidor" }
        }
    }

    // ruta delete /eliminarUsuario
    async eliminarUsuarioServidor(usuario) {
        const sesion = this.obtenerUsuarioActual()
        if (!sesion || sesion.rol !== "Administrador") {
            return { exito: false, mensaje: "permiso denegado: solo el Administrador puede eliminar usuarios" }
        }

        if (!navigator.onLine) {
            return { exito: false, mensaje: "debes estar online para eliminar usuarios" }
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
            return { exito: false, mensaje: "error de conexion al servidor" }
        }
    }

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