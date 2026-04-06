let puntas = { izq: null, der: null };
let miMano = [], manoPC = [], pozo = [];
const params = new URLSearchParams(window.location.search);
const modo = params.get('mode') || 'pc';

window.onload = () => {
    // Si es modo 3 jugadores: 9 fichas y sin doble blanco
    if (modo === '3vs3') iniciar(9, true); 
    else iniciar(7, false); // Modo normal vs PC
};

function iniciar(cant, sinDoble) {
    let mazo = [];
    for (let i=0; i<=6; i++) for (let j=i; j<=6; j++) mazo.push(`${i}${j}`);
    if (sinDoble) mazo = mazo.filter(f => f !== "00");
    
    mazo.sort(() => Math.random() - 0.5);
    miMano = mazo.slice(0, cant);
    manoPC = mazo.slice(cant, cant * 2);
    pozo = mazo.slice(cant * 2);
    
    document.getElementById('torn').innerText = "TU TURNO";
    render();
}

function render() {
    const cont = document.getElementById('contenedorFichas');
    cont.innerHTML = "";
    miMano.forEach(f => {
        const img = document.createElement('img');
        img.src = `imagen/${f}.png`;
        img.className = "ficha-mano";
        img.onclick = () => jugar(f);
        cont.appendChild(img);
    });
    document.getElementById('fichas-pc').innerText = `PC: ${manoPC.length}`;
}

function jugar(f) {
    const n1 = parseInt(f[0]), n2 = parseInt(f[1]);
    if (puntas.izq === null) { actuar(f, 'der'); }
    else if (n1 === puntas.izq || n2 === puntas.izq) { actuar(f, 'izq'); }
    else if (n1 === puntas.der || n2 === puntas.der) { actuar(f, 'der'); }
    else { alert("Ficha no cuadra"); }
}

function actuar(f, lado) {
    const n1 = parseInt(f[0]), n2 = parseInt(f[1]);
    let inv = false;
    if (puntas.izq === null) { puntas.izq = n1; puntas.der = n2; }
    else if (lado === 'izq') {
        if (n1 === puntas.izq) { puntas.izq = n2; inv = true; } else { puntas.izq = n1; }
    } else {
        if (n2 === puntas.der) { puntas.der = n1; inv = true; } else { puntas.der = n2; }
    }

    const img = document.createElement('img');
    img.src = `imagen/${f}.png`;
    img.style.transform = `rotate(${f[0]===f[1] ? 0 : (inv ? 270 : 90)}deg)`;
    const m = document.getElementById('jugades');
    if (lado === 'izq') m.insertBefore(img, m.firstChild); else m.appendChild(img);

    miMano = miMano.filter(x => x !== f);
    render();
    document.getElementById('torn').innerText = "PC PENSANDO...";
    setTimeout(turnoIA, 1000);
}

function turnoIA() {
    let f = manoPC.find(x => parseInt(x[0])===puntas.izq || parseInt(x[1])===puntas.izq || parseInt(x[0])===puntas.der || parseInt(x[1])===puntas.der);
    if (f) {
        let l = (parseInt(f[0])===puntas.der || parseInt(f[1])===puntas.der) ? 'der' : 'izq';
        manoPC = manoPC.filter(x => x !== f);
        actuarIA(f, l);
    } else if (pozo.length > 0) {
        manoPC.push(pozo.pop());
        setTimeout(turnoIA, 500);
    } else {
        document.getElementById('torn').innerText = "PC PASA. TU TURNO";
    }
}

function actuarIA(f, lado) {
    // Lógica de puntas igual que actuar() pero para la PC
    const n1 = parseInt(f[0]), n2 = parseInt(f[1]);
    let inv = false;
    if (lado === 'izq') {
        if (n1 === puntas.izq) { puntas.izq = n2; inv = true; } else { puntas.izq = n1; }
    } else {
        if (n2 === puntas.der) { puntas.der = n1; inv = true; } else { puntas.der = n2; }
    }
    const img = document.createElement('img');
    img.src = `imagen/${f}.png`;
    img.style.transform = `rotate(${f[0]===f[1] ? 0 : (inv ? 270 : 90)}deg)`;
    const m = document.getElementById('jugades');
    if (lado === 'izq') m.insertBefore(img, m.firstChild); else m.appendChild(img);
    document.getElementById('torn').innerText = "TU TURNO";
    render();
}
