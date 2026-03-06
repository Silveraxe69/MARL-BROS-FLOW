import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { colors } from '../utils/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Navigation is handled automatically by App.js based on auth state
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <Text variant="displaySmall" style={styles.title}>
              🚌 FLOW Passenger Portal
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
              Tamil Nadu State Transport Corporation Ltd.
            </Text>
            <Text variant="bodySmall" style={styles.governmentText}>
              A Government of Tamil Nadu Undertaking
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <Surface style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </Surface>
            ) : null}

            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              contentStyle={styles.buttonContent}
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodySmall" style={styles.demoText}>
              Demo Credentials:
            </Text>
            <Text variant="bodySmall" style={styles.demoText}>
              Email: passenger@test.com | Password: test123
            </Text>
            <Text variant="bodySmall" style={styles.demoText}>
              Email: anitha@smartbus.com | Password: password123
            </Text>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 32,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  governmentText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default LoginScreen;
