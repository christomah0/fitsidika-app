import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppVitalCard from '@/components/app-vital-card';
import { IconSymbolName } from '@/components/ui/icon-symbol';

interface VitalItem {
  icon: IconSymbolName;
  label: string;
  value: string;
  status: string;
  color: string;
}

interface VitalSignsGridProps {
  data: VitalItem[];
}

export default function VitalSignsGrid({ data }: VitalSignsGridProps) {
  return (
    <View style={styles.vitalsGrid}>
      {data.map((item, index) => (
        <AppVitalCard
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
          status={item.status}
          color={item.color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});