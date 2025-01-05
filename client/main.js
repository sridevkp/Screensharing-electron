const { app, BrowserWindow, desktopCapturer, ipcMain, screen  } = require('electron');
// const screenshot = require("screenshot-desktop");
const { v4: uuidv4 } = require('uuid');

const createWindow = () => {
    const win = new BrowserWindow({
      width: 550,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation : false
    }
    });
    // win.webContents.openDevTools()
    win.removeMenu();
    win.loadFile('index.html');
  }

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})

ipcMain.handle("start:share", async function(event, arg) {
  const uuid = uuidv4().split("-")[0];
  console.log(`sharing in room ${uuid}`);
  const src = await getPrimaryDisplaySource();
  const srcId = src.id;
  return { uuid, srcId }
})

async function captureScreen() {
  const screenSource = await getPrimaryDisplaySource();
  const screenshot = screenSource.thumbnail.toDataURL();
  return screenshot;
}

async function getPrimaryDisplaySource(){
  // const displays = screen.getAllDisplays();
  // const primaryDisplay = displays[0];
  // const { width, height } = primaryDisplay.size;

  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  // const screenSource = sources.find((source) => source.name === primaryDisplay.name);
  return sources[0];
}
