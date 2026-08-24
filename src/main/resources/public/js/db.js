export class ManejadorDB {
    constructor() {
        this.nombreBD = "CensoPUCMM_DB";
        this.version = 1;
        this.bd = null;
    }

    async inicializar() {
        return new Promise((resolve, reject) => {
            const solicitud = indexedDB.open(this.nombreBD, this.version);

            solicitud.onupgradeneeded = (e) => {
                const bd = e.target.result;
                if (!bd.objectStoreNames.contains("encuestas")) {
                    bd.createObjectStore("encuestas", { keyPath: "id", autoIncrement: true });
                }
            };

            solicitud.onsuccess = (e) => {
                this.bd = e.target.result;
                resolve(this.bd);
            };

            solicitud.onerror = (e) => reject(e.target.error);
        });
    }

    async guardar(encuesta) {
        return new Promise((resolve, reject) => {
            const transaccion = this.bd.transaction(["encuestas"], "readwrite");
            const almacen = transaccion.objectStore("encuestas");
            const data = { ...encuesta, sincronizado: false, fecha: new Date().toISOString() };
            const req = almacen.add(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async actualizar(id, encuesta) {
        return new Promise((resolve, reject) => {
            const transaccion = this.bd.transaction(["encuestas"], "readwrite");
            const almacen = transaccion.objectStore("encuestas");
            const data = { ...encuesta, id: Number(id), sincronizado: false };
            const req = almacen.put(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async obtenerTodas() {
        return new Promise((resolve, reject) => {
            const transaccion = this.bd.transaction(["encuestas"], "readonly");
            const almacen = transaccion.objectStore("encuestas");
            const req = almacen.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async eliminar(id) {
        return new Promise((resolve, reject) => {
            const transaccion = this.bd.transaction(["encuestas"], "readwrite");
            const almacen = transaccion.objectStore("encuestas");
            const req = almacen.delete(Number(id));
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }

    async marcarSincronizado(id) {
        const encuestas = await this.obtenerTodas();
        const target = encuestas.find(e => e.id === Number(id));
        if (target) {
            target.sincronizado = true;
            const transaccion = this.bd.transaction(["encuestas"], "readwrite");
            transaccion.objectStore("encuestas").put(target);
        }
    }

    async contarPendientes() {
        const encuestas = await this.obtenerTodas();
        return encuestas.filter(e => !e.sincronizado).length;
    }
}