// Usamos la configuración que ya tienes en tu HTML
const db = firebase.database(); 
var miIdJugador = 0;

function irAPartida(modo) {
    if (modo === 'pc') {
        window.location.href = `partida.html?mode=pc`;
    } else {
        // Buscamos una mesa libre (mesa_1, mesa_2, etc.)
        const mesaId = "mesa_maracay_1"; 
        window.location.href = `partida.html?mode=${modo}&id=${mesaId}`;
    }
}

// Lógica de lobby para esperar oponentes
window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const idPartida = params.get('id');
    if (!idPartida) return;

    const salaRef = db.ref(`partidas/${idPartida}/jugadores`);
    salaRef.on('value', (snapshot) => {
        const jugadores = snapshot.val() || {};
        const total = Object.keys(jugadores).length;
        
        // Si somos nuevos en la mesa, nos registramos
        if (miIdJugador === 0 && total < 4) {
            miIdJugador = total + 1;
            db.ref(`partidas/${idPartida}/jugadores/jugador${miIdJugador}`).set({
                nombre: localStorage.getItem('domino_user') || "Invitado",
                listo: true
            });
        }
    });
};

