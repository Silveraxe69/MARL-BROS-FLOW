import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import CrowdIndicator from './CrowdIndicator';
import { formatETA } from '../utils/etaCalculator';
import { colors } from '../utils/theme';

const getBusColor = (colorCode) => {
  const colorMap = {
    'PINK': '#FF69B4',
    'YELLOW_BLACK': '#FFD700',
    'BLUE_GREY': '#607D8B',
    'RED': '#F44336',
    'WHITE': '#FFFFFF',
  };
  return colorMap[colorCode] || '#9E9E9E';
};

const BusCard = ({ bus, eta, crowdLevel, onPress }) => {

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.busInfo}>
            <View 
              style={[
                styles.colorIndicator, 
                { backgroundColor: getBusColor(bus.bus_color) }
              ]} 
            />
            <View>
              <Text variant="titleMedium" style={styles.busId}>
                {bus.bus_id}
              </Text>
              <Text variant="bodySmall" style={styles.serviceType}>
                {bus.service_type}
              </Text>
            </View>
          </View>
          
          {eta !== undefined && (
            <View style={styles.etaContainer}>
              <Text variant="headlineSmall" style={styles.etaText}>
                {formatETA(eta)}
              </Text>
              <Text variant="bodySmall" style={styles.etaLabel}>ETA</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {bus.women_bus === 'Yes' && (
            <Chip 
              icon="human-female" 
              style={styles.womenChip}
              textStyle={styles.chipText}
            >
              Women Bus
            </Chip>
          )}
          
          {bus.accessible === 'Yes' && (
            <Chip 
              icon="wheelchair-accessibility" 
              style={styles.accessibleChip}
              textStyle={styles.chipText}
            >
              Accessible
            </Chip>
          )}
          
          {crowdLevel && (
            <CrowdIndicator level={crowdLevel} compact />
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  busId: {
    fontWeight: 'bold',
  },
  serviceType: {
    color: colors.textSecondary,
  },
  etaContainer: {
    alignItems: 'center',
  },
  etaText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  etaLabel: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  womenChip: {
    backgroundColor: colors.womenBusLight,
  },
  accessibleChip: {
    backgroundColor: colors.chipBlue,
  },
  chipText: {
    fontSize: 11,
  },
});

export default React.memo(BusCard);
