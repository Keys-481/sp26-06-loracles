/**
 * React component for displaying the desired save path for the file
 * in a text box format.
 */

function OutputFileSavePath({ labelText, placeholder="", outputPath }) {
  // Ensure funciton props are of the right type
  if (typeof labelText !== "string")
    throw new TypeError(`Expected a string, got ${typeof labelText}`);
  if (typeof placeholder !== "string")
    throw new TypeError(`Expected a string, got ${typeof placeholder}`);
  if (typeof outputPath !== "string")
    throw new TypeError(`Expected a string, got ${typeof outputPath}`);
  if (labelText.trim() === "")
    throw new Error(`Expected non-empty string`);

  return(
    <div id="outputFileSavePath">
      <label for="outputSaveFilePath_textarea">{labelText}</label>
      <br/>
      <textarea id="outputSaveFilePath_textarea"
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
        placeholder={placeholder}
        value={outputPath}
        readOnly
      />
    </div>
  );
}

export default OutputFileSavePath;