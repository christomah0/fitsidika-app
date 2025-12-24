import 'react-native-reanimated';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import InitSplashScreen from '@/app/init-splash';
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <RootLayoutNav />
          <Toast />
        </SafeAreaProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading } = useAuth();
  const [isTimerLoading, setIsTimerLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimerLoading(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const isAppReady = !isLoading && !isTimerLoading;

  useEffect(() => {
    if (!isAppReady) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'init-splash';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Logged in but on Auth screen -> Redirect based on role
      if (user.role === 'doctor') {
        router.replace('/(doctor)');
      } else {
        router.replace('/(tabs)/(accueil)');
      }
    }
  }, [user, isAppReady, segments]);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return <InitSplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(doctor)" />
      <Stack.Screen name="init-splash" />
    </Stack>
  );
}
