import { useState } from 'react';

import OutputTextBox from './components/LayoutGrid/OutputTextBox';
import ScanControlBox from './components/LayoutGrid/ScanControlBox';

// Image files
import img_file from './assets/file.png';
import img_folder from './assets/folder.png';
import img_settings from './assets/settings.png';
import img_world from './assets/world.png';
import img_save from './assets/save.png';
import AboutSDP from './components/AboutSDP.jsx';
import AboutLTU from './components/AboutLTU.jsx';


/**
 * Creates the main react element for this program
 * @returns {JSX.Element} Main react element for this program
 */
function App() {
  // Text for OutputBox
  const [outputText, setOutputText] = useState(undefined);
  // Boolean for whether or not the scan is running
  const [scanState, setScanState] = useState(false);
  // Path of the input document
  const [documentPath, setDocumentPath] = useState(undefined);
  // Directory of the input document
  const [documentDirectory, setDocumentDirectory] = useState(undefined);
  // Name of the input document
  const [documentFilename, setDocumentFilename] = useState(undefined);

  return (
    <div style={{ padding: '5px', fontFamily: 'Arial, sans-serif' }}>
      <div className="parent">
        <div className="div1">
          <div className="buttonRow">
            <button type="button" className="button" onClick={
              async () => {
                /**
                 * The resolved results are of the form α if a file was chosen or
                 * β if the file selection was canceled.
                 *
                 * α: {filePath, base64}
                 *
                 * β: false
                 */
                const results = await window.electronAPI.openFile();

                if (results !== false) { // Only proceed if open dialog wasn't canceled
                  const {filePath, dirName, baseName, base64} = results;

                  // Set the document directory and filename for future access.
                  setDocumentPath(filePath);
                  setDocumentDirectory(documentDirectory ?? dirName);
                  setDocumentFilename(baseName);
                  // Re-enable scanning, since its a new file
                  setScanState(false);
                  setOutputText(undefined);
                  // Set the document display image
                  document.getElementById('documentDisplay').src = `data:image/jpg;base64,${base64}`;
                }
              }
            }>
              <img src={img_file} alt="Icon" className="icon"></img>
              <span>File Select</span>
            </button>
            <button type="button" className="button" onClick={async () => {}} disabled>
              <img src={img_folder} alt="Icon" className="icon"></img>

              <span>Folder Select</span>
            </button>
            <button type="button" className="button" onClick={() => {}}>
              <img src={img_settings} alt="Icon" className="icon"></img>
              <span>Settings</span>
            </button>
            <button type="button" className="button" onClick={() => {}}>
              <img src={img_world} alt="Icon" className="icon"></img>
              <span>Language</span>
            </button>
          </div>
        </div>
        <div className="div2">
          <p>Document Display</p>
          <img id="documentDisplay"/>
        </div>
        <div className="div3">
          <ScanControlBox
            disable={documentPath === undefined || scanState === true}
            onRunInferenceButton={
              async () => {
                // Prevent spam scanning
                setScanState(true);
                // Run inference
                const results = await window.electronAPI.inferFile(documentPath);
                // Set the output text
                setOutputText(results);
              }
            }
          />
        </div>
        <div className="div4">
          <OutputTextBox
            updateOutput={e => setOutputText(e.target.value)}
            disable={documentPath === undefined || outputText === undefined}
            labelText={"Output goes here"}
            scannedText={outputText ?? (scanState ? 'Please wait... Scanning' : 'Start the scan to see results')}
          />
          <label className="label" id="outputPath">
            Output path: {documentDirectory ?? '<no output path selected>'}
          </label>
          <div id="saveButtons">
            <button type="button" className="button" onClick={
              async () => {
                // Open the dialog to select an output folder
                const result = window.electronAPI.openSavePath();

                result.then((resolved) => {
                  if (resolved === null) {
                    // Folder selection cancelled, do nothing
                  } else {
                    // Set save path
                    setDocumentDirectory(resolved);
                  }
                });
              }
            }>
              <img src={img_folder} alt="Icon" className="icon"></img>
              <span>Choose Output Folder</span>
            </button>
            <button type="button" className="button" onClick={async () => {
              window.electronAPI.saveResults(documentDirectory, documentFilename + '.txt', document.getElementById('outputTextBox_textarea').value);
            }}>
              <img src={img_save} alt="icon" className="icon"/>
              <span>Save Results</span>
            </button>
          </div>
          <div id='logos'>
            <AboutSDP/>
            <AboutLTU/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
