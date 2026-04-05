var id = 0; // Tu número de jugador
var nombreJugador = "";

window.onload = function() {
    // 1. Referencia a la sala de juego en Firebase
    const salaRef = db.ref('sala');

    // 2. Escuchar en tiempo real cuántos jugadores hay
    salaRef.on('value', (snapshot) => {
        const data = snapshot.val() || { jugadors: {} };
        const listaJugadores = data.jugadors ? Object.keys(data.jugadors) : [];
        const numJugadores = listaJugadores.length;

        // Si aún no tenemos ID, intentamos entrar a un puesto libre (1 al 4)
        if (id === 0) {
            if (numJugadores < 4) {
                // Buscamos el primer número disponible del 1 al 4
                for (let i = 1; i <= 4; i++) {
                    if (!data.jugadors || !data.jugadors['jugador' + i]) {
                        id = i;
                        db.ref('sala/jugadors/jugador' + id).set({
                            id: id,
                            online: true
                        });
                        break;
                    }
                }
            }
        }

        actualizarLobby(numJugadores, id);
    });
};

function actualizarLobby(total, miId) {
    const mensaje = document.getElementById("missatge");
    const boton = document.getElementById("btnJugar");

    if (miId === 0) {
        mensaje.innerText = "La mesa está llena (4/4). Espera que termine la partida.";
        boton.setAttribute("hidden", "true");
    } else {
        mensaje.innerHTML = `Eres el <b>Jugador ${miId}</b>.<br>Jugadores en la mesa: ${total} de 4.`;
        
        // El botón solo aparece cuando hay 4 jugadores listos
        if (total === 4) {
            mensaje.innerText = "¡Mesa completa! Listos para repartir.";
            boton.removeAttribute("hidden");
        } else {
            boton.setAttribute("hidden", "true");
        }
    }
}

function aJugar() {
    // Escondemos el lobby y mostramos la mesa de juego
    document.getElementById("home").setAttribute("hidden", "true");
    document.getElementById("domino").removeAttribute("hidden");
    
    // Si eres el Jugador 1, tú inicializas las fichas en la base de datos
    if (id === 1) {
        inicializarPartida();
    }
    
    // Llamamos a la función que dibuja las fichas (estará en partida.js)
    if (typeof iniciarPartidaEnMesa === "function") {
        iniciarPartidaEnMesa(id);
    }
}

// Función para el "Host" (Jugador 1)
function inicializarPartida() {
    const todasLasFichas = ["0,0", "0,1", "0,2", "0,3", "0,4", "0,5", "0,6", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,2", "2,3", "2,4", "2,5", "2,6", "3,3", "3,4", "3,5", "3,6", "4,4", "4,5", "4,6", "5,5", "5,6", "6,6"];
    
    // Mezclar fichas (Fisher-Yates Shuffle)
    for (let i = todasLasFichas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [todasLasFichas[i], todasLasFichas[j]] = [todasLasFichas[j], todasLasFichas[i]];
    }

    // Repartir 7 a cada uno
    db.ref('partida').set({
        fichasJ1: todasLasFichas.slice(0, 7),
        fichasJ2: todasLasFichas.slice(7, 14),
        fichasJ3: todasLasFichas.slice(14, 21),
        fichasJ4: todasLasFichas.slice(21, 28),
        mesa: [],
        torn: 1, // Empieza el jugador 1 por ahora
        ultimaFichaEsq: null,
        ultimaFichaDer: null
    });
}
