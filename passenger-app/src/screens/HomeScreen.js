import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Easing, Modal, Pressable } from 'react-native';
import { Button, Text, Card, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/theme';
import { loadMultipleCSV } from '../utils/csvParser';
import PassengerNavbar from '../components/PassengerNavbar';

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
  const [isVoiceAssistantVisible, setIsVoiceAssistantVisible] = useState(false);
  const micPulseValue = useRef(new Animated.Value(0)).current;

  // Load data from public folder on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (!isVoiceAssistantVisible) {
      micPulseValue.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(micPulseValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [isVoiceAssistantVisible, micPulseValue]);

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

    const normalizeId = (value) => String(value || '').trim();
    const fromId = normalizeId(fromStopId);
    const toId = normalizeId(toStopId);

    const getStopOrder = (sequence) => {
      const raw = sequence?.stop_order ?? sequence?.stop_sequence ?? '0';
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    // Get all unique route IDs
    const allRouteIds = [...new Set(busStopSequenceData.map(seq => normalizeId(seq.route_id)).filter(Boolean))];

    allRouteIds.forEach(routeId => {
      const routeStops = busStopSequenceData
        .filter(seq => normalizeId(seq.route_id) === routeId)
        .sort((a, b) => getStopOrder(a) - getStopOrder(b));

      const fromIndex = routeStops.findIndex(s => normalizeId(s.stop_id) === fromId);
      const toIndex = routeStops.findIndex(s => normalizeId(s.stop_id) === toId);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        const route = routesData.find(r => normalizeId(r.route_id) === routeId);
        const busesOnRoute = busesData.filter((b) => {
          if (normalizeId(b.route_id) !== routeId) return false;
          const status = String(b.status || '').toLowerCase();
          return status !== 'stopped';
        });

        // Sort buses - women buses first if preference is enabled
        let sortedBuses = busesOnRoute;
        if (preferWomenBuses) {
          sortedBuses = [
            ...busesOnRoute.filter(b => b.women_bus === 'Yes'),
            ...busesOnRoute.filter(b => b.women_bus === 'No'),
          ];
        }

        results.push({
          routeId,
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

    if (foundRoutes.length === 0) {
      alert('No buses found for the selected start and destination points');
      return;
    }

    const routeIds = [...new Set(foundRoutes.map(r => r.routeId).filter(Boolean))];
    const busIdsFromRoutes = foundRoutes
      .flatMap(r => r.buses || [])
      .map(bus => bus.bus_id)
      .filter(Boolean);

    const busIdsFromLiveLocation = liveBusLocations
      .filter((bus) => routeIds.includes(bus.route_id))
      .map((bus) => bus.bus_id)
      .filter(Boolean);

    const busIds = [...new Set([...busIdsFromRoutes, ...busIdsFromLiveLocation])];

    navigation.navigate('LiveMap', {
      filterRouteIds: routeIds,
      filterBusIds: busIds,
      fromStopId: fromStop.stop_id,
      toStopId: toStop.stop_id,
      fromStopName: fromStop.stop_name,
      toStopName: toStop.stop_name,
    });
  }, [fromStop, toStop, findConnectingRoutes, liveBusLocations, navigation]);

  return (
    <View style={styles.container}>
      <PassengerNavbar
        navigation={navigation}
        rightIcon="account-circle"
        onRightPress={() => navigation.navigate('Settings')}
      />

      <View style={styles.welcomeStrip}>
        <Text variant="titleMedium" style={styles.greeting}>
          Hello, {user?.name || 'Passenger'}
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Where would you like to go today?
        </Text>
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

        <Card style={styles.voiceAssistantCard}>
          <Card.Content>
            <View style={styles.voiceAssistantHeader}>
              <View style={styles.voiceAssistantTitleRow}>
                <Text variant="titleLarge" style={styles.voiceAssistantTitle}>
                  Voice Route Assistant
                </Text>
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.voiceAssistantDescription}>
              Speak your start and destination stops for guided route planning.
            </Text>

            <Button
              mode="contained"
              icon="microphone"
              style={styles.openVoiceButton}
              contentStyle={styles.openVoiceButtonContent}
              onPress={() => setIsVoiceAssistantVisible(true)}
            >
              Open Voice Assistant
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.aiRouteMiniCard}>
          <Card.Content style={styles.aiRouteMiniContent}>
            <Text variant="bodySmall" style={styles.aiRouteMiniLabel}>
              Need alternate route suggestions?
            </Text>
            <Button
              mode="outlined"
              compact
              icon="creation"
              style={styles.openAiMiniButton}
              contentStyle={styles.openAiMiniButtonContent}
              onPress={() => navigation.navigate('RouteRecommendation')}
            >
              AI Route Assistant
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isVoiceAssistantVisible}
        onRequestClose={() => setIsVoiceAssistantVisible(false)}
      >
        <View style={styles.voiceOverlay}>
          <View style={styles.voiceCard}>
            <View style={styles.voiceTopStripe} />
            <Text variant="titleLarge" style={styles.voiceTitle}>Bus Voice Assistant</Text>
            <Text variant="bodyMedium" style={styles.voiceSubtitle}>
              Listening for your Start and Destination...
            </Text>

            <View style={styles.voiceMicWrap}>
              <Animated.View
                style={[
                  styles.voicePulseRing,
                  {
                    transform: [
                      {
                        scale: micPulseValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.7],
                        }),
                      },
                    ],
                    opacity: micPulseValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 0],
                    }),
                  },
                ]}
              />
              <View style={styles.voiceMicCore}>
                <IconButton
                  icon="microphone"
                  size={36}
                  iconColor={colors.paper}
                  style={styles.voiceMicIcon}
                />
              </View>
            </View>

            <View style={styles.voiceInfoCard}>
              <Text variant="bodySmall" style={styles.voiceInfoLabel}>START</Text>
              <Text variant="bodyMedium" style={styles.voiceInfoValue}>
                {fromStop?.stop_name || 'Awaiting spoken Start'}
              </Text>
              <Text variant="bodySmall" style={styles.voiceInfoLabel}>DESTINATION</Text>
              <Text variant="bodyMedium" style={styles.voiceInfoValue}>
                {toStop?.stop_name || 'Awaiting spoken Destination'}
              </Text>
            </View>

            <View style={styles.voiceSelectionRow}>
              <Button
                mode="outlined"
                compact
                style={styles.voiceActionButton}
                onPress={() => {
                  setIsVoiceAssistantVisible(false);
                  navigation.navigate('StopSelection', {
                    onSelect: (stop) => setFromStop(stop),
                    title: 'Select Starting Stop',
                  });
                }}
              >
                Set Start
              </Button>
              <Button
                mode="outlined"
                compact
                style={styles.voiceActionButton}
                onPress={() => {
                  setIsVoiceAssistantVisible(false);
                  navigation.navigate('StopSelection', {
                    onSelect: (stop) => setToStop(stop),
                    title: 'Select Destination Stop',
                  });
                }}
              >
                Set Destination
              </Button>
            </View>

            <Pressable
              style={styles.voiceCloseButton}
              onPress={() => setIsVoiceAssistantVisible(false)}
            >
              <Text variant="labelLarge" style={styles.voiceCloseText}>Close Assistant</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexShrink: 0,
  },
  welcomeStrip: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  greeting: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
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
  resultsContainer: {
    marginTop: 0,
  },
  aiRouteCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.chipBlue,
  },
  aiRouteHeader: {
    marginBottom: 10,
  },
  aiRouteTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiRouteTitle: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  aiDescription: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  openAiButton: {
    marginTop: 0,
  },
  openAiButtonContent: {
    paddingVertical: 8,
  },
  aiRouteMiniCard: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiRouteMiniContent: {
    paddingVertical: 10,
  },
  aiRouteMiniLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  openAiMiniButton: {
    alignSelf: 'flex-start',
    borderColor: colors.primary,
  },
  openAiMiniButtonContent: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  voiceAssistantCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    elevation: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  voiceAssistantHeader: {
    marginBottom: 10,
  },
  voiceAssistantTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceAssistantTitle: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  voiceAssistantDescription: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  openVoiceButton: {
    marginTop: 0,
    backgroundColor: colors.primaryDark,
  },
  openVoiceButtonContent: {
    paddingVertical: 8,
  },
  voiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  voiceCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  voiceTopStripe: {
    height: 8,
    marginHorizontal: -20,
    marginBottom: 16,
    backgroundColor: colors.warning,
  },
  voiceTitle: {
    color: colors.primaryDark,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  voiceSubtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  voiceMicWrap: {
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  voicePulseRing: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: colors.info,
  },
  voiceMicCore: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceMicIcon: {
    margin: 0,
  },
  voiceInfoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.chipBlue,
    padding: 12,
    gap: 4,
  },
  voiceInfoLabel: {
    color: colors.primaryDark,
    fontWeight: 'bold',
    marginTop: 4,
  },
  voiceInfoValue: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  voiceSelectionRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
  voiceActionButton: {
    flex: 1,
    borderColor: colors.primary,
  },
  voiceCloseButton: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  voiceCloseText: {
    color: colors.paper,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
