import ScanControls from "./ScanControls";

/**
 * React compoenent for the scanning controls of the UI.
 *
 * This will be where the model parameters and big scan button are placed.
 *
 * @param {Object} param0 Container for component props
 * @param {*} param0.scanState The current state of the scanner
 * @param {*} param0.onRunInferenceButton Function to run when "Run Inference" button is clicked
 */
function ScanControlBox({ scanState, onRunInferenceButton, onPrevImgButton, onNextImgButton }) {
  return (
    <div id="scanControlBox">
      <ScanControls/>
      <div id="prevImgButtonBox">
        <button
          id="prevImgButton"
          class="button"
          onClick={onPrevImgButton}
        >
          {'Previous <<'}
        </button>
      </div>
      <div id="runInferenceButtonBox">
        <button
          id="runInferenceButton"
          class="button"
          onClick={onRunInferenceButton}
        >
          { scanState ? 'Scanned' : 'Run Inference' }
        </button>
      </div>
      <div id="nextImgButtonBox">
        <button
          id="nextImgButton"
          class="button"
          onClick={onNextImgButton}
        >
          {'Next >>'}
        </button>
      </div>
    </div>
  );
}

export default ScanControlBox;