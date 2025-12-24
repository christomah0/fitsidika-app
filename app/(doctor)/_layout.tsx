import React from "react";

import { AppDoctorTopBar } from "@/components/app-doctor-top-bar";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function DoctorLayout() {
    const router = useRouter();

    const handleNotificationsPress = () => {
        // router.push('notifications');
        console.log('Notifications pressed');
    };

    return (
        <View style={styles.container}>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: true,
                        header: () => (
                            <AppDoctorTopBar
                                onNotificationsPress={handleNotificationsPress}
                                userName="Utilisateur"
                                notificationsCount={7}
                            />
                        ),
                    }}
                />
                <Stack.Screen
                    name="patients/details/[id]"
                    options={{
                        headerShown: true,
                        title: 'Détails du Patient',
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()}>
                                <IconSymbol name="chevron.left" size={20} color="#000" />
                            </TouchableOpacity>
                        ),
                        headerRight: () => (
                            <TouchableOpacity onPress={() => router.push('/(doctor)/patients/history')}>
                                <IconSymbol name="clock.arrow.circlepath" size={20} color="#000" />
                            </TouchableOpacity>
                        ),
                    }}
                />
                <Stack.Screen
                    name="patients/history"
                    options={{
                        headerShown: true,
                        title: 'Historique Médical',
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => router.back()}>
                                <IconSymbol name="chevron.left" size={20} color="#000" />
                            </TouchableOpacity>
                        )
                    }}
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
