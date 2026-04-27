import ScanControls from './ScanControls';
import "./ScanControlBox.css";

/**
 * React compoenent for the scanning controls of the UI.
 *
 * This will be where the model parameters and big scan button are placed.
 *
 * @param {Object} param0 - Container for component props
 * @param {Boolean} param0.disable - whether or not to disable the run inference button
 * @param {Function} param0.onRunInferenceButton - function to run when "Run Inference" button is clicked
 * @param {Function} param0.onPrevImgButton - function to run when previous image button is clicked
 * @param {Function} param0.onNextImgButton - function to run when previous image button is clicked
 * @returns {JSX.Element} React element for this scan control box
 */
function ScanControlBox({ disable, onRunInferenceButton, onPrevImgButton, onNextImgButton }) {
  return (
    <div id="scanControlBox">
      <ScanControls/>
      <div id="controlButtonRow">
        <div id="prevImgButtonBox">
          <button
            id="prevImgButton"
            className="button"
            onClick={onPrevImgButton}
          >
            {'Previous <<'}
          </button>
        </div>
        <div id="runInferenceButtonBox">
          <button
            id="runInferenceButton"
            className="button"
            disabled={disable}
            onClick={onRunInferenceButton}
          >
            Run Inference
          </button>
        </div>
        <div id="nextImgButtonBox">
          <button
            id="nextImgButton"
            className="button"
            onClick={onNextImgButton}
          >
            {'Next >>'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScanControlBox;