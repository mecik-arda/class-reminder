import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, MapPin, User, FileText, Edit2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useSchedule } from '../../src/contexts/ScheduleContext';
import { DAYS_OF_WEEK } from '../../src/utils/constants';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { classes, deleteClass } = useSchedule();

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
});
