import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="(accueil)"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="waveform.path.ecg" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(vitaux)"
        options={{
          title: 'Vitaux',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(medocs)"
        options={{
          title: 'Médocs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(messages)"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left" color={color} />,
        }}
      />
    </Tabs>
  );
}
