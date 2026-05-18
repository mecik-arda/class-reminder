import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { STORAGE_KEYS } from '../src/utils/constants';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      if (value === 'true') {
        setHasSeenOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background.primary }}>
        <ActivityIndicator size="large" color={theme.purple.medium} />
      </View>
    );
  }

  if (hasSeenOnboarding) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/onboarding/welcome" />;
  }
}
