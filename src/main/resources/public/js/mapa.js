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
            if (e.latitud && e.longitud) {
                const fotoHTML = e.fotoBase64 ? `<img src="${e.fotoBase64}" class="w-24 h-24 object-cover rounded mb-1"/>` : "";
                const marker = L.marker([e.latitud, e.longitud]);
                marker.bindPopup(`
          <div class="text-xs">
            ${fotoHTML}
            <b>${e.nombre}</b><br/>
            Sector: ${e.sector}<br/>
            Nivel: ${e.nivelEscolar}<br/>
            Por: ${e.usuario}
          </div>
        `);
                this.capaMarcadores.addLayer(marker);
            }
        });
    }
}