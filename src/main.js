import {app, BrowserWindow, ipcMain, dialog} from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import started from 'electron-squirrel-startup';
import { spawn } from 'node:child_process';
import { Dealer } from 'zeromq';
import * as zmq from 'zeromq';

import InferenceResult from './parser/InferenceResult';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const INFERENCE_PORT = 5555;
let inferenceProcess = null;

function ensureModelsDir() {
  let modelsDir = path.join(app.getPath('userData'), 'models');
  fs.mkdirSync(modelsDir, { recursive: true });
  return modelsDir;
}

function spawnInferenceServer(modelsDir) {
  let appRoot = app.getAppPath();

  // 'python3' on macOS/Linux, 'python' on Windows
  let python = process.platform === 'win32' ? 'python' : 'python3';

  inferenceProcess = spawn(python, [
    '-m', 'src.inference.inference',
    '--models_dir', modelsDir,
    '--port', String(INFERENCE_PORT),
  ], {
    cwd: appRoot,  // project root on sys.path so 'src.inference...' imports resolve
    // stdin is kept open as a pipe — when Electron dies unexpectedly the OS
    // closes the write end, Python reads EOF in _heartbeat and self-terminates.
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  inferenceProcess.stdout.on('data', (data) => process.stdout.write(`[inference] ${data}`));
  inferenceProcess.stderr.on('data', (data) => process.stderr.write(`[inference] ${data}`));
  inferenceProcess.on('exit', (code, signal) => {
    console.log(`[inference] process exited (code=${code}, signal=${signal})`);
    inferenceProcess = null;
  });
}

async function testInference(folder) {
  const dealer = new Dealer();
  dealer.connect(`tcp://localhost:${INFERENCE_PORT}`);

  // Query available models
  await dealer.send(['', 'query_available_models', '']);
  const [, , modelsPayload] = await dealer.receive();
  const models = JSON.parse(modelsPayload.toString());
  console.log('[test] Available models:', models);

  // Select first available model of each type
  await dealer.send(['', 'htr_use', models.HTR[0]]);
  await dealer.send(['', 'line_seg_use', models.LineSegmentation[0]]);

  // Run inference on test assets
  const assetsDir = folder;
  const imgPaths = fs.readdirSync(assetsDir).map(f => path.join(assetsDir, f));
  await dealer.send(['', 'infer', JSON.stringify(imgPaths)]);
  const [, , resultPayload] = await dealer.receive();
  const results = JSON.parse(resultPayload.toString());
  console.log('[test] Inference results:', JSON.stringify(results, null, 2));

  for (const r of results) {
    let i = new InferenceResult(r);
    i.init(() => {
      console.log(i.allLines().join("\n"));
    });
  }

  dealer.close();
  return results;
}

function killInferenceServer() {
  if (inferenceProcess && !inferenceProcess.killed) {
    inferenceProcess.kill('SIGTERM');
    inferenceProcess = null;
  }
}

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
 */
ipcMain.on("chooseFolder", async (event) => {
  const result = dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  result.then(({canceled, filePaths, bookmarks}) => {
    if (!canceled) {
      const p = filePaths[0];
      const r = testInference(p);

      event.reply("chosenFolder", p);
    }
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const modelsDir = ensureModelsDir();
  spawnInferenceServer(modelsDir);
  // Give the Python process a moment to bind its ZMQ socket before connecting.
  // setTimeout(() => testInference().catch(console.error), 2000);
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Kill the inference server on graceful exit.
// For unexpected crashes the stdin pipe closure handles it (see _heartbeat in inference.py).
app.on('before-quit', killInferenceServer);

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
