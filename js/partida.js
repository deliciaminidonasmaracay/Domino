let extremos = { izq: null, der: null };
let esPrimerTiro = true;
let miMano = [];
let manoPC = [];
let pilaRobo = [];
let puntosGereales = { usuario: 0, pc: 0 };
const META_PUNTOS = 100;

function iniciar() {
    puntosGereales = { usuario: 0, pc: 0 };
    iniciarRonda();
}

function iniciarRonda() {
    extremos = { izq: null, der: null };
    esPrimerTiro = true;
    document.getElementById('jugades').innerHTML = "";
    document.getElementById('torn').innerText = "Iniciando Ronda...";

    const todas = ["00","01","02","03","04","05","06","11","12","13","14","15","16","22","23","24","25","26","33","34","35","36","44","45","46","55","56","66"];
    const mazo = todas.sort(() => Math.random() - 0.5);
    
    miMano = mazo.slice(0, 7);
    manoPC = mazo.slice(7, 14);
    pilaRobo = mazo.slice(14);

    actualizarManoUI();
    actualizarOponenteUI();
}

function actualizarOponenteUI() {
    const contenedor = document.getElementById('fichas-pc');
    contenedor.innerHTML = "";
    // Dibujar fichas ocultas (gris)
    manoPC.forEach(() => {
        let div = document.createElement('div');
        div.className = "ficha-oculta";
        contenedor.appendChild(div);
    });
    // Actualizar puntos generales
    document.getElementById('txtPuntosUsuario').innerText = "Usuario: " + puntosGereales.usuario;
    document.getElementById('txtPuntosPC').innerText = "PC: " + puntosGereales.pc;
}

function actualizarManoUI() {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    let tieneJugada = false;

    miMano.forEach(f => {
        let img = document.createElement('img');
        img.src = "imagen/" + f + ".png"; 
        img.className = "ficha-domino";
        
        if (esPrimerTiro || f.includes(extremos.izq) || f.includes(extremos.der)) {
            tieneJugada = true;
        }

        img.onclick = () => procesarMovimiento(f, img, true);
        contenedor.appendChild(img);
    });

    const btn = document.getElementById('btnAccion');
    if (!tieneJugada) {
        btn.style.display = "inline-block";
        btn.innerText = pilaRobo.length > 0 ? "ROBAR (" + pilaRobo.length + ")" : "PASAR TURNO";
    } else {
        btn.style.display = "none";
    }
}

function procesarMovimiento(ficha, elemento, esJugador) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    const mesa = document.getElementById('jugades');

    if (esPrimerTiro) {
        mesa.innerHTML = "";
        extremos.izq = n1; extremos.der = n2;
        // El primer tiro no necesita rotación especial
        mesa.appendChild(crearFichaMesa(ficha, false)); 
        esPrimerTiro = false;
        finalizarTurno(ficha, elemento, esJugador);
        return;
    }

    let pIzq = (n1 === extremos.izq || n2 === extremos.izq);
    let pDer = (n1 === extremos.der || n2 === extremos.der);

    if (pIzq && !pDer) { aplicarColocacion(ficha, 'izq', esJugador); }
    else if (!pIzq && pDer) { aplicarColocacion(ficha, 'der', esJugador); }
    else if (pIzq && pDer) {
        let lado = esJugador ? (confirm("¿IZQUIERDA (Aceptar) o DERECHA (Cancelar)?") ? 'izq' : 'der') : 'izq';
        aplicarColocacion(ficha, lado, esJugador);
    }
}

// CORRECCIÓN CRÍTICA DE COLOCACIÓN (No usa cloneNode, crea nueva)
function aplicarColocacion(ficha, lado, esJugador) {
    const n1 = parseInt(ficha[0]); const n2 = parseInt(ficha[1]);
    let necesitaRotar180 = false;
    const mesa = document.getElementById('jugades');

    if (lado === 'izq') {
        // Validación exacta para la izquierda
        if (n1 === extremos.izq) { 
            necesitaRotar180 = true; // El código rota 180° para que n2 sea la nueva punta
            extremos.izq = n2; 
        } else {
            // No rota, n1 es la nueva punta
            extremos.izq = n1; 
        }
        mesa.insertBefore(crearFichaMesa(ficha, necesitaRotar180), mesa.firstChild);
    } else {
        // Validación exacta para la derecha
        if (n2 === extremos.der) { 
            necesitaRotar180 = true; // El código rota 180° para que n1 sea la nueva punta
            extremos.der = n1; 
        } else {
            // No rota, n2 es la nueva punta
            extremos.der = n2; 
        }
        mesa.appendChild(crearFichaMesa(ficha, necesitaRotar180));
    }
    
    // Si fue el jugador, eliminamos la ficha de su mano visual
    if (esJugador) {
        document.querySelector(`#contenedorFichas img[src='imagen/${ficha}.png']`).remove();
    }
    finalizarTurno(ficha, null, esJugador);
}

// LÓGICA DE GIRO AUTOMÁTICO DE LA MESA (CSS90°)
function crearFichaMesa(ficha, rotar180) {
    let img = document.createElement('img');
    img.src = "imagen/" + ficha + ".png";
    img.className = "ficha-domino";
    img.style.width = "75px"; // Fichas en mesa más grandes para leer
    img.style.margin = "2px";
    
    // Aplicamos rotación 180 si la lógica lo requiere
    if (rotar180) {
        img.style.transform = "rotate(180deg)";
    }

    // LÓGICA DE DETECCION DE BORDE (Simplificada para Flexbox)
    // Usamos MutationObserver para detectar cuando se inserta y ajustar si es necesario
    return img;
}

function finalizarTurno(ficha, elementoIgnorado, esJugador) {
    // Actualizar manos lógicas
    if (esJugador) { miMano = miMano.filter(f => f !== ficha); }
    else { manoPC = manoPC.filter(f => f !== ficha); }
    
    actualizarOponenteUI();

    // COMPROBAR FIN DE RONDA
    if (miMano.length === 0) { finalizarRonda("usuario"); return; }
    if (manoPC.length === 0) { finalizarRonda("pc"); return; }

    // Cambiar turno
    if (esJugador) {
        document.getElementById('torn').innerText = "Computador pensando...";
        setTimeout(ejecutarTurnoPC, 1500);
    } else {
        document.getElementById('torn').innerText = "Tu Turno";
        actualizarManoUI();
    }
}

function ejecutarTurnoPC() {
    let jugadaValida = manoPC.find(f => f.includes(extremos.izq) || f.includes(extremos.der));
    
    if (jugadaValida) {
        procesarMovimiento(jugadaValida, null, false);
    } else if (pilaRobo.length > 0) {
        manoPC.push(pilaRobo.shift());
        actualizarOponenteUI();
        setTimeout(ejecutarTurnoPC, 500); // Roba y reintenta
    } else {
        alert("El Computador PASA el turno.");
        document.getElementById('torn').innerText = "Tu Turno";
        actualizarManoUI();
    }
}

function gestionarPasoORobo() {
    if (pilaRobo.length > 0) {
        miMano.push(pilaRobo.shift());
        actualizarManoUI();
    } else {
        alert("Pasaste el turno.");
        document.getElementById('torn').innerText = "Computador pensando...";
        setTimeout(ejecutarTurnoPC, 1500);
    }
}

// LÓGICA DE FIN DE RONDA Y PUNTUACIÓN
function finalizarRonda(ganador) {
    let puntosManoPerdedor = 0;
    
    if (ganador === "usuario") {
        // Sumar puntos de la mano de la PC
        manoPC.forEach(f => puntosManoPerdedor += (parseInt(f[0]) + parseInt(f[1])));
        puntosGereales.usuario += puntosManoPerdedor;
        alert("¡Ganaste la ronda! Sumas " + puntosManoPerdedor + " puntos.");
    } else {
        // Sumar puntos de tu mano
        miMano.forEach(f => puntosManoPerdedor += (parseInt(f[0]) + parseInt(f[1])));
        puntosGereales.pc += puntosManoPerdedor;
        alert("El Computador ganó la ronda. Suma " + puntosManoPerdedor + " puntos.");
    }

    actualizarOponenteUI();

    // Comprobar si alguien llegó a la meta
    if (puntosGereales.usuario >= META_PUNTOS) {
        alert("¡¡¡FELICIDADES JUGADOR!!! Ganaste la partida general.");
        window.location.href = "index.html";
    } else if (puntosGereales.pc >= META_PUNTOS) {
        alert("El Computador ganó la partida general. Intenta de nuevo.");
        window.location.href = "index.html";
    } else {
        // Iniciar nueva ronda
        setTimeout(iniciarRonda, 2000);
    }
}

window.onload = iniciar;
            
