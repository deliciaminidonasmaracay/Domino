// --- CONFIGURACIÓN Y ESTADO ---
let modoJuego = new URLSearchParams(window.location.search).get('mode'); 
let puntas = { izq: null, der: null };
let miMano = [];
let turnoActual = 1; // 1: Usuario, 2: PC/Rival...
let fichasRestantes = [];

// --- 1. INICIALIZACIÓN SEGÚN TU AUDIO ---
function iniciarPartidaEnMesa() {
    let todas = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) todas.push(`${i}${j}`);
    }

    if (modoJuego === 'pc' || modoJuego === '1vs1') {
        repartir(todas, 7, 2); // 2 jugadores, 7 fichas c/u
    } else if (modoJuego === '2vs2') {
        repartir(todas, 7, 4); // Parejas
    } else if (modoJuego === '3vs3') { // Tu modo de 3
        todas = todas.filter(f => f !== "00"); // Quitamos doble blanco
        repartir(todas, 9, 3); // 9 fichas c/u
    }
}

function repartir(mazo, cantidad, numJugadores) {
    mazo.sort(() => Math.random() - 0.5);
    miMano = mazo.slice(0, cantidad);
    // En modo PC, asignamos a la máquina
    if (modoJuego === 'pc') {
        manoPC = mazo.slice(cantidad, cantidad * 2);
        pozo = mazo.slice(cantidad * 2);
    }
    actualizarInterfazMano();
}

// --- 2. LÓGICA DE JUEGO (EL 4 CON EL 4) ---
function intentarJugar(ficha) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);

    if (puntas.izq === null) {
        ejecutarMovimiento(ficha, 'der');
        return;
    }

    const puedeIzq = (n1 === puntas.izq || n2 === puntas.izq);
    const puedeDer = (n1 === puntas.der || n2 === puntas.der);

    if (puedeIzq && puedeDer) {
        mostrarDecision(ficha); // Tu pop-up si hay dos opciones
    } else if (puedeIzq) {
        ejecutarMovimiento(ficha, 'izq');
    } else if (puedeDer) {
        ejecutarMovimiento(ficha, 'der');
    }
}

function ejecutarMovimiento(ficha, lado) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    let invertida = false;

    if (puntas.izq === null) {
        puntas.izq = n1; puntas.der = n2;
    } else if (lado === 'izq') {
        if (n1 === puntas.izq) { puntas.izq = n2; invertida = true; }
        else { puntas.izq = n1; invertida = false; }
    } else {
        if (n2 === puntas.der) { puntas.der = n1; invertida = true; }
        else { puntas.der = n2; invertida = false; }
    }

    dibujarFichaEnMesa(ficha, lado, invertida);
    miMano = miMano.filter(f => f !== ficha);
    
    if (modoJuego === 'pc') {
        turnoActual = 2;
        setTimeout(iaPC, 1000);
    }
    actualizarInterfazMano();
}

// --- 3. VISUALIZACIÓN (Mesa Marrón) ---
function dibujarFichaEnMesa(ficha, lado, invertida) {
    const mesa = document.getElementById('jugades');
    const img = document.createElement('img');
    img.src = `imagen/${ficha}.png`;
    
    const esDoble = ficha[0] === ficha[1];
    let angulo = esDoble ? 0 : (invertida ? 270 : 90);

    img.style.transform = `rotate(${angulo}deg)`;
    img.style.margin = esDoble ? "0 5px" : "0 15px";

    if (lado === 'izq') mesa.insertBefore(img, mesa.firstChild);
    else mesa.appendChild(img);
}

// Lógica de IA para modo PC
function iaPC() {
    const jugada = manoPC.find(f => f.includes(puntas.izq) || f.includes(puntas.der));
    if (jugada) {
        const lado = jugada.includes(puntas.der) ? 'der' : 'izq';
        ejecutarMovimientoIA(jugada, lado);
    } else if (pozo.length > 0) {
        manoPC.push(pozo.pop());
        setTimeout(iaPC, 500);
    } else {
        turnoActual = 1; // Pasa turno al jugador
    }
}

window.onload = iniciarPartidaEnMesa;
            
