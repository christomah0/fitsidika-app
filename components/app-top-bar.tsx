import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from './ui/icon-symbol';
import { useAuth } from '@/hooks/use-auth';

interface AppTopBarProps {
  userName: string;
  notificationsCount: number;
  onMenuPress: () => void;
  onNotificationsPress: () => void;
}

export function AppTopBar({ userName, notificationsCount, onMenuPress, onNotificationsPress }: AppTopBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { logout } = useAuth();

  const bgColor = Colors[colorScheme ?? 'light'].tint.includes('#fff')
    ? Colors.dark.background
    : Colors[colorScheme ?? 'light'].tint;

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: bgColor }}>
      <View style={styles.mainHeaderContainer}>
        {/* Left Icon: Menu */}
        <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
          <IconSymbol name="line.horizontal.3" size={28} color="white" />
        </TouchableOpacity>

        {/* Center: Logo/Title */}
        <View style={styles.titleContainer}>
          <IconSymbol name="heart" size={28} color="white" style={styles.heartIcon} />
          <Text style={styles.titleText}>FitsidikaApp</Text>
        </View>

        {/* Right Actions: Notifications & Logout */}
        <View style={styles.rightActions}>
          <TouchableOpacity onPress={onNotificationsPress} style={styles.iconButton}>
            <IconSymbol name="bell" size={28} color="white" />
            {notificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Greeting Section */}
      <View style={styles.greetingContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || '??'}</Text>
        </View>
        <Text style={styles.greetingText}>
          Bonjour,{"\n"}
          <Text style={styles.userNameText}>{userName}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    zIndex: -1,
  },
  heartIcon: {
    marginRight: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.light.tint,
    fontSize: 18,
    fontWeight: 'bold',
  },
  greetingText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  userNameText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
  },
});
