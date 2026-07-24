import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowIcon,
  Lock as LockIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useSnackbar } from 'notistack';

const PRESET_ACCOUNTS = [
  { username: 'alex@emgage.com', pass: 'employee123', name: 'Alex Johnson (#101)', role: 'EMPLOYEE' },
  { username: 'priya@emgage.com', pass: 'employee123', name: 'Priya Sharma (#102)', role: 'EMPLOYEE' },
  { username: 'rahul@emgage.com', pass: 'employee123', name: 'Rahul Verma (#103)', role: 'EMPLOYEE' },
  { username: 'admin@emgage.com', pass: 'admin123', name: 'System Administrator', role: 'ADMIN' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState<number>(0); // 0: Sign In, 1: Sign Up

  // Login state
  const [loginUsername, setLoginUsername] = useState<string>('alex@emgage.com');
  const [loginPassword, setLoginPassword] = useState<string>('employee123');

  // Register state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<string>('ROLE_EMPLOYEE');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (acc: typeof PRESET_ACCOUNTS[0]) => {
    setActiveTab(0);
    setLoginUsername(acc.username);
    setLoginPassword(acc.pass);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await apiClient.post('/auth/login', {
        username: loginUsername,
        password: loginPassword,
      });

      const { token, id, fullName, role } = response.data;

      localStorage.setItem('emgage_jwt_token', token);
      localStorage.setItem('emgage_emp_id', String(id));
      localStorage.setItem('emgage_emp_name', fullName);
      localStorage.setItem('emgage_username', loginUsername);
      localStorage.setItem('emgage_user_role', role);

      enqueueSnackbar(`Authenticated as ${fullName}!`, { variant: 'success' });

      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      const msg = err.response?.data?.error || 'Invalid username or password.';
      setErrorMsg(msg);
      enqueueSnackbar('Authentication failed.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await apiClient.post('/auth/register', {
        fullName: regFullName,
        username: regUsername,
        password: regPassword,
        role: regRole,
      });

      const { token, id, fullName, role } = response.data;

      localStorage.setItem('emgage_jwt_token', token);
      localStorage.setItem('emgage_emp_id', String(id));
      localStorage.setItem('emgage_emp_name', fullName);
      localStorage.setItem('emgage_username', regUsername);
      localStorage.setItem('emgage_user_role', role);

      enqueueSnackbar(`Account created successfully for ${fullName}!`, { variant: 'success' });

      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      const msg = err.response?.data?.error || 'Failed to register account. Username may already exist.';
      setErrorMsg(msg);
      enqueueSnackbar('Registration failed.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              backgroundColor: '#2563eb',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
              mb: 1.5,
            }}
          >
            <LocationIcon sx={{ color: '#ffffff', fontSize: 36 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Emgage Track
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Spring Security & Real-Time Device Geolocation Portal
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Preset Accounts Column */}
          <Grid item xs={12} md={5}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 4, backgroundColor: '#ffffff', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Database Preset Accounts
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Click any account to prefill login credentials:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {PRESET_ACCOUNTS.map((acc) => (
                  <Card
                    key={acc.username}
                    variant="outlined"
                    onClick={() => handleSelectPreset(acc)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      borderColor: loginUsername === acc.username ? '#2563eb' : '#e2e8f0',
                      backgroundColor: loginUsername === acc.username ? '#eff6ff' : '#ffffff',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#2563eb' },
                    }}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {acc.name}
                        </Typography>
                        <Chip
                          label={acc.role === 'ADMIN' ? 'ADMIN' : 'EMP'}
                          size="small"
                          color={acc.role === 'ADMIN' ? 'secondary' : 'primary'}
                          sx={{ fontSize: '0.65rem' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {acc.username}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Login / Register Tab Column */}
          <Grid item xs={12} md={7}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 4, backgroundColor: '#ffffff', height: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => {
                  setActiveTab(val);
                  setErrorMsg(null);
                }}
                variant="fullWidth"
                sx={{ mb: 3 }}
              >
                <Tab icon={<LockIcon />} iconPosition="start" label="Sign In" sx={{ fontWeight: 700 }} />
                <Tab icon={<PersonAddIcon />} iconPosition="start" label="Sign Up / Register" sx={{ fontWeight: 700 }} />
              </Tabs>

              {errorMsg && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {errorMsg}
                </Alert>
              )}

              {/* Sign In Form */}
              {activeTab === 0 && (
                <form onSubmit={handleLoginSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      label="Username / Email"
                      type="email"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      fullWidth
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading && <CircularProgress size={20} color="inherit" />}
                      endIcon={!loading && <ArrowIcon />}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, py: 1.5, mt: 1 }}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </Box>
                </form>
              )}

              {/* Sign Up / Register Form */}
              {activeTab === 1 && (
                <form onSubmit={handleRegisterSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Full Name"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                      fullWidth
                      placeholder="e.g. Sam Miller"
                    />
                    <TextField
                      label="Username / Email"
                      type="email"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                      fullWidth
                      placeholder="e.g. sam@emgage.com"
                    />
                    <TextField
                      label="Password (min 6 chars)"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      fullWidth
                      inputProps={{ minLength: 6 }}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Account Role</InputLabel>
                      <Select
                        value={regRole}
                        label="Account Role"
                        onChange={(e) => setRegRole(e.target.value)}
                      >
                        <MenuItem value="ROLE_EMPLOYEE">Field Representative (Employee)</MenuItem>
                        <MenuItem value="ROLE_ADMIN">System Administrator (Admin)</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      color="secondary"
                      disabled={loading}
                      startIcon={loading && <CircularProgress size={20} color="inherit" />}
                      endIcon={!loading && <ArrowIcon />}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, py: 1.5, mt: 1 }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account & Sign In'}
                    </Button>
                  </Box>
                </form>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
