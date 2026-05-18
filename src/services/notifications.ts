import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '../utils/constants';
import { ClassSession } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

const getMinutesBefore = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TIME);
    return value ? parseInt(value, 10) : DEFAULT_PREFERENCES.NOTIFICATION_TIME;
  } catch (error) {
    return DEFAULT_PREFERENCES.NOTIFICATION_TIME;
  }
};

const getAreNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return value !== 'false'; // default to true
  } catch (error) {
    return true;
  }
};

// Calculate the next occurrence of a specific time and day
const calculateNextOccurrence = (dayOfWeek: number, timeString: string, minutesBefore: number): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  
  let targetDate = new Date(now);
  targetDate.setHours(hours, minutes, 0, 0);
  
  // Subtract the notification offset
  targetDate.setMinutes(targetDate.getMinutes() - minutesBefore);
  
  // Adjust day of week (0 = Monday, 6 = Sunday for our app, but Date.getDay() is 0=Sunday)
  // Convert JS day to our day format
  const jsDay = now.getDay();
  const ourCurrentDay = jsDay === 0 ? 6 : jsDay - 1;
  
  let daysUntil = dayOfWeek - ourCurrentDay;
  if (daysUntil < 0 || (daysUntil === 0 && targetDate < now)) {
    daysUntil += 7; // It's next week
  }
  
  targetDate.setDate(targetDate.getDate() + daysUntil);
  return targetDate;
};

export const scheduleClassNotifications = async (classes: ClassSession[], language: string = 'tr') => {
  // Clear all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const isEnabled = await getAreNotificationsEnabled();
  if (!isEnabled) return;
  
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const minutesBefore = await getMinutesBefore();

  for (const session of classes) {
    const triggerDate = calculateNextOccurrence(session.day, session.startTime, minutesBefore);
    
    // Only schedule if it's in the future (sanity check)
    if (triggerDate > new Date()) {
      let bodyText = language === 'tr' 
        ? `${session.courseName} dersiniz ${minutesBefore} dakika sonra başlıyor!`
        : `${session.courseName} starts in ${minutesBefore} minutes!`;
        
      if (session.classroom) {
        bodyText += language === 'tr' ? ` (Sınıf: ${session.classroom})` : ` (Room: ${session.classroom})`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: language === 'tr' ? 'Ders Hatırlatıcısı' : 'Class Reminder',
          body: bodyText,
          data: { classId: session.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: session.day === 6 ? 1 : session.day + 2, // Map our 0-6 to Expo's 1-7 (Sun=1)
          hour: triggerDate.getHours(),
          minute: triggerDate.getMinutes(),
          repeats: true,
        },
      });
    }
  }
};
