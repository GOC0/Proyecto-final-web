export class ManejadorGPS {
    constructor() {
        // Coordenadas PUCMM Santiago
        this.coordenadasDefault = { latitud: 19.4517, longitud: -70.6970 };
    }

    async obtenerPosicion() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(this.coordenadasDefault);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        latitud: pos.coords.latitude,
                        longitud: pos.coords.longitude
                    });
                },
                () => resolve(this.coordenadasDefault),
                { enableHighAccuracy: true, timeout: 6000 }
            );
        });
    }
}