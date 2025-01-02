const { app, BrowserWindow, desktopCapturer, ipcMain  } = require('electron')
const io = require("socket.io-client")
const screenshot = require("screenshot-desktop")
const { v4: uuidv4 } = require('uuid')

const URL = "https://screensharing-electron.onrender.com"
const socket = io(URL)
var interval

const FPS = 10

const createWindow = () => {
    const win = new BrowserWindow({
      width: 550,
      height: 350,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation : false
    }
    })
    // win.webContents.openDevTools()
    win.removeMenu()
    win.loadFile('index.html')
  }

  app.whenReady().then(() => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if( interval ) clearInterval(interval);
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.on("start-share", function(event, arg) {
  const room = uuidv4().split("-")[0];
  socket.emit("join", room);
  event.reply("started-sharing", room);
  console.log(`sharing in room ${room}`)

  interval = setInterval( () => {
    screenshot().then( imgBuffer => {

      const img = Buffer.from(imgBuffer).toString('base64')

      socket.emit("screen-data", img, room )

    }, 1000/FPS).catch( err => {
      console.log(err)
    })
    
  })
})

ipcMain.on("stop-share", function(event, arg) {
  console.log('sharing stopped')
  clearInterval(interval);
  event.reply("stopped-sharing");
})