import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ImageIcon from "@mui/icons-material/Image";

function ImagePane({ base64 }) {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, overflow: "hidden", borderRight: 1, borderColor: "divider" }}>
      <Paper
        variant="outlined"
        sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", bgcolor: "grey.50" }}
      >
        {base64 ? (
          <img
            src={`data:image/jpg;base64,${base64}`}
            alt="document"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
          />
        ) : (
          <Box sx={{ textAlign: "center", color: "text.disabled", userSelect: "none" }}>
            <ImageIcon sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="body2">No document selected</Typography>
            <Typography variant="caption">Open a file or folder to get started</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ImagePane;