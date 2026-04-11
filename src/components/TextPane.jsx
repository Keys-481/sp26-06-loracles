import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function TextPane({ text, onChange }) {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2, overflow: "hidden" }}>
      <TextField
        label="Extracted Text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        multiline
        fullWidth
        placeholder="Run inference to extract text…"
        slotProps={{ htmlInput: { spellCheck: false } }}
        sx={{
          flex: 1,
          "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start", fontFamily: "monospace" },
          "& .MuiInputBase-input": { height: "100% !important", overflow: "auto !important" },
        }}
      />
    </Box>
  );
}

export default TextPane;