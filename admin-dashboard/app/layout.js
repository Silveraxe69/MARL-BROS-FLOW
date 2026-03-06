'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '../lib/auth';
import MainLayout from '../components/layout/MainLayout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0', // TNSTC Official Blue
    },
    secondary: {
      main: '#0D47A1', // Dark Blue
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
});

function LayoutContent({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Show only children for login page
  if (pathname === '/login') {
    return children;
  }

  return <MainLayout user={user} onLogout={logout}>{children}</MainLayout>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: '100vh', overflow: 'hidden' }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
