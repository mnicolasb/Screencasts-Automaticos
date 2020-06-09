'use strict'

const express = require('express')
const app = express()
const recordScreen = require('record-screen')
var fs = require('fs');
const path = require('path');
var cp = require('child_process');
var cp1 = require('child_process');
var cmdKill = 'pkill ffmpeg';//killall -m
var cmdPantalla = "";//'ffmpeg -f avfoundation -video_size 1920x1080 -i "1:0" -r 15';
var cmdWebcam = "";//'ffmpeg -f avfoundation -i "FaceTime HD Camera:0" -r 30';
var childKill = cp;//cp.exec(cmd, function(err, stdout, stderr) {});
var childStart = cp1;//cp.exec(cmd, function(err, stdout, stderr) {});
let recordingPantalla = '';
let recordingWebcam = '';

/*-----------------------------------
Variables Gloables
$estadoDeClase = 0 no iniciada,
				         1 iniciada,
				         2 en pausa

$estadoDeProfesor = 0 sentado() --> Grabar pantalla ,
           			    1 de pie    --> Grabar webcam

$rutaCarpeta = “”
$rutaGrabacion = “”
$contadorVideo = 0
-----------------------------------*/
let estadoDeClase = 0;
let estadoDeProfesor = 0;
var rutaGrabacion = "/api-rest/servidor";
var fecha = "";
let contadorVideo = 0;
var rutaCarpeta = "";
var rutaFinal = "";
/*
url:
http://localhost:3000/llamada/estadoGrabacion='X'&estadoProfesor='X'

Valores:
estadoGrabacion    =  0 Inicada - 1 terminada o no iniciada
estadoProfesor     =  0 Sentado - 1 De pie

Controlar las condiciones con la bandera
var estaIniciada = no --> No esta estaIniciada
var estaIniciada = si --> Si esta estaIniciada
-------------------------------------------------
var grabandoPantalla = no --> No esta grabando pantalla
var grabandoPantalla = si --> Si esta grabando pantalla
-------------------------------------------------
var grabandoWebcam = no --> No esta grabando webcam
var grabandoWebcam = si --> Si esta grabando webcam
*/
const mustache = require('mustache');
const livereload = require('livereload');
const livereloadMiddleware = require('connect-livereload');
app.use('/images', express.static(__dirname +'/images'));

// Create a livereload server
const hotServer = livereload.createServer({
  // Reload on changes to these file extensions.
  exts: [ 'json', 'mustache' ],
  // Print debug info
  debug: true
});

// Specify the folder to watch for file-changes.
hotServer.watch(__dirname);

// Inject the livereload script tag into pages.
app.use(livereloadMiddleware());
var state = [];
const tpl = fs.readFileSync('./hello.mustache', 'utf8');
const data = JSON.parse(fs.readFileSync('./hello.json'));
// Handle GET requests to `/hello`.
app.get('/', (req, res) => {
  // Read the template and JSON data from the local filesystem.

  const tpl = fs.readFileSync('./hello.mustache', 'utf8');
  const data = JSON.parse(fs.readFileSync('./hello.json'));

  if (estadoDeClase == 0){
    data.estClase = " NO INICIADA";
    res.send(mustache.render(tpl, data));
    //state.push({estClase:data.estClase, val:"Estoy sentado"});
    //document.getElementById("estadoDeLaClase").innerHTML = "El estado de la grabación es: NO INICIADA";
  }else if(estadoDeClase == 1){
    data.estClase = " INICIADA";
    res.send(mustache.render(tpl, data));
  }else if(estadoDeClase == 2){
    data.estClase = " PAUSADA";
    res.send(mustache.render(tpl, data));
  }

});

// INICIAR GRABACION
app.get('/play/estadoClase=:clase&estadoProfesor=:profesor',  (req, res) => {
  //El sensor dice que esta de pie y se graba la webcam
  cmdPantalla = 'ffmpeg -y -video_size 1920x1080 -f avfoundation -framerate 10 -i "1:0" -pix_fmt yuv420p ';
  cmdWebcam = 'ffmpeg -f avfoundation -framerate 30 -i "FaceTime HD Camera:0" ';

  if(estadoDeClase == 0){
    //estClase.innerHTML = "El estado de la grabación es: INICIADA";
    fecha = undefined;
    fecha = new Date();
    fecha = Date.parse(fecha);
    rutaFinal = "";
    rutaCarpeta = "";
    rutaCarpeta =  "Grabacion-" + fecha;
    if(req.params.clase == '0' && req.params.profesor == '0'){
      //BANDERA!!! Esta iniciada la grabacion
      if (!fs.existsSync(rutaGrabacion)){
        fs.mkdirSync(rutaCarpeta, { recursive: true });
      }
      estadoDeClase = 1;
      estadoDeProfesor = 0;
      rutaFinal =  rutaCarpeta + "/video" + contadorVideo +".mkv";
      cmdPantalla = cmdPantalla + rutaFinal;
      childStart.exec(cmdPantalla, function(err, stdout, stderr) {});
      res.send({message:`El estado de la clase es:${estadoDeClase} y num_video: ${contadorVideo}`});
    }else if(req.params.clase == '0' && req.params.profesor == '1'){
      //BANDERA!!! Esta iniciada la grabacion
      if (!fs.existsSync(rutaGrabacion)){
        fs.mkdirSync(rutaCarpeta, { recursive: true });
      }
      estadoDeClase = 1;
      estadoDeProfesor = 1;
      rutaFinal =  rutaCarpeta + "/video" + contadorVideo +".mkv";
      cmdWebcam = cmdWebcam + rutaFinal;
      childStart.exec(cmdWebcam, function(err, stdout, stderr) {});
      /*recordingWebcam = recordScreen(rutaFinal, {
        inputFormat: 'avfoundation', //MacOS
        fps: 30,
        pantalla: 'FaceTime HD Camera:0'
      })

      recordingWebcam.promise
        .then(result => {
          // Screen recording is done
          process.stdout.write(result.stdout)
          process.stderr.write(result.stderr)
        })
        .catch(error => {
          // Screen recording has failed
          console.error(error)
        })*/
      res.send({message:`El estado de la clase es:${estadoDeClase} y num_video: ${contadorVideo}`});
    }

  }else if(estadoDeClase != 0){
    res.send({message: 'ERROR: No se puede iniciar porque la clase ya esta iniciada!!!'})
    console.log('¡¡Ya esta iniciada la clase!!');
  }
})

// PAUSAR O REANUDAR GRABACION
app.get('/pause/estadoProfesor=:profesor',  (req, res) => {
  //El sensor dice que esta de pie y se graba la webcam
  cmdPantalla = 'ffmpeg -y -video_size 1920x1080 -f avfoundation -framerate 15 -i "1:0" -pix_fmt yuv420p ';
  cmdWebcam = 'ffmpeg -f avfoundation -framerate 30 -i "FaceTime HD Camera:0" ';
  if(estadoDeClase == 0){
    res.send({message: 'ERROR: La clase no esta iniciada!!!'})
    console.log('¡¡ERROR: La clase no esta iniciada!!');
  }else if(estadoDeClase != 0){
    if(estadoDeClase ==1){
        //BANDERA!!! Esta iniciada y se va a pausar la grabacion
        estadoDeClase = 2;
        childKill.exec(cmdKill, function(err, stdout, stderr) {});
        res.send({message:`El estado de la clase es:${estadoDeClase} y num_video: ${contadorVideo}`});
    }else if(estadoDeClase == 2){
      if(req.params.profesor == '0'){
        //BANDERA!!! Esta pausada y se va a reanudar la grabacion
        estadoDeClase = 1;
        estadoDeProfesor = 0;
        contadorVideo =  contadorVideo + 1;
        rutaFinal =  rutaCarpeta + "/video" + contadorVideo +".mkv";
        cmdPantalla = cmdPantalla + rutaFinal;
        childStart.exec(cmdPantalla, function(err, stdout, stderr) {});
        res.send(cmdPantalla)
        console.log(cmdPantalla);

        /*recordingPantalla = recordScreen(rutaFinal, {
          inputFormat: 'avfoundation',
          pantalla: '1:0',
          fps: 15,
          resolution: '1920x1080'
        })

        recordingPantalla.promise
          .then(result => {
            // Screen recording is done
            process.stdout.write(result.stdout)
            process.stderr.write(result.stderr)
          })
          .catch(error => {
            // Screen recording has failed
            console.error(error)
          })*/
        res.send({message:`El estado de la clase es:${estadoDeClase} y num_video: ${contadorVideo}`});
      }else if(req.params.profesor == '1'){
        //BANDERA!!! Esta pausada y se va a reanudar la grabacion
        estadoDeClase = 1;
        estadoDeProfesor = 1;
        contadorVideo =  contadorVideo + 1;
        rutaFinal =  rutaCarpeta + "/video" + contadorVideo +".mkv";
        cmdWebcam = cmdWebcam + rutaFinal;
        childStart.exec(cmdWebcam, function(err, stdout, stderr) {});
        res.send(cmdWebcam)
        console.log(cmdWebcam);
        /*recordingWebcam = recordScreen(rutaFinal, {
          inputFormat: 'avfoundation', //MacOS
          fps: 30,
          pantalla: 'FaceTime HD Camera:0'
        })

        recordingWebcam.promise
          .then(result => {
            // Screen recording is done
            process.stdout.write(result.stdout)
            process.stderr.write(result.stderr)
          })
          .catch(error => {
            // Screen recording has failed
            console.error(error)
          })*/
        res.send({message:`El estado de la clase es:${estadoDeClase} y num_video: ${contadorVideo}`});
      }
    }
  }
  cmdPantalla = "";
  cmdWebcam = "";
})

// TERMINAR GRABACION
app.get('/stop',  (req, res) => {
  //El sensor dice que esta de pie y se graba la webcam
  if(estadoDeClase == 0){
    res.send({message: 'ERROR: La clase no esta iniciada!!!'})
    console.log('¡¡NO ESTA INICIADA LA CLASE!!');
  }else if(estadoDeClase != 0){
      fecha = undefined;
      //BANDERA!!! Esta iniciada la grabacion
      estadoDeClase = 0;
      childKill.exec(cmdKill, function(err, stdout, stderr) {});
      res.send({message:`El estado de la clase es:${estadoDeClase}`});
      contadorVideo = 0;
  }
  cmdPantalla = "";
  cmdWebcam = "";
})

// CAMBIAR ESTADO DEL SENSOR
app.get('/change/estadoProfesor=:profesor',  (req, res) => {
  //El sensor dice que esta de pie y se graba la webcam
  cmdPantalla = 'ffmpeg -y -video_size 1920x1080 -f avfoundation -framerate 15 -i "1:0" -pix_fmt yuv420p ';
  cmdWebcam = 'ffmpeg -f avfoundation -framerate 30 -i "FaceTime HD Camera:0" ';
  if(estadoDeClase == 0){
    res.send({message: 'ERROR: No iniciada la clase, no se esta haciendo nada!!!'})
    console.log('¡¡NO SE ESTA HACIENDO NADA!!');
  }else if(estadoDeClase == 1){
    if(estadoDeProfesor == req.params.profesor){
      //BANDERA!!! Esta iniciada la grabacion
      res.send({message:'NO ESTA CAMBIANDO EL SENSOR'});
      console.log('¡¡NO ESTA CAMBIANDO EL SENSOR!!');
    }else if(estadoDeProfesor != req.params.profesor){
      if(req.params.profesor == 0){

          childKill.exec(cmdKill, function(err, stdout, stderr) {});
          estadoDeProfesor = 0;
          contadorVideo =  contadorVideo + 1;
          rutaFinal =  rutaCarpeta + "/video" + contadorVideo +".mkv";
          cmdPantalla = cmdPantalla + rutaFinal;
          setTimeout(() => childStart.exec(cmdPantalla, function(err, stdout, stderr) {}), 1000);
          //childStart.exec(cmdPantalla, function(err, stdout, stderr) {});
          res.send(cmdPantalla)
          console.log(cmdPantalla);

        /*recordingPantalla = recordScreen(rutaFinal, {
          inputFormat: 'avfoundation',
          pantalla: '1:0',
          fps: 15,
          resolution: '1920x1080'
        })
        /Users/manuelnb/api-rest

        recordingPantalla.promise
          .then(result => {
            // Screen recording is done
            process.stdout.write(result.stdout)
            process.stderr.write(result.stderr)
          })
          .catch(error => {
            // Screen recording has failed
            console.error(error)
          })*/
        res.send({message:`Se esta grabando la pantalla y el numero del video:${contadorVideo}`});
        console.log('¡¡Se esta parando la grabacion de WEBCAM y grabando LA PANTALLA!!');
      }else if(req.params.profesor == 1){

          childKill.exec(cmdKill, function(err, stdout, stderr) {});
          estadoDeProfesor = 1;
          contadorVideo =  contadorVideo + 1;
          rutaFinal =  rutaCarpeta + "/video" + contadorVideo +".mkv";
          cmdWebcam = cmdWebcam + rutaFinal;
          setTimeout(() => childStart.exec(cmdWebcam, function(err, stdout, stderr) {}), 1000);
          //childStart.exec(cmdWebcam, function(err, stdout, stderr) {});
          res.send(cmdWebcam)
          console.log(cmdWebcam);

        /*recordingWebcam = recordScreen(rutaFinal, {
          inputFormat: 'avfoundation', //MacOS
          fps: 30,
          pantalla: 'FaceTime HD Camera:0'
        })

        recordingWebcam.promise
          .then(result => {
            // Screen recording is done
            process.stdout.write(result.stdout)
            process.stderr.write(result.stderr)
          })
          .catch(error => {
            // Screen recording has failed
            console.error(error)
          })*/
        res.send({message:`Se esta grabando la webcam y el numero del video:${contadorVideo}`});
        console.log('¡¡Se esta parando la grabacion de PANTALLA y grabando la WEBCAM!!');
      }
    }
  }
  cmdPantalla = "";
  cmdWebcam = "";
})

//Escucha del puerto 3000
app.listen(3000, () =>{
  console.log('Servidor corriendo en http://localhost:3000');
})
