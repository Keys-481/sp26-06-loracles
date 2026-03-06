import { useState } from 'react';

/**
 * React compoenent for the scanning controls of the UI.
 *
 * This will be where the model parameters and big scan button are placed.
 */
function ScanControlBox() {
  const [scanState, setScanState] = useState(false);

  return (
    <div id="scanControlBox">
      <div id="modelParamBox">
        Add Model Param options here
      </div>
      <div id="runInferenceButtonBox">
        <button
          id="runInferenceButton"
          class="button"
          disabled={scanState}
          onClick={() => { setScanState(!scanState); }}
        >
          { scanState ? 'Scanning' : 'Run Inference' }
        </button>
      </div>
    </div>
  );
}

export default ScanControlBox;