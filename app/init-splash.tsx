import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, StatusBar, View, Image, Platform } from "react-native";
import AppThreeDotsLoading from "@/components/app-three-dots-loading";
import { Colors } from "@/constants/theme";

const ICON_PATH = require('@/assets/images/splash-icon.png');
const SPLASH_BG_COLOR = Colors.light.tint

export default function InitSplashScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar hidden={true} />

      {/* Heart Icon (inside the white rounded square) */}
      <View style={styles.logoContainer}>
        <Image 
            source={ICON_PATH}
            style={styles.logo}
        />
      </View>

      {/* Title Text */}
      <ThemedText style={styles.titleText} type="title">FitsidikaApp</ThemedText>
      
      {/* Tagline Text */}
      <ThemedText style={styles.taglineText} type="subtitle">Votre santé, notre priorité</ThemedText>
      
      {/* Animated Loading Dots */}
      <AppThreeDotsLoading />
      
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BG_COLOR, 
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoContainer: {
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  logo: {
    width: 60, 
    height: 60,
    resizeMode: 'contain',
    tintColor: SPLASH_BG_COLOR, 
  },
  titleText: {
    color: 'white',
    fontSize: 24,
  },
  taglineText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
  },
});
