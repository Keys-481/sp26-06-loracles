import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

/**
 * React compoenent for the output Text box of the UI.
 *
 * This will be where the text scanned from a document will be placed.
 *
 * @param {Object} param0 Container for component props
 * @param {*} param0.labelText Fills in the text of the label for the textarea
 * @param {string} [param0.placeholder=""] Fills in the placeholder attribute of the textarea
 * @param {string} [param0.scannedText=""] Fills in text scanned by the scanner
 */
function OutputTextBox({ labelText, placeholder="", scannedText="" }) {
  // Ensure function props are of the right type
  if (typeof labelText !== "string")
    throw new TypeError(`Expected a string, got ${typeof labelText}`);
  if (typeof placeholder !== "string")
    throw new TypeError(`Expected a string, got ${typeof placeholder}`);
  if (typeof scannedText !== "string")
    throw new TypeError(`Expected a string, got ${typeof scannedText}`);
  if (labelText.trim() === "")
    throw new Error(`Expected non-empty string`);

  return (
    <Box id="outputTextBox" sx={{ p: 2, height: "100%", boxSizing: "border-box" }}>
      <TextField
        id="outputTextBox_textarea"
        label={labelText}
        placeholder={placeholder}
        value={scannedText}
        multiline
        fullWidth
        slotProps={{
          htmlInput: {
            autoCapitalize: "off",
            autoComplete: "off",
            spellCheck: false,
          }
        }}
        sx={{ height: "100%", "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" } }}
      />
    </Box>
  );
}

export default OutputTextBox;