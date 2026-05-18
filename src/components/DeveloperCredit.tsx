import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Briefcase } from 'lucide-react-native';

export const DeveloperCredit = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const openLinkedIn = () => {
    Linking.openURL('https://www.linkedin.com/in/arda-mecik/');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
        {t('settings.developer')}
      </Text>
      
      <TouchableOpacity 
        style={[
          styles.creditCard, 
          { 
            backgroundColor: theme.card.background,
            borderColor: theme.purple.medium,
            shadowColor: theme.glow ? theme.purple.medium : '#000',
          }
        ]}
        onPress={openLinkedIn}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.creditTitle, { color: theme.text.primary }]}>
            👨‍💻 {t('developer.madeBy')}
          </Text>
        </View>
        
        <Text style={[styles.developerName, { color: theme.purple.medium }]}>
          Arda Meçik
        </Text>
        
        <View style={styles.linkedInButton}>
          <Briefcase size={18} color={theme.purple.medium} style={{ marginRight: 8 }} />
          <Text style={[styles.linkedInText, { color: theme.text.secondary }]}>
            {t('developer.viewLinkedIn')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  creditCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardHeader: {
    marginBottom: 4,
  },
  creditTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  developerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  linkedInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  linkedInText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
