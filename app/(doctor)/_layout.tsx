import React from "react";

import { AppDoctorTopBar } from "@/components/app-doctor-top-bar";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function DoctorLayout() {
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
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
