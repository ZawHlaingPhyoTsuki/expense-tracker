import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrationsJs from "../../drizzle/migrations";

import { db } from "@/db/client";
import {
  ThemePreferenceProvider,
  useThemePreference,
} from "@/providers/theme-preference";

const migrations = migrationsJs as unknown as Parameters<
  typeof useMigrations
>[1];

export const unstable_settings = { anchor: "(tabs)" };

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { palette, resolvedScheme } = useThemePreference();

  const navTheme = useMemo(() => {
    const base = resolvedScheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.background,
        card: palette.background,
        text: palette.text,
        border: palette.border,
        primary: palette.accent,
      },
    };
  }, [resolvedScheme, palette]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(palette.background);
  }, [palette.background]);

  return (
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.background },
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success || error) SplashScreen.hideAsync();
  }, [success, error]);

  if (error) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorTitle}>Could not open the database</Text>
        <Text style={styles.errorBody}>{String(error)}</Text>
      </View>
    );
  }
  if (!success) return null;

  return (
    <ThemePreferenceProvider>
      <RootLayoutNav />
    </ThemePreferenceProvider>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, justifyContent: "center", padding: 24, gap: 8 },
  errorTitle: { fontSize: 18, fontWeight: "700" },
  errorBody: { fontSize: 13, opacity: 0.7 },
});
