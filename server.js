
// server.js
var express        = require('express');
var app            = express();
var httpServer = require("http").createServer(app);
var five = require("johnny-five");
var io=require('socket.io')(httpServer);

var port = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
       res.sendFile(__dirname + '/public/index.html');
});

httpServer.listen(port);
console.log('Server available at http://localhost:' + port);
var banda;
var tortillera;
var dosificador;
var empalmadora;
var sensor;
var pies = 0;
var working = false;

var beforeDosificador = 1400;
var onDosificador = 3000;
var beforeEmpalmadora = 5800;
var onEmpalmadora = 1000;
var beforeFinish = 500;
var onFinish = 4000;

var validOff = function(){
  if(!pies && !working){
    setTimeout(function(){
      tortillera.off();
      banda.off();
      console.log('Terminado');
    },onFinish);
  }
}

var validOn = function(){
  if(!working && !pies){
    tortillera.on();
    banda.on();
  }
}

//Arduino board connection
var board = new five.Board();
board.on("ready", function() {
   console.log('Arduino connected');
   tortillera = new five.Led(22);
   banda = new five.Led(24);
   dosificador = new five.Led(26);
   empalmadora = new five.Led(28);
   sensor = new five.Sensor({
     pin: "A15",
     freq: 100
   });

   sensor.on("change", function() {
     if(pies && this.value < 500 && !working){
        console.log("Iniciando proceso...");
        working = true;
        tortillera.off();
        setTimeout(function(){
           console.log('Dosificando...');
           banda.off();
           dosificador.on();
           setTimeout(function(){
             console.log('Avanznado...');
             dosificador.off();
             banda.on();
             setTimeout(function(){
               console.log('Empalmando...');
               banda.off();
               empalmadora.on();
               setTimeout(function(){
                 console.log('Terminando...');
                 empalmadora.off();
                 setTimeout(function(){
                   banda.on();
                   tortillera.on();
                   pies = pies - 1;
                   console.log('Restantes: ',pies);
                   io.sockets.emit('broadcast', {
                      quantity: pies
                    });
                   working = false;
                   validOff();
                 }, beforeFinish);
               }, onEmpalmadora);
             }, beforeEmpalmadora);
           }, onDosificador);
        }, beforeDosificador);
     }
   });
});



//Socket connection handler
io.on('connection', function (socket) {
   console.log(socket.id);

   socket.on('led:on', function (data) {
     console.log('Producir: ',data);
     validOn();
     console.log(pies);
     console.log(data);
     pies = pies-(-data);
   });

   socket.on('led:off', function (data) {
     pies = 0;
     tortillera.off();
     banda.off();
     empalmadora.off();
     dosificador.off();
   });
});

console.log('Waiting for connection');
