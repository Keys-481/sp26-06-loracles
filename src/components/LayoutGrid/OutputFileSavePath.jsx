/**
 * React component for displaying the desired save path for the file
 * in a text box format.
 *
 * Selecting the paired 'Output Folder' button will update the value
 * with the selected folder destination for the file to be saved.
 * @param {*} labelText Text for the attached label for the component
 * @param {string} [placeholder=""] Fills in the placeholder attribute of the text area
 * @param {string} [outputPath=""]  Fills in the desired output path for file saving
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