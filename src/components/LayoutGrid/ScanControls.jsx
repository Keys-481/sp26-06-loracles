
/**
 * @todo Currently has no impact on project
 *
 * React component for scan input controls. This will allow the user to adjust any
 * default values to instruct the model what to look for.
 *
 * @todo Create parameters to auto-fill/select what the default detected values are.
 * @todo fix syling import
 * @todo have values which change and affect dropdown box selections
 *
 * @returns {JSX.Element} React element for this Scan Controls section
 */
function ScanControls() {
  return(
    <div id="scanControls">
      <p>
        <label for="language">Document language:</label>
        <select name="language" id="language">
          <option value="Belarusian">Belarusian</option>
          <option value="Bulgarian">Bulgarian</option>
          <option value="Russian">Russian</option>
          <option value="Ukrainian">Ukrainian</option>
          <option value="Unknown">Unknown</option>
        </select>
      </p>
      <p>
        <label for="columns">Number of Columns:</label>
        <select name="columns" id="columns">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </p>
      <p>
        <label for="columns">Additional Parameters:</label>
        <select name="params" id="params">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </p>
    </div>
  );
}

export default ScanControls;