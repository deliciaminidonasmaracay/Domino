let extremos = { izq: null, der: null };
let esPrimerTiro = true;
let miMano = [];
let manoPC = [];
let pozo = [];

function iniciarJuego() {
    const todas = ["00","01","02","03","04","05","06","11","12","13","14","15","16","22","23","24","25","26","33","34","35","36","44","45","46","55","56","66"];
    const mazo = todas.sort(() => Math.random() - 0.5);
    
    miMano = mazo.slice(0, 7);
    manoPC = mazo.slice(7, 14);
    pozo = mazo.slice(14);

    actualizarUI();
}

function crearFichaMesa(ficha, invertida) {
    const img = document.createElement('img');
    img.src = `imagen/${ficha}.png`;
    
    const esDoble = ficha[0] === ficha[1];
    
    if (esDoble) {
        // Dobles van verticales
        img.style.transform = invertida ? "rotate(180deg)" : "rotate(0deg)";
    } else {
        // Normales se acuestan 90 grados (orientación real)
        img.style.transform = invertida ? "rotate(270deg)" : "rotate(90deg)";
        img.style.margin = "0 15px"; // Espacio para la rotación
    }
    return img;
}

function aplicarJugada(ficha, lado, esJugador) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    const mesa = document.getElementById('jugades');
    let invertida = false;

    if (esPrimerTiro) {
        extremos.izq = n1; extremos.der = n2;
        mesa.appendChild(crearFichaMesa(ficha, false));
        esPrimerTiro = false;
    } else if (lado === 'izq') {
        if (n1 === extremos.izq) { invertida = true; extremos.izq = n2; }
        else { extremos.izq = n1; }
        mesa.insertBefore(crearFichaMesa(ficha, invertida), mesa.firstChild);
    } else {
        if (n2 === extremos.der) { invertida = true; extremos.der = n1; }
        else { extremos.der = n2; }
        mesa.appendChild(crearFichaMesa(ficha, invertida));
    }

    if (esJugador) {
        miMano = miMano.filter(f => f !== ficha);
        setTimeout(turnoPC, 1000);
    } else {
        manoPC = manoPC.filter(f => f !== ficha);
    }
    actualizarUI();
}

function turnoPC() {
    let jugada = manoPC.find(f => f.includes(extremos.izq) || f.includes(extremos.der));
    if (jugada) {
        let lado = jugada.includes(extremos.izq) ? 'izq' : 'der';
        aplicarJugada(jugada, lado, false);
    } else if (pozo.length > 0) {
        manoPC.push(pozo.shift());
        turnoPC();
    } else {
        alert("PC PASA");
    }
}

function actualizarUI() {
    const contMano = document.getElementById('contenedorFichas');
    contMano.innerHTML = "";
    miMano.forEach(f => {
        const img = document.createElement('img');
        img.src = `imagen/${f}.png`;
        img.className = "ficha-mano";
        img.onclick = () => {
            if (esPrimerTiro) aplicarJugada(f, 'der', true);
            else if (f.includes(extremos.izq)) aplicarJugada(f, 'izq', true);
            else if (f.includes(extremos.der)) aplicarJugada(f, 'der', true);
        };
        contMano.appendChild(img);
    });
}

window.onload = iniciarJuego;
                   
