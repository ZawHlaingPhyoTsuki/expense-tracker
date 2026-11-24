import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing, THEMES, type ThemeId } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  useThemePreference,
  type ColorMode,
} from "@/providers/theme-preference";

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { colorMode, setColorMode, themeId, setThemeId } = useThemePreference();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          gap: Spacing.xl,
        }}
      >
        <ThemedText type="subtitle" style={styles.title}>
          Settings
        </ThemedText>
        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary">
            Appearance
          </ThemedText>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.modeRow}>
              {COLOR_MODES.map((mode) => {
                const selected = colorMode === mode.id;
                return (
                  <Pressable
                    key={mode.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setColorMode(mode.id)}
                    style={[
                      styles.modeOption,
                      {
                        backgroundColor: selected
                          ? theme.accent
                          : theme.backgroundSubtle,
                        borderColor: selected ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.modeLabel,
                        { color: selected ? theme.onAccent : theme.text },
                      ]}
                    >
                      {mode.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary">
            Theme
          </ThemedText>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            {THEMES.map((item, index) => {
              const selected = themeId === item.id;
              const preview = item.light;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setThemeId(item.id as ThemeId)}
                  style={[
                    styles.themeRow,
                    index < THEMES.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.themeInfo}>
                    <View style={styles.swatches}>
                      <View
                        style={[
                          styles.swatch,
                          { backgroundColor: preview.accent },
                        ]}
                      />
                      <View
                        style={[
                          styles.swatch,
                          {
                            backgroundColor: preview.background,
                            borderWidth: StyleSheet.hairlineWidth,
                            borderColor: theme.border,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.swatch,
                          { backgroundColor: preview.text },
                        ]}
                      />
                    </View>
                    <ThemedText style={styles.themeName}>{item.name}</ThemedText>
                  </View>
                  <View
                    style={[
                      styles.check,
                      {
                        backgroundColor: selected
                          ? theme.accent
                          : "transparent",
                        borderColor: selected ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    {selected ? (
                      <ThemedText
                        style={[styles.checkMark, { color: theme.onAccent }]}
                      >
                        ✓
                      </ThemedText>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 28, lineHeight: 34 },
  section: { gap: Spacing.sm },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  modeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  modeOption: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  modeLabel: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  themeInfo: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  swatches: { flexDirection: "row", gap: 6 },
  swatch: { width: 18, height: 18, borderRadius: 9 },
  themeName: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { fontSize: 13, lineHeight: 16, fontWeight: "700", marginTop: -1 },
});
