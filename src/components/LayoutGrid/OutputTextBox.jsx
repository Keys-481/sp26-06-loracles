/**
 * React compoenent for the output Text box of the UI.
 *
 * This will be where the text scanned from a document will be placed.
 *
 * @returns
 */
function OutputTextBox({ labelText, placeholder="" }) {
  // Ensure function props are of the right type
  if (typeof labelText !== "string")
    throw new TypeError(`Expected a string, got ${typeof labelText}`);
  if (typeof placeholder !== "string")
    throw new TypeError(`Expected a string, got ${typeof placeholder}`);

  // Ensure function props don't have invalid values
  if (labelText.trim() === "")
    throw new Error(`Expected non-empty string`);

  return(
    <div id="outputTextBox">
      <div>
        <label for="outputTextBox_textarea">{labelText}</label>
        <textarea id="outputTextBox_textarea"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck="false"
          placeholder={placeholder} // Text to display when textarea is empty
        >
        </textarea>
      </div>
    </div>
  );
}

export default OutputTextBox;