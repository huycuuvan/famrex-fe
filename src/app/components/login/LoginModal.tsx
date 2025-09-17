'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Divider,
  Paper,
  CircularProgress,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import { Workspace } from '@/app/lib/types';
import { userService } from '@/app/lib/api/userService';
import WorkspaceModal from '../workspace/WorkspaceModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (workspace: Workspace) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('admin@superbai.io');
  const [password, setPassword] = useState('Dinhhuy@04');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting login...');
      const response = await userService.login({ email, password });
      
      console.log('Login successful:', response);
      
      // Store user data
      localStorage.setItem('famarex_user', JSON.stringify(response.user));
      localStorage.setItem('famarex_token', response.access_token);
      
      // Close login modal and show workspace selection
      onClose();
      setShowWorkspaceModal(true);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspaceSelected = (workspace: Workspace) => {
    // Store selected workspace
    localStorage.setItem('famarex_workspace', JSON.stringify(workspace));
    
    setShowWorkspaceModal(false);
    
    if (onLoginSuccess) {
      onLoginSuccess(workspace);
    } else {
      router.push('/workspace');
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError('Social login not implemented yet. Please use email login.');
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 0
          }
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 3,
            pb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SparklesIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Welcome to Famarex
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your AI Marketing Assistant
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Stack spacing={3}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Social Login Buttons */}
            <Stack spacing={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderColor: 'grey.300',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'grey.400',
                    bgcolor: 'grey.50'
                  }
                }}
              >
                Continue with Google
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FacebookIcon />}
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  borderColor: '#1877f2',
                  color: '#1877f2',
                  '&:hover': {
                    borderColor: '#166fe5',
                    bgcolor: '#f0f8ff'
                  }
                }}
              >
                Continue with Facebook
              </Button>
            </Stack>

            <Divider>
              <Typography variant="body2" color="text.secondary">
                or continue with email
              </Typography>
            </Divider>

            {/* Email Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {isLoading ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Signing in...</span>
                    </Stack>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Footer Links */}
            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Button 
                  variant="text" 
                  size="small"
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    p: 0,
                    minWidth: 'auto'
                  }}
                >
                  Sign up for free
                </Button>
              </Typography>
              <Button 
                variant="text" 
                size="small"
                sx={{ 
                  textTransform: 'none',
                  color: 'text.secondary'
                }}
              >
                Forgot password?
              </Button>
            </Stack>

            {/* Demo Notice */}
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                🔑 Demo credentials are pre-filled. Click "Sign In" to authenticate with SuperbAI.
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Workspace Selection Modal */}
      <WorkspaceModal
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        onWorkspaceSelected={handleWorkspaceSelected}
      />
    </>
  );
}
