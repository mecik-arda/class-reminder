import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ClassSession } from '../types';
import { Clock, MapPin, User } from 'lucide-react-native';

interface ClassCardProps {
  session: ClassSession;
  onPress: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ session, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card.background,
          borderColor: theme.card.border,
          shadowColor: theme.glow ? theme.purple.medium : '#000',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.timeStrip, { backgroundColor: theme.purple.medium }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
          {session.courseName}
        </Text>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Clock size={14} color={theme.purple.medium} />
            <Text style={[styles.detailText, { color: theme.text.secondary }]}>
              {session.startTime} - {session.endTime}
            </Text>
          </View>
        </View>

        {(session.classroom || session.teacher) && (
          <View style={styles.detailsRow}>
            {session.classroom && (
              <View style={[styles.detailItem, { marginRight: 16 }]}>
                <MapPin size={14} color={theme.text.tertiary} />
                <Text style={[styles.detailText, { color: theme.text.tertiary }]} numberOfLines={1}>
                  {session.classroom}
                </Text>
              </View>
            )}
            
            {session.teacher && (
              <View style={styles.detailItem}>
                <User size={14} color={theme.text.tertiary} />
                <Text style={[styles.detailText, { color: theme.text.tertiary }]} numberOfLines={1}>
                  {session.teacher}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  timeStrip: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  detailText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
});
