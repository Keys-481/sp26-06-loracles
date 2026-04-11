import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

/**
 * React component for scan input controls. This will allow the user to adjust any
 * default values to instruct the model what to look for.
 *
 * TODO - Create parameters to auto-fill/select what the default detected values are.
 */
function ScanControls() {
  // TODO have values which change and affect dropdown box selections

  return (
    <Box id="scanControls" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="language-label">Document language</InputLabel>
        <Select labelId="language-label" id="language" name="language" label="Document language" defaultValue="Unknown">
          <MenuItem value="Belarusian">Belarusian</MenuItem>
          <MenuItem value="Bulgarian">Bulgarian</MenuItem>
          <MenuItem value="Russian">Russian</MenuItem>
          <MenuItem value="Ukrainian">Ukrainian</MenuItem>
          <MenuItem value="Unknown">Unknown</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="columns-label">Number of Columns</InputLabel>
        <Select labelId="columns-label" id="columns" name="columns" label="Number of Columns" defaultValue="1">
          <MenuItem value="1">1</MenuItem>
          <MenuItem value="2">2</MenuItem>
          <MenuItem value="3">3</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="params-label">Additional Parameters</InputLabel>
        <Select labelId="params-label" id="params" name="params" label="Additional Parameters" defaultValue="1">
          <MenuItem value="1">1</MenuItem>
          <MenuItem value="2">2</MenuItem>
          <MenuItem value="3">3</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default ScanControls;