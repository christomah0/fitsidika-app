import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from './ui/icon-symbol';

interface AppDoctorTopBarProps {
    userName: string;
    notificationsCount: number;
    onNotificationsPress: () => void;
}

export function AppDoctorTopBar({
    userName,
    notificationsCount,
    onNotificationsPress
}: AppDoctorTopBarProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';

    // Cleaned up color logic: Primary theme color with a fallback
    const headerBg = Colors[colorScheme ?? 'light'].tint.includes('#fff') ? Colors.dark.background : Colors[colorScheme ?? 'light'].tint;

    // Extract initials for avatar
    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <View style={{ paddingTop: insets.top, backgroundColor: headerBg }}>
            <View style={styles.wrapper}>
                {/* Top Row: Logo & Notifications */}
                <View style={styles.topRow}>
                    <View style={styles.leftSpacer} />

                    <View style={styles.brand}>
                        <IconSymbol name="heart" size={28} color="white" />
                        <Text style={styles.brandText}>FitsidikaApp</Text>
                    </View>

                    <TouchableOpacity
                        onPress={onNotificationsPress}
                        style={styles.iconButton}
                        activeOpacity={0.7}
                    >
                        <IconSymbol name="bell" size={28} color="white" />
                        {notificationsCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{notificationsCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Bottom Row: User Profile */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials || '??'}</Text>
                    </View>
                    <View>
                        <Text style={styles.welcomeText}>Bonjour,</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        ...Platform.select({
            android: {
                elevation: 2,
            },
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
        }),
    },
    topRow: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    leftSpacer: {
        width: 44,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brandText: {
        fontSize: 20,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444', // Modern red (Tailwind Red 500)
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent', // Can change to headerBg if you want an outline
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 8,
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.light.tint,
        fontSize: 18,
        fontWeight: '700',
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    userName: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
});
