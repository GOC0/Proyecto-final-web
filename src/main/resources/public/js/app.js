import { ManejadorDB } from "./db.js";
import { ManejadorAuth } from "./auth.js";
import { ManejadorGPS } from "./gps.js";
import { ManejadorCamara } from "./camera.js";
import { ManejadorSync } from "./sync.js";
import { ManejadorMapa } from "./mapa.js";

const db = new ManejadorDB();
const auth = new ManejadorAuth();
const gps = new ManejadorGPS();
const camara = new ManejadorCamara();
let mapa = null;
let sync = null;

let fotoActualBase64 = "";
let coordsActuales = { latitud: 0, longitud: 0 };
let editandoId = null;

document.addEventListener("DOMContentLoaded", async () => {
    await db.inicializar();
    mapa = new ManejadorMapa(db);
    sync = new ManejadorSync(db, () => actualizarUI());

    verificarAutenticacion();
    configurarRed();
    configurarNavegacion();
    configurarEventosFormulario();
    actualizarGPS();
    actualizarUI();
});

function verificarAutenticacion() {
    const modal = document.getElementById("modal-login");
    const formLogin = document.getElementById("form-login");
    const usuarioTag = document.getElementById("usuario-actual");

    if (!auth.estaAutenticado()) {
        modal.classList.remove("hidden");
    } else {
        usuarioTag.innerText = auth.obtenerUsuarioActual().usuario;
    }

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("login-user").value;
        const p = document.getElementById("login-pass").value;
        const r = document.getElementById("login-rol").value;

        const sesion = auth.login(u, p, r);
        usuarioTag.innerText = sesion.usuario;
        modal.classList.add("hidden");
    });

    document.getElementById("btn-logout").addEventListener("click", () => {
        if (confirm("¿Cerrar sesión?")) {
            auth.logout();
            modal.classList.remove("hidden");
        }
    });
}

function configurarRed() {
    const badge = document.getElementById("badge-red");
    const icono = document.getElementById("icono-red");
    const texto = document.getElementById("texto-red");

    const actualizarEstadoRed = () => {
        if (navigator.onLine) {
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 font-semibold text-white";
            icono.className = "bi bi-wifi";
            texto.innerText = "Online";
            if (sync) sync.conectarWebSocket();
        } else {
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 font-semibold text-white";
            icono.className = "bi bi-wifi-off";
            texto.innerText = "Offline";
        }
    };

    window.addEventListener("online", actualizarEstadoRed);
    window.addEventListener("offline", actualizarEstadoRed);
    actualizarEstadoRed();
}

async function actualizarGPS() {
    const status = document.getElementById("texto-gps");
    status.innerText = "Calculando posición...";
    coordsActuales = await gps.obtenerPosicion();
    status.innerText = `${coordsActuales.latitud.toFixed(4)} N, ${coordsActuales.longitud.toFixed(4)} W`;
}

function configurarEventosFormulario() {
    const inputFoto = document.getElementById("input-foto");
    const preview = document.getElementById("preview-img");
    const contenedorPreview = document.getElementById("preview-contenedor");

    document.getElementById("btn-foto").addEventListener("click", () => inputFoto.click());
    document.getElementById("btn-gps").addEventListener("click", actualizarGPS);

    inputFoto.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
            fotoActualBase64 = await camara.procesarFotoBase64(file);
            preview.src = fotoActualBase64;
            contenedorPreview.classList.remove("hidden");
        }
    });

    document.getElementById("btn-borrar-foto").addEventListener("click", () => {
        fotoActualBase64 = "";
        preview.src = "";
        contenedorPreview.classList.add("hidden");
    });

    document.getElementById("btn-cancelar").addEventListener("click", resetearFormulario);

    document.getElementById("form-encuesta").addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = auth.obtenerUsuarioActual();

         const data = {
               nombre: document.getElementById("campo-nombre").value,
               sector: document.getElementById("campo-sector").value,
               nivelEscolar: document.getElementById("campo-nivel").value,
               foto: fotoActualBase64,
               latitude: String(coordsActuales.latitud),
               longitude: String(coordsActuales.longitud),
               usuarioRegis: user ? user.usuario : "anonimo"
           };

        if (editandoId) {
            await db.actualizar(editandoId, data);
            alert("Encuesta actualizada");
        } else {
            await db.guardar(data);
            alert("Encuesta guardada localmente");
        }

        resetearFormulario();
        actualizarUI();
        if (navigator.onLine && sync) sync.sincronizarTodo();
    });

    document.getElementById("btn-sync-ahora").addEventListener("click", () => {
        if (sync) sync.sincronizarTodo();
    });
}

function resetearFormulario() {
    document.getElementById("form-encuesta").reset();
    document.getElementById("encuesta-id").value = "";
    document.getElementById("preview-contenedor").classList.add("hidden");
    document.getElementById("titulo-formulario").innerText = "Nuevo Registro";
    document.getElementById("tag-edicion").classList.add("hidden");
    document.getElementById("btn-cancelar").classList.add("hidden");
    fotoActualBase64 = "";
    editandoId = null;
    actualizarGPS();
}

async function renderizarLista() {
    const contenedor = document.getElementById("lista-encuestas");
    const vacio = document.getElementById("mensaje-vacio");
    const encuestas = await db.obtenerTodas();

    contenedor.innerHTML = "";
    if (encuestas.length === 0) {
        vacio.classList.remove("hidden");
        return;
    }
    vacio.classList.add("hidden");

    encuestas.forEach((item) => {
        const card = document.createElement("div");
        card.className = "bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between text-xs";
        card.innerHTML = `
      <div>
        <p class="font-bold text-slate-800">${item.nombre}</p>
        <p class="text-slate-500">${item.sector} • <span class="text-blue-700">${item.nivelEscolar}</span></p>
        <span class="text-[10px] font-bold ${item.sincronizado ? 'text-emerald-600' : 'text-orange-600'}">
          ${item.sincronizado ? '✓ Sincronizado' : '⏳ Pendiente'}
        </span>
      </div>
      <div class="flex gap-1.5">
        <button data-editar="${item.id}" class="p-2 text-blue-600 bg-blue-50 rounded"><i class="bi bi-pencil"></i></button>
        <button data-borrar="${item.id}" class="p-2 text-red-600 bg-red-50 rounded"><i class="bi bi-trash"></i></button>
      </div>
    `;

        card.querySelector(`[data-editar="${item.id}"]`).addEventListener("click", () => {
            editandoId = item.id;
            document.getElementById("encuesta-id").value = item.id;
            document.getElementById("campo-nombre").value = item.nombre;
            document.getElementById("campo-sector").value = item.sector;
            document.getElementById("campo-nivel").value = item.nivelEscolar;

            if (item.fotoBase64) {
                fotoActualBase64 = item.fotoBase64;
                document.getElementById("preview-img").src = item.fotoBase64;
                document.getElementById("preview-contenedor").classList.remove("hidden");
            }

            document.getElementById("titulo-formulario").innerText = "Editar Registro";
            document.getElementById("tag-edicion").classList.remove("hidden");
            document.getElementById("btn-cancelar").classList.remove("hidden");
            cambiarPestana("formulario");
        });

        card.querySelector(`[data-borrar="${item.id}"]`).addEventListener("click", async () => {
            if (confirm(`¿Eliminar la encuesta de ${item.nombre}?`)) {
                await db.eliminar(item.id);
                actualizarUI();
            }
        });

        contenedor.appendChild(card);
    });
}

function cambiarPestana(pestana) {
    ["formulario", "registros", "mapa"].forEach((p) => {
        document.getElementById(`vista-${p}`).classList.add("hidden");
        document.getElementById(`tab-${p === 'formulario' ? 'form' : p === 'registros' ? 'records' : 'map'}`).classList.remove("tab-activa");
    });

    document.getElementById(`vista-${pestana}`).classList.remove("hidden");
    document.getElementById(`tab-${pestana === 'formulario' ? 'form' : pestana === 'registros' ? 'records' : 'map'}`).classList.add("tab-activa");

    if (pestana === "registros") renderizarLista();
    if (pestana === "mapa") mapa.cargarMarcadores();
}

function configurarNavegacion() {
    document.getElementById("tab-form").addEventListener("click", () => cambiarPestana("formulario"));
    document.getElementById("tab-records").addEventListener("click", () => cambiarPestana("registros"));
    document.getElementById("tab-map").addEventListener("click", () => cambiarPestana("mapa"));
}

async function actualizarUI() {
    const pendientes = await db.contarPendientes();
    document.getElementById("badge-pendientes").innerText = `${pendientes} pend.`;
    if (!document.getElementById("vista-registros").classList.contains("hidden")) {
        renderizarLista();
    }
}