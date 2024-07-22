const express = require("express")
const path = require("path")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)
require("dotenv").config()

const PORT = process.env.PORT

app.use( express.static(path.join( __dirname, "public")) )

app.get("/", ( req, res ) => { res.redirect("/view")})

app.get("/view", ( req, res ) => {
    res.sendFile(__dirname+"/view.html")
})

io.on( "connection",  socket => {
    socket.on("join", room => {
        console.log( room )
        socket.join( room )
    })
    socket.on("screen-data", ( imgData, room ) => {
        socket.to( room ).emit( "screen-data", imgData )
    })
})

server.listen( PORT, () => {
    console.log("app listening on port "+PORT)
})