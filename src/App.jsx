import img_file from "./assets/file.png";
import img_folder from "./assets/folder.png";
import img_settings from "./assets/settings.png";
import img_world from "./assets/world.png";

function App() {

  return (
    <div style={{ padding: '5px', fontFamily: 'Arial, sans-serif' }}>

      <div class="parent">
        <div class="div1">
          <div class="buttonRow">
            <button type="button" class="button">
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

function imageURL(url) {
  return 
}

export default App;
