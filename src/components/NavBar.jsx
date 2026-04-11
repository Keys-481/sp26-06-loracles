import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function NavBar({ currentIndex, total, onPrev, onNext, filename }) {
  return (
    <Box sx={{ px: 2, py: 0.75, borderTop: 1, borderColor: "divider", display: "flex", alignItems: "center", gap: 0.5, bgcolor: "background.paper" }}>
      <IconButton size="small" disabled={currentIndex <= 0} onClick={onPrev}>
        <ChevronLeftIcon fontSize="small" />
      </IconButton>
      <Typography variant="body2" sx={{ minWidth: 56, textAlign: "center" }}>
        {total > 0 ? `${currentIndex + 1} / ${total}` : "—"}
      </Typography>
      <IconButton size="small" disabled={currentIndex >= total - 1} onClick={onNext}>
        <ChevronRightIcon fontSize="small" />
      </IconButton>
      {filename && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ml: 1, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {filename}
        </Typography>
      )}
    </Box>
  );
}

export default NavBar;