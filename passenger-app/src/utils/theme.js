// TNSTC Official Color Theme - Matching Admin Dashboard
export const colors = {
  // Primary Colors
  primary: '#1565C0',        // TNSTC Official Blue
  primaryDark: '#0D47A1',    // Dark Blue
  primaryLight: '#1976D2',   // Light Blue
  
  // Secondary Colors
  secondary: '#0D47A1',      // Dark Blue
  
  // Background Colors
  background: '#f5f5f5',     // Light Gray
  paper: '#ffffff',          // White
  surface: '#ffffff',        // White
  
  // Status Colors
  success: '#4CAF50',        // Green
  warning: '#FF9800',        // Orange
  error: '#F44336',          // Red
  info: '#2196F3',           // Blue
  
  // Women Bus
  womenBus: '#FF69B4',       // Pink
  womenBusLight: '#FFE4F5',  // Light Pink
  
  // Text Colors
  textPrimary: '#212121',    // Dark Gray
  textSecondary: '#666666',  // Medium Gray
  textDisabled: '#9E9E9E',   // Light Gray
  textHint: '#999999',       // Hint Gray
  
  // Border Colors
  border: '#E0E0E0',         // Light Gray
  divider: '#E0E0E0',        // Light Gray
  
  // Crowd Level Colors
  crowdLow: '#4CAF50',       // Green
  crowdLowBg: '#E8F5E9',     // Light Green
  crowdMedium: '#FF9800',    // Orange
  crowdMediumBg: '#FFF3E0',  // Light Orange
  crowdFull: '#F44336',      // Red
  crowdFullBg: '#FFEBEE',    // Light Red
  
  // Chip/Badge Colors
  chipBlue: '#E3F2FD',       // Light Blue
};

export const theme = {
  colors,
  
  // Typography
  fonts: {
    regular: '"Roboto", "Helvetica", "Arial", sans-serif',
    medium: '"Roboto Medium", "Helvetica", "Arial", sans-serif',
    bold: '"Roboto Bold", "Helvetica", "Arial", sans-serif',
  },
  
  // Spacing (multiples of 8)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 50,
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 2px 8px rgba(0,0,0,0.15)',
    lg: '0 4px 16px rgba(0,0,0,0.18)',
  },
};

export default theme;
