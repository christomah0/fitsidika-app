import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MENU_ITEMS } from '@/constants/constants';
import { Route } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface AppMenuOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigate: (route: Route) => void;
  topInset: number;
}

export function AppMenuOverlay({ isVisible, onClose, onNavigate, topInset }: AppMenuOverlayProps) {
  const colorScheme = useColorScheme();

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={SlideOutUp.duration(300)}
      style={[styles.overlay, { top: topInset }]}
    >
      <View style={styles.shadowWrapper}>
        {/* Menu Content */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onNavigate(item.route); // Navigate using the route path
              }}
            >
              <IconSymbol name={item.icon as any} size={24} color={Colors[colorScheme ?? 'light'].icon} />
              <Text style={[styles.menuText, { color: Colors[colorScheme ?? 'light'].text }]}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  shadowWrapper: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  menuContainer: {
    backgroundColor: 'white',
    width: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '500',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
