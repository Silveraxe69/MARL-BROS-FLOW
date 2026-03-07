import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { colors } from '../utils/theme';

const CrowdIndicator = ({ level, compact = false }) => {
  const getCrowdConfig = (crowdLevel) => {
    switch (crowdLevel) {
      case 'Low':
        return {
          color: colors.crowdLow,
          icon: 'account-outline',
          label: 'Low Crowd',
          bgColor: colors.crowdLowBg,
        };
      case 'Medium':
        return {
          color: colors.crowdMedium,
          icon: 'account-multiple-outline',
          label: 'Medium Crowd',
          bgColor: colors.crowdMediumBg,
        };
      case 'Full':
        return {
          color: colors.crowdFull,
          icon: 'account-multiple',
          label: 'Full',
          bgColor: colors.crowdFullBg,
        };
      default:
        return {
          color: colors.textDisabled,
          icon: 'help-circle-outline',
          label: 'Unknown',
          bgColor: colors.background,
        };
    }
  };

  const config = getCrowdConfig(level);

  if (compact) {
    return (
      <Chip
        icon={config.icon}
        style={[styles.compactChip, { backgroundColor: config.bgColor }]}
        textStyle={[styles.compactText, { color: config.color }]}
      >
        {level}
      </Chip>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={[styles.indicator, { backgroundColor: config.color }]} />
      <View style={styles.textContainer}>
        <Text variant="bodyMedium" style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
        <Text variant="bodySmall" style={styles.description}>
          Current occupancy level
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: colors.textSecondary,
  },
  compactChip: {
    height: 28,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default React.memo(CrowdIndicator);
