
function App() {

  return (
    <div style={{ padding: '5px', fontFamily: 'Arial, sans-serif' }}>

      <div className="parent">

        <div className="div1">

          <div className="buttonRow">

            <button id="selectImagesButton" type="button" className="button" onClick={() => {window.electronAPI.openImage();}} >
              <img src="/src/assets/file.png" alt="Icon" className="icon"></img>
              <span>File Select</span>
            </button>

            <button type="button" className="button">
              <img src="/src/assets/folder.png" alt="Icon" className="icon"></img>
              <span>Folder Select</span>
            </button>

            <button type="button" className="button">
              <img src="/src/assets/settings.png" alt="Icon" className="icon"></img>
              <span>Settings</span>
            </button>

            <button type="button" className="button">
              <img src="/src/assets/world.png" alt="Icon" className="icon"></img>
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
          <p>Box 3</p>
          <p>Scanning controls</p>
        </div>

        <div className="div4">
          <p>Box 4</p>
          <p>Text Display</p>
        </div>

      </div>

    </div>
  );
}

export default App;
