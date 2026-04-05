var http = require("http");
var url = require("url");
var querystring = require("querystring");
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Jugadors = [];
var jug1 = [];
var jug2 = [];
var pecesJugades = [];
var torn;
var contingut;

class Jugador {
    constructor(nom,password){
        this.nom = nom;
        this.password = password;
    }
}

class Partida {
    constructor(codiP){
        this.codiP = codiP;
    }
}

/*Es crea una variable la qual conté els strings de les peces*/
var peces = ["0,0", "0,1", "0,2", "0,3", "0,4", "0,5", "0,6", "1,1", "1,2", "1,3", "1,4", "1,5", "1,6", "2,2", "2,3", "2,4", "2,5", "2,6", "3,3", "3,4", "3,5",
    "3,6", "4,4", "4,5", "4,6", "5,5", "5,6", "6,6"];
repartirPeces(peces); //Les peces s'insereixen en la funció repartirPeces

function iniciar(encaminar,manegadorPeticions){
    function onRequest(request,response){
        var sortida;
        var pathname = url.parse(request.url).pathname;
        var consulta = url.parse(request.url, true).query;
        var nom = consulta['caracter'];

        contingut = encaminar(manegadorPeticions, pathname);
        
        if(contingut == '/desar'){
            var ruta = 'mongodb://localhost:27017';

            MongoClient.connect(ruta, function (err, client) {
                assert.equal(null, err);
                console.log("Connexió correcta");
                var db = client.db('domino');
                db.collection('jugadors').insertOne({
                    "nom": consulta.nom,
                    "password": consulta.password,
                });
                assert.equal(err, null);
                console.log("Afegit document a col·lecció jugadors");
                response.write("Registre confirmat");
                response.end();
                client.close();
            });
            
        }else if (contingut == '/consultar') {
            var ruta = 'mongodb://localhost:27017';
            MongoClient.connect(ruta, function (err, client) {
                assert.equal(null, err);
                console.log("Connexió correcta");
                var db = client.db('domino');
                response.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                console.log("consulta document a col·lecció usuaris");
              
                var cursor = db.collection('jugadors').find({});
                cursor.each(function (err, doc) {
                    assert.equal(err, null);
                    if (doc != null) {
                        response.write(doc.nom + ' ' + doc.password + '<br>');
                    }
                    else {
                        response.end();
                        client.close();
                    }
                });
            });

        }else if(contingut == '/autenticar'){
            var ruta = 'mongodb://localhost:27017';
            MongoClient.connect(ruta, function (err, client) {
                assert.equal(null, err);
                console.log("Connexió correcta");
                var db = client.db('domino');
                var trobat = false;
                response.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                console.log("consulta document a col·lecció usuaris");

                var cursor = db.collection('jugadors').find({});
                cursor.each(function (err, doc) {
                    assert.equal(err, null);
                    if (doc != null) {
                        if (doc.nom == consulta.nom && doc.password == consulta.password) {
                            trobat = true;
                            response.write('Hola ' + doc.nom);
                            response.write('<form action="/partida" method="post">');
                            response.write('<input type="submit" value="Iniciar partida" />');
                            response.write('</form>');
                            response.write('<form action="/" method="post">');
                            response.write('<input type="submit" value="Logout" />');
                            response.write('</form>');
                        }
                    }else {
                        if (trobat == false) {
                            response.write('Usuari no trobat');
                            response.write('<form action="/login" method="post">');
                            response.write('<input type="submit" value="Tornar enrrere" />');
                            response.write('</form>');
                        }
                        response.end();
                    }
                }); 
                client.close();
            });

        }else if (contingut == '/index') {
            response.writeHead(200, {
                "Content-Type": "application/json charset=utf-8"
            });
            var jugs = Jugadors.length;
            var id = consulta['idJugador'];
            if (id == 0 && jugs == 0){
                id = 1;
                Jugadors.push(1);
            }else if (id == 0 && jugs == 1){
                id = 2;
                Jugadors.push(2);
            }else{
                id;
            }
            console.log("El jugador " + id + " ha entrat a la partida. Número de jugadors a dins: " + Jugadors.length);

            var objecteInicial = {
                "id": id,
                "jugadors": Jugadors
            };
            response.write(JSON.stringify(objecteInicial));
            response.end();

        }else if (contingut == '/canviTorn'){
            response.writeHead(200, {
                "Content-Type": "text/xml; charset=utf-8"
            });
            var objecteCanvi = {
                "id": consulta['idJugador'],
                "torn": torn,
                "pecesJugades": pecesJugades
            };
            response.write(JSON.stringify(objecteCanvi));
            response.end();

        }else if (contingut == '/pecaJugada'){
            response.writeHead(200, {
                "Content-Type": "text/xml; charset=utf-8"
            });
            torn = consulta['torn'];
            if(consulta['costat'] == "dropDreta"){
                pecesJugades.push(consulta['peca']);
            }else if(consulta['costat'] == "dropEsquerra"){
                pecesJugades.unshift(consulta['peca']);
            }
            if(torn == 1){
                torn = 2;
            }else if(torn == 2){
                torn = 1;
            }
            var objecteLlencament = {
                "id": consulta['idJugador'],
                "tirada": consulta['peca'],
                "correcte": true,
                "torn": torn,
                "pecesJugades": pecesJugades
            };
            console.log(`El jugador ${consulta['idJugador']} ha llencat ${consulta['peca']}`);
            response.write(JSON.stringify(objecteLlencament));
            response.end();

        }else if (contingut == '/comencar'){
            response.writeHead(200, {
                "Content-Type": "application/json charset=utf-8"
            });
            console.log(`Jugador ${consulta['idJugador']}`);
            var objecteJoc = {
                "id": consulta['idJugador'],
                "torn": 1,
                "peces": [
                    "0,0", "0,1", "0,2", "0,3", "0,4", "0,5", "0,6",
                    "1,1", "1,2", "1,3", "1,4", "1,5", "1,6",
                    "2,2", "2,3", "2,4", "2,5", "2,6",
                    "3,3", "3,4", "3,5", "3,6",
                    "4,4", "4,5", "4,6",
                    "5,5", "5,6",
                    "6,6"
                ],
                "pecesJug1": jug1,
                "pecesJug2": jug2
            };
            response.write(JSON.stringify(objecteJoc));
            response.end();
        }else if (contingut == '/imatge'){
            response.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });
            fs.readFile('/imatges/' + consulta['img'], function(err,sortida){
                response.writeHead(200, {
                    'Content-Type': 'image/png'
                });
                response.write(sortida);
                response.end();
            });
        }else if (contingut == '/styles.css'){
            response.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });
            fs.readFile('./styles.css',function(err,sortida){
                response.writeHead(200, {
                    'Content-Type': 'text/css'
                });
                response.write(sortida);
                response.end();
            });
        }else if (contingut == 'favicon') {
            console.log("Hola");
        }else if (contingut == '/puntuat'){
            var ruta = 'mongodb://localhost:27017';

            MongoClient.connect(ruta, function (err, client) {
                assert.equal(null, err);
                console.log("Connexió correcta");
                var db = client.db('domino');
                db.collection('puntuacio').insertOne({
                    "nom": consulta.nom,
                    "resultat": consulta.resultat,
                });
                assert.equal(err,null);
                console.log("Document afegit a la col·lecció puntuacions");
                response.write("Resultat satisfactori");
                response.end();
                client.close();
            });
        }else if (contingut == '/puntuacio'){
            var ruta = 'mongodb://localhost:27017';
            MongoClient.connect(ruta, function (err, client) {
                assert.equal(null, err);
                console.log("Connexió correcta");
                var db = client.db('domino');
                response.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                console.log("Consulta document a col·lecció usuaris");

                var cursor = db.collection('puntacio').find({});
                cursor.each(function(err,doc){
                    assert.equal(err,null);
                    if(doc != null){
                        response.write(doc.nom + '' + doc.resultat + '<br>');
                    }else{
                        response.end();
                        client.close();
                    }
                });
            });
        }else{
            fs.readFile(contingut,function(err,sortida){
                response.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });
                response.write(sortida);
                response.end();
            });
        }
    }
    http.createServer(onRequest).listen(8887);
    console.log("Servidor iniciat. http://localhost:8887");
}

//Mètode per a fer el repartiment de peces
function repartirPeces(peces){
    var p = [];
    var p1 = [];
    var p2 = [];
    for(var i=0; i<peces.length;){
        nRandom = Math.floor(Math.random()*peces.length);
        var jaPosada = false;
        for (var j=0; j<p.length; j++){
            if (p[j] == nRandom){
                jaPosada = true;
                break;
            }else{
                jaPosada = false;
            }
        }
        p.push(nRandom);
        if (!jaPosada){
            if (i%2 == 1){
                p1.push(nRandom);
            }else if (i%2 == 0){
                p2.push(nRandom);
            }
            i++;
        }
    }
    retornarImgPeces(p1,p2);
}

//Mètode per a retornar la imatge de les peces correponents amb el seu valor
function retornarImgPeces(pecesJug1,pecesJug2){
    for (var i=0; i<7; i++){
        jug1[i] = peces[pecesJug1[i]];
    };
    for (var j=0; j<7; j++){
        jug2[j] = peces[pecesJug2[j]];
    }
}

exports.iniciar = iniciar;