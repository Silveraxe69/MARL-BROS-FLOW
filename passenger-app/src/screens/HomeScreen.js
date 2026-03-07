import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, IconButton, Chip } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/theme';
import { loadMultipleCSV } from '../utils/csvParser';

const HomeScreen = ({ navigation }) => {
  const { user, preferWomenBuses } = useAuth();
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [routes, setRoutes] = useState([]);
  
  // State for data loaded from public folder
  const [routesData, setRoutesData] = useState([]);
  const [busStopSequenceData, setBusStopSequenceData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [liveBusLocations, setLiveBusLocations] = useState([]);

  // Load data from public folder on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const data = await loadMultipleCSV([
        'bus_stops.csv',
        'routes.csv',
        'bus_stop_sequence.csv',
        'buses.csv',
        'live_bus_location.csv'
      ]);
      
      setRoutesData(data.routes || []);
      setBusStopSequenceData(data.bus_stop_sequence || []);
      setBusesData(data.buses || []);
      
      // Merge bus data with location data
      const locations = data.live_bus_location || [];
      const buses = data.buses || [];
      const busesWithLocation = locations.map(location => {
        const bus = buses.find(b => b.bus_id === location.bus_id);
        return {
          ...bus,
          ...location,
        };
      });
      setLiveBusLocations(busesWithLocation);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const findConnectingRoutes = useCallback((fromStopId, toStopId) => {
    const results = [];

    // Get all unique route IDs
    const allRouteIds = [...new Set(busStopSequenceData.map(seq => seq.route_id))];

    allRouteIds.forEach(routeId => {
      const routeStops = busStopSequenceData
        .filter(seq => seq.route_id === routeId)
        .sort((a, b) => a.stop_order - b.stop_order);

      const fromIndex = routeStops.findIndex(s => s.stop_id === fromStopId);
      const toIndex = routeStops.findIndex(s => s.stop_id === toStopId);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        const route = routesData.find(r => r.route_id === routeId);
        const busesOnRoute = busesData.filter(b => b.route_id === routeId && b.status === 'Running');

        // Sort buses - women buses first if preference is enabled
        let sortedBuses = busesOnRoute;
        if (preferWomenBuses) {
          sortedBuses = [
            ...busesOnRoute.filter(b => b.women_bus === 'Yes'),
            ...busesOnRoute.filter(b => b.women_bus === 'No'),
          ];
        }

        results.push({
          route,
          buses: sortedBuses,
          stopCount: toIndex - fromIndex + 1,
        });
      }
    });

    return results;
  }, [busStopSequenceData, routesData, busesData, preferWomenBuses]);

  const handleSearch = useCallback(() => {
    if (!fromStop || !toStop) {
      alert('Please select both From and To stops');
      return;
    }

    if (fromStop.stop_id === toStop.stop_id) {
      alert('From and To stops cannot be the same');
      return;
    }

    // Find routes that connect these stops
    const foundRoutes = findConnectingRoutes(fromStop.stop_id, toStop.stop_id);
    setRoutes(foundRoutes);
  }, [fromStop, toStop, findConnectingRoutes]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text variant="headlineMedium" style={styles.greeting}>
              Hello, {user?.name || 'Passenger'}! 👋
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Where would you like to go today?
            </Text>
          </View>
          <IconButton
            icon="account-circle"
            iconColor="white"
            size={32}
            onPress={() => navigation.navigate('Settings')}
            style={styles.accountButton}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Card */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <View style={styles.searchContainer}>
              <Text variant="titleMedium" style={styles.searchTitle}>
                Plan Your Journey
              </Text>

              <View style={styles.inputContainer}>
                <Text variant="labelMedium" style={styles.label}>From</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('StopSelection', {
                    onSelect: (stop) => setFromStop(stop),
                    title: 'Select Starting Stop',
                  })}
                  style={styles.selectButton}
                  contentStyle={styles.selectButtonContent}
                  icon="map-marker"
                >
                  {fromStop ? fromStop.stop_name : 'Select Stop'}
                </Button>
              </View>

              <View style={styles.inputContainer}>
                <Text variant="labelMedium" style={styles.label}>To</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('StopSelection', {
                    onSelect: (stop) => setToStop(stop),
                    title: 'Select Destination Stop',
                  })}
                  style={styles.selectButton}
                  contentStyle={styles.selectButtonContent}
                  icon="map-marker-check"
                >
                  {toStop ? toStop.stop_name : 'Select Stop'}
                </Button>
              </View>

              <Button
                mode="contained"
                onPress={handleSearch}
                style={styles.searchButton}
                contentStyle={styles.searchButtonContent}
                icon="magnify"
              >
                Search Buses
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Results */}
        {routes.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text variant="titleLarge" style={styles.resultsTitle}>
              Available Routes ({routes.length})
            </Text>
            
            {routes.map((routeInfo, index) => (
              <Card key={index} style={styles.routeCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.routeName}>
                    {routeInfo.route.start_stop} → {routeInfo.route.end_stop}
                  </Text>
                  <Text variant="bodySmall" style={styles.routeDetails}>
                    {routeInfo.stopCount} stops • {routeInfo.route.distance_km} km
                  </Text>
                  <Text variant="bodyMedium" style={styles.busCount}>
                    {routeInfo.buses.length} buses available
                  </Text>
                  
                  <View style={styles.busPreview}>
                    {routeInfo.buses.slice(0, 3).map(bus => (
                      <View key={bus.bus_id} style={styles.busTag}>
                        <Text variant="bodySmall">
                          {bus.bus_id} {bus.women_bus === 'Yes' ? '💗' : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
        
        {routes.length === 0 && fromStop && toStop && (
          <Card style={styles.noResultsCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.noResults}>
                No direct routes found
              </Text>
              <Text variant="bodySmall" style={styles.noResultsHint}>
                Try selecting different stops or check individual stops for next buses
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Live Map Button Card - Moved to Bottom */}
        <Card style={styles.liveMapCard}>
          <Card.Content>
            <View style={styles.liveMapHeader}>
              <View style={styles.liveMapTitleContainer}>
                <Text variant="titleLarge" style={styles.liveMapTitle}>
                  🗺️ Live Bus Tracking
                </Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveIndicator} />
                  <Text variant="bodySmall" style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <Chip icon="bus" style={styles.busCountChip}>
                {liveBusLocations.length} buses
              </Chip>
            </View>
            
            <Text variant="bodyMedium" style={styles.mapDescription}>
              Track all buses in real-time on an interactive map
            </Text>
            
            <Button
              mode="contained"
              icon="map"
              style={styles.openMapButton}
              contentStyle={styles.openMapButtonContent}
              onPress={() => navigation.navigate('LiveMap')}
            >
              Open Live Map
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    paddingTop: 40,
    flexShrink: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  accountButton: {
    margin: 0,
  },
  greeting: {
    color: 'white',
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  searchCard: {
    margin: 16,
    elevation: 4,
  },
  searchContainer: {
    gap: 16,
  },
  searchTitle: {
    fontWeight: 'bold',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
  },
  selectButton: {
    justifyContent: 'flex-start',
  },
  selectButtonContent: {
    justifyContent: 'flex-start',
  },
  searchButton: {
    marginTop: 8,
  },
  searchButtonContent: {
    paddingVertical: 8,
  },
  results: {
    flex: 1,
  },
  resultsTitle: {
    padding: 16,
    fontWeight: 'bold',
  },
  routeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  routeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routeDetails: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  busCount: {
    marginBottom: 8,
  },
  busPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  busTag: {
    backgroundColor: colors.chipBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noResultsCard: {
    margin: 16,
  },
  noResults: {
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsHint: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  liveMapCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
    elevation: 6,
    backgroundColor: '#fff',
  },
  liveMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveMapTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveMapTitle: {
    fontWeight: 'bold',
    color: colors.text,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  busCountChip: {
    backgroundColor: colors.chipBlue,
  },
  mapDescription: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  openMapButton: {
    marginTop: 8,
  },
  openMapButtonContent: {
    paddingVertical: 8,
  },
  resultsContainer: {
    marginTop: 0,
  },
});

export default HomeScreen;
