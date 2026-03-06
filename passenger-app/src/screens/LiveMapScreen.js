import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text, ActivityIndicator } from 'react-native-paper';
import LiveMapLeaflet from '../components/LiveMapLeaflet';
import socketService from '../services/socket';
import { colors } from '../utils/theme';
import { loadMultipleCSV } from '../utils/csvParser';

const LiveMapScreen = ({ navigation }) => {
  const [busLocations, setBusLocations] = useState([]);
  const [stops, setStops] = useState([]);

  useEffect(() => {
    // Load data from public folder
    loadAllData();

    // Connect to socket for real-time updates
    socketService.connect();
    socketService.onBusLocationUpdate(handleBusLocationUpdate);

    return () => {
      socketService.off('busLocationUpdate', handleBusLocationUpdate);
    };
  }, []);

  const loadAllData = async () => {
    try {
      const data = await loadMultipleCSV([
        'live_bus_location.csv',
        'bus_stops.csv',
        'buses.csv'
      ]);
      
      const locations = data.live_bus_location || [];
      const stops = data.bus_stops || [];
      const buses = data.buses || [];
      
      // Merge bus data with location data
      const busesWithLocation = locations.map(location => {
        const bus = buses.find(b => b.bus_id === location.bus_id);
        return {
          ...bus,
          ...location,
        };
      });
      setBusLocations(busesWithLocation);
      setStops(stops);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };



  const handleBusLocationUpdate = (data) => {
    // Update specific bus location
    setBusLocations(prev => {
      const index = prev.findIndex(b => b.bus_id === data.bus_id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...data };
        return updated;
      }
      return prev;
    });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title="Live Bus Tracking" />
        <Appbar.Action icon="home" onPress={() => navigation.navigate('Home')} />
        <Appbar.Action icon="refresh" onPress={loadAllData} />
      </Appbar.Header>

      {busLocations.length > 0 ? (
        <LiveMapLeaflet 
          buses={busLocations}
          stops={stops}
          height="100%"
        />
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bus locations...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textPrimary,
  },
});

export default LiveMapScreen;
