import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

export interface AlertItem {
  id: string;
  count: number;
  label: string;
  type: 'critical' | 'warning';
}

interface AlertsBoxProps {
  alerts: AlertItem[];
}

export const AlertsBox = ({ alerts }: AlertsBoxProps) => {
  if (alerts.length === 0) return null;

  return (
    <View style={styles.alertsBox}>
      {/* Header */}
      <View style={styles.alertHeader}>
        <IconSymbol 
          name="exclamationmark.triangle.fill" 
          size={18} 
          color="#DC2626" 
        />
        <Text style={styles.alertTitle}>Alertes</Text>
      </View>

      {/* Dynamic List of Alerts */}
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.alertItem}>
          <View 
            style={[
              styles.alertBadge, 
              { backgroundColor: alert.type === 'critical' ? '#DC2626' : '#D97706' }
            ]}
          >
            <Text style={styles.whiteText}>{alert.count}</Text>
          </View>
          <Text style={styles.alertText}>{alert.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  alertsBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 15,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  alertBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
});
