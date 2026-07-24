import React from 'react';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 5, textCenter: 'center', borderRadius: 3, maxWidth: 480, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontWeight: 800, color: '#2563eb', fontSize: '5rem' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#0f172a' }}>
          Page Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The page or route you are looking for does not exist in Emgage Track.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/employee')}
          sx={{ textTransform: 'none', fontWeight: 600, px: 3, borderRadius: 2 }}
        >
          Go to Employee Dashboard
        </Button>
      </Paper>
    </Box>
  );
};
