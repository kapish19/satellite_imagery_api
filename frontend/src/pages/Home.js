import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box, Stack } from '@mui/material';

const accentGreen = '#43B649';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pt: { xs: 8, md: 16 }, pb: { xs: 4, md: 8 } }}>
        <Typography
          variant="h2"
          component="h1"
          align="center"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '2.2rem', md: '3.5rem' },
            mb: 2,
            lineHeight: 1.1,
          }}
        >
          The only <Box component="span" sx={{ color: accentGreen }}>Satellite API</Box><br /> you will ever need.
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          sx={{ mb: 5, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.4rem' } }}
        >
          Process, analyze, and visualize satellite imagery with ease.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 8 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: accentGreen,
              color: '#fff',
              borderRadius: 999,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#369c3c' },
            }}
            onClick={() => navigate('/ndvi')}
          >
            Try NDVI Calculator
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: accentGreen,
              color: '#fff',
              borderRadius: 999,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#369c3c' },
            }}
            onClick={() => navigate('/change-detection')}
          >
            Try Change Detection
          </Button>
        </Stack>
      </Container>
      {/* SVG accent line at the bottom */}
      <Box sx={{ width: '100%', overflow: 'hidden', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 180" width="100%" height="100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
          <path d="M0 120 Q 360 200 720 120 T 1440 120" stroke={accentGreen} strokeWidth="10" fill="none" />
        </svg>
      </Box>
    </Box>
  );
};

export default Home; 