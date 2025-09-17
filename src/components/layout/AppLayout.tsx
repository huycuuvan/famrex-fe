// file: src/components/layout/AppLayout.tsx
'use client';

import { useState, ReactNode } from 'react';
import { Box, Toolbar, IconButton, Typography, AppBar, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAppContext } from '@/contexts/AppContext';
import Sidebar from './sidebar/Sidebar'; // << 1. IMPORT SIDEBAR MỚI
import PageHeader from './PageHeader';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const DRAWER_WIDTH = 320;

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  // 2. State và logic được giảm thiểu tối đa
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSidebarHidden, toggleSidebar } = useAppContext();
  const theme = useTheme();
  
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const currentDrawerWidth = isSidebarHidden ? 0 : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile Header */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, display: { md: 'none' } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>{title || 'Famarex'}</Typography>
        </Toolbar>
      </AppBar>
      
      {/* 3. SỬ DỤNG SIDEBAR COMPONENT */}
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          mt: { xs: 8, md: 0 },
          transition: theme.transitions.create('width', { /*...*/ }),
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Desktop Sidebar Toggle Button */}
        <Box sx={{ position: 'fixed', top: 16, left: isSidebarHidden ? 16 : DRAWER_WIDTH + 16, zIndex: 1300, transition: theme.transitions.create('left', {/*...*/}) }}>
          <IconButton onClick={toggleSidebar} sx={{ display: { xs: 'none', md: 'inline-flex' }, bgcolor: 'primary.main', color: 'white', /*...*/ }}>
            <MenuIcon />
          </IconButton>
        </Box>

        <PageHeader title={title} subtitle={subtitle} />
        
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}