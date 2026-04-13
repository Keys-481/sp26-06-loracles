import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

function DownloadDialog({ open, onClose, items }) {
  const [destDir, setDestDir] = useState('');

  useEffect(() => {
    window.electronAPI.onDownloadDirChosen((chosenPath) => {
      setDestDir(chosenPath);
    });
    return () => {
      window.electronAPI.removeListeners('downloadDirChosen');
      window.electronAPI.removeListeners('downloadComplete');
    };
  }, []);

  const handleSave = () => {
    const toSave = items
      .filter((item) => item.text)
      .map((item) => ({ filePath: item.path, text: item.text }));
    window.electronAPI.downloadFiles(destDir, toSave);
    onClose();
  };

  const savableCount = items.filter((item) => item.text).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Files</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography
            variant="body2"
            sx={{ flex: 1, color: destDir ? 'text.primary' : 'text.disabled', wordBreak: 'break-all' }}
          >
            {destDir || 'No folder selected'}
          </Typography>
          <Button
            size="small"
            startIcon={<FolderOpenIcon />}
            onClick={() => window.electronAPI.chooseDownloadDir()}
          >
            Browse
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {savableCount > 0
            ? `${savableCount} file${savableCount !== 1 ? 's' : ''} will be saved`
            : 'No files with text to save'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!destDir || savableCount === 0}
        >
          Save All
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DownloadDialog;