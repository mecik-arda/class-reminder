import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ClassSession } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface WeeklyGridViewProps {
  classes: ClassSession[];
  onClassPress: (id: string) => void;
}

const START_HOUR = 8; // 08:00
const END_HOUR = 20; // 20:00
const HOUR_HEIGHT = 65; // Pixels per hour

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const WeeklyGridView: React.FC<WeeklyGridViewProps> = ({ classes, onClassPress }) => {
  const { theme, isDark } = useTheme();
  const { language } = useLanguage();
  const days = language === 'tr' ? DAYS_TR : DAYS_EN;
  
  // Filter out Sat/Sun (5 and 6)
  const gridClasses = classes.filter(c => c.day < 5);

  const getMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateTop = (timeString: string) => {
    const minutes = getMinutes(timeString);
    const startMinutes = START_HOUR * 60;
    return Math.max(0, ((minutes - startMinutes) / 60) * HOUR_HEIGHT);
  };

  const calculateHeight = (start: string, end: string) => {
    const startMins = getMinutes(start);
    const endMins = getMinutes(end);
    return Math.max(30, ((endMins - startMins) / 60) * HOUR_HEIGHT);
  };

  const screenWidth = Dimensions.get('window').width;
  const timeColumnWidth = 50;
  // Make day columns slightly larger to fit content, so horizontal scroll happens
  const dayColumnWidth = Math.max(120, (screenWidth - timeColumnWidth) / 5);

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={[styles.timeHeaderCell, { width: timeColumnWidth, borderBottomColor: theme.card.border }]} />
            {days.map((day, index) => (
              <View key={index} style={[styles.dayHeaderCell, { width: dayColumnWidth, borderBottomColor: theme.card.border }]}>
                <Text style={[styles.dayHeaderText, { color: theme.text.primary }]}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Grid Body */}
          <View style={styles.body}>
            {/* Time Column */}
            <View style={[styles.timeColumn, { width: timeColumnWidth }]}>
              {hours.map(hour => (
                <View key={hour} style={[styles.timeCell, { height: HOUR_HEIGHT }]}>
                  <Text style={[styles.timeText, { color: theme.text.tertiary }]}>{`${hour}:00`}</Text>
                </View>
              ))}
            </View>

            {/* Days Columns */}
            {days.map((_, dayIndex) => (
              <View key={dayIndex} style={[styles.dayColumn, { width: dayColumnWidth, borderLeftColor: theme.card.border }]}>
                {hours.map(hour => (
                  <View key={hour} style={[styles.gridLine, { height: HOUR_HEIGHT, borderBottomColor: theme.card.border }]} />
                ))}

                {/* Class Blocks */}
                {(() => {
                  const dayClasses = gridClasses.filter(c => c.day === dayIndex);
                  
                  return dayClasses.map(c => {
                    const top = calculateTop(c.startTime);
                    const height = calculateHeight(c.startTime, c.endTime);
                    const startMins = getMinutes(c.startTime);
                    const endMins = getMinutes(c.endTime);
                    
                    // Find overlapping classes
                    const overlaps = dayClasses.filter(other => {
                      const otherStart = getMinutes(other.startTime);
                      const otherEnd = getMinutes(other.endTime);
                      return Math.max(startMins, otherStart) < Math.min(endMins, otherEnd);
                    });
                    
                    // Sort overlaps by start time to determine stacking order
                    overlaps.sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime) || a.courseName.localeCompare(b.courseName));
                    const overlapIndex = overlaps.findIndex(o => o.id === c.id);
                    const overlapCount = overlaps.length;
                    
                    const cascadeOffset = 15; // Shift by 15px for each overlapping item
                    const left = 4 + (overlapIndex * cascadeOffset);
                    const width = dayColumnWidth - 8 - ((overlapCount - 1) * cascadeOffset);

                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.classBlock,
                          {
                            top,
                            height,
                            left,
                            width,
                            backgroundColor: isDark ? '#2D2D3A' : '#FFFFFF', 
                            borderColor: theme.purple.medium,
                            elevation: overlapIndex > 0 ? 4 : 0, 
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: overlapIndex > 0 ? 0.3 : 0,
                          }
                        ]}
                        onPress={() => onClassPress(c.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.classTitle, { color: theme.purple.medium }]} numberOfLines={height < 50 ? 1 : 2}>{c.courseName}</Text>
                        <Text style={[styles.classTime, { color: theme.text.secondary }]} numberOfLines={1}>{c.startTime}-{c.endTime}</Text>
                        {height > 60 && c.classroom && <Text style={[styles.classRoom, { color: theme.text.tertiary }]} numberOfLines={1}>{c.classroom}</Text>}
                      </TouchableOpacity>
                    );
                  });
                })()}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    height: 40,
  },
  timeHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  dayHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  dayHeaderText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  body: {
    flexDirection: 'row',
  },
  timeColumn: {
    flexDirection: 'column',
  },
  timeCell: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  timeText: {
    fontSize: 12,
    position: 'absolute',
    top: -8,
  },
  dayColumn: {
    flexDirection: 'column',
    borderLeftWidth: 1,
    position: 'relative',
  },
  gridLine: {
    borderBottomWidth: 1,
  },
  classBlock: {
    position: 'absolute',
    borderLeftWidth: 4,
    borderWidth: 1, // Add full border to make solid stacking visible
    borderRadius: 6,
    padding: 6,
    overflow: 'hidden',
    zIndex: 10,
  },
  classTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  classTime: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  classRoom: {
    fontSize: 10,
    marginTop: 2,
  }
});
