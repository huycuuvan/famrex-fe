// file: src/components/layout/Sidebar.tsx
'use client';

import { Box, Drawer, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAppContext } from '@/contexts/AppContext';
import UserProfileCard from './UserProfileCard';
import NavigationList from './NavigationList';
import SidebarFooter from './SidebarFooter';

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

export default function Sidebar({ mobileOpen, onDrawerToggle }: SidebarProps) {
  const { isSidebarHidden } = useAppContext();
  const DRAWER_WIDTH = 320;

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <UserProfileCard />
      <NavigationList />
      <SidebarFooter />
    </Box>
  );

  if (isSidebarHidden) return null;

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={onDrawerToggle} /* ... sx props ... */ >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={onDrawerToggle}><CloseIcon /></IconButton>
        </Box>
        {sidebarContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer variant="permanent" open /* ... sx props ... */ >
        {sidebarContent}
      </Drawer>
    </Box>
  );
}