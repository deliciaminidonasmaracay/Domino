// Capturamos el modo desde la URL que envía el index.html
const urlParams = new URLSearchParams(window.location.search);
const modoActual = urlParams.get('modo'); 

// Tu configuración de red validada
const firebaseConfig = { 
    databaseURL: "https://dominovenezuela-2624b-default-rtdb.firebaseio.com/" 
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

function iniciarMesa() {
    if (modoActual === 'PC') {
        console.log("Iniciando Modo Offline: Usuario vs Computadora");
        configurarPartidaLocal();
    } else {
        console.log("Iniciando Modo Online: " + modoActual + " jugadores");
        conectarAServidor(modoActual);
    }
}

// LÓGICA VS PC (Sin latencia de red)
function configurarPartidaLocal() {
    document.getElementById('estadoModo').innerText = "JUGANDO CONTRA LA PC";
    
    // Lista maestra de las 28 fichas que limpiamos
    const todasLasFichas = [
        "00","01","02","03","04","05","06",
        "11","12","13","14","15","16",
        "22","23","24","25","26",
        "33","34","35","36",
        "44","45","46",
        "55","56",
        "66"
    ];

    // Barajamos (Shuffle)
    const mazo = todasLasFichas.sort(() => Math.random() - 0.5);
    
    // Repartimos 7 al usuario
    const misFichas = mazo.slice(0, 7);
    renderizarMisFichas(misFichas);
}

function renderizarMisFichas(fichas) {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    
    fichas.forEach(f => {
        let img = document.createElement('img');
        // Usamos la ruta y extensión que confirmaste (.png minúscula)
        img.src = "imagen/" + f + ".png"; 
        img.className = "ficha-domino";
        img.onclick = () => intentarJugar(f);
        contenedor.appendChild(img);
    });
}

window.onload = iniciarMesa;
