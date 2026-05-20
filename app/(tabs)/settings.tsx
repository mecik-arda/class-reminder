import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Globe, Moon, Bell, Trash2, KeyRound, Camera, LayoutGrid, VolumeX, CalendarDays } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useSchedule } from '../../src/contexts/ScheduleContext';
import { DeveloperCredit } from '../../src/components/DeveloperCredit';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '../../src/utils/constants';
import { scheduleClassNotifications } from '../../src/services/notifications';
import { getApiKey } from '../../src/services/secureStorage';
import { requestCalendarPermissions, getWritableCalendars, syncToCalendar } from '../../src/services/calendarSync';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { clearSchedule, classes } = useSchedule();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState(DEFAULT_PREFERENCES.NOTIFICATION_TIME);
  const [useGridView, setUseGridView] = useState(DEFAULT_PREFERENCES.USE_GRID_VIEW);
  const [classModeType, setClassModeType] = useState(DEFAULT_PREFERENCES.CLASS_MODE_TYPE);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    const time = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TIME);
    const grid = await AsyncStorage.getItem(STORAGE_KEYS.USE_GRID_VIEW);
    const classMode = await AsyncStorage.getItem(STORAGE_KEYS.CLASS_MODE_TYPE);
    
    if (enabled !== null) setNotificationsEnabled(enabled === 'true');
    if (time !== null) setNotificationTime(parseInt(time, 10));
    if (grid !== null) setUseGridView(grid === 'true');
    if (classMode !== null) setClassModeType(classMode as any);
  };

  const toggleGridView = async (value: boolean) => {
    setUseGridView(value);
    await AsyncStorage.setItem(STORAGE_KEYS.USE_GRID_VIEW, value.toString());
  };

  const cycleClassMode = async () => {
    const modes = ['none', 'notification', 'settings'] as const;
    const currentIndex = modes.indexOf(classModeType);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    setClassModeType(nextMode);
    await AsyncStorage.setItem(STORAGE_KEYS.CLASS_MODE_TYPE, nextMode);
    scheduleClassNotifications(classes, language);
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

  const handleUpdateApiKey = () => {
    router.push({
      pathname: '/onboarding/api-key',
      params: { from: 'settings' }
    });
  };

  const handleFileUpload = async () => {
    const apiKey = await getApiKey();
    if (!apiKey) {
      Alert.alert(
        "API Key Required",
        "You need a Gemini API key to use the AI scanning feature. Please add it first.",
        [{ text: "OK", onPress: handleUpdateApiKey }]
      );
      return;
    }

    Alert.alert(
      "Upload Schedule",
      "Choose the format of your schedule (Image or PDF)",
      [
        {
          text: "Photo (Gallery)",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission Required", "Camera roll permissions are needed.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              router.push({
                pathname: '/scan-result',
                params: { base64: result.assets[0].base64, mimeType: 'image/jpeg' }
              });
            }
          }
        },
        {
          text: "Document (PDF)",
          onPress: async () => {
            const result = await DocumentPicker.getDocumentAsync({
              type: 'application/pdf',
              copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets[0].uri) {
              try {
                const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                router.push({
                  pathname: '/scan-result',
                  params: { base64, mimeType: 'application/pdf' }
                });
              } catch (e) {
                Alert.alert("Error", "Failed to read document data.");
              }
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleCalendarSync = async () => {
    if (classes.length === 0) {
      Alert.alert(
        language === 'tr' ? 'Ders Bulunamadı' : 'No Classes Found',
        language === 'tr' ? 'Takvime eklenecek ders bulunamadı. Önce ders ekleyin.' : 'No classes found to sync. Add classes first.'
      );
      return;
    }

    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      Alert.alert(
        language === 'tr' ? 'İzin Gerekli' : 'Permission Required',
        language === 'tr' ? 'Takvim erişim izni verilmedi.' : 'Calendar permission was not granted.'
      );
      return;
    }

    try {
      const calendars = await getWritableCalendars();
      if (calendars.length === 0) {
        Alert.alert(
          language === 'tr' ? 'Takvim Bulunamadı' : 'No Calendar Found',
          language === 'tr' ? 'Yazılabilir takvim bulunamadı.' : 'No writable calendar found on your device.'
        );
        return;
      }

      // Show calendar picker
      const calendarOptions = calendars.map(cal => ({
        text: cal.title || cal.name || 'Calendar',
        onPress: async () => {
          const count = await syncToCalendar(classes, cal.id, language);
          Alert.alert(
            language === 'tr' ? 'Senkronizasyon Tamamlandı!' : 'Sync Complete!',
            language === 'tr' 
              ? `${count} ders "${cal.title}" takvimine eklendi. 16 hafta boyunca tekrarlanacak şekilde ayarlandı.`
              : `${count} classes synced to "${cal.title}". Set to repeat for 16 weeks.`
          );
        },
      }));

      calendarOptions.push({ text: language === 'tr' ? 'İptal' : 'Cancel', onPress: async () => {} });

      Alert.alert(
        language === 'tr' ? 'Takvim Seçin' : 'Choose Calendar',
        language === 'tr' ? 'Ders programınızı hangi takvime eklemek istiyorsunuz?' : 'Which calendar would you like to sync your schedule to?',
        calendarOptions as any
      );
    } catch (e) {
      Alert.alert('Error', String(e));
    }
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
          <SettingsRow 
            icon={LayoutGrid} 
            title={language === 'tr' ? 'Izgara Görünümü (Haftalık)' : 'Grid View (Weekly)'} 
            isSwitch 
            switchValue={useGridView}
            onSwitchChange={toggleGridView}
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
          {notificationsEnabled && (
            <SettingsRow 
              icon={VolumeX} 
              title={language === 'tr' ? 'Ders Modu (Sessize Al)' : 'Class Mode (Mute)'} 
              value={classModeType === 'none' ? (language === 'tr' ? 'Kapalı' : 'Off') : classModeType === 'notification' ? (language === 'tr' ? 'Bildirim' : 'Notification') : (language === 'tr' ? 'Ayarlar Kısayolu' : 'Settings Shortcut')} 
              onPress={cycleClassMode}
            />
          )}
        </View>

        {/* AI & Features Section */}
        <View style={[styles.section, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
          <SettingsRow 
            icon={KeyRound} 
            title={t('settings.updateKey')} 
            onPress={handleUpdateApiKey}
          />
          <SettingsRow 
            icon={Camera} 
            title={t('onboarding.uploadPhoto') + " / PDF"} 
            onPress={handleFileUpload}
          />
          <SettingsRow 
            icon={CalendarDays} 
            title={language === 'tr' ? 'Takvimle Senkronize Et' : 'Sync with Calendar'} 
            onPress={handleCalendarSync}
          />
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
