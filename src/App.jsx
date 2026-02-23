
function App() {

  return (
    <div style={{ padding: '5px', fontFamily: 'Arial, sans-serif' }}>

      <div class="parent">

        <div class="div1">

          <div class="buttonRow">

            <button id="selectImagesButton" type="button" class="button">
              <img src="/src/assets/file.png" alt="Icon" class="icon"></img>
              <span>File Select</span>
            </button>

            <button type="button" class="button">
              <img src="/src/assets/folder.png" alt="Icon" class="icon"></img>
              <span>Folder Select</span>
            </button>

            <button type="button" class="button">
              <img src="/src/assets/settings.png" alt="Icon" class="icon"></img>
              <span>Settings</span>
            </button>

            <button type="button" class="button">
              <img src="/src/assets/world.png" alt="Icon" class="icon"></img>
              <span>Language</span>
            </button>

          </div>

        </div>

        <div class="div2">
          <p>Box 2</p>
          <p>Document Display</p>
        </div>

        <div class="div3">
          <p>Box 3</p>
          <p>Scanning controls</p>
        </div>

        <div class="div4">
          <p>Box 4</p>
          <p>Text Display</p>
        </div>
        
      </div>

    </div>
  );
}

export default App;
