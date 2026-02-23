// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    selectImages: () => ipcRenderer.invoke('select-images') // Invoke main process handler
});