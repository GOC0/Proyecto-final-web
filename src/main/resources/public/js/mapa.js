// clase para mapa leaflet con marcadores
export class ManejadorMapa {
    constructor(db) {
        this.db = db;
        this.mapa = null;
        this.capaMarcadores = null;
    }

    inicializar() {
        if (this.mapa) return;

        this.mapa = L.map("mapa").setView([19.4517, -70.6970], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19
        }).addTo(this.mapa);

        this.capaMarcadores = L.layerGroup().addTo(this.mapa);
    }

    async cargarMarcadores() {
        this.inicializar();
        setTimeout(() => this.mapa.invalidateSize(), 150);

        this.capaMarcadores.clearLayers();
        const encuestas = await this.db.obtenerTodas();

        encuestas.forEach((e) => {
            const lat = parseFloat(e.latitude);
            const lng = parseFloat(e.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
                const fotoHTML = e.foto ? `<img src="${e.foto}" class="w-24 h-24 object-cover rounded mb-1"/>` : "";
                const marker = L.marker([lat, lng]);
                marker.bindPopup(`
          <div class="text-xs">
            ${fotoHTML}
            <b>${e.nombre}</b><br/>
            Sector: ${e.sector}<br/>
            Nivel: ${e.nivelEscolar}<br/>
            Por: ${e.usuarioRegis}
          </div>
        `);
                this.capaMarcadores.addLayer(marker);
            }
        });
    }
}