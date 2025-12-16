import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { IconSymbol, IconSymbolName } from './ui/icon-symbol';

interface AppVitalCardProps {
  icon: IconSymbolName;
  label: string;
  value: string;
  status: string;
  color: string;
}

const AppVitaCard: React.FC<AppVitalCardProps> = ({ icon, label, value, status, color }) => {
  const cardStyle: ViewStyle = {
    ...styles.card,
    backgroundColor: color,
  };

  return (
    <View style={cardStyle}>
      <View style={styles.header}>
        <IconSymbol style={styles.icon} name={icon} color='#fff' />
        <Text style={styles.status}>{status}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  status: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
});

export default AppVitaCard;