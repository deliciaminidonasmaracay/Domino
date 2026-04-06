// VARIABLES DE CONTROL (Basadas en tus capturas)
let puntas = { izq: null, der: null };
let miMano = [];
let manoPC = [];

function iniciarJuego() {
    // Generar y repartir (Lógica estándar)
    const mazo = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) mazo.push(`${i}${j}`);
    }
    mazo.sort(() => Math.random() - 0.5);
    
    miMano = mazo.slice(0, 7);
    manoPC = mazo.slice(7, 14);
    renderizarMano();
}

// 1. EL JUGADOR SELECCIONA UNA FICHA
function seleccionarFicha(ficha) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);

    // Caso A: Es la primera ficha
    if (puntas.izq === null) {
        realizarJugada(ficha, 'der');
        return;
    }

    // Caso B: Verificamos por dónde puede entrar
    const puedeIzq = (n1 === puntas.izq || n2 === puntas.izq);
    const puedeDer = (n1 === puntas.der || n2 === puntas.der);

    if (puedeIzq && puedeDer) {
        // SI TIENE DOS OPCIONES: Pop-up para decidir (Como pediste)
        pedirDecision(ficha);
    } else if (puedeIzq) {
        realizarJugada(ficha, 'izq');
    } else if (puedeDer) {
        realizarJugada(ficha, 'der');
    } else {
        alert("Esa ficha no camina. No coincide con las puntas.");
    }
}

// 2. LÓGICA DE EMPALME (Para que 4 toque con 4)
function realizarJugada(ficha, lado) {
    const n1 = parseInt(ficha[0]);
    const n2 = parseInt(ficha[1]);
    let invertida = false;

    if (puntas.izq === null) {
        puntas.izq = n1; puntas.der = n2;
    } else if (lado === 'izq') {
        // Si el n1 es el que coincide, invertimos para que el n2 sea la nueva punta
        if (n1 === puntas.izq) { puntas.izq = n2; invertida = true; }
        else { puntas.izq = n1; invertida = false; }
    } else {
        // Si el n2 es el que coincide, invertimos para que el n1 sea la nueva punta
        if (n2 === puntas.der) { puntas.der = n1; invertida = true; }
        else { puntas.der = n2; invertida = false; }
    }

    dibujarEnMesa(ficha, lado, invertida);
    miMano = miMano.filter(f => f !== ficha);
    renderizarMano();
    setTimeout(turnoPC, 1000);
}

// 3. DIBUJO VISUAL (Respetando la orientación de tus capturas)
function dibujarEnMesa(ficha, lado, invertida) {
    const mesa = document.getElementById('jugades');
    const img = document.createElement('img');
    img.src = `imagen/${ficha}.png`;
    
    // Tamaño pequeño para que no se amontonen (Captura 22:42)
    img.style.width = "45px"; 
    
    const esDoble = ficha[0] === ficha[1];
    
    // Lógica de rotación real:
    // Dobles: Verticales (0deg). Normales: Horizontales (90deg o 270deg)
    let angulo = 0;
    if (!esDoble) {
        angulo = invertida ? 270 : 90;
    }

    img.style.transform = `rotate(${angulo}deg)`;
    img.style.margin = esDoble ? "0 5px" : "0 15px"; // Espacio para que se vea la unión
    
    if (lado === 'izq') {
        mesa.insertBefore(img, mesa.firstChild);
    } else {
        mesa.appendChild(img);
    }
}

// 4. POP-UP DE DECISIÓN (Solo cuando hay dos opciones)
function pedirDecision(ficha) {
    const contenedor = document.createElement('div');
    contenedor.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#2c3e50; padding:20px; border:2px solid #f1c40f; z-index:2000; text-align:center; color:white; border-radius:10px;";
    contenedor.innerHTML = `
        <p>¿Dónde quieres jugar la ficha ${ficha[0]}-${ficha[1]}?</p>
        <button onclick="confirmar('${ficha}', 'izq')" style="background:green; color:white; padding:10px; margin:5px; border:none; cursor:pointer;">IZQUIERDA</button>
        <button onclick="confirmar('${ficha}', 'der')" style="background:blue; color:white; padding:10px; margin:5px; border:none; cursor:pointer;">DERECHA</button>
    `;
    contenedor.id = "p-decision";
    document.body.appendChild(contenedor);
}

function confirmar(ficha, lado) {
    document.getElementById('p-decision').remove();
    realizarJugada(ficha, lado);
}

// 5. TURNO DE LA PC (Automático y con lógica)
function turnoPC() {
    // Busca una ficha que coincida con punta izq o der
    const fichaPC = manoPC.find(f => f.includes(puntas.izq) || f.includes(puntas.der));
    
    if (fichaPC) {
        const lado = fichaPC.includes(puntas.izq) ? 'izq' : 'der';
        // Aplicamos la misma lógica de inversión que el jugador
        const n1 = parseInt(fichaPC[0]);
        const n2 = parseInt(fichaPC[1]);
        let invPC = false;

        if (lado === 'izq') {
            if (n1 === puntas.izq) { puntas.izq = n2; invPC = true; }
            else { puntas.izq = n1; invPC = false; }
        } else {
            if (n2 === puntas.der) { puntas.der = n1; invPC = true; }
            else { puntas.der = n2; invPC = false; }
        }

        dibujarEnMesa(fichaPC, lado, invPC);
        manoPC = manoPC.filter(f => f !== fichaPC);
    }
}

function renderizarMano() {
    const divMano = document.getElementById('contenedorFichas');
    divMano.innerHTML = "";
    miMano.forEach(f => {
        const img = document.createElement('img');
        img.src = `imagen/${f}.png`;
        img.className = "ficha-mano";
        img.onclick = () => seleccionarFicha(f);
        divMano.appendChild(img);
    });
}

window.onload = iniciarJuego;
    
