import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Slider,
  TextField,
  Link,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const accentGreen = '#43B649';

const ChangeDetection = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [threshold, setThreshold] = useState(0.1);
  const [band, setBand] = useState(1);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (type === 'image1') {
      setImage1(file);
    } else {
      setImage2(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);
    formData.append('threshold', threshold);
    formData.append('band', band);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/change-detection', formData, {
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
          <Box component="span" sx={{ color: accentGreen }}>Change</Box> Detection
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 5, fontWeight: 400, fontSize: { xs: '1rem', md: '1.2rem' } }}
        >
          Detect changes between two satellite images by comparing them pixel by pixel.
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
                  Upload First Image
                  <input
                    accept=".tif,.tiff"
                    type="file"
                    hidden
                    onChange={(e) => handleFileChange(e, 'image1')}
                  />
                </Button>
                {image1 && (
                  <Typography variant="body2" sx={{ mt: 1, color: accentGreen }}>
                    Selected: {image1.name}
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
                  Upload Second Image
                  <input
                    accept=".tif,.tiff"
                    type="file"
                    hidden
                    onChange={(e) => handleFileChange(e, 'image2')}
                  />
                </Button>
                {image2 && (
                  <Typography variant="body2" sx={{ mt: 1, color: accentGreen }}>
                    Selected: {image2.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Threshold: {threshold}
                </Typography>
                <Slider
                  value={threshold}
                  onChange={(_, value) => setThreshold(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                  sx={{ color: accentGreen }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Band Number"
                  value={band}
                  onChange={(e) => setBand(parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{
                    '& .MuiInputBase-root': { borderRadius: 999 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={!image1 || !image2 || loading}
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
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Detect Changes'}
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
                  Change Statistics
                </Typography>
                <Typography>Changed Area: {result.changed_area_pixels.toLocaleString()} pixels</Typography>
                <Typography>Change Percentage: {result.changed_area_percentage.toFixed(2)}%</Typography>
                <Typography>Threshold Used: {result.threshold_used}</Typography>
                <Typography>Image Dimensions: {result.dimensions}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Download Results
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    component={Link}
                    href={`http://localhost:8000${result.output_tiff}`}
                    download
                    sx={{
                      bgcolor: accentGreen,
                      color: '#fff',
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: 'none',
                      mr: 2,
                      mb: 2,
                      '&:hover': { bgcolor: '#369c3c' },
                    }}
                  >
                    Download GeoTIFF
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    component={Link}
                    href={`http://localhost:8000${result.output_png}`}
                    download
                    sx={{
                      bgcolor: accentGreen,
                      color: '#fff',
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      boxShadow: 'none',
                      mb: 2,
                      '&:hover': { bgcolor: '#369c3c' },
                    }}
                  >
                    Download PNG Preview
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  The GeoTIFF file contains the full change detection data and can be used for further analysis.<br />
                  The PNG file provides a visual preview of the changes.
                </Typography>
              </Grid>
            </Grid>
            <img
              src={`http://localhost:8000${result.output_png}`}
              alt="Change Detection Result"
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ChangeDetection; 