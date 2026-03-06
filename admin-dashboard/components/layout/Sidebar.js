'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RouteIcon from '@mui/icons-material/Route';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MapIcon from '@mui/icons-material/Map';

export const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
  { text: 'Fleet Monitor', icon: <DirectionsBusIcon />, href: '/fleet' },
  { text: 'Routes', icon: <RouteIcon />, href: '/routes' },
  { text: 'Live Map', icon: <MapIcon />, href: '/map' },
  { text: 'Analytics', icon: <AnalyticsIcon />, href: '/analytics' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} href={item.href} selected={pathname === item.href}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
