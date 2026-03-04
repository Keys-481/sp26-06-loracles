// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  openImage: () => ipcRenderer.send('chooseFile'),
  // Load the image and fill the documentDisplay
  opened: ipcRenderer.on('chosenFile', (event, base64) => {
    document.getElementById("documentDisplay").src = `data:image/jpg;base64,${base64}`;
  }),
  selectImages: () => ipcRenderer.invoke('chooseFile') // Invoke main process handler
});