const urlParams = new URLSearchParams(window.location.search);
const modoActual = urlParams.get('modo');
const firebaseConfig = { databaseURL: "https://dominovenezuela-2624b-default-rtdb.firebaseio.com/" };

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

let extremos = { izq: null, der: null };
let esPrimerTiro = true;

function iniciar() {
    const txt = document.getElementById('estadoModo');
    if(modoActual === 'PC') {
        txt.innerText = "JUGANDO CONTRA LA PC";
        repartirLocal();
    } else {
        txt.innerText = "MODO MULTIJUGADOR";
    }
}

function repartirLocal() {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    // Ejemplo de mano inicial
    const miMano = ["00", "11", "22", "33", "44", "55", "66"];
    
    miMano.forEach(f => {
        let img = document.createElement('img');
        img.src = "imagen/" + f + ".png"; 
        img.className = "ficha-domino";
        img.onclick = () => procesarJugada(f, img);
        contenedor.appendChild(img);
    });
}

function procesarJugada(ficha, elemento) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    const mesa = document.getElementById('jugades');

    if (esPrimerTiro) {
        mesa.innerHTML = ""; // Limpia las etiquetas "Punta Izq/Der"
        extremos.izq = n1;
        extremos.der = n2;
        agregarAMesa(elemento.cloneNode(), 'centro');
        finalizarTurno(elemento);
        esPrimerTiro = false;
        return;
    }

    // Lógica de validación de puntas
    let puedeIzq = (n1 === extremos.izq || n2 === extremos.izq);
    let puedeDer = (n1 === extremos.der || n2 === extremos.der);

    if (puedeIzq && !puedeDer) {
        colocar(ficha, 'izq', elemento);
    } else if (!puedeIzq && puedeDer) {
        colocar(ficha, 'der', elemento);
    } else if (puedeIzq && puedeDer) {
        let lado = confirm("¿Colocar a la IZQUIERDA? (Cancelar para DERECHA)") ? 'izq' : 'der';
        colocar(ficha, lado, elemento);
    } else {
        alert("Esa ficha no calza en las puntas.");
    }
}

function colocar(ficha, lado, elemento) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    let nuevoNodo = elemento.cloneNode();

    if (lado === 'izq') {
        if (n1 === extremos.izq) {
            nuevoNodo.style.transform = "rotate(180deg)";
            extremos.izq = n2;
        } else {
            extremos.izq = n1;
        }
        document.getElementById('jugades').insertBefore(nuevoNodo, document.getElementById('jugades').firstChild);
    } else {
        if (n2 === extremos.der) {
            nuevoNodo.style.transform = "rotate(180deg)";
            extremos.der = n1;
        } else {
            extremos.der = n2;
        }
        document.getElementById('jugades').appendChild(nuevoNodo);
    }
    finalizarTurno(elemento);
}

function agregarAMesa(nodo, pos) {
    document.getElementById('jugades').appendChild(nodo);
}

function finalizarTurno(el) {
    el.remove();
    document.getElementById('torn').innerText = "Turno de la PC...";
    setTimeout(() => { document.getElementById('torn').innerText = "Tu Turno"; }, 1500);
}

window.onload = iniciar;
