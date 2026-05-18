import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { KeyRound } from 'lucide-react-native';
import { saveApiKey } from '../../src/services/secureStorage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApiKeyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState('');

  const handleSave = async () => {
    if (apiKey.trim().length > 0) {
      await saveApiKey(apiKey.trim());
    }
    router.push('/onboarding/schedule-setup');
  };

  const handleSkip = () => {
    router.push('/onboarding/schedule-setup');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.card.background, shadowColor: theme.purple.medium }]}>
              <KeyRound size={48} color={theme.purple.medium} />
            </View>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              {t('onboarding.apiKeyTitle')}
            </Text>
            <Text style={[styles.description, { color: theme.text.secondary }]}>
              {t('onboarding.apiKeyDesc')}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.card.background,
                  color: theme.text.primary,
                  borderColor: theme.card.border
                }
              ]}
              placeholder={t('onboarding.apiKeyPlaceholder')}
              placeholderTextColor={theme.text.tertiary}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: apiKey.trim() ? theme.purple.medium : theme.card.border }
              ]}
              onPress={handleSave}
              disabled={!apiKey.trim()}
            >
              <Text style={styles.buttonText}>{t('onboarding.continue')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={[styles.skipButtonText, { color: theme.text.tertiary }]}>
                {t('onboarding.skipForNow')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 40,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
