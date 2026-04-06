const urlParams = new URLSearchParams(window.location.search);
const modoActual = urlParams.get('modo');
const firebaseConfig = { databaseURL: "https://dominovenezuela-2624b-default-rtdb.firebaseio.com/" };

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

function iniciarJuego() {
    const estado = document.getElementById('estadoModo');
    if(modoActual === 'PC') {
        estado.innerText = "MODO: VS COMPUTADORA";
        repartirLocal();
    } else {
        estado.innerText = "MODO: MULTIJUGADOR (" + modoActual + ")";
        // Aquí iría la lógica de escuchar a los otros jugadores
    }
}

function repartirLocal() {
    const contenedor = document.getElementById('contenedorFichas');
    contenedor.innerHTML = "";
    // Ejemplo de 7 fichas (usa tus nombres 00.PNG, 01.PNG...)
    const misFichas = ["00", "01", "02", "03", "04", "05", "06"];
    
    misFichas.forEach(f => {
        let img = document.createElement('img');
        img.src = "imagen/" + f + ".PNG"; // Cambia a .png si las renombraste a minúscula
        img.className = "ficha-domino";
        img.onclick = () => console.log("Jugaste " + f);
        contenedor.appendChild(img);
    });
}

window.onload = iniciarJuego;
