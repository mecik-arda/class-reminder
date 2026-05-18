import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { useSchedule } from '../src/contexts/ScheduleContext';
import { ClassSession } from '../src/types';
import { DAYS_OF_WEEK } from '../src/utils/constants';

export default function AddClassScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { classes, addClass, updateClass } = useSchedule();

  const isEditing = !!id;
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  // Form State
  const [courseName, setCourseName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [classroom, setClassroom] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isEditing && typeof id === 'string') {
      const existingClass = classes.find(c => c.id === id);
      if (existingClass) {
        setCourseName(existingClass.courseName);
        setTeacher(existingClass.teacher || '');
        setClassroom(existingClass.classroom || '');
        setSelectedDay(existingClass.day);
        setStartTime(existingClass.startTime);
        setEndTime(existingClass.endTime);
        setNotes(existingClass.notes || '');
      }
    }
  }, [id, classes, isEditing]);

  const handleSave = async () => {
    if (!courseName.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Error', 'Please fill in course name and times.');
      return;
    }

    const classData: ClassSession = {
      id: isEditing ? (id as string) : Date.now().toString(),
      courseName: courseName.trim(),
      teacher: teacher.trim(),
      classroom: classroom.trim(),
      day: selectedDay,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      notes: notes.trim(),
    };

    try {
      if (isEditing) {
        await updateClass(classData);
      } else {
        await addClass(classData);
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save class.');
    }
  };

  const InputField = ({ label, value, onChange, placeholder, multiline = false }: any) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: theme.card.background,
            borderColor: theme.card.border,
            color: theme.text.primary,
            height: multiline ? 100 : 50
          }
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.text.tertiary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {isEditing ? t('class.edit') : t('home.addNew')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <InputField 
            label={t('class.courseName')} 
            value={courseName} 
            onChange={setCourseName} 
            placeholder="e.g. Mathematics" 
          />

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>{t('settings.language')} (Day)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayBtn,
                      {
                        backgroundColor: isSelected ? theme.purple.medium : theme.card.background,
                        borderColor: isSelected ? theme.purple.medium : theme.card.border,
                      }
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={{ color: isSelected ? '#FFF' : theme.text.secondary, fontWeight: '600' }}>
                      {t(`days.${dayKeys[day]}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <InputField 
                label={t('class.startTime')} 
                value={startTime} 
                onChange={setStartTime} 
                placeholder="09:00" 
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <InputField 
                label={t('class.endTime')} 
                value={endTime} 
                onChange={setEndTime} 
                placeholder="10:30" 
              />
            </View>
          </View>

          <InputField 
            label={t('class.classroom')} 
            value={classroom} 
            onChange={setClassroom} 
            placeholder="e.g. Room A-101" 
          />

          <InputField 
            label={t('class.teacher')} 
            value={teacher} 
            onChange={setTeacher} 
            placeholder="e.g. Dr. Smith" 
          />

          <InputField 
            label={t('class.notes')} 
            value={notes} 
            onChange={setNotes} 
            placeholder="Optional notes" 
            multiline 
          />

        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background.secondary }]}>
          <TouchableOpacity 
            style={[styles.btn, styles.cancelBtn, { borderColor: theme.card.border }]} 
            onPress={() => router.back()}
          >
            <Text style={[styles.btnText, { color: theme.text.primary }]}>{t('class.cancel')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: theme.purple.medium }]} 
            onPress={handleSave}
          >
            <Text style={[styles.btnText, { color: '#FFF' }]}>{t('class.save')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  daySelector: {
    flexDirection: 'row',
  },
  dayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  btn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
