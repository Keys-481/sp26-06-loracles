// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // File / folder selection
  openImage:  () => ipcRenderer.send('chooseFile'),
  openFolder: () => ipcRenderer.send('chooseFolder'),

  // Inference
  runInference: () => ipcRenderer.send('runInference'),

  // Callbacks — main process pushes results to renderer via these
  onFileChosen:        (cb) => ipcRenderer.on('chosenFile',        (_e, data)    => cb(data)),
  onFolderChosen:      (cb) => ipcRenderer.on('chosenFolder',      (_e, items)   => cb(items)),
  onInferenceComplete: (cb) => ipcRenderer.on('inferenceComplete', (_e, items)   => cb(items)),
  onInferenceError:    (cb) => ipcRenderer.on('inferenceError',    (_e, message) => cb(message)),

  // Cleanup
  removeListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});