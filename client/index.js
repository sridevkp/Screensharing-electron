const ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery'); 

const btn = document.getElementById("start-stop")

const states = { START:"start", STOP:"stop"}
var state = states.STOP
const URL = "https://screensharing-electron.onrender.com"


ipcRenderer.on("started-sharing", (event, uuid) => {
    const link = `${URL}/view/?id=${id}`
    $("#room-id").text(link)

    $("#start-stop")
        .removeClass("btn-danger")
        .addClass("btn-primary")
        .text("Start")

    $("#live-label").show()
})

ipcRenderer.on("stopped-sharing", event => {
    $this
        .removeClass("btn-danger")
        .addClass("btn-primary")
        .text("Start")

    $("#live-label").hide()
})

$("#start-stop").on("click", function(){
    const $this = $(this);

    if( $this.hasClass("btn-primary") ){
        ipcRenderer.send("start-share")
        // $this
        //     .removeClass("btn-primary")
        //     .addClass("btn-danger")
        //     .text("Stop")
    }else{
        ipcRenderer.send("stop-share")
        // $this
        //     .removeClass("btn-danger")
        //     .addClass("btn-primary")
        //     .text("Start")
    }
});


$("#copy-link").on("click", function(){
    const id = $("#room-id").text()
    navigator.clipboard.writeText( URL +"/view/?id=" +id)
})
