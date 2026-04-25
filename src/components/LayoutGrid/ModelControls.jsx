import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
function ModelControls() {
  const [htrModels, setHtrModels] = useState([]);
  const [lineSegModels, setLineSegModels] = useState([]);
  const [selectedHtr, setSelectedHtr] = useState('');
  const [selectedLineSeg, setSelectedLineSeg] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    window.electronAPI.onAvailableModels((models) => {
      setHtrModels(models.HTR || []);
      setLineSegModels(models.LineSegmentation || []);
      if (models.HTR?.length > 0) setSelectedHtr((prev) => prev || models.HTR[0]);
      if (models.LineSegmentation?.length > 0) setSelectedLineSeg((prev) => prev || models.LineSegmentation[0]);
    });
    window.electronAPI.onModelImported(() => {
      setImporting(false);
      window.electronAPI.getAvailableModels();
    });
    window.electronAPI.onModelImportError(() => {
      setImporting(false);
    });
    window.electronAPI.getAvailableModels();
    return () => {
      window.electronAPI.removeListeners('availableModels');
      window.electronAPI.removeListeners('modelImported');
      window.electronAPI.removeListeners('modelImportError');
    };
  }, []);

  const handleImport = () => {
    setImporting(true);
    window.electronAPI.importModel();
  };

  const handleSave = () => {
    window.electronAPI.saveModelSelection(selectedHtr, selectedLineSeg);
  };

  return (
    <Box id="scanControls" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="htr-model-label">HTR Model</InputLabel>
        <Select
          labelId="htr-model-label"
          id="htr-model"
          value={selectedHtr}
          label="HTR Model"
          onChange={(e) => setSelectedHtr(e.target.value)}
        >
          {htrModels.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel id="line-seg-model-label">Line Segmentation Model</InputLabel>
        <Select
          labelId="line-seg-model-label"
          id="line-seg-model"
          value={selectedLineSeg}
          label="Line Segmentation Model"
          onChange={(e) => setSelectedLineSeg(e.target.value)}
        >
          {lineSegModels.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={!selectedHtr || !selectedLineSeg}
      >
        Save
      </Button>
      <Button
        variant="outlined"
        onClick={handleImport}
        disabled={importing}
      >
        {importing ? 'Importing…' : 'Import Model'}
      </Button>
    </Box>
  );
}

export default ModelControls;