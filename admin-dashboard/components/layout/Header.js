'use client';

import { useState, useCallback } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header({ user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    handleMenuClose();
    onLogout();
  }, [handleMenuClose, onLogout]);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1565C0' }}>
      <Toolbar>
        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src="/images/tnstc-logo.png"
            alt="TNSTC Logo"
            sx={{ height: 40, width: 'auto', display: 'block' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('header-logo-fallback');
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <DirectionsBusIcon id="header-logo-fallback" sx={{ fontSize: 32, display: 'none' }} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            Tamil Nadu State Transport Corporation Ltd.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            FLOW - Real-Time Bus Management System
          </Typography>
        </Box>

        {user && (
          <>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.email}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircleIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
