import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/contexts/ThemeContext';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useSchedule } from '../src/contexts/ScheduleContext';
import { scanSchedule } from '../src/services/claude';
import { getApiKey } from '../src/services/secureStorage';
import { ClassSession } from '../src/types';
import { Check, X } from 'lucide-react-native';

export default function ScanResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { setAllClasses } = useSchedule();
  
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scannedClasses, setScannedClasses] = useState<ClassSession[]>([]);

  useEffect(() => {
    if (params.base64 && typeof params.base64 === 'string') {
      performScan(params.base64);
    } else {
      setError("No image data provided");
      setIsScanning(false);
    }
  }, [params.base64]);

  const performScan = async (base64: string) => {
    try {
      const apiKey = await getApiKey();
      if (!apiKey) throw new Error("API Key not found");

      const result = await scanSchedule(base64, language, apiKey);
      
      // Process and validate result
      const newClasses: ClassSession[] = result.classes.map((c, index) => ({
        id: Date.now().toString() + index.toString(),
        courseName: c.courseName || "Unknown Course",
        day: c.day ?? 0,
        startTime: c.startTime || "09:00",
        endTime: c.endTime || "10:00",
        teacher: c.teacher || "",
        classroom: c.classroom || "",
      }));

      setScannedClasses(newClasses);
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    try {
      await setAllClasses(scannedClasses);
      router.replace('/(tabs)/home');
    } catch (e) {
      Alert.alert("Error", "Failed to save schedule.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const dayNames = [
    t('days.monday'), t('days.tuesday'), t('days.wednesday'), 
    t('days.thursday'), t('days.friday'), t('days.saturday'), t('days.sunday')
  ];

  if (isScanning) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.purple.medium} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>{t('scan.processing')}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background.primary }]}>
        <X size={48} color="red" />
        <Text style={[styles.errorText, { color: theme.text.primary }]}>{t('scan.error')}</Text>
        <Text style={{ color: theme.text.secondary, marginVertical: 10 }}>{error}</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.purple.medium, marginTop: 20 }]} 
          onPress={handleCancel}
        >
          <Text style={styles.buttonText}>{t('class.cancel')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>{t('scan.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{t('scan.reviewText')}</Text>
      </View>

      <ScrollView style={styles.list}>
        {scannedClasses.map((item) => (
          <View key={item.id} style={[styles.classCard, { backgroundColor: theme.card.background, borderColor: theme.card.border }]}>
            <Text style={[styles.courseName, { color: theme.text.primary }]}>{item.courseName}</Text>
            <Text style={[styles.courseDetails, { color: theme.text.secondary }]}>
              {dayNames[item.day]} | {item.startTime} - {item.endTime}
            </Text>
            {(item.teacher || item.classroom) && (
              <Text style={[styles.courseDetails, { color: theme.text.tertiary }]}>
                {item.teacher} {item.teacher && item.classroom ? ' | ' : ''} {item.classroom}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background.secondary }]}>
        <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn, { borderColor: theme.card.border }]} onPress={handleCancel}>
          <Text style={[styles.actionBtnText, { color: theme.text.primary }]}>{t('class.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.purple.medium }]} onPress={handleSave}>
          <Text style={[styles.actionBtnText, { color: '#FFF' }]}>{t('scan.saveAll')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  classCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionBtn: {
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
  actionBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
