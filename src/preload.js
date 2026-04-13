// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // File / folder selection
  openImage:  () => ipcRenderer.send('chooseFile'),
  openFolder: () => ipcRenderer.send('chooseFolder'),

  // Inference
  runInference: () => ipcRenderer.send('runInference'),

  // Model selection
  getAvailableModels:  () => ipcRenderer.send('getAvailableModels'),
  saveModelSelection:  (htr, lineSeg) => ipcRenderer.send('saveModelSelection', { htr, lineSeg }),

  // Model import
  importModel:        () => ipcRenderer.send('importModel'),
  onModelImported:    (cb) => ipcRenderer.on('modelImported',    (_e)          => cb()),
  onModelImportError: (cb) => ipcRenderer.on('modelImportError', (_e, message) => cb(message)),

  // Download
  chooseDownloadDir:   () => ipcRenderer.send('chooseDownloadDir'),
  downloadFiles:       (destDir, items) => ipcRenderer.send('downloadFiles', { destDir, items }),
  onDownloadDirChosen: (cb) => ipcRenderer.on('downloadDirChosen', (_e, dirPath) => cb(dirPath)),
  onDownloadComplete:  (cb) => ipcRenderer.on('downloadComplete',  (_e, files)   => cb(files)),

  // Callbacks — main process pushes results to renderer via these
  onFileChosen:        (cb) => ipcRenderer.on('chosenFile',        (_e, data)    => cb(data)),
  onFolderChosen:      (cb) => ipcRenderer.on('chosenFolder',      (_e, items)   => cb(items)),
  onInferenceComplete: (cb) => ipcRenderer.on('inferenceComplete', (_e, items)   => cb(items)),
  onInferenceError:    (cb) => ipcRenderer.on('inferenceError',    (_e, message) => cb(message)),
  onAvailableModels:   (cb) => ipcRenderer.on('availableModels',   (_e, models)  => cb(models)),

  // Cleanup
  removeListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});