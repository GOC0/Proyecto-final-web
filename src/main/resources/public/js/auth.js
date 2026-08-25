// clase para conectar con todas las rutas de usuario del backend
export class ManejadorAuth {
    constructor() {
        this.LLAVE_SESION = "censo_sesion";
        this.LLAVE_USUARIOS = "censo_usuarios";
        this.crearUsuariosMock();
    }

    // usuarios mock para modo offline
    crearUsuariosMock() {
        if (!localStorage.getItem(this.LLAVE_USUARIOS)) {
            const usuarios = [
                { usuario: "admin", clave: "admin123", rol: "Administrador" },
                { usuario: "encuestador", clave: "123", rol: "ENCUESTADOR" }
            ];
            localStorage.setItem(this.LLAVE_USUARIOS, JSON.stringify(usuarios));
        }
    }

    // ruta post /login de javalin con fallback offline
    async login(usuario, clave, rol) {
        if (navigator.onLine) {
            try {
                const body = new URLSearchParams();
                body.append("usuario", usuario);
                body.append("password", clave);

                await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: body.toString()
                });
            } catch (err) {
                console.log("servidor no respondio login usando sesion local");
            }
        }

        const lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS) || "[]");
        const match = lista.find(u => u.usuario === usuario && u.clave === clave);

        const sesion = {
            usuario: match ? match.usuario : usuario,
            rol: rol || (match ? match.rol : "ENCUESTADOR"),
            token: "token-mock-" + btoa(usuario + ":" + Date.now())
        };

        sessionStorage.setItem(this.LLAVE_SESION, JSON.stringify(sesion));
        return sesion;
    }

    // ruta post /crearUsuario
    async crearUsuarioServidor(usuario, password) {
        const lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS) || "[]");
        lista.push({ usuario: usuario, clave: password, rol: "ENCUESTADOR" });
        localStorage.setItem(this.LLAVE_USUARIOS, JSON.stringify(lista));

        if (navigator.onLine) {
            const body = new URLSearchParams();
            body.append("usuario", usuario);
            body.append("password", password);

            const resp = await fetch("/crearUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString()
            });
            return resp.ok;
        }
        return true;
    }

    // ruta patch /cambiarRol
    async cambiarRolServidor(usuario, nuevoRol) {
        const lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS) || "[]");
        const target = lista.find(u => u.usuario === usuario);
        if (target) {
            target.rol = nuevoRol;
            localStorage.setItem(this.LLAVE_USUARIOS, JSON.stringify(lista));
        }

        if (navigator.onLine) {
            const body = new URLSearchParams();
            body.append("usuario", usuario);
            body.append("rol", nuevoRol);

            const resp = await fetch("/cambiarRol", {
                method: "PATCH",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString()
            });
            return resp.ok;
        }
        return true;
    }

    // ruta delete /eliminarUsuario
    async eliminarUsuarioServidor(usuario) {
        let lista = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS) || "[]");
        lista = lista.filter(u => u.usuario !== usuario);
        localStorage.setItem(this.LLAVE_USUARIOS, JSON.stringify(lista));

        if (navigator.onLine) {
            const body = new URLSearchParams();
            body.append("usuario", usuario);

            const resp = await fetch("/eliminarUsuario", {
                method: "DELETE",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body.toString()
            });
            return resp.ok;
        }
        return true;
    }

    // ruta post /cerrarSession
    async logout() {
        if (navigator.onLine) {
            try {
                await fetch("/cerrarSession", { method: "POST" });
            } catch (e) {}
        }
        sessionStorage.removeItem(this.LLAVE_SESION);
    }

    obtenerUsuarioActual() {
        const raw = sessionStorage.getItem(this.LLAVE_SESION);
        return raw ? JSON.parse(raw) : null;
    }

    estaAutenticado() {
        return this.obtenerUsuarioActual() !== null;
    }
}