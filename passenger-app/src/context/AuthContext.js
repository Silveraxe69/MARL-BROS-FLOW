import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadCSV } from '../utils/csvParser';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferWomenBuses, setPreferWomenBuses] = useState(false);
  const [usersData, setUsersData] = useState([]);

  // Load user from local storage on app start
  useEffect(() => {
    loadUsersData();
    loadUser();
  }, []);

  const loadUsersData = async () => {
    try {
      const data = await loadCSV('users.csv');
      setUsersData(data);
    } catch (error) {
      console.error('Error loading users data:', error);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const womenBusPreference = await AsyncStorage.getItem('preferWomenBuses');
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      if (womenBusPreference) {
        setPreferWomenBuses(JSON.parse(womenBusPreference));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      if (usersData.length === 0) {
        return {
          success: false,
          error: 'User data not loaded. Please try again.'
        };
      }
      
      // Find user in users.csv dataset from public folder
      // Trim whitespace from both email and password for comparison
      const foundUser = usersData.find(
        u => u.email?.trim().toLowerCase() === email.trim().toLowerCase() && 
             u.password?.trim() === password.trim()
      );
      
      if (!foundUser) {
        return { 
          success: false, 
          error: 'Invalid email or password' 
        };
      }

      // Create user session data (excluding password)
      const userData = {
        user_id: foundUser.user_id,
        name: foundUser.name,
        email: foundUser.email,
        phone_number: foundUser.phone_number,
        role: foundUser.role,
        loginTime: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleWomenBusPreference = async () => {
    try {
      const newPreference = !preferWomenBuses;
      await AsyncStorage.setItem('preferWomenBuses', JSON.stringify(newPreference));
      setPreferWomenBuses(newPreference);
    } catch (error) {
      console.error('Error toggling women bus preference:', error);
    }
  };

  const value = {
    user,
    isLoading,
    preferWomenBuses,
    login,
    logout,
    toggleWomenBusPreference,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
