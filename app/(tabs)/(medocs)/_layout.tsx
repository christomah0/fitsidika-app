import { AppMenuOverlay } from "@/components/app-menu-overlay";
import { AppTopBar } from "@/components/app-top-bar";
import { Route, Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MedocsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuVisible(prev => !prev);
  };

  const handleMenuNavigation = (route: Route) => {
    router.push(route);
  };

  const handleNotificationsPress = () => {
    // router.push('notifications');
    console.log('Notifications pressed');
  };

  const menuStartPosition = insets.top + 140;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          header: () => (
            <AppTopBar
              onMenuPress={handleMenuToggle}
              onNotificationsPress={handleNotificationsPress}
              userName="Utilisateur"
              notificationsCount={4}
            />
          )
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: true }} />
      </Stack>
      
      <AppMenuOverlay
        isVisible={isMenuVisible}
        onClose={handleMenuToggle}
        onNavigate={handleMenuNavigation}
        topInset={menuStartPosition}
      />
    </View>
  );
}
