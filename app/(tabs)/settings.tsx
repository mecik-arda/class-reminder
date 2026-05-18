import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe, Moon, Bell, Trash2, KeyRound } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useSchedule } from '../../src/contexts/ScheduleContext';
import { DeveloperCredit } from '../../src/components/DeveloperCredit';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '../../src/utils/constants';
import { scheduleClassNotifications } from '../../src/services/notifications';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { clearSchedule, classes } = useSchedule();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState(DEFAULT_PREFERENCES.NOTIFICATION_TIME);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    const time = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TIME);
    
    if (enabled !== null) setNotificationsEnabled(enabled === 'true');
    if (time !== null) setNotificationTime(parseInt(time, 10));
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, value.toString());
    // Reschedule
    scheduleClassNotifications(classes, language);
  };

  const cycleNotificationTime = async () => {
    const times = [5, 10, 15, 20, 30];
    const currentIndex = times.indexOf(notificationTime);
    const nextTime = times[(currentIndex + 1) % times.length];
    
    setNotificationTime(nextTime);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TIME, nextTime.toString());
    scheduleClassNotifications(classes, language);
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'tr' ? 'en' : 'tr');
    scheduleClassNotifications(classes, language === 'tr' ? 'en' : 'tr'); // Update notification texts
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const handleDeleteSchedule = () => {
    Alert.alert(
      t('settings.deleteSchedule'),
      t('settings.deleteScheduleConfirm'),
      [
        { text: t('class.cancel'), style: 'cancel' },
        { 
          text: t('class.delete'), 
          style: 'destructive',
          onPress: async () => {
            await clearSchedule();
            scheduleClassNotifications([], language);
            Alert.alert("Success", "Schedule cleared.");
          }
        }
      ]
    );
  };

  const SettingsRow = ({ icon: Icon, title, value, onPress, isSwitch, switchValue, onSwitchChange, isDestructive }: any) => (
    <TouchableOpacity 
      style={[styles.row, { borderBottomColor: theme.card.border }]} 
      onPress={onPress}
      disabled={isSwitch || !onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: isDestructive ? '#FEE2E2' : theme.purple.light + '20' }]}>
        <Icon size={20} color={isDestructive ? '#EF4444' : theme.purple.medium} />
      </View>
      <Text style={[styles.rowTitle, { color: isDestructive ? '#EF4444' : theme.text.primary }]}>
        {title}
      </Text>
      {value && !isSwitch && (
        <Text style={[styles.rowValue, { color: theme.text.secondary }]}>{value}</Text>
      )}
      {isSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.card.border, true: theme.purple.medium }}
          thumbColor={'#FFFFFF'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
          <SettingsRow 
            icon={Globe} 
            title={t('settings.language')} 
            value={language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'} 
            onPress={toggleLanguage}
          />
          <SettingsRow 
            icon={Moon} 
            title={t('settings.theme')} 
            value={themeMode === 'dark' ? t('settings.darkMode') : t('settings.lightMode')} 
            onPress={toggleTheme}
          />
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
          <SettingsRow 
            icon={Bell} 
            title={t('settings.notifications')} 
            isSwitch 
            switchValue={notificationsEnabled}
            onSwitchChange={toggleNotifications}
          />
          {notificationsEnabled && (
            <SettingsRow 
              icon={Bell} 
              title={t('settings.notificationTime')} 
              value={t('settings.minutesBefore', { minutes: notificationTime })} 
              onPress={cycleNotificationTime}
            />
          )}
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
          <SettingsRow 
            icon={Trash2} 
            title={t('settings.deleteSchedule')} 
            onPress={handleDeleteSchedule}
            isDestructive
          />
        </View>

        <DeveloperCredit />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for tabs
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 16,
  },
});
