import { ManejadorDB } from "./db.js"
import { ManejadorAuth } from "./auth.js"
import { ManejadorGPS } from "./gps.js"
import { ManejadorCamara } from "./camera.js"
import { ManejadorSync } from "./sync.js"
import { ManejadorMapa } from "./mapa.js"

const db = new ManejadorDB()
const auth = new ManejadorAuth()
const gps = new ManejadorGPS()
const camara = new ManejadorCamara()
let mapa = null
let sync = null

let fotoActualBase64 = ""
let coordsActuales = { latitude: "0", longitude: "0" }
let editandoId = null
let modoRegistroAuth = false

document.addEventListener("DOMContentLoaded", async () => {
    await db.inicializar()
    mapa = new ManejadorMapa(db)
    sync = new ManejadorSync(db, () => actualizarUI())

    verificarAutenticacion()
    configurarRed()
    configurarNavegacion()
    configurarEventosFormulario()
    configurarEventosUsuarios()
    actualizarGPS()
    actualizarUI()
})

// control estricto de roles: encuestador no puede ver panel admin
function aplicarPermisosPorRol() {
    const usuario = auth.obtenerUsuarioActual()
    const tabUsuarios = document.getElementById("tab-users")
    const vistaUsuarios = document.getElementById("vista-usuarios")
    const badgeRol = document.getElementById("badge-rol-actual")

    if (!usuario) {
        document.getElementById("modal-login").classList.remove("hidden")
        return
    }

    if (badgeRol) {
        badgeRol.innerText = usuario.rol
        badgeRol.className = usuario.rol === "Administrador"
            ? "bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase"
            : "bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase"
    }

    if (usuario.rol === "Administrador") {
        if (tabUsuarios) tabUsuarios.classList.remove("hidden")
    } else {
        if (tabUsuarios) tabUsuarios.classList.add("hidden")
        if (vistaUsuarios) vistaUsuarios.classList.add("hidden")
        cambiarPestana("formulario")
    }
}

function verificarAutenticacion() {
    const modal = document.getElementById("modal-login")
    const formLogin = document.getElementById("form-login")
    const usuarioTag = document.getElementById("usuario-actual")
    const btnToggle = document.getElementById("btn-toggle-registro")
    const authTitulo = document.getElementById("modal-auth-titulo")
    const authDesc = document.getElementById("modal-auth-desc")
    const btnSubmit = document.getElementById("btn-submit-auth")

    if (!auth.estaAutenticado()) {
        modal.classList.remove("hidden")
    } else {
        usuarioTag.innerText = auth.obtenerUsuarioActual().usuario
        aplicarPermisosPorRol()
    }

    btnToggle.addEventListener("click", () => {
        modoRegistroAuth = !modoRegistroAuth
        if (modoRegistroAuth) {
            authTitulo.innerText = "Crear Cuenta Nueva"
            authDesc.innerText = "Registrate para acceder al censo"
            btnSubmit.innerText = "Registrarse"
            btnToggle.innerText = "Ya tienes cuenta? Inicia sesion"
        } else {
            authTitulo.innerText = "Censo PUCMM ZN"
            authDesc.innerText = "Inicia sesion para registrar encuestas"
            btnSubmit.innerText = "Entrar"
            btnToggle.innerText = "No tienes cuenta? Registrate aqui"
        }
    })

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault()
        const u = document.getElementById("login-user").value.trim()
        const p = document.getElementById("login-pass").value.trim()

        if (modoRegistroAuth) {
            const res = await auth.crearUsuarioServidor(u, p)
            if (res.exito) {
                alert("usuario registrado. ahora inicia sesion")
                btnToggle.click()
            } else {
                alert(res.mensaje)
            }
        } else {
            const res = await auth.login(u, p)
            if (res.exito) {
                usuarioTag.innerText = res.sesion.usuario
                modal.classList.add("hidden")
                aplicarPermisosPorRol()
            } else {
                alert(res.mensaje)
            }
        }
    })

    document.getElementById("btn-logout").addEventListener("click", async () => {
        if (confirm("cerrar sesion actual?")) {
            await auth.logout()
            modal.classList.remove("hidden")
            aplicarPermisosPorRol()
        }
    })
}

function configurarRed() {
    const badge = document.getElementById("badge-red")
    const icono = document.getElementById("icono-red")
    const texto = document.getElementById("texto-red")

    const actualizarEstadoRed = () => {
        if (navigator.onLine) {
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 font-semibold text-white"
            icono.className = "bi bi-wifi"
            texto.innerText = "Online"
            if (sync) sync.conectarWebSocket()
        } else {
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500 font-semibold text-white"
            icono.className = "bi bi-wifi-off"
            texto.innerText = "Offline"
        }
    }

    window.addEventListener("online", actualizarEstadoRed)
    window.addEventListener("offline", actualizarEstadoRed)
    actualizarEstadoRed()
}

async function actualizarGPS() {
    const status = document.getElementById("texto-gps")
    status.innerText = "buscando coordenadas..."
    coordsActuales = await gps.obtenerPosicion()
    status.innerText = `${coordsActuales.latitude} N, ${coordsActuales.longitude} W`
}

function configurarEventosFormulario() {
    const inputFoto = document.getElementById("input-foto")
    const preview = document.getElementById("preview-img")
    const contenedorPreview = document.getElementById("preview-contenedor")

    document.getElementById("btn-foto").addEventListener("click", () => inputFoto.click())
    document.getElementById("btn-gps").addEventListener("click", actualizarGPS)

    inputFoto.addEventListener("change", async (e) => {
        const file = e.target.files[0]
        if (file) {
            fotoActualBase64 = await camara.procesarFotoBase64(file)
            preview.src = fotoActualBase64
            contenedorPreview.classList.remove("hidden")
        }
    })

    document.getElementById("btn-borrar-foto").addEventListener("click", () => {
        fotoActualBase64 = ""
        preview.src = ""
        contenedorPreview.classList.add("hidden")
    })

    document.getElementById("btn-cancelar").addEventListener("click", resetearFormulario)

    document.getElementById("form-encuesta").addEventListener("submit", async (e) => {
        e.preventDefault()

        if (!auth.estaAutenticado()) {
            alert("acceso denegado: debes iniciar sesion primero")
            document.getElementById("modal-login").classList.remove("hidden")
            return
        }

        const user = auth.obtenerUsuarioActual()

        const data = {
            nombre: document.getElementById("campo-nombre").value,
            sector: document.getElementById("campo-sector").value,
            nivelEscolar: document.getElementById("campo-nivel").value,
            foto: fotoActualBase64,
            latitude: coordsActuales.latitude,
            longitude: coordsActuales.longitude,
            usuarioRegis: user.usuario
        }

        if (editandoId) {
            await db.actualizar(editandoId, data)
            alert("encuesta modificada")
        } else {
            await db.guardar(data)
            alert("encuesta guardada localmente")
        }

        resetearFormulario()
        actualizarUI()
        if (navigator.onLine && sync) sync.sincronizarTodo()
    })

    document.getElementById("btn-sync-ahora").addEventListener("click", () => {
        if (sync) sync.sincronizarTodo()
    })
}

// administracion protegida por rol
function configurarEventosUsuarios() {
    document.getElementById("form-crear-usuario").addEventListener("submit", async (e) => {
        e.preventDefault()
        const user = document.getElementById("nuevo-user-nombre").value.trim()
        const pass = document.getElementById("nuevo-user-pass").value.trim()
        const res = await auth.crearUsuarioServidor(user, pass)
        alert(res.mensaje)
        if (res.exito) document.getElementById("form-crear-usuario").reset()
    })

    document.getElementById("form-cambiar-rol").addEventListener("submit", async (e) => {
        e.preventDefault()
        const target = document.getElementById("rol-user-target").value.trim()
        const rol = document.getElementById("rol-user-nuevo").value
        const res = await auth.cambiarRolServidor(target, rol)
        alert(res.mensaje)
        if (res.exito) document.getElementById("form-cambiar-rol").reset()
    })

    document.getElementById("form-eliminar-usuario").addEventListener("submit", async (e) => {
        e.preventDefault()
        const target = document.getElementById("eliminar-user-target").value.trim()
        if (confirm(`eliminar definitivamente a ${target}?`)) {
            const res = await auth.eliminarUsuarioServidor(target)
            alert(res.mensaje)
            if (res.exito) document.getElementById("form-eliminar-usuario").reset()
        }
    })
}

function resetearFormulario() {
    document.getElementById("form-encuesta").reset()
    document.getElementById("encuesta-id").value = ""
    document.getElementById("preview-contenedor").classList.add("hidden")
    document.getElementById("titulo-formulario").innerText = "Nuevo Registro"
    document.getElementById("tag-edicion").classList.add("hidden")
    document.getElementById("btn-cancelar").classList.add("hidden")
    fotoActualBase64 = ""
    editandoId = null
    actualizarGPS()
}

async function renderizarLista() {
    const contenedor = document.getElementById("lista-encuestas")
    const vacio = document.getElementById("mensaje-vacio")
    const encuestas = await db.obtenerTodas()

    contenedor.innerHTML = ""
    if (encuestas.length === 0) {
        vacio.classList.remove("hidden")
        return
    }
    vacio.classList.add("hidden")

    encuestas.forEach((item) => {
        const card = document.createElement("div")
        card.className = "bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between text-xs"
        card.innerHTML = `
      <div>
        <p class="font-bold text-slate-800">${item.nombre}</p>
        <p class="text-slate-500">${item.sector} • <span class="text-blue-700 font-semibold">${item.nivelEscolar}</span></p>
        <span class="text-[10px] font-bold ${item.sincronizado ? 'text-emerald-600' : 'text-orange-600'}">
          ${item.sincronizado ? '✓ Sincronizado' : '⏳ Pendiente'}
        </span>
      </div>
      <div class="flex gap-1.5">
        <button data-editar="${item.id}" class="p-2 text-blue-600 bg-blue-50 rounded"><i class="bi bi-pencil"></i></button>
        <button data-borrar="${item.id}" class="p-2 text-red-600 bg-red-50 rounded"><i class="bi bi-trash"></i></button>
      </div>
    `

        card.querySelector(`[data-editar="${item.id}"]`).addEventListener("click", () => {
            editandoId = item.id
            document.getElementById("encuesta-id").value = item.id
            document.getElementById("campo-nombre").value = item.nombre
            document.getElementById("campo-sector").value = item.sector
            document.getElementById("campo-nivel").value = item.nivelEscolar

            if (item.foto) {
                fotoActualBase64 = item.foto
                document.getElementById("preview-img").src = item.foto
                document.getElementById("preview-contenedor").classList.remove("hidden")
            }

            document.getElementById("titulo-formulario").innerText = "Editar Registro"
            document.getElementById("tag-edicion").classList.remove("hidden")
            document.getElementById("btn-cancelar").classList.remove("hidden")
            cambiarPestana("formulario")
        })

        card.querySelector(`[data-borrar="${item.id}"]`).addEventListener("click", async () => {
            if (confirm(`eliminar encuesta de ${item.nombre}?`)) {
                await db.eliminar(item.id)
                if (sync) sync.eliminarFormServidor(item.id)
                actualizarUI()
            }
        })

        contenedor.appendChild(card)
    })
}

function cambiarPestana(pestana) {
    ["formulario", "registros", "mapa", "usuarios"].forEach((p) => {
        document.getElementById(`vista-${p}`).classList.add("hidden")
        const tabBtn = document.getElementById(`tab-${p === 'formulario' ? 'form' : p === 'registros' ? 'records' : p === 'mapa' ? 'map' : 'users'}`)
        if (tabBtn) tabBtn.classList.remove("tab-activa")
    })

    document.getElementById(`vista-${pestana}`).classList.remove("hidden")
    const activeTab = document.getElementById(`tab-${pestana === 'formulario' ? 'form' : pestana === 'registros' ? 'records' : pestana === 'mapa' ? 'map' : 'users'}`)
    if (activeTab) activeTab.classList.add("tab-activa")

    if (pestana === "registros") renderizarLista()
    if (pestana === "mapa") mapa.cargarMarcadores()
}

function configurarNavegacion() {
    document.getElementById("tab-form").addEventListener("click", () => cambiarPestana("formulario"))
    document.getElementById("tab-records").addEventListener("click", () => cambiarPestana("registros"))
    document.getElementById("tab-map").addEventListener("click", () => cambiarPestana("mapa"))
    document.getElementById("tab-users").addEventListener("click", () => cambiarPestana("usuarios"))
}

async function actualizarUI() {
    const pendientes = await db.contarPendientes()
    document.getElementById("badge-pendientes").innerText = `${pendientes} pend.`
    if (!document.getElementById("vista-registros").classList.contains("hidden")) {
        renderizarLista()
    }
}