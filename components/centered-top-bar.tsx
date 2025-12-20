import React from 'react';

import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from './ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CenteredTopBarProps {
    title: string;
    onBackPress?: () => void;
    rightIcon?: React.ReactNode;
    onRightPress?: () => void;
}

// A top bar with a centered title, a back button on the left, and an optional right icon.
const CenteredTopBar = ({
    title,
    onBackPress,
    rightIcon,
    onRightPress
}: CenteredTopBarProps) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Left Slot */}
            <TouchableOpacity style={styles.button} onPress={handleBack}>
                <IconSymbol name='chevron.left' size={24} color="#000" />
            </TouchableOpacity>

            {/* Center Slot */}
            <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            {/* Right Slot */}
            <TouchableOpacity
                style={styles.button}
                onPress={onRightPress}
                disabled={!rightIcon}
            >
                {rightIcon ? rightIcon : <View style={{ width: 24 }} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        zIndex: 10,

        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 4,
            }
        })
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: -1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        maxWidth: '60%',
    },
    button: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CenteredTopBar;
