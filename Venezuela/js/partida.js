var id = 0;
var movimentAcertat;
var peces = [];
var pecesJugades = [];

function cridaAJAXJoc(url) {
    let xhr = new XMLHttpRequest();

    if (!xhr) {
        alert('problemes amb XHR');
        return false;
    }
    xhr.onreadystatechange = callbackAJAXJoc;
    xhr.open('POST', url, true);
    xhr.send(null);
}

function callbackAJAXJoc() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
            dada = JSON.parse(xhr.response);
            mostrarJoc();
        } else {
            console.log('problemes amb l\'AJAX');
        }
    }
}

function mostrarJoc() {
    var p = 3;
    id = dada.id;
    tornActual = dada.torn;

    if (id == 1) {
        peces = dada.peces1;
    } else if (id == 2) {
        peces = dada.peces2;
    }

    for (var i = 0; i < peces.length; i++) {
        var img = document.createElement('img');
        img.id = peces[i];
        img.height = 90;
        img.width = 45;
        img.draggable = true;
        var srcImg = "/imatge?img=" + peces[i] + ".png";
        img.src = srcImg;
        img.className = "peca";
        img.ondragstart = function (e) {
            drag(e);
        };
        document.getElementById('domino').appendChild(img);
        console.log(peces[i]);
    }

    document.addEventListener("load", setInterval(function () {
        if (tornActual != id) {
            callbackAJAXcanviTorn('canviTorn=idJugador=' + id);
            document.getElementById("torn").innerHTML = "<p>Es el torn del jugador " + tornActual + ". Espera al teu torn.</p>";
        } else if (tornActual == id) {
            document.getElementById("torn").innerHTML = "<p>Es el teu torn, jugador " + tornActual + ".</p>";
        }
    }, 3000));
}

function cridaAJAXJugada(url) {
    let xhr = new XMLHttpRequest();
    if (!xhr) {
        alert('problemes amb XHR');
        return false;
    }
    xhr.onreadystatechange = callbackAJAXjugada;
    xhr.open('POST', url, true); // el 3r paràmetre indica que és asíncron
    xhr.send(null);
}

function callbackAJAXjugada(){
    if(xhr.readyState == 4){
        if(xhr.status === 200){
            data = JSON.parse(xhr.response);
            mostrarJugada();
        }else{
            console.log('Problemes amb l\'AJAX');
        }
    }
}

/*Mètode que mostra quan jugadors tiren una fitxa*/
function mostrarJugada(){
    document.getElementById("jugades").innerText = "";
    peca = dada.tirada;
    id = dada.id;
    movimentAcertat = dada.acertat;
    pecesJugades = dada.pecesJugades;
    tornActual = dada.torn;

    for(var i=0; i<pecesJugades.length; i++){
        var img = document.createElement('img');
        img.id = pecesJugades[i];
        img.height = 90;
        img.width = 45;
        img.draggable = false;
        var srcImg = "/imatge?img=" + pecesJugades[i] + ".png";
        img.src = srcImg;
        img.className = "peca";
        img.title = pecesJugades[i] + ": Jug" + id;
        document.getElementById('jugades').appendChild(img);
    }
}

/*Mètode que indica la zona on es dropejen les peces*/
function allowDrop(ev){
    if(tornActual == id){
        ev.preventDefault();
    }else{
        return false;
    }
}

/*Aquest mètode indica el que haurà de fer l'objecte quan s'arrossegui*/
function drag(ev){
    ev.dataTransfer.serData("peca", ev.target.id);
}

/*Aquest mètode indica que haurà de realitzar l'objecte quan es faci el drop*/
function drop(ev){
    ev.preventDefault();
    var data = ev.dataTransfer.getData("peca");
    document.getElementById(data).setAttribute("hidden",true);
    var div = document.getElementById("pecesEsquerra");
    pecaJugada = data;
    cridaAJAXJugada('pecaJugada?idJugador=' + id + '&peca=' + pecaJugada + '&costat=' + ev.target.id + '&torn=' + tornActual);
}

/*Crida per a comprovar de qui es el torn*/
function cridaAJAXCanviTorn(url){
    let xhr = new XMLHttpRequest();
    if(!xhr){
        alert('Problemes amb XHR');
        return false;
    }
    xhr.onreadystatechange = 
    xhr.open('POST',url,true);
    xhr.send(null);
}

/*Callback per a comprovar de qui es el torn*/
function callbackAJAXcanviTorn(){
    if(xhr.readyState == 4){
        if(xhr.status === 200){
            dada = JSON.parse(xhr.response);
            //canvi de torn
        }else{
            console.log('Problemes amb l\'AJAX');
        }
    }
}

/*Mètode per a comprovar de qui es el torn*/
function canviTorn(id,torn){
    tornActual = dada.torn;
    pecesJugades = dada.pecesJugades;
    document.getElementById('jugades').innerText="";
    for(var i=0; i < pecesJugades.length; i++){
        var img = document.createElement('img');
        img.id = pecesJugades[i];
        img.height = 90;
        img.width = 45;
        img.draggable = false;
        var srcImg = "/imatge?img=" + pecesJugades[i] + ".png";
        img.src = srcImg;
        img.className = "peca";
        img.title = pecesJugades[i] + ": Jug" + id;
        document.getElementById('jugades').appendChild(img);
    }
}