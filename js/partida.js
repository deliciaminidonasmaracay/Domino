// --- CONFIGURACIÓN Y VARIABLES ---
let puntas = { izq: null, der: null };
let miMano = [];
let manoPC = []; // Se usa para oponentes virtuales (PC o 3 Jugadores)
let pozo = [];
const params = new URLSearchParams(window.location.search);
const modoActual = params.get('mode') || 'pc'; // 'pc', '3vs3', 'online'

window.onload = function() {
    console.log("Iniciando modo:", modoActual);
    
    if (modoActual === 'pc') {
        iniciarJuegoLocal(7, false); // 7 fichas, mazo completo
    } else if (modoActual === '3vs3') {
        iniciarJuegoLocal(9, true);  // 9 fichas, sin doble blanco
    } else {
        iniciarModoOnline(); // Conexión a Firebase
    }
};

// --- MOTOR DE REPARTO (Lógica extraída y mejorada) ---
function iniciarJuegoLocal(cantidadFichas, sinDobleBlanco) {
    document.getElementById('torn').innerText = "TU TURNO";
    
    // Generar mazo profesional
    let mazo = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) mazo.push(`${i}${j}`);
    }

    if (sinDobleBlanco) {
        mazo = mazo.filter(f => f !== "00"); // Regla del audio: sin 0-0
    }

    mazo.sort(() => Math.random() - 0.5);

    // Reparto dinámico
    miMano = mazo.slice(0, cantidadFichas);
    manoPC = mazo.slice(cantidadFichas, cantidadFichas * 2);
    pozo = mazo.slice(cantidadFichas * 2);

    actualizarMesaVisual();
}

// --- SERVIDOR FIREBASE (Basado en tu repositorio) ---
function iniciarModoOnline() {
    // Referencia a tu rama sala_espera
    db.ref('sala_espera/mesa_1').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('torn').innerText = "RIVAL CONECTADO";
            // Sincronización de jugadas online
            if (data.ultimaJugada && data.autor !== "YO") {
                recibirMovimientoOnline(data.ultimaJugada, data.lado);
            }
        } else {
            document.getElementById('torn').innerText = "ESPERANDO JUGADOR...";
        }
    });
}

// --- LÓGICA DE TIRO (El "4 con el 4") ---
function intentarJugar(ficha) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);

    if (puntas.izq === null) {
        ejecutarMovimiento(ficha, 'der', "YO");
    } else if (n1 === puntas.izq || n2 === puntas.izq) {
        ejecutarMovimiento(ficha, 'izq', "YO");
    } else if (n1 === puntas.der || n2 === puntas.der) {
        ejecutarMovimiento(ficha, 'der', "YO");
    } else {
        console.log("Ficha no cuadra");
    }
}

function ejecutarMovimiento(ficha, lado, autor) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    let inv = false;

    // Validación de puntas
    if (puntas.izq === null) {
        puntas.izq = n1; puntas.der = n2;
    } else if (lado === 'izq') {
        if (n1 === puntas.izq) { puntas.izq = n2; inv = true; }
        else { puntas.izq = n1; }
    } else {
        if (n2 === puntas.der) { puntas.der = n1; inv = true; }
        else { puntas.der = n2; }
    }

    dibujarEnTablero(ficha, lado, inv);

    if (autor === "YO") {
        miMano = miMano.filter(f => f !== ficha);
        // Si es online, mandamos al servidor
        if (modoActual === 'online') {
            db.ref('sala_espera/mesa_1').update({
                ultimaJugada: ficha,
                lado: lado,
                autor: "YO"
            });
        } else {
            document.getElementById('torn').innerText = "PC PENSANDO...";
            setTimeout(turnoIA, 1200);
        }
    }
    actualizarMesaVisual();
}

// --- INTELIGENCIA ARTIFICIAL (Basado en Dominoes 365) ---
function turnoIA() {
    let fichaIA = manoPC.find(f => 
        parseInt(f[0]) === puntas.izq || parseInt(f[1]) === puntas.izq ||
        parseInt(f[0]) === puntas.der || parseInt(f[1]) === puntas.der
    );

    if (fichaIA) {
        let l = (parseInt(fichaIA[0]) === puntas.der || parseInt(fichaIA[1]) === puntas.der) ? 'der' : 'izq';
        manoPC = manoPC.filter(f => f !== fichaIA);
        ejecutarMovimiento(fichaIA, l, "PC");
    } else if (pozo.length > 0) {
        manoPC.push(pozo.pop()); // Robar del pozo
        setTimeout(turnoIA, 500);
    } else {
        document.getElementById('torn').innerText = "PC PASÓ. TU TURNO";
    }
}

// --- RENDERIZADO VISUAL ---
function dibujarEnTablero(ficha, lado, inv) {
    const tablero = document.getElementById('jugades');
    const img = document.createElement('img');
    img.src = `imagen/${ficha}.png`;
    const esDoble = ficha[0] === ficha[1];
    
    // Rotación profesional para que los números coincidan
    img.style.transform = `rotate(${esDoble ? 0 : (inv ? 270 : 90)}deg)`;
    
    if (lado === 'izq') tablero.insertBefore(img, tablero.firstChild);
    else tablero.appendChild(img);
}

function actualizarMesaVisual() {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    miMano.forEach(f => {
        const img = document.createElement('img');
        img.src = `imagen/${f}.png`;
        img.className = "ficha-mano";
        img.onclick = () => intentarJugar(f);
        contenedor.appendChild(img);
    });
    
    const txtOponente = document.getElementById('fichas-pc');
    if (txtOponente) txtOponente.innerText = `Oponente: ${manoPC.length}`;
}
    
