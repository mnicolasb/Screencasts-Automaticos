'use strict'

const express = require('express')
const app = express()
const recordScreen = require('record-screen')

var estaIniciada = 'no'
var grabandoPantalla = 'no'
var grabandoWebcam = 'no'
/*-----------------------------------
Variables Gloables
$estadoDeClase = 0 no iniciada,
				   1 iniciada,
				   2 en pausa

$rutagrabación = “”
$contadorVideo = 0
-----------------------------------*/
var rutaGrabacion = "/Grabaciones/";
let fecha = "";
let contadorVideo = 0;
var rutaFinal = "final";
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

app.get('/llamada/estadoGrabacion=:grabacion&estadoProfesor=:profesor',  (req, res) => {
        //El sensor dice que esta de pie y se graba la webcam
      if(req.params.profesor == '1'){
          //Controlar si esta iniciada la clase
          if((estaIniciada == 'no') || (grabandoPantalla == 'si')){
            //Terminar si esta iniciada la grabacion de webcam
            if(grabandoPantalla == 'si'){
              //Terminar grabación de la webcam, si grabacion=1 y profesor=1
              //http://localhost:3000/llamada/estadoGrabacion=1&estadoProfesor=1
              recordingScreen.stop()
              grabandoPantalla == 'no'
            }
          //Empieza a grabar la pantalla de la webcam, si grabacion=0 y profesor=1
          //http://localhost:3000/llamada/estadoGrabacion=0&estadoProfesor=0
          if(req.params.grabacion == '0'){
            //BANDERA!!! Esta iniciada la grabacion
            grabandoWebcam = "si"
            estaIniciada = "si"
            const recordingWebcam = recordScreen('./Grabaciones/pruebaWebcam.mkv', {
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
              })
          }else if(req.params.grabacion == '1'){
            if(grabandoWebcam == 'no'){
              //fecha = new Date();
              fecha = Date.parse(fecha);
              contadorVideo = contadorVideo + 1;
              rutaGrabacion = rutaGrabacion+fecha+"video"+contadorVideo;
              //rutaFinal = rutaGrabacion.concat(fecha,"/video",contadorVideo);
              res.send({message:`${rutaGrabacion}`});
              //res.send({message: '$pruebaFinal ERROR: No se puede finalizar porque la clase no esta iniciada!!!'});
            }else if(grabandoWebcam == 'si'){
              //Terminar grabación de la webcam, si grabacion=1 y profesor=1
              //http://localhost:3000/llamada/estadoGrabacion=1&estadoProfesor=1
              recordingWebcam.stop()
              //BANDERA!!! Se va a finalizar la grabacion iniciada
              estaIniciada = 'no'
              grabandoWebcam = 'no'
              grabandoPantalla = 'no'
            }
          }
        }else if(estaIniciada == 'si' && grabandoWebcam == 'si'){
          if(req.params.grabacion == '0' ){
            res.send({message: 'ERROR: La clase ya iniciada y grabando de webcam!!!'})
          }else if(req.params.grabacion == '1'){
            //Terminar grabación de la webcam, si grabacion=1 y profesor=1
            //http://localhost:3000/llamada/estadoGrabacion=1&estadoProfesor=1
            recordingWebcam.stop()
            //BANDERA!!! Se va a finalizar la grabacion iniciada
            estaIniciada = 'no'
            grabandoPantalla = 'no'
            grabandoWebcam = 'no'
          }
        }
        //Pruebaa
      }else if(req.params.profesor == '0'){
          //Controlar si esta iniciada la clase
          if((estaIniciada == 'no') || (grabandoWebcam == 'si')){
            //Terminar si esta iniciada la grabacion de webcam
            if(grabandoWebcam == 'si'){
              //Terminar grabación de la webcam, si grabacion=1 y profesor=1
              //http://localhost:3000/llamada/estadoGrabacion=1&estadoProfesor=1
              recordingWebcam.stop()
              grabandoWebcam == 'no'
            }
          //Empieza a grabar la pantalla de la webcam, si grabacion=0 y profesor=1
          //http://localhost:3000/llamada/estadoGrabacion=0&estadoProfesor=0
          if(req.params.grabacion == '0'){
            //BANDERA!!! Esta iniciada la grabacion
            grabandoPantalla = "si"
            estaIniciada = "si"
            const recordingPantalla2 = recordScreen('/Users/manuelnb/Desktop/pruebaPantalla2.mkv', {
              inputFormat: 'avfoundation',
              pantalla: '1:0',
              fps: 15,
              resolution: '1920x1080'
            })

            recordingPantalla2.promise
              .then(result => {
                // Screen recording is done
                process.stdout.write(result.stdout)
                process.stderr.write(result.stderr)
              })
              .catch(error => {
                // Screen recording has failed
                console.error(error)
              })
          }else if(req.params.grabacion == '1'){
            if(grabandoPantalla == 'no'){
              res.send({message: 'ERROR: No se puede finalizar, porque la clase no esta iniciada!!!'})
            }else if(grabandoPantalla == 'si'){
              //Terminar grabación de la webcam, si grabacion=1 y profesor=1
              //http://localhost:3000/llamada/estadoGrabacion=1&estadoProfesor=1
              recordingPantalla2.stop()
              //BANDERA!!! Se va a finalizar la grabacion iniciada
              estaIniciada = 'no'
              grabandoWebcam = 'no'
              grabandoPantalla = 'no'
            }
          }
        }else if(estaIniciada == 'si' && grabandoPantalla == 'si'){
          if(req.params.grabacion == '0' ){
            res.send({message: 'ERROR: La clase ya iniciada y grabando de pantalla!!!'})
          }else if(req.params.grabacion == '1'){
            //Terminar grabación de la webcam, si grabacion=1 y profesor=1
            //http://localhost:3000/llamada/estadoGrabacion=1&estadoProfesor=1
            recordingPantalla2.stop()
            //BANDERA!!! Se va a finalizar la grabacion iniciada
            estaIniciada = 'no'
            grabandoPantalla = 'no'
            grabandoWebcam = 'no'
          }
        }
      }
    })



//Escucha del puerto 3000
app.listen(3000, () =>{
  console.log('API REST corriendo en http://localhost:3000');
})
