import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function LoginScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Login Screen</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#66BB6A',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff'
  }
});
