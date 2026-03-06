import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Text, ActivityIndicator, Button } from 'react-native-paper';
import BusCard from '../components/BusCard';
import { getNextBusesAtStop } from '../utils/etaCalculator';
import { colors } from '../utils/theme';
import { loadMultipleCSV } from '../utils/csvParser';

const BusStopScreen = ({ route, navigation }) => {
  const { stopId } = route.params || {};
  const [stop, setStop] = useState(null);
  const [nextBuses, setNextBuses] = useState([]);
  const [busEtaData, setBusEtaData] = useState([]);
  const [busStopsData, setBusStopsData] = useState([]);
  const [crowdStatusData, setCrowdStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await loadMultipleCSV([
        'bus_eta.csv',
        'bus_stops.csv',
        'crowd_status.csv'
      ]);
      setBusEtaData(data.bus_eta || []);
      setBusStopsData(data.bus_stops || []);
      setCrowdStatusData(data.crowd_status || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load bus data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (stopId && busStopsData.length > 0 && busEtaData.length > 0) {
      loadStopData(stopId);
    }
  }, [stopId, busStopsData, busEtaData]);

  const loadStopData = (id) => {
    const stopData = busStopsData.find(s => s.stop_id === id);
    setStop(stopData);

    if (stopData) {
      const buses = getNextBusesAtStop(id, busEtaData, []);
      setNextBuses(buses);
    }
  };

  const getCrowdLevel = useCallback((busId) => {
    const crowd = crowdStatusData.find(c => c.bus_id === busId);
    return crowd?.crowd_level;
  }, [crowdStatusData]);

  const renderBusCard = useCallback(({ item }) => (
    <BusCard
      bus={item}
      eta={item.eta_minutes}
      crowdLevel={getCrowdLevel(item.bus_id)}
    />
  ), [getCrowdLevel]);

  if (!stop) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbarHeader}>
          <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
          <Appbar.Content title="Bus Stop" />
          <Appbar.Action icon="home" onPress={() => navigation.navigate('Home')} />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>Stop not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbarHeader}>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title={stop.stop_name} subtitle={stop.city} />
        <Appbar.Action icon="home" onPress={() => navigation.navigate('Home')} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bus information...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={loadAllData} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Next Buses
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {nextBuses.length} buses arriving soon
            </Text>
          </View>

          <FlatList
            data={nextBuses}
            renderItem={renderBusCard}
            keyExtractor={(item, index) => `${item.bus_id}-${index}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text variant="bodyLarge">No buses scheduled</Text>
                <Text variant="bodySmall" style={styles.emptyHint}>
                  Check back later or try a different stop
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appbarHeader: {
    backgroundColor: colors.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingVertical: 8,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyHint: {
    color: colors.textHint,
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
});

export default BusStopScreen;
