import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestingTab() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={
        (styles.screen,
        { paddingTop: insets.top, paddingHorizontal: 20, paddingBottom: insets.bottom })
      }
    >
      <ThemedText>TestingTab</ThemedText>

      <Link href="/test" asChild>
          <ThemedText>Go to test</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
