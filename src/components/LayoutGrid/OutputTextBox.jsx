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

  return(
    <div id="outputTextBox">
      <label for="outputTextBox_textarea">{labelText}</label>
      <br/>
      <textarea id="outputTextBox_textarea"
        autoCapitalize="off"
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder} // Text to display when textarea is empty
        value={scannedText}
      />
    </div>
  );
}

export default OutputTextBox;