const urlParams = new URLSearchParams(window.location.search);
const modoActual = urlParams.get('modo');

let extremos = { izq: null, der: null };
let esPrimerTiro = true;
let manoPC = []; // Fichas de la computadora
let miMano = []; // Tus fichas
let pila = [];   // Fichas restantes para robar

function iniciar() {
    const todas = ["00","01","02","03","04","05","06","11","12","13","14","15","16","22","23","24","25","26","33","34","35","36","44","45","46","55","56","66"];
    const mazo = todas.sort(() => Math.random() - 0.5);
    
    miMano = mazo.slice(0, 7);
    manoPC = mazo.slice(7, 14);
    pila = mazo.slice(14); // El resto queda en la pila

    repartirManoUsuario();
}

function repartirManoUsuario() {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    let tieneJugada = false;

    miMano.forEach((f, index) => {
        let img = document.createElement('img');
        img.src = "imagen/" + f + ".png"; 
        img.className = "ficha-domino";
        
        // Verificar si el usuario tiene al menos una jugada válida
        if (esPrimerTiro || f.includes(extremos.izq) || f.includes(extremos.der)) {
            tieneJugada = true;
        }

        img.onclick = () => procesarJugada(f, img, true);
        contenedor.appendChild(img);
    });

    // Si no tienes jugada, mostramos el botón de Pasar/Robar
    document.getElementById('btnPasar').style.display = tieneJugada ? "none" : "inline-block";
}

function procesarJugada(ficha, elemento, esUsuario) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    const mesa = document.getElementById('jugades');

    if (esPrimerTiro) {
        mesa.innerHTML = "";
        extremos.izq = n1; extremos.der = n2;
        colocarEnPantalla(elemento.cloneNode(), 'centro', false);
        finalizarMovimiento(ficha, elemento, esUsuario);
        esPrimerTiro = false;
        return;
    }

    let puedeIzq = (n1 === extremos.izq || n2 === extremos.izq);
    let puedeDer = (n1 === extremos.der || n2 === extremos.der);

    if (puedeIzq && !puedeDer) {
        ejecutarColocacion(ficha, 'izq', elemento, esUsuario);
    } else if (!puedeIzq && puedeDer) {
        ejecutarColocacion(ficha, 'der', elemento, esUsuario);
    } else if (puedeIzq && puedeDer) {
        if (esUsuario) {
            let lado = confirm("¿IZQUIERDA (Aceptar) o DERECHA (Cancelar)?") ? 'izq' : 'der';
            ejecutarColocacion(ficha, lado, elemento, esUsuario);
        } else {
            ejecutarColocacion(ficha, 'izq', elemento, esUsuario); // PC elige izq por defecto
        }
    }
}

function ejecutarColocacion(ficha, lado, elemento, esUsuario) {
    const n1 = parseInt(ficha[0]); const n2 = parseInt(ficha[1]);
    let nuevoNodo = elemento.cloneNode();
    
    if (lado === 'izq') {
        if (n1 === extremos.izq) { nuevoNodo.style.transform = "rotate(180deg)"; extremos.izq = n2; }
        else { extremos.izq = n1; }
        document.getElementById('jugades').insertBefore(nuevoNodo, document.getElementById('jugades').firstChild);
    } else {
        if (n2 === extremos.der) { nuevoNodo.style.transform = "rotate(180deg)"; extremos.der = n1; }
        else { extremos.der = n2; }
        document.getElementById('jugades').appendChild(nuevoNodo);
    }
    finalizarMovimiento(ficha, elemento, esUsuario);
}

function finalizarMovimiento(ficha, elemento, esUsuario) {
    if (esUsuario) {
        miMano = miMano.filter(f => f !== ficha);
        elemento.remove();
        document.getElementById('torn').innerText = "Turno de la PC...";
        document.getElementById('btnPasar').style.display = "none";
        setTimeout(jugarTurnoPC, 1500);
    } else {
        manoPC = manoPC.filter(f => f !== ficha);
        document.getElementById('torn').innerText = "Tu Turno";
        repartirManoUsuario();
    }
}

function jugarTurnoPC() {
    let fichaParaJugar = manoPC.find(f => f.includes(extremos.izq) || f.includes(extremos.der));

    if (fichaParaJugar) {
        let dummyImg = document.createElement('img');
        dummyImg.src = "imagen/" + fichaParaJugar + ".png";
        procesarJugada(fichaParaJugar, dummyImg, false);
    } else {
        if (pila.length > 0) {
            manoPC.push(pila.shift());
            setTimeout(jugarTurnoPC, 1000); // Roba y vuelve a intentar
        } else {
            alert("La PC PASA");
            document.getElementById('torn').innerText = "Tu Turno";
            repartirManoUsuario();
        }
    }
}

function accionPasarORobar() {
    if (pila.length > 0) {
        miMano.push(pila.shift());
        repartirManoUsuario();
    } else {
        alert("Pasaste el turno");
        document.getElementById('torn').innerText = "Turno de la PC...";
        setTimeout(jugarTurnoPC, 1500);
    }
}

function colocarEnPantalla(nodo, pos, rotar) {
    document.getElementById('jugades').appendChild(nodo);
}

window.onload = iniciar;
    
