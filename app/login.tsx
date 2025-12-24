import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const { login, isLoggingIn } = useAuth();

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleLogin = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Veuillez entrer une adresse email.',
        position: 'bottom'
      });
    }

    try {
      await login(email);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: error.message || 'Une erreur est survenue lors de la connexion.',
        position: 'bottom'
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Main Card */}
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <IconSymbol name="heart" size={48} color="white" />
              </View>
            </View>

            <Text style={styles.title}>Bienvenue</Text>
            <Text style={styles.subtitle}>Connectez-vous à FitsidikaApp</Text>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <IconSymbol name="envelope" size={18} color="#2e7d32" />
                <Text style={styles.label}>Adresse email</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="marie.dubois@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoggingIn || !isEmailValid(email)}
            >
              {isLoggingIn ? (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Connexion</Text>
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Se connecter</Text>
                  <IconSymbol name="arrow.right" size={18} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.legalText}>
              En vous connectant, vous acceptez nos <Text style={styles.link}>conditions d'utilisation</Text> et notre <Text style={styles.link}>politique de confidentialité</Text>.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.tint,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBox: {
    backgroundColor: Colors.light.tint,
    padding: 20,
    borderRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 16,
    color: '#4a4a4a',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: Colors.light.tint,
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  legalText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
    marginBottom: 24,
  },
  link: {
    textDecorationLine: 'none',
  },
  encryptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00c853',
  },
  encryptionText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  banner: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  bannerTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.9,
  },
});
