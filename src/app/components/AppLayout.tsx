'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Avatar,
  Paper,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Circle as CircleIcon,
  Chat as ChatIcon,
  Campaign as CampaignIcon,
  Business as WorkspaceIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { userService, User } from '../lib/api/userService';
import { aiService, Agent } from '../lib/api/aiService';
import AgentSelector from './AgentSelector';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showAgentSelector?: boolean;
}

const DRAWER_WIDTH = 320;
const COLLAPSED_DRAWER_WIDTH = 72;

const navigationItems = [
  {
    id: 'chat',
    label: 'AI Chat',
    icon: <ChatIcon />,
    path: '/chat',
    description: 'Trò chuyện với AI Marketing'
  },
  {
    id: 'content-plans',
    label: 'Content Plans',
    icon: <CampaignIcon />,
    path: '/content-plans',
    description: 'Quản lý kế hoạch nội dung'
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: <WorkspaceIcon />,
    path: '/workspace',
    description: 'Quản lý workspace'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
    description: 'Phân tích hiệu suất'
  },
  {
    id: 'team',
    label: 'Team',
    icon: <PeopleIcon />,
    path: '/team',
    description: 'Quản lý thành viên'
  }
];

export default function AppLayout({ children, title, subtitle, showAgentSelector = false }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [agentSelectorOpen, setAgentSelectorOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadUserData();
    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('famarex_sidebar_hidden');
    if (savedSidebarState) {
      setSidebarHidden(JSON.parse(savedSidebarState));
    }
  }, []);

  const loadUserData = async () => {
    try {
      // Get user from localStorage first (faster)
      const cachedUser = localStorage.getItem('famarex_user');
      if (cachedUser) {
        setCurrentUser(JSON.parse(cachedUser));
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      // If API fails but we have cached data, that's ok
      if (!currentUser) {
        // If no cached data and API fails, redirect to login
        router.push('/login');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      aiService.resetSession();
      router.push('/');
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    const newHiddenState = !sidebarHidden;
    setSidebarHidden(newHiddenState);
    // Save state to localStorage
    localStorage.setItem('famarex_sidebar_hidden', JSON.stringify(newHiddenState));
  };

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Get current drawer width based on state
  const currentDrawerWidth = sidebarHidden ? 0 : DRAWER_WIDTH;

  // Sidebar Content
  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
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
            <SparklesIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            Famarex
          </Typography>
        </Stack>
        
        {/* User Profile */}
        <Card elevation={0} sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                {currentUser?.picture ? (
                  <img src={currentUser.picture} alt={currentUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <PersonIcon />
                )}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {currentUser?.name || 'Loading...'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {currentUser?.email || 'Loading...'}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <CircleIcon sx={{ fontSize: 8, color: 'success.main' }} />
                  <Typography variant="caption">Online</Typography>
                  {currentUser?.credit && (
                    <Chip 
                      label={`${currentUser.credit} credits`} 
                      size="small" 
                      sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Agent Selector (only show on chat page) */}
      {showAgentSelector && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <ListItemButton 
            onClick={() => setAgentSelectorOpen(!agentSelectorOpen)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemText 
              primary="AI Agent" 
              secondary={selectedAgent?.name || 'Select Agent'}
            />
            {agentSelectorOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse in={agentSelectorOpen}>
            <Box sx={{ pl: 2 }}>
              <AgentSelector 
                selectedAgentId={selectedAgent?.id}
                onAgentSelect={handleAgentSelect}
              />
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Navigation
        </Typography>
        <List sx={{ px: 1 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton 
                onClick={() => router.push(item.path)}
                selected={isActivePath(item.path)}
                sx={{ 
                  borderRadius: 2, 
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActivePath(item.path) ? 'primary.main' : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={isActivePath(item.path) ? 'bold' : 'medium'}>
                      {item.label}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Settings & Logout */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack spacing={1}>
          <Button
            fullWidth
            variant="text"
            startIcon={<SettingsIcon />}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Settings
          </Button>
          <Button
            fullWidth
            variant="text"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="error"
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            Logout
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {title || 'Famarex'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      {!sidebarHidden && (
        <Box
          component="nav"
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: DRAWER_WIDTH,
                  bgcolor: 'background.paper'
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleDrawerToggle}>
                  <CloseIcon />
                </IconButton>
              </Box>
              {sidebarContent}
            </Drawer>
          ) : (
            <Drawer
              variant="permanent"
              sx={{
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: DRAWER_WIDTH,
                  bgcolor: 'background.paper',
                  borderRight: 1,
                  borderColor: 'divider',
                  transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                },
              }}
              open
            >
              {sidebarContent}
            </Drawer>
          )}
        </Box>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          mt: { xs: 8, md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Desktop Menu Toggle Button */}
        {!isMobile && (
          <Box sx={{ 
            position: 'fixed', 
            top: 16, 
            left: sidebarHidden ? 16 : DRAWER_WIDTH + 16, 
            zIndex: 1200,
            transition: theme.transitions.create('left', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}>
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: 3,
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: 4,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {/* Page Header (optional) */}
        {(title || subtitle) && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                {title && (
                  <Typography variant="h5" fontWeight="bold">
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              <Chip
                icon={<CircleIcon sx={{ fontSize: 12, color: 'success.main' }} />}
                label="Online"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Paper>
        )}

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
