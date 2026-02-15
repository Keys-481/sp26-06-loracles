import { useState } from 'react';
import Greeting from './components/Greeting';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>💖 Hello World!</h1>
      <p>Welcome to your Electron application with React!</p>

      <Greeting name="Developer" />

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Count: {count}
        </button>
      </div>
    </div>
  );
}

export default App;
