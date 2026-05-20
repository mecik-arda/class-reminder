import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSchedule } from '../../src/contexts/ScheduleContext';
import { ClassCard } from '../../src/components/ClassCard';
import { DaySelector } from '../../src/components/DaySelector';
import { WeeklyGridView } from '../../src/components/WeeklyGridView';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '../../src/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { classes } = useSchedule();
  const insets = useSafeAreaInsets();

  // Determine current day (0 = Monday, 6 = Sunday)
  const today = new Date().getDay();
  const initialDay = today === 0 ? 6 : today - 1; 
  
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [useGridView, setUseGridView] = useState(DEFAULT_PREFERENCES.USE_GRID_VIEW);

  useFocusEffect(
    useCallback(() => {
      const loadPreference = async () => {
        const grid = await AsyncStorage.getItem(STORAGE_KEYS.USE_GRID_VIEW);
        if (grid !== null) setUseGridView(grid === 'true');
      };
      loadPreference();
    }, [])
  );

  const filteredClasses = useMemo(() => {
    return classes
      .filter((c) => c.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [classes, selectedDay]);

  const handleClassPress = (id: string) => {
    router.push(`/class/${id}`);
  };

  const handleAddClass = () => {
    router.push('/add-class');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{t('home.title')}</Text>
      </View>

      {useGridView ? (
        <WeeklyGridView classes={classes} onClassPress={handleClassPress} />
      ) : (
        <>
          <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          {filteredClasses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.text.tertiary }]}>
                {t('home.noClasses')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredClasses}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ClassCard session={item} onPress={() => handleClassPress(item.id)} />
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={[
          styles.fab,
          { 
            backgroundColor: theme.purple.medium,
            shadowColor: theme.glow ? theme.purple.medium : '#000',
            bottom: 80 + Math.max(insets.bottom, 0)
          }
        ]}
        onPress={handleAddClass}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#FFF" />
      </TouchableOpacity>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom tabs + FAB
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 80, // Above bottom tabs
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 999,
  },
});
