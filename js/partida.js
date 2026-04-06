// --- CONFIGURACIÓN DE FIREBASE (Usa tus credenciales de siempre) ---
// const db = firebase.database(); 

let puntas = { izq: null, der: null };
let miMano = [];
let idPartida = new URLSearchParams(window.location.search).get('id');
let miNombre = localStorage.getItem('domino_user');

// --- 1. RECUPERAR SINCRONIZACIÓN (Lo que se había perdido) ---
function conectarPartida() {
    if (!idPartida) return console.error("No hay ID de partida");

    const refPartida = db.ref(`partidas/${idPartida}`);

    // Escuchar cambios en la mesa (Sincronizado)
    refPartida.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Si el juego no ha empezado, esperamos jugadores (Como antes)
        if (data.estado === 'esperando') {
            document.getElementById('estado-texto').innerText = "Esperando jugadores...";
            return;
        }

        // Actualizar puntas y mesa desde el servidor
        puntas = data.puntas || { izq: null, der: null };
        renderizarMesa(data.jugadas);
        actualizarMano(data.jugadores[miNombre].mano);
    });
}

// --- 2. LÓGICA DE JUGADA (INTELIGENTE Y AUTOMÁTICA) ---
function intentarJugar(ficha) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);

    // Primer tiro de la partida
    if (puntas.izq === null) {
        enviarMovimiento(ficha, 'der');
        return;
    }

    const puedeIzq = (n1 === puntas.izq || n2 === puntas.izq);
    const puedeDer = (n1 === puntas.der || n2 === puntas.der);

    if (puedeIzq && puedeDer) {
        // Pop-up solo si hay dos opciones
        mostrarPopupOpciones(ficha);
    } else if (puedeIzq) {
        enviarMovimiento(ficha, 'izq');
    } else if (puedeDer) {
        enviarMovimiento(ficha, 'der');
    } else {
        alert("Esa ficha no cuadra.");
    }
}

// --- 3. VALIDACIÓN DE EMPALME (El 4 con el 4) ---
function enviarMovimiento(ficha, lado) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    let nuevaPunta;
    let invertida = false;

    if (lado === 'izq') {
        if (n1 === puntas.izq) { nuevaPunta = n2; invertida = true; }
        else { nuevaPunta = n1; invertida = false; }
    } else {
        if (n2 === puntas.der) { nuevaPunta = n1; invertida = true; }
        else { nuevaPunta = n2; invertida = false; }
    }

    // ACTUALIZACIÓN EN FIREBASE (Sincroniza con todos)
    const updates = {};
    updates[`partidas/${idPartida}/puntas/${lado}`] = nuevaPunta;
    // Aquí se enviaría el objeto de la jugada al servidor...
    db.ref().update(updates);
}

// --- 4. VISUALIZACIÓN (Mesa de madera de tus fotos) ---
function dibujarFicha(ficha, lado, invertida) {
    const mesa = document.getElementById('jugades');
    const img = document.createElement('img');
    img.src = `imagen/${ficha}.png`;
    img.style.width = "45px"; 

    const esDoble = ficha[0] === ficha[1];
    let angulo = esDoble ? 0 : (invertida ? 270 : 90);

    img.style.transform = `rotate(${angulo}deg)`;
    img.style.margin = esDoble ? "0 5px" : "0 12px";

    if (lado === 'izq') mesa.insertBefore(img, mesa.firstChild);
    else mesa.appendChild(img);
}

// --- 5. SISTEMA DE POZO (Para no trancarse como en la foto) ---
function robarFicha() {
    db.ref(`partidas/${idPartida}/pozo`).transaction((pozo) => {
        if (pozo && pozo.length > 0) {
            const ficha = pozo.pop();
            // Agregar a mi mano en Firebase...
            return pozo;
        }
    });
}

// Inicializar al cargar
window.onload = conectarPartida;
