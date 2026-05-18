import { Stack } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function OnboardingLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background.primary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="language" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="api-key" />
      <Stack.Screen name="schedule-setup" />
    </Stack>
  );
}
