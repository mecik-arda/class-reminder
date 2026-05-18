import React, { useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { DAYS_OF_WEEK } from '../utils/constants';

interface DaySelectorProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ selectedDay, onSelectDay }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // Scroll to selected day on mount
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: selectedDay * 60, animated: true });
    }
  }, [selectedDay]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected ? theme.purple.medium : theme.card.background,
                  borderColor: isSelected ? theme.purple.medium : theme.card.border,
                }
              ]}
              onPress={() => onSelectDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isSelected ? '#FFF' : theme.text.secondary }
                ]}
              >
                {t(`days.${dayKeys[day]}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
