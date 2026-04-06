// --- GESTIÓN DE SALA Y MODOS ---
var miIdJugador = 0;
const db = firebase.database(); 

window.onload = function() {
    // Detectar el modo desde la URL para saber si buscamos red o no
    const params = new URLSearchParams(window.location.search);
    const modo = params.get('mode');

    if (modo === 'pc') {
        // Si es contra PC, saltamos el lobby y vamos directo
        console.log("Modo local contra PC activado.");
        return;
    }

    // Si es Online (1vs1, 2vs2, o 3), conectamos a la Sala de Espera
    const salaRef = db.ref('sala');

    salaRef.on('value', (snapshot) => {
        const data = snapshot.val() || { jugadors: {} };
        const listaJugadores = data.jugadors ? Object.keys(data.jugadors) : [];
        const numJugadores = listaJugadores.length;

        // Asignación de ID por puesto libre (1 al 4)
        if (miIdJugador === 0 && numJugadores < 4) {
            for (let i = 1; i <= 4; i++) {
                if (!data.jugadors['jugador' + i]) {
                    miIdJugador = i;
                    db.ref(`sala/jugadors/jugador${i}`).set({
                        nombre: localStorage.getItem('domino_user') || "Invitado",
                        status: "listo"
                    });
                    break;
                }
            }
        }
        
        actualizarEstadoLobby(numJugadores, modo);
    });
};

function actualizarEstadoLobby(total, modo) {
    const txtEstado = document.getElementById("mensaje-turno"); // Usamos el ID del HTML
    if (!txtEstado) return;

    if (modo === '1vs1' && total >= 2) {
        txtEstado.innerText = "¡Rival encontrado! Iniciando...";
        setTimeout(() => { if(miIdJugador === 1) iniciarTableroOnline(2); }, 2000);
    } else if (modo === '2vs2' && total === 4) {
        txtEstado.innerText = "Mesa llena. Repartiendo 7 fichas por pareja...";
        setTimeout(() => { if(miIdJugador === 1) iniciarTableroOnline(4); }, 2000);
    } else {
        txtEstado.innerText = `Esperando jugadores... (${total})`;
    }
}

// Función para el Host (Jugador 1) para repartir en Firebase
function iniciarTableroOnline(cantidadJugadores) {
    let mazo = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) mazo.push(`${i}${j}`);
    }

    // Lógica del audio: Si son 3, quitamos el doble blanco
    if (cantidadJugadores === 3) {
        mazo = mazo.filter(f => f !== "00");
    }

    // Mezclar
    mazo.sort(() => Math.random() - 0.5);

    // Reparto dinámico según modo
    const reparto = {
        mazo: mazo,
        puntas: { izq: null, der: null },
        turno: 1,
        ultimaJugada: Date.now()
    };

    db.ref('partida_activa').set(reparto);
    }
                           
