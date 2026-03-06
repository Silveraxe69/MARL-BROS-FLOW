'use client';

import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ user, onLogout, children }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Header user={user} onLogout={onLogout} />
      <Sidebar />

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, bgcolor: 'background.default' }}>
        <Toolbar />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 3,
            minHeight: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
