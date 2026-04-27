import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";

function TopBar({ onOpenFile, onOpenFolder, onSettings, onDownload, onRunInference, isRunning, hasFiles }) {
  return (
    <AppBar position="static" elevation={0} color="inherit" sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar variant="dense">
        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", mr: 2 }}>
          LTU HTR
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Button size="small" startIcon={<FileOpenIcon />} onClick={onOpenFile}>
          File
        </Button>
        <Button size="small" startIcon={<FolderOpenIcon />} onClick={onOpenFolder}>
          Folder
        </Button>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Save Files">
          <span>
            <IconButton size="small" onClick={onDownload} disabled={!hasFiles}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton size="small" onClick={onSettings}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          size="small"
          disableElevation
          startIcon={isRunning ? <CircularProgress size={14} color="inherit" /> : <PlayArrowIcon />}
          onClick={onRunInference}
          disabled={isRunning || !hasFiles}
          sx={{ ml: 1 }}
        >
          {isRunning ? "Running…" : "Run Inference"}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;