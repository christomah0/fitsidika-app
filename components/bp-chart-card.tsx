import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ChartData = lineDataItem[];

interface BPChartCardProps {
  dataSystolic: ChartData;
  dataDiastolic: ChartData;
}

export default function BPChartCard({ dataSystolic, dataDiastolic }: BPChartCardProps) {
  return (
    <View style={styles.chartContainer}>
      <TouchableOpacity style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Tension - 7 jours</Text>
        <IconSymbol name='chevron.right' color='grey' size={16} style={styles.chartArrow} />
      </TouchableOpacity>
      <View style={styles.chart}>
        <LineChart
          data={dataSystolic}
          data2={dataDiastolic}
          yAxisLabelSuffix=""
          yAxisLabelWidth={30}
          yAxisLabelTexts={['60', '80', '100', '120', '140']}
          initialSpacing={0}
          xAxisColor={'#ccc'}
          xAxisThickness={1}
          spacing={50}
          xAxisLabelTextStyle={{ color: 'grey', fontSize: 14 }}
          color={'red'}
          color2={'red'}
          thickness={2}
          hideDataPoints={false}
          dataPointsColor={'red'}
          dataPointsColor2={'red'}
          dataPointsRadius={4}
          height={150}
          width={300}
          isAnimated
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartArrow: {
    fontSize: 16,
    color: 'grey',
  },
  chart: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
