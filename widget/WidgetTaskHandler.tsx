import React from 'react';
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { NextClassWidget } from './NextClassWidget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/utils/constants';
import { ClassSession } from '../src/types';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetAction === 'WIDGET_ADDED' || props.widgetAction === 'WIDGET_UPDATE') {
    let nextClass: ClassSession | null = null;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (data) {
        const classes: ClassSession[] = JSON.parse(data);
        const now = new Date();
        const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Find next class today
        const todayClasses = classes
          .filter(c => c.day === currentDay)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        for (const c of todayClasses) {
          const [h, m] = c.startTime.split(':').map(Number);
          if (h * 60 + m > currentMinutes) {
            nextClass = c;
            break;
          }
        }

        // If no class today, find first class tomorrow or next available day
        if (!nextClass) {
          const upcomingClasses = classes
            .filter(c => c.day > currentDay)
            .sort((a, b) => {
              if (a.day !== b.day) return a.day - b.day;
              return a.startTime.localeCompare(b.startTime);
            });
            
          if (upcomingClasses.length > 0) {
            nextClass = upcomingClasses[0];
          } else {
            // Loop back to start of week
            const nextWeekClasses = classes
              .filter(c => c.day <= currentDay)
              .sort((a, b) => {
                if (a.day !== b.day) return a.day - b.day;
                return a.startTime.localeCompare(b.startTime);
              });
            if (nextWeekClasses.length > 0) {
              nextClass = nextWeekClasses[0];
            }
          }
        }
      }
    } catch (e) {
      console.error('Widget: Failed to load classes', e);
    }

    props.renderWidget(
      <NextClassWidget 
        courseName={nextClass ? nextClass.courseName : 'Ders Yok'} 
        time={nextClass ? nextClass.startTime : ''} 
        room={nextClass?.classroom || ''} 
      />
    );
  }
}
