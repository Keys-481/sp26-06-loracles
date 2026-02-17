import { useState } from 'react';
import Greeting from './components/Greeting';

function App() {

  return (
    <div style={{ padding: '5px', fontFamily: 'Arial, sans-serif' }}>

      <div class="parent">
        <div class="div1">
          <p>Box 1</p>
          <p>Misc. Settings</p>
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
