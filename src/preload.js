// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Forward main-process stdout/stderr to DevTools console.
ipcRenderer.on('console-output', (_event, level, text) => {
  const fn = console[level] ?? console.log;
  fn.call(console, text.trimEnd());
});

// Expose safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {

  /**
   * Triggers dialog:openFile
   */
  openFile: () => ipcRenderer.invoke('dialog:openFile'),

  /**
   * Triggers inference:InferImage
   */
  inferFile: (imagePath) => ipcRenderer.invoke('inference:inferImage', imagePath),

  /**
   * Displays output text in outputTextBox_textarea
   */
  displayOutputText: ipcRenderer.on('display:displayText', (event, outputText) => {
    document.getElementById('outputTextBox_textarea').value = outputText;
  }),

  // openDirectory: () => ipcRenderer.send('dialog:openDirectory'),

  // displayDirectory: ipcRenderer.on('display:displayDirectory', (event, directory) =>{
  //   console.log("[info] opened directory:", directory);
  //   ipcRenderer.send('inference:inferDirectory', directory);
  // }),

  // displayDirectoryText: ipcRenderer.on('display:displayDirectoryText', (event, inferenceResults) => {
  //   console.log(inferenceResults);
  // }),

  /**
   * Load file path for .txt file output for save button
   */
  openSavePath: () => ipcRenderer.invoke('dialog:chooseSaveFolder'),

  /**
   * Triggers save:saveResults
   */
  saveResults: (filePath, fileName, content) => ipcRenderer.invoke('save:saveResults', filePath, fileName, content)
});