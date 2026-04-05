var server = require("./indexDomino");
var encaminador = require("./encaminador");
var manegadorPeticions = require("./manegador");

var manegador = {};
manegador["/"] = manegadorPeticions.inici;
manegador["/registre"] = manegadorPeticions.registre;
manegador["/login"] = manegadorPeticions.login;
manegador["/partida"] = manegadorPeticions.partida;
manegador["/js/main.js"] = manegadorPeticions.main;
manegador["/js/partida.js"] = manegadorPeticions.partidaJS;
manegador["/styles.css"] = manegadorPeticions.styles;
manegador["/desar"] = manegadorPeticions.desar;
manegador["/consultar"] = manegadorPeticions.consultar;
manegador["/autenticar"] = manegadorPeticions.autenticar;
manegador["/index"] = manegadorPeticions.index;
manegador["/canviTorn"] = manegadorPeticions.canviTorn;
manegador["/pecaJugada"] = manegadorPeticions.pecaJugada;
manegador["/comencar"] = manegadorPeticions.comencar;
manegador["/imatges"] = manegadorPeticions.imatges;
manegador["/favicon.ico"] = manegadorPeticions.favicon;
manegador["/puntuar"] = manegadorPeticions.puntuar;
manegador["/puntuat"] = manegadorPeticions.puntuat;
manegador["/puntuacio"] = manegadorPeticions.puntuacio;

server.iniciar(encaminador.encaminar,manegador);