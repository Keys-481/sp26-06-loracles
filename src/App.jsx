import { useState } from "react";

import img_file from "./assets/file.png";
import img_folder from "./assets/folder.png";
import img_settings from "./assets/settings.png";
import img_world from "./assets/world.png";

import OutputTextBox from "./components/LayoutGrid/OutputTextBox";
import ScanControlBox from "./components/LayoutGrid/ScanControlBox";

function App() {
  const [scanState, setScanState] = useState(false);

  return (
    <div style={{ padding: '5px', fontFamily: 'Arial, sans-serif' }}>
      <div class="parent">
        <div class="div1">
          <div class="buttonRow">
            <button type="button" class="button" onClick={() => {window.electronAPI.openImage();}}>
              <img src={img_file} alt="Icon" class="icon"></img>
              <span>File Select</span>
            </button>
            <button type="button" class="button">
              <img src={img_folder} alt="Icon" class="icon"></img>
              <span>Folder Select</span>
            </button>
            <button type="button" class="button">
              <img src={img_settings} alt="Icon" class="icon"></img>
              <span>Settings</span>
            </button>
            <button type="button" class="button">
              <img src={img_world} alt="Icon" class="icon"></img>
              <span>Language</span>
            </button>
          </div>
        </div>
        <div className="div2">
          <p>Box 2</p>
          <p>Document Display</p>
          <img id="documentDisplay" />
        </div>
        <div className="div3">
          <ScanControlBox
            scanState={scanState}
            onRunInferenceButton={() => setScanState(true)}
          />
        </div>
        <div class="div4">
          <OutputTextBox
            labelText={"Output goes here"}
            scannedText={scanState ? 'this is scanned text' : ''}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
