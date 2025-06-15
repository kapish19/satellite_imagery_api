import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NDVICalculator from './pages/NDVICalculator';
import ChangeDetection from './pages/ChangeDetection';
import GeoTIFFTools from './pages/GeoTIFFTools';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Green shade
    },
    secondary: {
      main: '#1565C0', // Blue shade
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ndvi" element={<NDVICalculator />} />
          <Route path="/change-detection" element={<ChangeDetection />} />
          <Route path="/geotiff-tools" element={<GeoTIFFTools />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
