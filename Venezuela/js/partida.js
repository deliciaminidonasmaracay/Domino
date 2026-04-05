var miIdJugador = 0;
var misFichas = [];
var turnoActual = 0;

// Esta función se llama desde main.js cuando le das a "Jugar"
function iniciarPartidaEnMesa(id) {
    miIdJugador = id;
    
    // Escuchar cambios en la partida (fichas en mesa, turnos, etc)
    db.ref('partida').on('value', (snapshot) => {
        const estado = snapshot.val();
        if (estado) {
            actualizarMesa(estado);
            cargarMisFichas(estado);
        }
    });
}

function cargarMisFichas(estado) {
    // Obtenemos las fichas que nos tocaron según nuestro ID
    misFichas = estado['fichasJ' + miIdJugador] || [];
    const contenedor = document.getElementById("contenedorFichas");
    contenedor.innerHTML = ""; // Limpiar antes de dibujar

    misFichas.forEach((ficha, index) => {
        var img = document.createElement('img');
        img.src = `imatges/${ficha.replace(',', '')}.png`; // Ejemplo: "0,1" -> imatges/01.png
        img.id = ficha;
        img.className = "ficha-domino";
        img.style.cursor = "pointer";
        img.style.margin = "5px";
        img.width = 50;
        
        // Habilitar arrastre
        img.draggable = true;
        img.ondragstart = (ev) => {
            ev.dataTransfer.setData("text", ev.target.id);
        };
        
        contenedor.appendChild(img);
    });
}

function actualizarMesa(estado) {
    turnoActual = estado.torn;
    const divJugadas = document.getElementById("jugades");
    const divTorn = document.getElementById("torn");

    // Mostrar las fichas que ya están en la mesa
    divJugadas.innerText = "Mesa: " + (estado.mesa ? estado.mesa.join(" | ") : "Vacía");

    // Mostrar de quién es el turno
    if (turnoActual === miIdJugador) {
        divTorn.innerText = "¡ES TU TURNO!";
        divTorn.style.color = "green";
    } else {
        divTorn.innerText = "Turno del Jugador " + turnoActual;
        divTorn.style.color = "red";
    }
}

// Funciones para Arrastrar y Soltar (Drag & Drop)
function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var fichaId = ev.dataTransfer.getData("text");
    
    if (turnoActual !== miIdJugador) {
        alert("¡No es tu turno!");
        return;
    }

    // Aquí enviamos la jugada a Firebase
    registrarJugada(fichaId, ev.target.id); // ev.target.id es 'dropEsq' o 'dropDreta'
}

function registrarJugada(ficha, lado) {
    const partidaRef = db.ref('partida');
    
    partidaRef.once('value').then((snapshot) => {
        let estado = snapshot.val();
        let mesa = estado.mesa || [];
        let misNuevasFichas = misFichas.filter(f => f !== ficha);
        
        // Lógica simple: agregar a la mesa
        if (lado === "dropEsq") {
            mesa.unshift(ficha);
        } else {
            mesa.push(ficha);
        }

        // Calcular siguiente turno (1->2, 2->3, 3->4, 4->1)
        let siguienteTurno = (miIdJugador % 4) + 1;

        // Actualizar Firebase
        let actualizaciones = {};
        actualizaciones['mesa'] = mesa;
        actualizaciones['torn'] = siguienteTurno;
        actualizaciones['fichasJ' + miIdJugador] = misNuevasFichas;

        partidaRef.update(actualizaciones);
    });
}
