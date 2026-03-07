import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Chip } from 'react-native-paper';
import LiveMapLeaflet from '../components/LiveMapLeaflet';
import socketService from '../services/socket';
import { colors } from '../utils/theme';
import { loadMultipleCSV } from '../utils/csvParser';
import PassengerNavbar from '../components/PassengerNavbar';

const LiveMapScreen = ({ navigation, route }) => {
  const NEARBY_BUS_LIMIT = 5;
  const [busLocations, setBusLocations] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeMarkers, setRouteMarkers] = useState([]);

  const filterRouteIds = route?.params?.filterRouteIds || [];
  const filterBusIds = route?.params?.filterBusIds || [];
  const fromStopId = route?.params?.fromStopId;
  const toStopId = route?.params?.toStopId;
  const fromStopName = route?.params?.fromStopName;
  const toStopName = route?.params?.toStopName;

  const hasFilter =
    filterRouteIds.length > 0 ||
    filterBusIds.length > 0 ||
    (fromStopId && toStopId);

  const normalizeId = (value) => String(value || '').trim();

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  };

  const getNearbyBuses = (buses, stopData) => {
    const startStop = stopData.find((stop) => normalizeId(stop.stop_id) === normalizeId(fromStopId));
    const destinationStop = stopData.find((stop) => normalizeId(stop.stop_id) === normalizeId(toStopId));

    const references = [startStop, destinationStop]
      .filter(Boolean)
      .map((stop) => ({
        latitude: toNumber(stop.latitude),
        longitude: toNumber(stop.longitude),
      }))
      .filter((point) => point.latitude !== null && point.longitude !== null);

    // If no valid stop coordinates are available, keep the first few filtered buses.
    if (references.length === 0) {
      return buses.slice(0, NEARBY_BUS_LIMIT);
    }

    const enriched = buses
      .map((bus) => {
        const busLat = toNumber(bus.latitude);
        const busLon = toNumber(bus.longitude);
        if (busLat === null || busLon === null) {
          return null;
        }

        const minDistanceKm = Math.min(
          ...references.map((ref) => haversineKm(busLat, busLon, ref.latitude, ref.longitude))
        );

        return {
          ...bus,
          nearestDistanceKm: minDistanceKm,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.nearestDistanceKm - b.nearestDistanceKm);

    return enriched.slice(0, NEARBY_BUS_LIMIT);
  };

  const getStopOrder = (sequence) => {
    const raw = sequence?.stop_order ?? sequence?.stop_sequence ?? '0';
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const routeConnectsStops = (routeId, startId, destinationId, sequences) => {
    const routeStops = sequences
      .filter((seq) => normalizeId(seq.route_id) === routeId)
      .sort((a, b) => getStopOrder(a) - getStopOrder(b));

    const startIndex = routeStops.findIndex((seq) => normalizeId(seq.stop_id) === startId);
    const destinationIndex = routeStops.findIndex((seq) => normalizeId(seq.stop_id) === destinationId);

    return startIndex !== -1 && destinationIndex !== -1 && startIndex < destinationIndex;
  };

  const loadAllData = useCallback(async () => {
    try {
      const data = await loadMultipleCSV([
        'live_bus_location.csv',
        'bus_stops.csv',
        'buses.csv',
        'bus_stop_sequence.csv',
        'routes.csv',
      ]);
      
      const locations = data.live_bus_location || [];
      const stops = data.bus_stops || [];
      const buses = data.buses || [];
      const sequences = data.bus_stop_sequence || [];
      const routes = data.routes || [];

      const normalizedRouteIds = [...new Set(filterRouteIds.map(normalizeId).filter(Boolean))];
      const normalizedBusIds = [...new Set(filterBusIds.map(normalizeId).filter(Boolean))];

      let validRouteIds = normalizedRouteIds;
      const normalizedFromStopId = normalizeId(fromStopId);
      const normalizedToStopId = normalizeId(toStopId);

      if (normalizedFromStopId && normalizedToStopId) {
        const routeUniverse =
          normalizedRouteIds.length > 0
            ? normalizedRouteIds
            : [...new Set(sequences.map((seq) => normalizeId(seq.route_id)).filter(Boolean))];

        validRouteIds = routeUniverse.filter((routeId) =>
          routeConnectsStops(routeId, normalizedFromStopId, normalizedToStopId, sequences)
        );
      }
      
      // Merge bus data with location data
      const busesWithLocation = locations.map(location => {
        const bus = buses.find(b => b.bus_id === location.bus_id);
        return {
          ...bus,
          ...location,
        };
      });

      const filteredBuses = hasFilter
        ? busesWithLocation.filter((bus) => {
            const busId = normalizeId(bus.bus_id);
            const routeId = normalizeId(bus.route_id);

            if (normalizedBusIds.length > 0 && normalizedBusIds.includes(busId)) {
              return true;
            }
            if (validRouteIds.length > 0 && validRouteIds.includes(routeId)) {
              return true;
            }
            return false;
          })
        : busesWithLocation;

      const selectedRoutes =
        validRouteIds.length > 0
          ? routes.filter((routeItem) => validRouteIds.includes(normalizeId(routeItem.route_id)))
          : normalizedRouteIds.length > 0
          ? routes.filter((routeItem) => normalizedRouteIds.includes(normalizeId(routeItem.route_id)))
          : routes;

      const nearbyBuses = hasFilter ? getNearbyBuses(filteredBuses, stops) : filteredBuses;

      setBusLocations(nearbyBuses);
      setStops(stops);
      setRouteMarkers(selectedRoutes);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [hasFilter, filterBusIds, filterRouteIds, fromStopId, toStopId]);

  useEffect(() => {
    // Load data from public folder
    loadAllData();

    // Connect to socket for real-time updates
    socketService.connect();
    socketService.onBusLocationUpdate(handleBusLocationUpdate);

    return () => {
      socketService.off('busLocationUpdate', handleBusLocationUpdate);
    };
  }, [loadAllData]);



  const handleBusLocationUpdate = (data) => {
    // Update specific bus location
    setBusLocations(prev => {
      if (hasFilter) {
        const normalizedRouteIds = [...new Set(filterRouteIds.map(normalizeId).filter(Boolean))];
        const normalizedBusIds = [...new Set(filterBusIds.map(normalizeId).filter(Boolean))];
        const matchesRoute = normalizedRouteIds.length > 0 && normalizedRouteIds.includes(normalizeId(data.route_id));
        const matchesBus = normalizedBusIds.length > 0 && normalizedBusIds.includes(normalizeId(data.bus_id));
        if (!matchesRoute && !matchesBus) {
          return prev;
        }
      }

      const index = prev.findIndex(b => b.bus_id === data.bus_id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...data };
        return hasFilter ? getNearbyBuses(updated, stops) : updated;
      }
      const next = [...prev, data];
      return hasFilter ? getNearbyBuses(next, stops) : next;
    });
  };

  return (
    <View style={styles.container}>
      <PassengerNavbar
        navigation={navigation}
        showBack
        onBackPress={() => navigation.navigate('Home')}
        rightIcon="refresh"
        onRightPress={loadAllData}
      />

      {hasFilter ? (
        <View style={styles.contextBar}>
          <Text variant="bodySmall" style={styles.contextText}>
            Showing route map for: {fromStopName || 'Selected Start'} to {toStopName || 'Selected Destination'}
          </Text>
          <Chip compact style={styles.contextChip}>{routeMarkers.length} routes</Chip>
          <Chip compact style={styles.contextChip}>{busLocations.length} nearby buses</Chip>
        </View>
      ) : null}

      {busLocations.length > 0 || routeMarkers.length > 0 ? (
        <LiveMapLeaflet 
          buses={busLocations}
          stops={stops}
          routes={routeMarkers}
          height="100%"
        />
      ) : hasFilter ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No routes found for the selected points.</Text>
        </View>
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
  contextBar: {
    backgroundColor: '#E3F2FD',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  contextText: {
    color: colors.textPrimary,
    flex: 1,
  },
  contextChip: {
    backgroundColor: colors.chipBlue,
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
