const socket = io("/");

socket.on("screen-data", imgData => {
    $("#screen").attr("src", "data:image/png;base64,"+ imgData)
})

const queryString = window.location.search
const urlParams = new URLSearchParams( queryString )
const room = urlParams.get("id")

if( !room ){
    window.location = "/view/?id="+prompt("enter room Id")
}

socket.emit("join", room )