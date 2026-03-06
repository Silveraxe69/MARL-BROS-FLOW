import './src/utils/suppressWarnings'; // Suppress non-critical library warnings
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/utils/theme';
import { injectWebStyles } from './src/utils/webStyles';
import 'react-native-gesture-handler';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LiveMapScreen from './src/screens/LiveMapScreen';
import BusStopScreen from './src/screens/BusStopScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StopSelectionScreen from './src/screens/StopSelectionScreen';

const Stack = createStackNavigator();

// Custom theme matching TNSTC Admin Dashboard
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,        // TNSTC Official Blue
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,     // Dark Blue
    secondaryContainer: colors.primaryLight,
    tertiary: colors.primary,
    error: colors.error,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.chipBlue,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    outline: colors.border,
  },
};

// Navigation wrapper that checks auth state
function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="LiveMap" component={LiveMapScreen} />
            <Stack.Screen name="BusStop" component={BusStopScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="StopSelection" component={StopSelectionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // Inject web-specific styles on mount
  useEffect(() => {
    injectWebStyles();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
