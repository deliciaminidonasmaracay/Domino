var miIdJugador = 0;
var misFichas = [];
var turnoActual = 0;

// Se activa cuando los 4 están en la mesa
function iniciarPartidaEnMesa(id) {
    miIdJugador = id;
    
    // Escuchar la base de datos en tiempo real
    db.ref('partida').on('value', (snapshot) => {
        const estado = snapshot.val();
        if (estado) {
            actualizarMesa(estado);
            cargarMisFichas(estado);
        }
    });
}

function cargarMisFichas(estado) {
    misFichas = estado['fichasJ' + miIdJugador] || [];
    const contenedor = document.getElementById("contenedorFichas");
    contenedor.innerHTML = ""; 

    misFichas.forEach((ficha) => {
        var img = document.createElement('img');
        
        // AJUSTE DE RUTA: Carpeta 'imagen' y formato '01.png'
        // Convertimos "0,1" en "01" para que coincida con tus archivos
        let nombreArchivo = ficha.replace(',', ''); 
        img.src = `imagen/${nombreArchivo}.png`; 
        
        img.id = ficha;
        img.className = "ficha-domino";
        img.style.cursor = "pointer";
        img.style.margin = "8px";
        img.width = 60; // Un poco más grandes para que se vean bien en el celular
        
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

    // Dibujamos las fichas que ya están en la mesa
    divJugadas.innerHTML = "";
    if (estado.mesa) {
        estado.mesa.forEach(f => {
            let imgMesa = document.createElement('img');
            imgMesa.src = `imagen/${f.replace(',', '')}.png`;
            imgMesa.width = 40;
            imgMesa.style.margin = "2px";
            divJugadas.appendChild(imgMesa);
        });
    }

    if (turnoActual === miIdJugador) {
        divTorn.innerHTML = "<h2 style='color: #2ecc71;'>¡TE TOCA JUGAR!</h2>";
    } else {
        divTorn.innerHTML = `<p>Esperando al Jugador ${turnoActual}...</p>`;
        divTorn.style.color = "#e74c3c";
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var fichaId = ev.dataTransfer.getData("text");
    
    if (turnoActual !== miIdJugador) {
        alert("¡Cuidado! Todavía no es tu turno.");
        return;
    }

    registrarJugada(fichaId, ev.target.id);
}

function registrarJugada(ficha, lado) {
    const partidaRef = db.ref('partida');
    
    partidaRef.once('value').then((snapshot) => {
        let estado = snapshot.val();
        let mesa = estado.mesa || [];
        
        // Quitamos la ficha de nuestra mano
        let misNuevasFichas = misFichas.filter(f => f !== ficha);
        
        // La ponemos en el lado elegido
        if (lado === "dropEsq") {
            mesa.unshift(ficha);
        } else {
            mesa.push(ficha);
        }

        // Rotación de turnos (1 -> 2 -> 3 -> 4 -> 1)
        let siguienteTurno = (miIdJugador % 4) + 1;

        // Subida de datos a Firebase
        let updates = {};
        updates['mesa'] = mesa;
        updates['torn'] = siguienteTurno;
        updates['fichasJ' + miIdJugador] = misNuevasFichas;

        partidaRef.update(updates);
    });
        }
                                  
