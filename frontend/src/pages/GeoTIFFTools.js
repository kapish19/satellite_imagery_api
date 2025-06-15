import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const accentGreen = '#43B649';

const GeoTIFFTools = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [targetCrs, setTargetCrs] = useState('EPSG:4326');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setResult(null);
    setError(null);
  };

  const handleMetadataSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/geotiff/metadata', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while processing the file');
    } finally {
      setLoading(false);
    }
  };

  const handleReprojectSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_crs', targetCrs);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/geotiff/reproject', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while processing the file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', pt: { xs: 10, md: 14 }, pb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '2.7rem' },
            mb: 2,
            lineHeight: 1.1,
          }}
        >
          <Box component="span" sx={{ color: accentGreen }}>GeoTIFF</Box> Tools
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 5, fontWeight: 400, fontSize: { xs: '1rem', md: '1.2rem' } }}
        >
          Extract metadata and reproject GeoTIFF files to different coordinate systems.
        </Typography>
        <Paper elevation={0} sx={{ mb: 4, bgcolor: '#fafafa', borderRadius: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              borderBottom: 0,
              minHeight: 56,
              '& .MuiTabs-indicator': {
                backgroundColor: accentGreen,
                height: 4,
                borderRadius: 2,
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1.1rem',
                borderRadius: 999,
                minHeight: 48,
                px: 3,
                mx: 1,
                color: '#222',
                '&.Mui-selected': {
                  color: accentGreen,
                  bgcolor: '#eafbe7',
                },
              },
            }}
          >
            <Tab label="Extract Metadata" />
            <Tab label="Reproject Image" />
          </Tabs>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <form onSubmit={activeTab === 0 ? handleMetadataSubmit : handleReprojectSubmit}>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      bgcolor: accentGreen,
                      color: '#fff',
                      borderRadius: 999,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: 'none',
                      width: '100%',
                      mb: 1,
                      '&:hover': { bgcolor: '#369c3c' },
                    }}
                  >
                    Upload GeoTIFF File
                    <input
                      accept=".tif,.tiff"
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  {file && (
                    <Typography variant="body2" sx={{ mt: 1, color: accentGreen }}>
                      Selected: {file.name}
                    </Typography>
                  )}
                </Grid>
                {activeTab === 1 && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target CRS"
                      value={targetCrs}
                      onChange={(e) => setTargetCrs(e.target.value)}
                      placeholder="e.g., EPSG:4326"
                      sx={{
                        '& .MuiInputBase-root': { borderRadius: 999 },
                      }}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={!file || loading}
                    sx={{
                      bgcolor: accentGreen,
                      color: '#fff',
                      borderRadius: 999,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      boxShadow: 'none',
                      mt: 2,
                      '&:hover': { bgcolor: '#369c3c' },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : activeTab === 0 ? (
                      'Extract Metadata'
                    ) : (
                      'Reproject Image'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        {result && (
          <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, mt: 2, bgcolor: '#fafafa', borderRadius: 4, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: accentGreen }}>
              Results
            </Typography>
            {activeTab === 0 ? (
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Image Information
                  </Typography>
                  <Typography>Width: {result.width} pixels</Typography>
                  <Typography>Height: {result.height} pixels</Typography>
                  <Typography>Bands: {result.count}</Typography>
                  <Typography>Data Type: {result.dtype}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Geographic Information
                  </Typography>
                  <Typography>CRS: {result.crs}</Typography>
                  <Typography>Transform: {Array.isArray(result.transform) ? result.transform.join(', ') : result.transform}</Typography>
                  <Typography>Bounds:</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography>Left: {result.bounds.left}</Typography>
                    <Typography>Right: {result.bounds.right}</Typography>
                    <Typography>Bottom: {result.bounds.bottom}</Typography>
                    <Typography>Top: {result.bounds.top}</Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Reprojection Successful
                </Typography>
                <Typography>
                  Output file: {result.output_path}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default GeoTIFFTools; 