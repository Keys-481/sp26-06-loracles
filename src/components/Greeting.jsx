import { useState } from 'react';

function Greeting({ name }) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px'
    }}>
      <h2>Hello, {name}!</h2>

      <button
        onClick={() => setShowMessage(!showMessage)}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        {showMessage ? 'Hide' : 'Show'} Message
      </button>

      {showMessage && (
        <p style={{ marginTop: '10px', color: '#555' }}>
          This is a simple React component! You can use this as a pattern for creating new components.
        </p>
      )}
    </div>
  );
}

export default Greeting;
