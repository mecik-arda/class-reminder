import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun } from 'lucide-react-native';
import { ThemeMode } from '../../src/types';

export default function ThemeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, themeMode, setThemeMode } = useTheme();

  const handleSelect = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    router.push('/onboarding/api-key');
  };

  const ThemeOption = ({ mode, label, icon: Icon }: { mode: ThemeMode; label: string; icon: any }) => {
    const isSelected = themeMode === mode;
    
    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          { 
            backgroundColor: theme.card.background,
            borderColor: isSelected ? theme.purple.medium : theme.card.border,
            borderWidth: isSelected ? 2 : 1,
            shadowColor: isSelected && theme.glow ? theme.purple.medium : 'transparent'
          }
        ]}
        onPress={() => handleSelect(mode)}
      >
        <Icon size={32} color={isSelected ? theme.purple.medium : theme.text.secondary} />
        <Text style={[styles.optionLabel, { color: theme.text.primary }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Moon size={32} color={theme.purple.medium} />
          <Sun size={32} color={theme.purple.medium} style={{ marginLeft: -10 }} />
        </View>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t('onboarding.selectTheme')}
        </Text>
      </View>

      <View style={styles.content}>
        <ThemeOption mode="dark" label={t('settings.darkMode')} icon={Moon} />
        <ThemeOption mode="light" label={t('settings.lightMode')} icon={Sun} />
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
    alignItems: 'center',
    marginTop: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
});
