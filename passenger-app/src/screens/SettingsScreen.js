import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Button, Divider, Text, Card } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/theme';
import PassengerNavbar from '../components/PassengerNavbar';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Navigation handled automatically by App.js
  };

  return (
    <View style={styles.container}>
      <PassengerNavbar
        navigation={navigation}
        showBack
        onBackPress={() => navigation.navigate('Home')}
        subtitle="FLOW - Passenger Settings"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Profile Section */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text variant="headlineMedium" style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text variant="titleLarge" style={styles.userName}>
                  {user?.name || 'Passenger'}
                </Text>
                <Text variant="bodyMedium" style={styles.userEmail}>
                  {user?.email || 'Not provided'}
                </Text>
                {user?.phone_number && (
                  <Text variant="bodySmall" style={styles.userPhone}>
                    📱 {user.phone_number}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* About Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            About
          </Text>
          
          <Card style={styles.card}>
            <List.Item
              title="App Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              left={props => <List.Icon {...props} icon="file-document" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="shield-check" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </Card>
        </View>

        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          icon="logout"
          textColor={colors.error}
        >
          Logout
        </Button>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Flow Bus System © 2026
          </Text>
        </View>
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
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  userEmail: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 32,
    borderColor: colors.error,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textHint,
  },
});

export default SettingsScreen;
