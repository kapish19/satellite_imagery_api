import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const accentGreen = '#43B649';

const NDVICalculator = () => {
  const [redFile, setRedFile] = useState(null);
  const [nirFile, setNirFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (type === 'red') {
      setRedFile(file);
    } else {
      setNirFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('red_file', redFile, redFile.name);
    formData.append('nir_file', nirFile, nirFile.name);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/ndvi/from-bands', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while processing the files');
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
          <Box component="span" sx={{ color: accentGreen }}>NDVI</Box> Calculator
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 5, fontWeight: 400, fontSize: { xs: '1rem', md: '1.2rem' } }}
        >
          Calculate the Normalized Difference Vegetation Index (NDVI) from red and near-infrared band images.
        </Typography>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, mb: 4, bgcolor: '#fafafa', borderRadius: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6}>
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
                  Upload Red Band
                  <input
                    accept=".tif,.tiff"
                    type="file"
                    hidden
                    onChange={(e) => handleFileChange(e, 'red')}
                  />
                </Button>
                {redFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: accentGreen }}>
                    Selected: {redFile.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
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
                  Upload NIR Band
                  <input
                    accept=".tif,.tiff"
                    type="file"
                    hidden
                    onChange={(e) => handleFileChange(e, 'nir')}
                  />
                </Button>
                {nirFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: accentGreen }}>
                    Selected: {nirFile.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={!redFile || !nirFile || loading}
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
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Calculate NDVI'}
                </Button>
              </Grid>
            </Grid>
          </form>
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
            <Grid container spacing={3} justifyContent="center" alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  NDVI Statistics
                </Typography>
                <Typography>Minimum: {result.min.toFixed(4)}</Typography>
                <Typography>Maximum: {result.max.toFixed(4)}</Typography>
                <Typography>Mean: {result.mean.toFixed(4)}</Typography>
                <Typography>Median: {result.median.toFixed(4)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  NDVI Visualization
                </Typography>
                <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', bgcolor: '#eee', p: 1 }}>
                  <img
                    src={`http://localhost:8000${result.ndvi_png}`}
                    alt="NDVI Visualization"
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default NDVICalculator; 