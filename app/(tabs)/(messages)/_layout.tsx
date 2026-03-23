import { AppMenuOverlay } from "@/components/app-menu-overlay";
import { AppTopBar } from "@/components/app-top-bar";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationCount } from "@/hooks/use-notification-count";
import { Route, Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TouchableOpacity } from "react-native";

export default function MessagesLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const notificationCount = useNotificationCount();

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuVisible(prev => !prev);
  };

  const handleMenuNavigation = (route: Route) => {
    router.push(route);
  };

  const handleNotificationsPress = () => {
    router.push('/notifications' as any);
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
              userName={user?.name || 'Utilisateur'}
              notificationsCount={notificationCount}
            />
          )
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: true }} />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: true,
            header: undefined,
            title: 'Conversation',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <IconSymbol name="chevron.left" size={20} color="#000" />
              </TouchableOpacity>
            ),
          }}
        />
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
