// clase para manejar indexeddb facil con promesas
export class ManejadorDB {
    constructor() {
        this.nombreBD = "CensoPUCMM_DB";
        this.version = 1;
        this.bd = null;
    }

    // abre la bd y crea la tabla si no existe
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

    // guarda en local y marca sincronizado en false
    async guardar(encuesta) {
        return new Promise((resolve, reject) => {
            const tx = this.bd.transaction(["encuestas"], "readwrite");
            const store = tx.objectStore("encuestas");
            const data = { ...encuesta, sincronizado: false, fecha: new Date().toISOString() };
            const req = store.add(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    // actualiza un registro editado
    async actualizar(id, encuesta) {
        return new Promise((resolve, reject) => {
            const tx = this.bd.transaction(["encuestas"], "readwrite");
            const store = tx.objectStore("encuestas");
            const data = { ...encuesta, id: Number(id), sincronizado: false };
            const req = store.put(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    // saca todos los datos guardados en el cel
    async obtenerTodas() {
        return new Promise((resolve, reject) => {
            const tx = this.bd.transaction(["encuestas"], "readonly");
            const store = tx.objectStore("encuestas");
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    // borra una encuesta local
    async eliminar(id) {
        return new Promise((resolve, reject) => {
            const tx = this.bd.transaction(["encuestas"], "readwrite");
            const store = tx.objectStore("encuestas");
            const req = store.delete(Number(id));
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }

    // marca como sincronizado cuando el socket responde ok
    async marcarSincronizado(id) {
        const encuestas = await this.obtenerTodas();
        const item = encuestas.find(e => e.id === Number(id));
        if (item) {
            item.sincronizado = true;
            const tx = this.bd.transaction(["encuestas"], "readwrite");
            tx.objectStore("encuestas").put(item);
        }
    }

    // saca cantidad de encuestas que faltan por subir
    async contarPendientes() {
        const encuestas = await this.obtenerTodas();
        return encuestas.filter(e => !e.sincronizado).length;
    }
}