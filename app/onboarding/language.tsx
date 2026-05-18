import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe } from 'lucide-react-native';
import { LanguageCode } from '../../src/types';

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language, changeLanguage } = useLanguage();

  const handleSelect = async (code: LanguageCode) => {
    await changeLanguage(code);
    router.push('/onboarding/theme');
  };

  const LanguageOption = ({ code, label, flag }: { code: LanguageCode; label: string; flag: string }) => {
    const isSelected = language === code;
    
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
        onPress={() => handleSelect(code)}
      >
        <Text style={styles.flag}>{flag}</Text>
        <Text style={[styles.optionLabel, { color: theme.text.primary }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Globe size={48} color={theme.purple.medium} style={styles.icon} />
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t('onboarding.selectLanguage')}
        </Text>
      </View>

      <View style={styles.content}>
        <LanguageOption code="tr" label="Türkçe" flag="🇹🇷" />
        <LanguageOption code="en" label="English" flag="🇬🇧" />
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
  icon: {
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
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});
