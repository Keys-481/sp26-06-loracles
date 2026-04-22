import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
function ScanControlBox({ scanState, onRunInferenceButton }) {
  return (
    <Box id="scanControlBox" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <ScanControls/>
      <Box id="runInferenceButtonBox">
        <Button
          id="runInferenceButton"
          variant="contained"
          size="large"
          fullWidth
          startIcon={scanState ? <CheckCircleIcon /> : <PlayArrowIcon />}
          onClick={onRunInferenceButton}
          color={scanState ? "success" : "primary"}
        >
          {scanState ? 'Scanned' : 'Run Inference'}
        </Button>
      </Box>
    </Box>
  );
}

export default ScanControlBox;