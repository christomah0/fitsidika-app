import React from "react";

import { AppDoctorTopBar } from "@/components/app-doctor-top-bar";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationCount } from "@/hooks/use-notification-count";

export default function DoctorLayout() {
    const router = useRouter();
    const {user, isLoading} = useAuth();
    const notificationCount = useNotificationCount();

    const displayName = isLoading ? 'Chargement...' : (user?.name || 'Médecin');

    const handleNotificationsPress = () => {
        router.push('/notifications' as any);
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
                                userName={displayName}
                                notificationsCount={notificationCount}
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
                        )
                    }}
                />
                <Stack.Screen
                    name="patients/history/[id]"
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
                <Stack.Screen
                    name="patients/chat/[id]"
                    options={{
                        headerShown: true,
                        title: 'Messagerie',
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
