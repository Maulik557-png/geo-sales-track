import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Box,
  Button,
  Container,
  Tooltip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJourney } from '../contexts/JourneyContext';

interface HeaderProps {
  wsConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ wsConnected = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status, activeJourney } = useJourney();

  const getStatusColor = () => {
    if (!activeJourney) return 'default';
    if (status === 'ACTIVE') return 'success';
    if (status === 'COMPLETED') return 'info';
    return 'default';
  };

  const getStatusText = () => {
    if (!activeJourney) return 'IDLE';
    return status || 'IDLE';
  };

  return (
    <AppBar position="sticky" elevation={2} sx={{ backgroundColor: '#0f172a' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 70 }}>
          {/* Logo & Brand Name */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              <LocationIcon sx={{ color: '#ffffff', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: '.05rem',
                  color: '#ffffff',
                  lineHeight: 1.2,
                }}
              >
                Emgage Track
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Real-Time Employee Location Intelligence
              </Typography>
            </Box>
          </Box>

          {/* Center Status Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', display: { xs: 'none', sm: 'block' } }}>
              Journey Status:
            </Typography>
            <Chip
              label={getStatusText()}
              color={getStatusColor()}
              size="medium"
              sx={{ fontWeight: 600, px: 1 }}
            />
          </Box>

          {/* Right Navigation & WS Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}>
              <Chip
                icon={wsConnected ? <WifiIcon fontSize="small" /> : <WifiOffIcon fontSize="small" />}
                label={wsConnected ? 'Live' : 'Offline'}
                color={wsConnected ? 'success' : 'error'}
                variant="outlined"
                size="small"
                sx={{ mr: 1, display: { xs: 'none', md: 'inline-flex' } }}
              />
            </Tooltip>

            <Button
              variant={location.pathname === '/employee' || location.pathname === '/' ? 'contained' : 'text'}
              color="primary"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/employee')}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              Employee
            </Button>
            <Button
              variant={location.pathname === '/admin' ? 'contained' : 'text'}
              color="primary"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/admin')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                color: location.pathname === '/admin' ? '#ffffff' : '#cbd5e1',
              }}
            >
              Admin
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
