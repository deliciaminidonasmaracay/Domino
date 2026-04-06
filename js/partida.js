const urlParams = new URLSearchParams(window.location.search);
const modoActual = urlParams.get('modo');

let extremos = { izq: null, der: null };
let esPrimerTiro = true;
let miMano = [];
let manoPC = [];
let pila = [];

function iniciar() {
    // Definimos las 28 piezas únicas
    const todas = ["00","01","02","03","04","05","06","11","12","13","14","15","16","22","23","24","25","26","33","34","35","36","44","45","46","55","56","66"];
    // Barajamos el mazo
    const mazo = todas.sort(() => Math.random() - 0.5);
    
    // Reparto técnico
    miMano = mazo.slice(0, 7);
    manoPC = mazo.slice(7, 14);
    pila = mazo.slice(14);

    actualizarManoUI();
}

function actualizarManoUI() {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    let tieneJugada = false;

    miMano.forEach(f => {
        let img = document.createElement('img');
        img.src = "imagen/" + f + ".png"; 
        img.className = "ficha-domino";
        
        // Verificamos si la ficha puede ser jugada
        if (esPrimerTiro || f.includes(extremos.izq) || f.includes(extremos.der)) {
            tieneJugada = true;
        }

        img.onclick = () => procesarJugada(f, img, true);
        contenedor.appendChild(img);
    });

    // Control del botón de emergencia (Robar/Pasar)
    const btn = document.getElementById('btnAccion');
    if (!tieneJugada) {
        btn.style.display = "inline-block";
        btn.innerText = pila.length > 0 ? "ROBAR FICHA (" + pila.length + ")" : "PASAR TURNO";
    } else {
        btn.style.display = "none";
    }
}

function procesarJugada(ficha, elemento, esJugador) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    const mesa = document.getElementById('jugades');

    if (esPrimerTiro) {
        mesa.innerHTML = "";
        extremos.izq = n1; extremos.der = n2;
        mesa.appendChild(elemento.cloneNode());
        esPrimerTiro = false;
        finalizarAccion(ficha, elemento, esJugador);
        return;
    }

    let pIzq = (n1 === extremos.izq || n2 === extremos.izq);
    let pDer = (n1 === extremos.der || n2 === extremos.der);

    if (pIzq && !pDer) { aplicarColocacion(ficha, 'izq', elemento, esJugador); }
    else if (!pIzq && pDer) { aplicarColocacion(ficha, 'der', elemento, esJugador); }
    else if (pIzq && pDer) {
        // Si calza en ambos, el jugador elige; la PC elige izquierda por defecto
        let lado = esJugador ? (confirm("¿Colocar a la IZQUIERDA? (Cancelar para DERECHA)") ? 'izq' : 'der') : 'izq';
        aplicarColocacion(ficha, lado, elemento, esJugador);
    }
}

function aplicarColocacion(ficha, lado, elemento, esJugador) {
    const n1 = parseInt(ficha[0]); const n2 = parseInt(ficha[1]);
    let img = elemento.cloneNode();
    const mesa = document.getElementById('jugades');

    if (lado === 'izq') {
        if (n1 === extremos.izq) { img.style.transform = "rotate(180deg)"; extremos.izq = n2; }
        else { extremos.izq = n1; }
        mesa.insertBefore(img, mesa.firstChild);
    } else {
        if (n2 === extremos.der) { img.style.transform = "rotate(180deg)"; extremos.der = n1; }
        else { extremos.der = n2; }
        mesa.appendChild(img);
    }
    finalizarAccion(ficha, elemento, esJugador);
}

function finalizarAccion(ficha, elemento, esJugador) {
    if (esJugador) {
        miMano = miMano.filter(f => f !== ficha);
        elemento.remove();
        document.getElementById('torn').innerText = "Computador pensando...";
        setTimeout(ejecutarIA, 1500);
    } else {
        manoPC = manoPC.filter(f => f !== ficha);
        document.getElementById('torn').innerText = "Tu Turno";
        actualizarManoUI();
    }
}

function ejecutarIA() {
    let fichaValida = manoPC.find(f => f.includes(extremos.izq) || f.includes(extremos.der));
    
    if (fichaValida) {
        let dummyImg = document.createElement('img');
        dummyImg.src = "imagen/" + fichaValida + ".png";
        procesarJugada(fichaValida, dummyImg, false);
    } else if (pila.length > 0) {
        manoPC.push(pila.shift());
        setTimeout(ejecutarIA, 500); // Roba y reintenta rápido
    } else {
        alert("El Computador no tiene jugada y PASA.");
        document.getElementById('torn').innerText = "Tu Turno";
        actualizarManoUI();
    }
}

function gestionarPasoORobo() {
    if (pila.length > 0) {
        miMano.push(pila.shift());
        actualizarManoUI();
    } else {
        alert("No hay más fichas. Pasas el turno.");
        document.getElementById('torn').innerText = "Computador pensando...";
        setTimeout(ejecutarIA, 1500);
    }
}

window.onload = iniciar;
