
/**
 * React component for scan input controls. This will allow the user to adjust any
 * default values to instruct the model what to look for.
 *
 * TODO - Create parameters to auto-fill/select what the default detected values are.
 * TODO - fix syling import
 */

// import "./index.css";

function ScanControls() {
  // TODO have values which change and affect dropdown box selections

  return(
    <div id="scanControls">
      <p>
        <label htmlFor="language">Document language:</label>
        <select name="language" id="language">
          <option value="Belarusian">Belarusian</option>
          <option value="Bulgarian">Bulgarian</option>
          <option value="Russian">Russian</option>
          <option value="Ukrainian">Ukrainian</option>
          <option value="Unknown">Unknown</option>
        </select>
      </p>
      <p>
        <label htmlFor="columns">Number of Columns:</label>
        <select name="columns" id="columns">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </p>
      <p>
        <label htmlFor="columns">Additional Parameters:</label>
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