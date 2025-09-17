'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Badge,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  ExitToApp as ExitIcon,
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { Workspace, WorkspaceMember, WorkspaceNotification } from '../../lib/types';
import { workspaceService } from '../../lib/api/workspaceService';
import AppLayout from '../AppLayout';

// Dynamic import to prevent hydration issues
const WorkspaceProfileModal = dynamic(() => import('./WorkspaceProfileModal'), {
  ssr: false,
  loading: () => <CircularProgress />
});

interface WorkspaceDashboardProps {
  workspace: Workspace;
  onWorkspaceChange: () => void;
  onStartChat: () => void;
}

export default function WorkspaceDashboard({ workspace, onWorkspaceChange, onStartChat }: WorkspaceDashboardProps) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(workspace);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentWorkspace(workspace);
    loadWorkspaceData();
  }, [workspace.id]);

  const loadWorkspaceData = async () => {
    if (!mounted) return;
    
    setIsLoading(true);
    setError('');

    try {
      const [membersResponse, notificationsResponse] = await Promise.all([
        workspaceService.getWorkspaceMembers(workspace.id),
        workspaceService.getNotifications()
      ]);

      setMembers(membersResponse.data);
      setNotifications(notificationsResponse.data.filter(n => !n.is_read));
    } catch (error) {
      console.error('Failed to load workspace data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load workspace data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditWorkspace = () => {
    handleMenuClose();
    setShowProfileModal(true);
  };

  const handleSwitchWorkspace = () => {
    handleMenuClose();
    onWorkspaceChange();
  };

  const handleProfileUpdated = (updatedWorkspace: Workspace) => {
    setCurrentWorkspace(updatedWorkspace);
    // Update localStorage with new workspace data
    if (typeof window !== 'undefined') {
      localStorage.setItem('famarex_workspace', JSON.stringify(updatedWorkspace));
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const quickActions = [
    {
      title: 'Start AI Chat',
      description: 'Begin a conversation with your AI marketing assistant',
      icon: <CampaignIcon sx={{ fontSize: 40 }} />,
      color: 'primary' as const,
      action: onStartChat
    },
    {
      title: 'View Analytics',
      description: 'Check your campaign performance and insights',
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      color: 'success' as const,
      action: () => console.log('Analytics clicked')
    },
    {
      title: 'Manage Team',
      description: 'Invite members and manage workspace permissions',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'warning' as const,
      action: () => console.log('Team management clicked')
    },
    {
      title: 'Workspace Settings',
      description: 'Configure your workspace profile and preferences',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      color: 'secondary' as const,
      action: handleEditWorkspace
    }
  ];

  return (
    <AppLayout 
      title={currentWorkspace.profile?.brand_name || currentWorkspace.name}
      subtitle={currentWorkspace.profile?.brand_description || currentWorkspace.description || 'Workspace Dashboard'}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
                src={currentWorkspace.profile?.brand_logo_url}
              >
                {currentWorkspace.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {currentWorkspace.profile?.brand_name || currentWorkspace.name}
                </Typography>
                {(currentWorkspace.description || currentWorkspace.profile?.brand_description) && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {currentWorkspace.profile?.brand_description || currentWorkspace.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${members.length} member${members.length !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                  />
                  {currentWorkspace.profile?.business_type && (
                    <Chip
                      icon={<BusinessIcon />}
                      label={currentWorkspace.profile.business_type}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  )}
                  {unreadNotifications > 0 && (
                    <Badge badgeContent={unreadNotifications} color="error">
                      <Chip
                        icon={<NotificationsIcon />}
                        label="Notifications"
                        size="small"
                        variant="outlined"
                        color="warning"
                      />
                    </Badge>
                  )}
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<CampaignIcon />}
                onClick={onStartChat}
                size="large"
                sx={{ borderRadius: 2 }}
              >
                Start AI Chat
              </Button>
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleEditWorkspace}>
              <EditIcon sx={{ mr: 2 }} />
              Edit Workspace Profile
            </MenuItem>
            <MenuItem onClick={handleSwitchWorkspace}>
              <ExitIcon sx={{ mr: 2 }} />
              Switch Workspace
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => console.log('Settings')}>
              <SettingsIcon sx={{ mr: 2 }} />
              Advanced Settings
            </MenuItem>
          </Menu>
        </Paper>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      elevation: 6,
                      transform: 'translateY(-4px)'
                    }
                  }}
                  onClick={action.action}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${action.color}.light`,
                        color: `${action.color}.main`,
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Workspace Overview */}
        <Grid container spacing={3}>
          {/* Team Members */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Team Members
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => console.log('Invite member')}
                  >
                    Invite
                  </Button>
                </Stack>
                <Stack spacing={2}>
                  {members.slice(0, 5).map((member) => (
                    <Stack key={member.id} direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {member.user.email.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {member.user.name || member.user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.user.email}
                        </Typography>
                      </Box>
                      <Chip
                        label={member.role}
                        size="small"
                        color={member.role === 'owner' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </Stack>
                  ))}
                  {members.length > 5 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 1 }}>
                      +{members.length - 5} more members
                    </Typography>
                  )}
                  {members.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No team members yet
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Recent Activity
                </Typography>
                <Stack spacing={2}>
                  {notifications.slice(0, 5).map((notification) => (
                    <Box key={notification.id}>
                      <Typography variant="body2" fontWeight="medium">
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                  {notifications.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No recent activity
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Workspace Profile Setup Prompt */}
        {!currentWorkspace.profile?.brand_name && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mt: 4, 
              borderRadius: 3,
              bgcolor: 'info.light',
              color: 'info.contrastText'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <BusinessIcon sx={{ fontSize: 32 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Complete Your Workspace Profile
                </Typography>
                <Typography variant="body2">
                  Set up your brand information to get better AI recommendations and personalized marketing insights.
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleEditWorkspace}
                sx={{ bgcolor: 'info.dark', '&:hover': { bgcolor: 'info.main' } }}
              >
                Setup Profile
              </Button>
            </Stack>
          </Paper>
        )}
      </Container>

      {/* Workspace Profile Modal */}
      {mounted && (
        <WorkspaceProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          workspace={currentWorkspace}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </AppLayout>
  );
}
