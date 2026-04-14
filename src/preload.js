// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import OutputFileSavePath from './components/LayoutGrid/OutputFileSavePath';

// Forward main-process stdout/stderr to DevTools console.
ipcRenderer.on('console-output', (_event, level, text) => {
  const fn = console[level] ?? console.log;
  fn.call(console, text.trimEnd());
});

// Expose safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  openImage: () => ipcRenderer.send('chooseFile'),
  // Load the image and fill the documentDisplay
  openedFile: ipcRenderer.on('chosenFile', (event, base64) => {
    document.getElementById("documentDisplay").src = `data:image/jpg;base64,${base64}`;
  }),

  // Load the file path and log it in the console
  openFolder: () => ipcRenderer.send('chooseFolder'),
  openedFolder: ipcRenderer.on('chosenFolder', (event, directory) => {
    console.log(directory);
  }),

  // Load file path for .txt file output for save button
  openSavePath: () => ipcRenderer.send('chooseSaveFolder'),
  openedFolder: ipcRenderer.on('chosenSaveFolder', (event, directory) => {
    //document.getElementById(OutputFileSavePath).src = directory;
    
    console.log(directory);
  })
});