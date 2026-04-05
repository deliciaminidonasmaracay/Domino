var id = 0;
var idInterval;
var peces = [];
var pecaJugada;

window.onload = function() {
    var dada;
    document.getElementById("missatge").innerText = "Esperant a l'altre jugador";
    idInterval = setInterval(function() {
        cridaAJAXinicial('/index?idJugador=' + id);
    }, 3000);
};

/*Funció feta amb fetch
function cridaFetchInicial(url){
    fetch(url, {
        method: 'POST'        
    }).then(function(response) {

    })
}*/
/*Funció feta amb AJAX*/
function cridaAJAXinicial(url){
    var xhr = new XMLHttpRequest();
        if(!xhr){
            alert('Problemes amb XHR');
            return false;
        }
        xhr.onreadystatechange = callbackAJAXinicial;
        xhr.open('POST',url,true);
        xhr.send(null);
}

function callbackAJAXinicial() {
    if(xhr.readyState === XMLHttpRequest.DONE){
        if(xhr.status === 200){
            dada = JSON.parse(xhr.response);
            mostrarInici();
        }else{
            console.log('Problemes amb l\'AJAX');
        }
    }
}

//Mostra l'index de la pàgina
function mostrarInici() {
    var jugadors = dada.jugadors;
    id = dada.id;
    if(jugadors.length < 2){
        document.getElementById("missatge").innerText = "Esperant l'altre jugador";
    }else if(jugadors.length == 2 && id != 0){
        document.getElementById("missatge").innerText = "Fes click per jugar";
        document.getElementById("btnJugar").attributes.removeNamedItem("hidden");
        clearInterval(idInterval);
    }else if(jugadors.length == 2 && id == 0){
        document.getElementById("missatge").innerText = "Sala plena. Espera a que els jugadors finalitzin.";
        clearInterval(idInterval);
    }
}

function aJugar() {
    document.getElementById("home").setAttribute("hidden","true");
    document.getElementById("domino").attributes.removeNamedItem("hidden");
    cridaAJAXJoc('/comencar?idJugador=' + id);
}