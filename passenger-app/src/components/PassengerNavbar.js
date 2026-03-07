import React, { useState } from 'react';
import { View, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { colors } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

const PassengerNavbar = ({
  navigation,
  title = 'Tamil Nadu State Transport Corporation Ltd.',
  subtitle = 'FLOW - Real-Time Bus Management System',
  showBack = false,
  onBackPress,
  rightIcon = 'home',
  onRightPress,
  showWomenBusToggle = true,
}) => {
  const { preferWomenBuses, toggleWomenBusPreference } = useAuth();
  const [showLogo, setShowLogo] = useState(true);
  const { width } = useWindowDimensions();
  const isCompactHeader = width <= 430;
  const displayTitle = isCompactHeader ? 'Tamil Nadu STC' : title;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    navigation.goBack();
  };

  const handleRight = () => {
    if (onRightPress) {
      onRightPress();
      return;
    }
    navigation.navigate('Home');
  };

  return (
    <Appbar.Header style={[styles.header, isCompactHeader && styles.headerCompact]}>
      {showBack ? (
        <Appbar.BackAction onPress={handleBack} color="white" />
      ) : (
        <View style={[styles.sideSpacer, isCompactHeader && styles.sideSpacerCompact]} />
      )}

      <View style={styles.brandContainer}>
        {showLogo ? (
          <Image
            source={{ uri: '/images/tnstc-logo.png' }}
            style={[styles.logo, isCompactHeader && styles.logoCompact]}
            onError={() => setShowLogo(false)}
          />
        ) : (
          <Text style={[styles.logoFallback, isCompactHeader && styles.logoFallbackCompact]}>BUS</Text>
        )}

        <View style={styles.textBlock}>
          <Text numberOfLines={1} style={[styles.title, isCompactHeader && styles.titleCompact]}>
            {displayTitle}
          </Text>
          {!isCompactHeader && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {showWomenBusToggle && (
        <View style={styles.womenToggleContainer}>
          <Text
            style={[styles.womenToggleLabel, isCompactHeader && styles.womenToggleLabelCompact]}
            numberOfLines={1}
          >
            {isCompactHeader ? 'Pink' : 'Pink Bus'}
          </Text>
          <Appbar.Action
            icon={preferWomenBuses ? 'human-female' : 'bus'}
            onPress={toggleWomenBusPreference}
            accessibilityLabel={preferWomenBuses ? 'Prefer Pink Buses On' : 'Prefer Pink Buses Off'}
            color={preferWomenBuses ? colors.womenBus : 'white'}
            size={isCompactHeader ? 20 : 24}
            style={styles.womenToggleAction}
          />
        </View>
      )}
      <Appbar.Action
        icon={rightIcon}
        onPress={handleRight}
        color="white"
        size={isCompactHeader ? 20 : 24}
        style={isCompactHeader ? styles.rightActionCompact : null}
      />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  headerCompact: {
    height: 54,
    paddingHorizontal: 2,
  },
  sideSpacer: {
    width: 48,
  },
  sideSpacerCompact: {
    width: 40,
  },
  brandContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: 'white',
  },
  logoCompact: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  logoFallback: {
    width: 34,
    textAlign: 'center',
    color: 'white',
    fontWeight: '700',
    marginRight: 10,
    fontSize: 10,
  },
  logoFallbackCompact: {
    width: 28,
    marginRight: 6,
    fontSize: 8,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  titleCompact: {
    fontSize: 11,
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 10,
    marginTop: 1,
  },
  womenToggleAction: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  womenToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  womenToggleLabel: {
    color: 'white',
    fontSize: 10,
    marginRight: 2,
    opacity: 0.95,
  },
  womenToggleLabelCompact: {
    fontSize: 8,
    maxWidth: 52,
    marginRight: 0,
  },
  rightActionCompact: {
    marginHorizontal: 0,
  },
});

export default PassengerNavbar;
