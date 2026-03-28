import {app, BrowserWindow, ipcMain, dialog} from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';

import { Dealer } from 'zeromq';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const INFERENCE_PORT = 5555;
let inferenceProcess = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// Handle IPC request to select images
ipcMain.on("chooseFile", (event, arg) => {
  const result = dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", 'tiff'] }]
  });

  result.then(({canceled, filePaths, bookmarks}) => {
    const base64 = fs.readFileSync(filePaths[0]).toString('base64');
    event.reply("chosenFile", base64);
  });
});

/**
 * Opens a dialog to make the user select a directory
 * If operation is 'export', then 
 */
ipcMain.on("chooseFolder", async (event) => {

  const result = dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  result.then(({canceled, filePaths, bookmarks}) => {
    console.log(canceled, filePaths, bookmarks);

    if (!canceled) {
      const selectedDirectory = filePaths[0];
      // insert logic to pass directory to python via zmq

      event.reply("chosenFolder", selectedDirectory);
    }
  })
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle("zmq:runClient", runClient);
  ipcMain.handle("zmq:runServer", runServer);
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
