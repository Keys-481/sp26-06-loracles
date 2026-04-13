import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";

import TopBar from "./components/TopBar";
import ImagePane from "./components/ImagePane";
import TextPane from "./components/TextPane";
import NavBar from "./components/NavBar";
import SettingsDialog from "./components/SettingsDialog";
import DownloadDialog from "./components/DownloadDialog";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    background: { default: "#f0f2f5" },
  },
  shape: { borderRadius: 8 },
});

function App() {
  // Each item: { base64: string, text: string, filename: string, path: string }
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    // Single file selected — main sends { base64, path }
    window.electronAPI.onFileChosen(({ base64, path: filePath }) => {
      setItems([{ base64, text: '', filename: filePath.split('/').pop(), path: filePath }]);
      setCurrentIndex(0);
    });

    // Folder selected — main sends [{ base64, path, filename }]
    window.electronAPI.onFolderChosen((files) => {
      setItems(files.map(f => ({ base64: f.base64, text: '', filename: f.filename, path: f.path })));
      setCurrentIndex(0);
    });

    // Inference complete — main sends [{ base64, text, filename, path }]
    window.electronAPI.onInferenceComplete((results) => {
      setItems(results);
      setCurrentIndex(0);
      setIsRunning(false);
    });

    window.electronAPI.onInferenceError((message) => {
      console.error('Inference error:', message);
      setIsRunning(false);
    });

    return () => {
      window.electronAPI.removeListeners('chosenFile');
      window.electronAPI.removeListeners('chosenFolder');
      window.electronAPI.removeListeners('inferenceComplete');
      window.electronAPI.removeListeners('inferenceError');
    };
  }, []);

  const current = items[currentIndex];

  const handleTextChange = (text) => {
    setItems((prev) =>
      prev.map((item, i) => (i === currentIndex ? { ...item, text } : item))
    );
  };

  const handleRunInference = () => {
    setIsRunning(true);
    window.electronAPI.runInference();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <TopBar
          onOpenFile={() => window.electronAPI.openImage()}
          onOpenFolder={() => window.electronAPI.openFolder()}
          onSettings={() => setSettingsOpen(true)}
          onDownload={() => setDownloadOpen(true)}
          onRunInference={handleRunInference}
          isRunning={isRunning}
          hasFiles={items.length > 0}
        />
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <ImagePane base64={current?.base64} />
          <TextPane
            text={current?.text ?? ""}
            onChange={handleTextChange}
          />
        </Box>
        <NavBar
          currentIndex={currentIndex}
          total={items.length}
          onPrev={() => setCurrentIndex((i) => i - 1)}
          onNext={() => setCurrentIndex((i) => i + 1)}
          filename={current?.filename ?? ""}
        />
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <DownloadDialog open={downloadOpen} onClose={() => setDownloadOpen(false)} items={items} />
      </Box>
    </ThemeProvider>
  );
}

export default App;