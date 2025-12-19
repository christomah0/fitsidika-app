import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from "@/components/themed-text";

interface GuideBoxProps {
    range: string;
    desc: string;
    variant: 'light' | 'moderate' | 'severe';
}

const THEMES = {
    light: { color: '#2F855A', bg: '#F0FFF4' },
    moderate: { color: '#B7791F', bg: '#FFFDF0' },
    severe: { color: '#C53030', bg: '#FFF5F5' },
};

export const GuideBox = ({ range, desc, variant }: GuideBoxProps) => {
    const theme = THEMES[variant];

    return (
        <View style={[styles.guideBox, { backgroundColor: theme.bg }]}>
            <ThemedText style={{ color: theme.color, fontWeight: '700' }}>{range}</ThemedText>
            <ThemedText style={{ color: theme.color, fontSize: 13 }}>{desc}</ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    guideBox: { padding: 12, borderRadius: 10, marginBottom: 10 },
});