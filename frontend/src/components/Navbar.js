import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, Link, Container } from '@mui/material';

const accentGreen = '#43B649';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'NDVI', path: '/ndvi' },
  { label: 'Change Detection', path: '/change-detection' },
  { label: 'GeoTIFF Tools', path: '/geotiff-tools' },
];

const Navbar = () => {
  const location = useLocation();
  return (
    <AppBar position="fixed" elevation={2} sx={{ bgcolor: '#fff', color: '#222' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 72 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                component={RouterLink}
                to={link.path}
                underline="none"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: '#222',
                  px: 1,
                  pb: 0.5,
                  borderBottom: location.pathname === link.path ? `3px solid ${accentGreen}` : '3px solid transparent',
                  transition: 'border-bottom 0.2s',
                  '&:hover': { color: accentGreen },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: accentGreen,
              color: '#fff',
              borderRadius: 999,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 'none',
              ml: 2,
              '&:hover': { bgcolor: '#369c3c' },
            }}
            component={RouterLink}
            to="/ndvi"
          >
            Get Started
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 