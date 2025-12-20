import { Colors } from '@/constants/theme';
import React from 'react';
import { Platform } from 'react-native';
import { StyleSheet, View, Text, Image } from 'react-native';

interface DoctorSummaryProps {
  name: string;
  specialty: string;
  patientCount: number;
  avatarUrl?: string;
}

export function DoctorSummaryCard({ name, specialty, patientCount, avatarUrl }: DoctorSummaryProps) {
  return (
    <View style={styles.card}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
        <View style={styles.badge}>
          <Text style={styles.patientCount}>{patientCount} patients</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,

    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
    }),

    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  avatarPlaceholder: {
    backgroundColor: '#A7F3D0',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  specialty: {
    color: '#D1FAE5',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  patientCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DoctorSummaryCard;
