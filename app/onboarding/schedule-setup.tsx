import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Edit3 } from 'lucide-react-native';
import { STORAGE_KEYS } from '../../src/utils/constants';
import { getApiKey } from '../../src/services/secureStorage';

export default function ScheduleSetupScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
  };

  const handleManualEntry = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const handlePhotoUpload = async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      Alert.alert(
        "API Key Required",
        "You need a Claude API key to use the AI scanning feature. Please add it in Settings or go back.",
        [{ text: "OK" }]
      );
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera roll permissions to upload a schedule.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true, // We need base64 for Claude API
    });

    if (!result.canceled && result.assets[0].base64) {
      await completeOnboarding();
      // Navigate to scan result page with the image data
      // For now we just route to a dummy scan-result page, we'll build it later
      router.push({
        pathname: '/scan-result',
        params: { base64: result.assets[0].base64 }
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t('onboarding.setupTitle')}
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}
          onPress={handlePhotoUpload}
        >
          <View style={[styles.iconBox, { backgroundColor: theme.purple.light + '30' }]}>
            <Camera size={32} color={theme.purple.medium} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
              {t('onboarding.uploadPhoto')}
            </Text>
            <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>
              {t('onboarding.uploadDesc')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}
          onPress={handleManualEntry}
        >
          <View style={[styles.iconBox, { backgroundColor: theme.purple.light + '30' }]}>
            <Edit3 size={32} color={theme.purple.medium} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
              {t('onboarding.enterManually')}
            </Text>
            <Text style={[styles.cardDesc, { color: theme.text.secondary }]}>
              {t('onboarding.manualDesc')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});
