import {app, BrowserWindow, ipcMain, dialog} from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import started from 'electron-squirrel-startup';
import { spawn } from 'node:child_process';
import { Dealer } from 'zeromq';

import InferenceResult from './parser/InferenceResult';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const INFERENCE_PORT = 5555;
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.tiff']);

let inferenceProcess = null;
let selectedImagePaths = []; // populated by chooseFile / chooseFolder
let selectedHtrModel = null;
let selectedLineSegModel = null;
let modelsDir = null;

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
    cwd: appRoot,
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

function killInferenceServer() {
  if (inferenceProcess && !inferenceProcess.killed) {
    inferenceProcess.kill('SIGTERM');
    inferenceProcess = null;
  }
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // mainWindow.webContents.openDevTools();
};

// Handle IPC request to select a single image file
ipcMain.on('chooseFile', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'tiff'] }],
  }).then(({ canceled, filePaths }) => {
    if (canceled) return;
    selectedImagePaths = filePaths;
    const base64 = fs.readFileSync(filePaths[0]).toString('base64');
    event.reply('chosenFile', { base64, path: filePaths[0] });
  });
});

// Handle IPC request to select a folder of images
ipcMain.on('chooseFolder', (event) => {
  dialog.showOpenDialog({
    properties: ['openDirectory'],
  }).then(({ canceled, filePaths }) => {
    if (canceled) return;

    const folderPath = filePaths[0];
    selectedImagePaths = fs.readdirSync(folderPath)
      .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .map(f => path.join(folderPath, f));

    const items = selectedImagePaths.map(p => ({
      base64: fs.readFileSync(p).toString('base64'),
      path: p,
      filename: path.basename(p),
    }));

    event.reply('chosenFolder', items);
  });
});

// Handle IPC request to fetch available models from the inference server
ipcMain.on('getAvailableModels', async (event) => {
  const dealer = new Dealer();
  dealer.connect(`tcp://localhost:${INFERENCE_PORT}`);
  try {
    await dealer.send(['', 'query_available_models', '']);
    const [, , modelsPayload] = await dealer.receive();
    event.reply('availableModels', JSON.parse(modelsPayload.toString()));
  } catch (err) {
    console.error('[inference] getAvailableModels failed:', err);
    event.reply('availableModels', { HTR: [], LineSegmentation: [] });
  } finally {
    dealer.close();
  }
});

// Handle IPC request to store the user's model selection
ipcMain.on('saveModelSelection', (_event, { htr, lineSeg }) => {
  selectedHtrModel = htr;
  selectedLineSegModel = lineSeg;
});

// Handle IPC request to run inference on the current selection
ipcMain.on('runInference', async (event) => {
  if (selectedImagePaths.length === 0) return;

  const dealer = new Dealer();
  dealer.connect(`tcp://localhost:${INFERENCE_PORT}`);

  try {
    // Query and select models
    await dealer.send(['', 'query_available_models', '']);
    const [, , modelsPayload] = await dealer.receive();
    const models = JSON.parse(modelsPayload.toString());

    await dealer.send(['', 'htr_use', selectedHtrModel || models.HTR[0]]);
    await dealer.send(['', 'line_seg_use', selectedLineSegModel || models.LineSegmentation[0]]);

    // Run inference — Python returns a list of JSON result file paths
    await dealer.send(['', 'infer', JSON.stringify(selectedImagePaths)]);
    const [, , resultPayload] = await dealer.receive();
    const resultPaths = JSON.parse(resultPayload.toString());

    // Parse each result file and assemble UI items
    const items = await Promise.all(resultPaths.map(async (jsonPath) => {
      const ir = new InferenceResult(jsonPath);
      await ir.init(() => {});
      const imgPath = ir.imagePath;
      const base64 = fs.readFileSync(imgPath).toString('base64');
      return {
        base64,
        text: ir.allLines().join('\n'),
        filename: path.basename(imgPath),
        path: imgPath,
      };
    }));

    event.reply('inferenceComplete', items);
  } catch (err) {
    console.error('[inference] runInference failed:', err);
    event.reply('inferenceError', err.message);
  } finally {
    dealer.close();
  }
});

// Handle IPC request to pick a download destination folder
ipcMain.on('chooseDownloadDir', (event) => {
  dialog.showOpenDialog({ properties: ['openDirectory'] }).then(({ canceled, filePaths }) => {
    if (!canceled) event.reply('downloadDirChosen', filePaths[0]);
  });
});

// Handle IPC request to write text files to a destination folder
ipcMain.on('downloadFiles', (event, { destDir, items }) => {
  const written = [];
  for (const { filePath, text } of items) {
    const stem = path.basename(filePath, path.extname(filePath));
    const id = crypto.randomBytes(3).toString('hex');
    const outPath = path.join(destDir, `${stem}_${id}.txt`);
    fs.writeFileSync(outPath, text, 'utf8');
    written.push(path.basename(outPath));
  }
  event.reply('downloadComplete', written);
});

function extractZip(filePath, destDir) {
  return new Promise((resolve, reject) => {
    let proc;
    if (process.platform === 'win32') {
      proc = spawn('powershell.exe', [
        '-NoProfile', '-NonInteractive', '-Command',
        `Expand-Archive -LiteralPath "${filePath}" -DestinationPath "${destDir}" -Force`,
      ]);
    } else if (process.platform === 'darwin') {
      // ditto handles ZIP64 (archives >4GB) and preserves macOS metadata
      proc = spawn('ditto', ['-xk', filePath, destDir]);
    } else {
      // python3's zipfile module handles ZIP64; unzip (Info-ZIP 6.0) does not
      proc = spawn('python3', ['-m', 'zipfile', '-e', filePath, destDir]);
    }
    let stderr = '';
    proc.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('close', (code) => {
      // exit code 1 = success with warnings (e.g. extra metadata from macOS/Windows zips)
      if (code === 0 || code === 1) resolve();
      else reject(new Error(`Extraction exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`));
    });
    proc.on('error', reject);
  });
}

// Handle IPC request to import a model zip into the models directory
ipcMain.on('importModel', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Zip Archive', extensions: ['zip'] }],
  });
  if (canceled) return;
  try {
    await extractZip(filePaths[0], modelsDir);
    event.reply('modelImported');
  } catch (err) {
    console.error('[importModel] extraction failed:', err);
    event.reply('modelImportError', err.message);
  }
});

app.whenReady().then(() => {
  modelsDir = ensureModelsDir();
  spawnInferenceServer(modelsDir);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Kill the inference server on graceful exit.
// For unexpected crashes the stdin pipe closure handles it (see _heartbeat in inference.py).
app.on('before-quit', killInferenceServer);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});