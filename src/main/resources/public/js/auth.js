// clase para auth offline con web storage
export class ManejadorAuth {
    constructor() {
        this.LLAVE_SESION = "censo_sesion";
        this.LLAVE_USUARIOS = "censo_usuarios";
        this.crearUsuariosMock();
    }

    // crea usuarios locales para pruebas sin conexion
    crearUsuariosMock() {
        if (!localStorage.getItem(this.LLAVE_USUARIOS)) {
            const usuarios = [
                { usuario: "admin", clave: "admin123", rol: "ADMIN" },
                { usuario: "encuestador", clave: "123", rol: "ENCUESTADOR" }
            ];
            localStorage.setItem(this.LLAVE_USUARIOS, JSON.stringify(usuarios));
        }
    }

    // loguea y persiste en session storage
    login(usuario, clave, rol) {
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

    logout() {
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