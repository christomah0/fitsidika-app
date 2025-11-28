import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from './ui/icon-symbol';

interface AppTopBarProps {
  userName: string;
  notificationsCount: number;
  onMenuPress: () => void;
  onNotificationsPress: () => void;
}

export function AppTopBar({ userName, notificationsCount, onMenuPress, onNotificationsPress }: AppTopBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? 'light'].tint.includes('#fff') ? Colors.dark.background : Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: bgColor }}>
      <View style={styles.mainHeaderContainer}>
        {/* Left Icon: Menu */}
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <IconSymbol name="line.horizontal.3" size={28} color="white" />
        </TouchableOpacity>

        {/* Center: Logo/Title */}
        <View style={styles.titleContainer}>
          <IconSymbol name="heart" size={28} color="white" style={styles.heartIcon} />
          <Text style={styles.titleText}>FitsidikaApp</Text>
        </View>

        {/* Right Icon: Notifications with Badge */}
        <TouchableOpacity onPress={onNotificationsPress} style={styles.notificationButton}>
          <IconSymbol name="bell" size={28} color="white" />
          {notificationsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* User Greeting Section */}
      <View style={[styles.greetingContainer, { backgroundColor: bgColor }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MD</Text>
        </View>
        <Text style={styles.greetingText}>
          Bonjour,{"\n"}
          <Text style={styles.userNameText}>{userName}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60, // Height for the top bar
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', // Slightly transparent white for button background
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    marginRight: 5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative', // For badge positioning
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4136', // Red color for the badge
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#34A853', // Green text for avatar
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    color: 'white',
    fontSize: 16,
  },
  userNameText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
