import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';
import { ClassSession } from '../types';

const DAY_NAMES_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const DAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const requestCalendarPermissions = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};

export const getWritableCalendars = async (): Promise<Calendar.Calendar[]> => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  return calendars.filter(cal => cal.allowsModifications);
};

// Map our day index (0=Mon,6=Sun) to the next occurrence Date
const getNextDayDate = (dayIndex: number): Date => {
  const now = new Date();
  const currentJsDay = now.getDay(); // 0=Sun
  const ourCurrentDay = currentJsDay === 0 ? 6 : currentJsDay - 1;
  
  let daysUntil = dayIndex - ourCurrentDay;
  if (daysUntil <= 0) daysUntil += 7;
  
  const target = new Date(now);
  target.setDate(target.getDate() + daysUntil);
  return target;
};

export const syncToCalendar = async (
  classes: ClassSession[],
  calendarId: string,
  language: string = 'tr',
  semesterWeeks: number = 16
): Promise<number> => {
  let created = 0;
  const dayNames = language === 'tr' ? DAY_NAMES_TR : DAY_NAMES_EN;

  for (const session of classes) {
    const dayDate = getNextDayDate(session.day);
    
    const [startH, startM] = session.startTime.split(':').map(Number);
    const [endH, endM] = session.endTime.split(':').map(Number);
    
    const startDate = new Date(dayDate);
    startDate.setHours(startH, startM, 0, 0);
    
    const endDate = new Date(dayDate);
    endDate.setHours(endH, endM, 0, 0);

    // Calculate end date for recurrence (semesterWeeks from now)
    const recurrenceEnd = new Date(startDate);
    recurrenceEnd.setDate(recurrenceEnd.getDate() + (semesterWeeks * 7));

    const location = session.classroom || '';
    const notes = session.teacher 
      ? (language === 'tr' ? `Öğretmen: ${session.teacher}` : `Teacher: ${session.teacher}`)
      : '';

    try {
      await Calendar.createEventAsync(calendarId, {
        title: session.courseName,
        startDate,
        endDate,
        location,
        notes,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurrenceRule: {
          frequency: Calendar.Frequency.WEEKLY,
          interval: 1,
          endDate: recurrenceEnd,
        },
      });
      created++;
    } catch (e) {
      console.error(`Failed to create event for ${session.courseName}:`, e);
    }
  }

  return created;
};
