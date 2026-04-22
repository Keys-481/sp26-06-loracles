import {app, BrowserWindow, ipcMain, dialog} from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import EOL from 'node:os';
import started from 'electron-squirrel-startup';
import {spawn} from 'node:child_process';
import {Dealer} from 'zeromq';

import InferenceResult from './parser/InferenceResult';
import pyManager from './pymanager/PyManager';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Intercept main-process stdout/stderr and forward to DevTools so output is
// visible when running the installed app without an attached terminal.
const _patch = (stream, level) => {
  const original = stream.write.bind(stream);
  stream.write = (chunk, ...args) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('console-output', level, chunk.toString());
    }
    return original(chunk, ...args);
  };
};
_patch(process.stdout, 'log');
_patch(process.stderr, 'warn');

const INFERENCE_PORT = 5555;
let inferenceProcess = null;
let mainWindow = null;

function ensureModelsDir() {
  let modelsDir = path.join(app.getPath('userData'), 'models');
  fs.mkdirSync(modelsDir, {recursive: true});
  return modelsDir;
}

// Ensures src/inference (and the src package marker) are on the real filesystem
// so Python can import them. In dev, the source tree is already on disk.
// When packaged, Node can read from app.asar but Python cannot, so we extract
// the necessary files to userData and re-extract whenever the app version changes.
async function ensurePythonSource() {
  if (!app.isPackaged) {
    return app.getAppPath();
  }
  // Python source is pre-copied into the app and extracted to app.asar.unpacked at build time.
  return path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'python');
}

function spawnInferenceServer(modelsDir, cwd) {
  console.log('Spawning inference server...');

  inferenceProcess = spawn(pyManager.pythonPath, [
    '-m', 'src.inference.inference',
    '--models_dir', modelsDir,
    '--port', String(INFERENCE_PORT),
    '--temp_dir', path.join(app.getPath('userData'), 'temp'),
  ], {
    cwd,  // project root on sys.path so 'src.inference...' imports resolve
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',  // disable stdout block-buffering when writing to a pipe
    },
    // stdin is kept open as a pipe — when Electron dies unexpectedly the OS
    // closes the write end, Python reads EOF in _heartbeat and self-terminates.
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  inferenceProcess.stdout.pipe(process.stdout);
  inferenceProcess.stderr.pipe(process.stderr);
  inferenceProcess.on('exit', (code, signal) => {
    console.log(`[inference] process exited (code=${code}, signal=${signal})`);
    inferenceProcess = null;
  });
}

/**
 * Run inference for one file
 *
 * @param {string} filePath The file path on the computer
 * @param {number} port Port to use for 0mq
 * @returns
 */
async function inferFile(filePath, port=INFERENCE_PORT) {
  return new Promise(async (resolve, reject) => {
    const dealer = new Dealer();
    dealer.connect(`tcp://localhost:${port}`);

    // Query available models
    await dealer.send(['', 'query_available_models', '']);
    const [, , modelsPayload] = await dealer.receive();
    const models = JSON.parse(modelsPayload.toString());
    console.log('[info] Available models:', models);

    // Select first available model of each type
    await dealer.send(['', 'htr_use', models.HTR[0]]);
    await dealer.send(['', 'line_seg_use', models.LineSegmentation[0]]);

    // Run inference on selected file path
    await dealer.send(['', 'infer', JSON.stringify([filePath])]);
    const [, , resultPayload] = await dealer.receive();
    const results = JSON.parse(resultPayload.toString());
    console.log('[info] Inference results:', JSON.stringify(results, null, 2));

    // Close the dealer, we don't need it anymore
    dealer.close();

    // Parse the JSON file into an InferenceResult object
    const inferenceRes = new InferenceResult(results[0]);
    await inferenceRes.init().then((value) => {
      resolve(inferenceRes);
    });
  });
}

/**
 * Run inference for all files in the directory
 *
 * @param {string} filePath The file path on the computer
 * @param {number} port Port to use for 0mq
 * @returns
 */
async function inferDirectory(folder, port=INFERENCE_PORT) {
  return new Promise(async (resolve, reject) => {
    const dealer = new Dealer();
    dealer.connect(`tcp://localhost:${port}`);

    // Query available models
    await dealer.send(['', 'query_available_models', '']);
    const [, , modelsPayload] = await dealer.receive();
    const models = JSON.parse(modelsPayload.toString());
    console.log('[info] Available models:', models);

    // Select first available model of each type
    await dealer.send(['', 'htr_use', models.HTR[0]]);
    await dealer.send(['', 'line_seg_use', models.LineSegmentation[0]]);

    // Run inference on test assets
    const assetsDir = folder;
    const imgPaths = fs.readdirSync(assetsDir).map(f => path.join(assetsDir, f));
    await dealer.send(['', 'infer', JSON.stringify(imgPaths)]);
    const [, , resultPayload] = await dealer.receive();
    const results = JSON.parse(resultPayload.toString());
    console.log('[info] Inference results:', JSON.stringify(results, null, 2));

    // Close the dealer, we don't need it anymore
    dealer.close();

    let inferenceRess = {};
    await Promise.all(results.map(async (r) => {
      const i = new InferenceResult(r);
      await i.init().then((inited) => {
        inferenceRess[inited.imagePath] = inited;
      });
    }));

    console.log(inferenceRess);
    resolve(inferenceRess);
  });
}

function killInferenceServer() {
  if (inferenceProcess && !inferenceProcess.killed) {
    inferenceProcess.kill('SIGTERM');
    inferenceProcess = null;
  }
}

function cleanTempDir() {
  const tempDir = path.join(app.getPath('userData'), 'temp');
  if (!fs.existsSync(tempDir)) return;
  for (const file of fs.readdirSync(tempDir)) {
    fs.rmSync(path.join(tempDir, file), { force: true });
  }
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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

/**
 * 1. Opens the OpenDialog window, allowing user to select a file to open from their hard drive
 * 2. Branching step:
 *   α. User selects a file
 *     3. File path saved to filePath
 *     4. File dir saved to dirName
 *     5. File name saved to baseName
 *     6. File contents read synchronously
 *     7. File contents in base64 saved to base64
 *     8. Promise is resolved with {filePath, dirName, baseName, base64}
 *   β. User cancels file selection
 *     3. Promise is resolved with false
 *
 * @returns Promise as specified above
 */
ipcMain.handle('dialog:openFile', async (event) => {
  return new Promise(async (resolve, reject) => {
    const result = dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{name: "Images", extensions: ["png", "jpg", "jpeg", 'tiff']}]
    });

    result.then(({canceled, filePaths, bookmarks}) => {
      if (!canceled) { // α
        const filePath = filePaths[0];
        const dirName = path.dirname(filePath)
        const baseName = path.basename(filePath);
        const base64 = fs.readFileSync(filePaths[0]).toString('base64');

        resolve({filePath, dirName, baseName, base64});
      } else { // β
        resolve(false);
      }
    });
  });
});

/**
 * Opens a dialog to make the user select a directory for input images
 */
ipcMain.on("dialog:openDirectory", (event) => {
  const result = dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  result.then(({canceled, filePaths, bookmarks}) => {
    if (!canceled) {
      event.reply('display:displayDirectory', filePaths[0]);
    }
  });
});

ipcMain.handle('inference:inferImage', async (event, imagePath) => {
  return new Promise(async (resolve, reject) => {
    const result = inferFile(imagePath);

    result.then((inferenceResult) => {
      const outputText = inferenceResult.allLines().join(EOL.EOL);
      resolve(outputText);
    });
  })
  
});

ipcMain.on('inference:inferDirectory', (event, imagePaths) => {
  const result = inferDirectory(imagePaths);

  result.then((inferenceResults) => {
    event.reply('display:displayDirectoryText', inferenceResults);
  });
});

/**
 * Writes the results to the specified directory
 * 
 * Uses fs to write a file to the file named "filename" at directory "directory".
 * If the file does not exist, creates a new one. In any casem gets write access for the file.
 * Then attempts to set contents of file to "content"
 * 
 * @returns Any errors
 */
ipcMain.handle('save:saveResults', (event, directory, filename, content) => {
  const result = fs.writeFile(path.join(directory, filename), content, {flag: 'w+'}, err => {return err;});
});
/**
 * Opens a dialog to make the user select a directory for
 * saving outputs
 */
ipcMain.handle("dialog:chooseSaveFolder", async (event) => {
  return new Promise(async (resolve, reject) => {
    const result = dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    result.then(({canceled, filePaths, _}) => {
      // Folder was selected
      if (!canceled)
        resolve(filePaths[0]);
      // Folder not selected, back out
      else
        resolve(null);
    });
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const modelsDir = ensureModelsDir();
  // Give the Python process a moment to bind its ZMQ socket before connecting.
  // setTimeout(() => testInference().catch(console.error), 2000);
  createWindow();

  // Initialize the venv and start the inference server in the background.
  console.log('[pymanager] calling initialize...');
  pyManager.initialize(modelsDir)
    .then(() => {
      console.log('[pymanager] initialized; ensuring Python source...');
      return ensurePythonSource();
    })
    .then((cwd) => {
      console.log(`[pymanager] cwd=${cwd}; spawning inference server...`);
      spawnInferenceServer(modelsDir, cwd);
    })
    .catch((err) => {
      console.error(`[pymanager ERROR] ${err.message}\n${err.stack}`);
    });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Kill the inference server and clean up temp files on graceful exit.
// For unexpected crashes the stdin pipe closure handles it (see _heartbeat in inference.py).
app.on('before-quit', () => {
  killInferenceServer();
  cleanTempDir();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
