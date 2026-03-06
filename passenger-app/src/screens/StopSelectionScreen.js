import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Appbar, Searchbar, List, Divider } from 'react-native-paper';
import { colors } from '../utils/theme';
import { loadCSV } from '../utils/csvParser';

const StopSelectionScreen = ({ route, navigation }) => {
  const { onSelect, title = 'Select Stop' } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [busStopsData, setBusStopsData] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);

  useEffect(() => {
    loadBusStops();
  }, []);

  const loadBusStops = async () => {
    try {
      const data = await loadCSV('bus_stops.csv');
      setBusStopsData(data);
      setFilteredStops(data);
    } catch (error) {
      console.error('Error loading bus stops:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredStops(busStopsData);
      return;
    }

    const filtered = busStopsData.filter(stop =>
      stop.stop_name.toLowerCase().includes(query.toLowerCase()) ||
      stop.city.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStops(filtered);
  };

  const handleSelectStop = (stop) => {
    if (onSelect) {
      onSelect(stop);
    }
    navigation.goBack();
  };

  const renderStopItem = ({ item }) => (
    <>
      <List.Item
        title={item.stop_name}
        description={item.city}
        left={props => <List.Icon {...props} icon="map-marker" />}
        right={props => <List.Icon {...props} icon="chevron-right" />}
        onPress={() => handleSelectStop(item)}
      />
      <Divider />
    </>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title} />
      </Appbar.Header>

      <Searchbar
        placeholder="Search stops..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredStops}
        renderItem={renderStopItem}
        keyExtractor={item => item.stop_id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    flex: 1,
  },
});

export default StopSelectionScreen;
