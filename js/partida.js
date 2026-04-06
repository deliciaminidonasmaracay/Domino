// --- Variables de Juego ---
let puntas = { izq: null, der: null };
let miMano = [];
let manoPC = [];
let pozo = [];
const params = new URLSearchParams(window.location.search);
const modoActual = params.get('mode'); 

window.onload = function() {
    if (modoActual === 'pc') {
        iniciarModoPC();
    } else if (modoActual === '3vs3') {
        iniciarModo3Jugadores();
    } else {
        iniciarModoOnline();
    }
};

// --- Lógica Modo PC ---
function iniciarModoPC() {
    document.getElementById('torn').innerText = "TU TURNO";
    let mazo = generarMazo();
    mazo.sort(() => Math.random() - 0.5);

    miMano = mazo.slice(0, 7);
    manoPC = mazo.slice(7, 14);
    pozo = mazo.slice(14);

    actualizarMesaVisual();
}

// --- NUEVO: Modo 3 Jugadores (Sin doble blanco) ---
function iniciarModo3Jugadores() {
    document.getElementById('torn').innerText = "TU TURNO";
    let mazo = generarMazo().filter(f => f !== "00"); // Regla: sin 0-0
    mazo.sort(() => Math.random() - 0.5);

    miMano = mazo.slice(0, 9); // 9 fichas cada uno
    manoPC = mazo.slice(9, 18); // Oponente virtual 1
    // El resto (18-27) sería para un tercer jugador (PC o Online)
    
    actualizarMesaVisual();
}

// --- Lógica Online (Apunta a tu rama sala_espera) ---
function iniciarModoOnline() {
    // Escucha la rama 'sala_espera' de tu captura de pantalla
    db.ref('sala_espera/mesa_1').on('value', (snap) => {
        const data = snap.val();
        if (data) {
            document.getElementById('torn').innerText = "RIVAL CONECTADO";
            // Si el oponente jugó, actualizamos nuestra mesa
            if (data.ultimaJugada && data.quien !== "YO") {
                recibirJugadaOnline(data.ultimaJugada, data.lado);
            }
        } else {
            document.getElementById('torn').innerText = "ESPERANDO JUGADOR...";
        }
    });
}

// --- Funciones de Soporte (Sin tocar tu lógica de tiro) ---
function generarMazo() {
    let m = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) m.push(`${i}${j}`);
    }
    return m;
}

function actualizarMesaVisual() {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    
    miMano.forEach(ficha => {
        const img = document.createElement('img');
        img.src = `imagen/${ficha}.png`;
        img.className = "ficha-mano";
        img.onclick = () => intentarJugar(ficha);
        contenedor.appendChild(img);
    });

    const infoOponente = document.getElementById('fichas-pc');
    if (infoOponente) infoOponente.innerText = `Oponente: ${manoPC.length} fichas`;
}

function intentarJugar(ficha) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);

    if (puntas.izq === null) {
        ejecutarMovimiento(ficha, 'der');
    } else if (n1 === puntas.izq || n2 === puntas.izq) {
        ejecutarMovimiento(ficha, 'izq');
    } else if (n1 === puntas.der || n2 === puntas.der) {
        ejecutarMovimiento(ficha, 'der');
    } else {
        console.log("Ficha no sirve");
    }
}

function ejecutarMovimiento(ficha, lado) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    let inv = false;

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
    miMano = miMano.filter(f => f !== ficha);
    
    // Si es online, avisamos a Firebase
    if (modoActual !== 'pc' && modoActual !== '3vs3') {
        db.ref('sala_espera/mesa_1').update({
            ultimaJugada: ficha,
            lado: lado,
            quien: "YO"
        });
    }

    if (modoActual === 'pc' || modoActual === '3vs3') {
        document.getElementById('torn').innerText = "PC PENSANDO...";
        setTimeout(turnoIA, 1500);
    }
    actualizarMesaVisual();
}

function recibirJugadaOnline(ficha, lado) {
    // Esta función dibuja lo que el otro jugador mandó por Firebase
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    let inv = false;

    if (lado === 'izq') {
        if (n1 === puntas.izq) { puntas.izq = n2; inv = true; }
        else { puntas.izq = n1; }
    } else {
        if (n2 === puntas.der) { puntas.der = n1; inv = true; }
        else { puntas.der = n2; }
    }
    dibujarEnTablero(ficha, lado, inv);
    document.getElementById('torn').innerText = "TU TURNO";
}

function dibujarEnTablero(ficha, lado, inv) {
    const tablero = document.getElementById('jugades');
    const img = document.createElement('img');
    img.src = `imagen/${ficha}.png`;
    const esDoble = ficha[0] === ficha[1];
    img.style.transform = `rotate(${esDoble ? 0 : (inv ? 270 : 90)}deg)`;
    
    if (lado === 'izq') tablero.insertBefore(img, tablero.firstChild);
    else tablero.appendChild(img);
}

function turnoIA() {
    let fichaIA = manoPC.find(f => 
        parseInt(f[0]) === puntas.izq || parseInt(f[1]) === puntas.izq ||
        parseInt(f[0]) === puntas.der || parseInt(f[1]) === puntas.der
    );

    if (fichaIA) {
        let l = (parseInt(fichaIA[0]) === puntas.der || parseInt(fichaIA[1]) === puntas.der) ? 'der' : 'izq';
        manoPC = manoPC.filter(f => f !== fichaIA);
        ejecutarMovimientoIA(fichaIA, l);
    } else if (pozo.length > 0) {
        manoPC.push(pozo.pop());
        turnoIA();
    } else {
        document.getElementById('torn').innerText = "TU TURNO (PC PASÓ)";
    }
}

function ejecutarMovimientoIA(ficha, lado) {
    const n1 = parseInt(ficha[0]); const n2 = parseInt(ficha[1]);
    let inv = false;
    if (lado === 'izq') {
        if (n1 === puntas.izq) { puntas.izq = n2; inv = true; }
        else { puntas.izq = n1; }
    } else {
        if (n2 === puntas.der) { puntas.der = n1; inv = true; }
        else { puntas.der = n2; }
    }
    dibujarEnTablero(ficha, lado, inv);
    document.getElementById('torn').innerText = "TU TURNO";
    actualizarMesaVisual();
    }
