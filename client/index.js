const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery'); 

const btn = document.getElementById("start-stop");


const FPS = 10;

const HOST = "http://localhost:3000";
// const URL = "https://screensharing-electron.onrender.com";
const socket = io(HOST); 

let mediaStream;
let mediaRecorder;

$("#start-stop").on("click", function(){
    const $this = $(this);

    if( $this.hasClass("btn-primary") ){
        startShare();
    }else{
        stopShare();
    }
});

$("#copy-link").on("click", function(){
    const link = $("#room-id").text();
    navigator.clipboard.writeText( link );
});

async function startShare(){
    const response = await ipcRenderer.invoke("start:share");
    console.log(response);
    socket.emit("join", response.uuid);

    const link = new URL(HOST);
    link.pathname = "view"
    link.searchParams.append("id", response.uuid)

    $("#room-id").text(link);
    $("#start-stop")
        .removeClass("btn-primary")
        .addClass("btn-danger")
        .text("Stop");

    $("#copy-link").removeAttr("disabled");

    startVideoCapture(response.srcId, response.uuid)
}

async function stopShare(){
    console.log("Stopped sharing");
    $("#start-stop")
        .removeClass("btn-danger")
        .addClass("btn-primary")
        .text("Start");

    $("#copy-link").attr("disabled", true);
    if (mediaRecorder) mediaRecorder.stop();
}

async function startVideoCapture( srcId, uuid ) {
    try{
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: srcId,
              },
            },
          });
              
        mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 2500000, // 2.5 Mbps
            audioBitsPerSecond: 0, // No audio needed for screen sharing
        });
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                socket.emit('video:chunk', event.data, uuid);
            }
        };
      
        mediaRecorder.start(1000/FPS);  
      
        mediaRecorder.onstop = () => {
            mediaStream.getTracks().forEach(track => track.stop());
        };
    }catch(e){
      console.log(e);
      stopShare();
    }
  }

