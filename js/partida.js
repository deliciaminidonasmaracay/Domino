// --- VARIABLES DE ESTADO ---
let manoJugador = [];
let manoPC = [];
let pozo = [];
let puntas = { izq: null, der: null };
let turnoActual = 'jugador'; // Empieza el jugador

// --- 1. INICIALIZACIÓN ---
function iniciarPartida() {
    const todas = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) todas.push(`${i}${j}`);
    }
    todas.sort(() => Math.random() - 0.5);

    manoJugador = todas.slice(0, 7);
    manoPC = todas.slice(7, 14);
    pozo = todas.slice(14);

    actualizarInterfaz();
}

// --- 2. LÓGICA DE JUGADA (AUTOMATIZADA) ---
function intentarJugar(ficha) {
    if (turnoActual !== 'jugador') return;

    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);

    // Primera ficha de la mesa
    if (puntas.izq === null) {
        ejecutarMovimiento(ficha, 'der');
        return;
    }

    const puedeIzq = (n1 === puntas.izq || n2 === puntas.izq);
    const puedeDer = (n1 === puntas.der || n2 === puntas.der);

    if (puedeIzq && puedeDer) {
        mostrarDecision(ficha); // Pop-up si hay dos opciones
    } else if (puedeIzq) {
        ejecutarMovimiento(ficha, 'izq');
    } else if (puedeDer) {
        ejecutarMovimiento(ficha, 'der');
    } else {
        alert("Esa ficha no sirve en ninguna punta.");
    }
}

// --- 3. EMPALME TÉCNICO Y ROTACIÓN ---
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

    dibujarEnTablero(ficha, lado, invertida);
    
    // Quitar ficha de la mano correspondiente
    if (turnoActual === 'jugador') {
        manoJugador = manoJugador.filter(f => f !== ficha);
    } else {
        manoPC = manoPC.filter(f => f !== ficha);
    }

    actualizarInterfaz();
    verificarEstadoJuego();
}

// --- 4. VISUALIZACIÓN (SEGÚN TUS CAPTURAS) ---
function dibujarEnTablero(ficha, lado, invertida) {
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

// --- 5. SISTEMA DE POZO Y PASO (EVITA QUE SE TRANQUE) ---
function robarDelPozo() {
    if (pozo.length > 0) {
        const nueva = pozo.pop();
        manoJugador.push(nueva);
        actualizarInterfaz();
        // Si la que robó sirve, no hace falta alert
    } else {
        alert("Pozo vacío. Debes pasar.");
        pasarTurno();
    }
}

function pasarTurno() {
    turnoActual = (turnoActual === 'jugador') ? 'pc' : 'jugador';
    if (turnoActual === 'pc') setTimeout(iaPC, 1000);
}

// --- 6. INTELIGENCIA DE LA PC ---
function iaPC() {
    const jugada = manoPC.find(f => f.includes(puntas.izq) || f.includes(puntas.der));
    
    if (jugada) {
        const lado = jugada.includes(puntas.der) ? 'der' : 'izq';
        ejecutarMovimiento(jugada, lado);
        turnoActual = 'jugador';
    } else if (pozo.length > 0) {
        manoPC.push(pozo.pop());
        setTimeout(iaPC, 500); // Roba y vuelve a intentar
    } else {
        console.log("PC Pasa");
        turnoActual = 'jugador';
    }
}

// --- INTERFAZ ---
function actualizarInterfaz() {
    const cont = document.getElementById('contenedorFichas');
    cont.innerHTML = "";
    manoJugador.forEach(f => {
        const img = document.createElement('img');
        img.src = `imagen/${f}.png`;
        img.className = "ficha-mano";
        img.onclick = () => intentarJugar(f);
        cont.appendChild(img);
    });
    
    // Mostrar u ocultar botones de robar según necesidad
    const puedeJugarCualquiera = manoJugador.some(f => f.includes(puntas.izq) || f.includes(puntas.der));
    document.getElementById('btnRobar').style.display = puedeJugarCualquiera ? 'none' : 'block';
}

function mostrarDecision(ficha) {
    const pop = document.createElement('div');
    pop.id = "pop-decision";
    pop.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1e293b; padding:20px; border:2px solid #f1c40f; color:white; z-index:1000; text-align:center;";
    pop.innerHTML = `
        <p>¿Punta Izquierda o Derecha?</p>
        <button onclick="confirmar('${ficha}', 'izq')" style="background:green; color:white; margin:5px; padding:10px;">IZQUIERDA</button>
        <button onclick="confirmar('${ficha}', 'der')" style="background:blue; color:white; margin:5px; padding:10px;">DERECHA</button>
    `;
    document.body.appendChild(pop);
}

function confirmar(ficha, lado) {
    document.getElementById('pop-decision').remove();
    ejecutarMovimiento(ficha, lado);
}

window.onload = iniciarPartida;
