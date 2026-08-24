export class ManejadorAuth {
    constructor() {
        this.LLAVE_SESION = "censo_pucmm_sesion";
        this.LLAVE_USUARIOS = "censo_pucmm_usuarios";
        this.crearUsuariosPorDefecto();
    }

    crearUsuariosPorDefecto() {
        if (!localStorage.getItem(this.LLAVE_USUARIOS)) {
            const iniciales = [
                { usuario: "admin", clave: "admin123", rol: "ADMIN" },
                { usuario: "encuestador", clave: "123", rol: "ENCUESTADOR" }
            ];
            localStorage.setItem(this.LLAVE_USUARIOS, JSON.stringify(iniciales));
        }
    }

    login(usuario, clave, rol) {
        const usuarios = JSON.parse(localStorage.getItem(this.LLAVE_USUARIOS) || "[]");
        const existe = usuarios.find(u => u.usuario === usuario && u.clave === clave);

        const sesion = {
            usuario: existe ? existe.usuario : usuario,
            rol: rol || (existe ? existe.rol : "ENCUESTADOR"),
            token: "token-local-" + btoa(usuario + ":" + Date.now())
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