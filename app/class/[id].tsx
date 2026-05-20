import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, MapPin, User, FileText, Edit2, Trash2, Minus, Plus, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSchedule } from '../../src/contexts/ScheduleContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { DAYS_OF_WEEK } from '../../src/utils/constants';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { classes, deleteClass, updateClass } = useSchedule();
  const { language } = useLanguage();

  const classSession = classes.find(c => c.id === id);
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  if (!classSession) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={{ color: theme.text.primary, padding: 20 }}>Class not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
          <Text style={{ color: theme.purple.medium }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      t('class.deleteConfirmTitle'),
      t('class.deleteConfirmDesc'),
      [
        { text: t('class.cancel'), style: 'cancel' },
        { 
          text: t('class.delete'), 
          style: 'destructive',
          onPress: async () => {
            await deleteClass(classSession.id);
            router.back();
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/add-class?id=${classSession.id}`);
  };

  // Attendance state
  const absences = classSession.absences || 0;
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState(String(classSession.absenceLimit || 4));
  const absenceLimit = classSession.absenceLimit || 4;
  const absencePercent = absenceLimit > 0 ? Math.min((absences / absenceLimit) * 100, 100) : 0;
  const isWarning = absencePercent >= 75;
  const isDanger = absencePercent >= 100;

  const handleIncrement = async () => {
    await updateClass({ ...classSession, absences: absences + 1 });
  };

  const handleDecrement = async () => {
    if (absences > 0) {
      await updateClass({ ...classSession, absences: absences - 1 });
    }
  };

  const handleSaveLimit = async () => {
    const parsed = parseInt(limitInput, 10);
    if (!isNaN(parsed) && parsed > 0) {
      await updateClass({ ...classSession, absenceLimit: parsed });
    }
    setIsEditingLimit(false);
  };

  const DetailRow = ({ icon: Icon, label, value }: any) => {
    if (!value) return null;
    return (
      <View style={[styles.detailRow, { borderBottomColor: theme.card.border }]}>
        <View style={[styles.iconBox, { backgroundColor: theme.purple.light + '20' }]}>
          <Icon size={20} color={theme.purple.medium} />
        </View>
        <View style={styles.detailContent}>
          <Text style={[styles.detailLabel, { color: theme.text.secondary }]}>{label}</Text>
          <Text style={[styles.detailValue, { color: theme.text.primary }]}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.actionBtn}>
            <Edit2 size={20} color={theme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={[styles.actionBtn, styles.deleteBtn]}>
            <Trash2 size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.titleContainer, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
          <View style={[styles.colorStrip, { backgroundColor: theme.purple.medium }]} />
          <Text style={[styles.courseName, { color: theme.text.primary }]}>{classSession.courseName}</Text>
          <Text style={[styles.dayText, { color: theme.purple.medium }]}>
            {t(`days.${dayKeys[classSession.day]}`)}
          </Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
          <DetailRow 
            icon={Clock} 
            label={t('class.time')} 
            value={`${classSession.startTime} - ${classSession.endTime}`} 
          />
          <DetailRow 
            icon={MapPin} 
            label={t('class.classroom')} 
            value={classSession.classroom} 
          />
          <DetailRow 
            icon={User} 
            label={t('class.teacher')} 
            value={classSession.teacher} 
          />
        </View>

        {classSession.notes ? (
          <View style={[styles.notesCard, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
            <View style={styles.notesHeader}>
              <FileText size={18} color={theme.text.secondary} />
              <Text style={[styles.notesTitle, { color: theme.text.secondary }]}>{t('class.notes')}</Text>
            </View>
            <Text style={[styles.notesText, { color: theme.text.primary }]}>
              {classSession.notes}
            </Text>
          </View>
        ) : null}

        {/* Attendance Tracker Card */}
        <View style={[styles.attendanceCard, { backgroundColor: theme.card.background, borderColor: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : theme.card.border }]}>
          <View style={styles.attendanceHeader}>
            <View style={styles.attendanceHeaderLeft}>
              <AlertTriangle size={18} color={isDanger ? '#EF4444' : isWarning ? '#F59E0B' : theme.purple.medium} />
              <Text style={[styles.attendanceTitle, { color: theme.text.primary }]}>
                {language === 'tr' ? 'Devamsızlık Takibi' : 'Attendance Tracker'}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: theme.card.border }]}>
            <View style={[
              styles.progressBarFill,
              {
                width: `${absencePercent}%`,
                backgroundColor: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : theme.purple.medium
              }
            ]} />
          </View>
          <Text style={[styles.progressLabel, { color: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : theme.text.secondary }]}>
            {absences} / {absenceLimit} {language === 'tr' ? 'devamsızlık kullanıldı' : 'absences used'}
            {isDanger ? (language === 'tr' ? ' ⚠️ LİMİT AŞILDI!' : ' ⚠️ LIMIT EXCEEDED!') : ''}
          </Text>

          {/* +/- Buttons */}
          <View style={styles.attendanceActions}>
            <TouchableOpacity
              onPress={handleDecrement}
              style={[styles.attendanceBtn, { backgroundColor: theme.card.border }]}
              disabled={absences <= 0}
            >
              <Minus size={22} color={absences <= 0 ? theme.text.tertiary : theme.text.primary} />
            </TouchableOpacity>

            <View style={styles.absenceCountBox}>
              <Text style={[styles.absenceCount, { color: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : theme.text.primary }]}>
                {absences}
              </Text>
              <Text style={[styles.absenceCountLabel, { color: theme.text.tertiary }]}>
                {language === 'tr' ? 'Devamsız' : 'Absent'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleIncrement}
              style={[styles.attendanceBtn, { backgroundColor: isDanger ? '#FEE2E2' : isWarning ? '#FEF3C7' : theme.purple.light + '30' }]}
            >
              <Plus size={22} color={isDanger ? '#EF4444' : isWarning ? '#F59E0B' : theme.purple.medium} />
            </TouchableOpacity>
          </View>

          {/* Limit Setting */}
          <View style={[styles.limitRow, { borderTopColor: theme.card.border }]}>
            <Text style={[styles.limitLabel, { color: theme.text.secondary }]}>
              {language === 'tr' ? 'Devamsızlık Limiti:' : 'Absence Limit:'}
            </Text>
            {isEditingLimit ? (
              <View style={styles.limitEditRow}>
                <TextInput
                  style={[styles.limitInput, { color: theme.text.primary, borderColor: theme.purple.medium }]}
                  value={limitInput}
                  onChangeText={setLimitInput}
                  keyboardType="number-pad"
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveLimit} style={[styles.limitSaveBtn, { backgroundColor: theme.purple.medium }]}>
                  <Text style={styles.limitSaveBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setLimitInput(String(absenceLimit)); setIsEditingLimit(true); }}>
                <Text style={[styles.limitValue, { color: theme.purple.medium }]}>
                  {absenceLimit} {language === 'tr' ? 'hafta' : 'weeks'} ✏️
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 8,
  },
  deleteBtn: {
    marginRight: -8,
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  titleContainer: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  colorStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  courseName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 24,
  },
  attendanceCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginTop: 24,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
  },
  attendanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 16,
  },
  attendanceBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absenceCountBox: {
    alignItems: 'center',
  },
  absenceCount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  absenceCountLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -2,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
  },
  limitLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  limitEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  limitInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 16,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  limitSaveBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  limitSaveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
