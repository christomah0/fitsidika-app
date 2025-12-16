import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';

interface ActivityItem {
  icon: IconSymbolName;
  label: string;
  status: string;
  color: string;
}

interface ActivityListProps {
  data: ActivityItem[];
  iconColorOfActivity: (key: number) => string;
  iconBgColorOfActivity: (key: number) => string;
}

export default function ActivityList({
  data,
  iconColorOfActivity,
  iconBgColorOfActivity,
}: ActivityListProps) {
  return (
    <View style={styles.activityContainer}>
      <Text style={styles.todayTitle}>Aujourd'hui</Text>
      {data.map((item, index) => (
        <TouchableOpacity key={index} style={[styles.activityItem, { backgroundColor: item.color }]}>
          <View
            style={{
              backgroundColor: iconBgColorOfActivity(index),
              padding: 8,
              borderRadius: 10,
              marginRight: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <IconSymbol size={20} name={item.icon} color={iconColorOfActivity(index)} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityLabel}>{item.label}</Text>
            <Text style={[styles.activityStatus, { color: iconColorOfActivity(index) }]}>{item.status}</Text>
          </View>
          <IconSymbol name='chevron.right' color='grey' size={16} style={styles.activityArrow} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  todayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    minHeight: 60,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityStatus: {
    fontSize: 14,
  },
  activityArrow: {
    fontSize: 18,
    color: 'grey',
  },
});
