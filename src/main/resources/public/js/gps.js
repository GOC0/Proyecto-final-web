// clase para capturar gps con html5
export class ManejadorGPS {
    constructor() {
        // coordenadas default del campus santiago pucmm
        this.coordsDefault = { latitude: "19.4517", longitude: "-70.6970" };
    }

    async obtenerPosicion() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(this.coordsDefault);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        latitude: pos.coords.latitude.toFixed(6),
                        longitude: pos.coords.longitude.toFixed(6)
                    });
                },
                () => resolve(this.coordsDefault),
                { enableHighAccuracy: true, timeout: 6000 }
            );
        });
    }
}