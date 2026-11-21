import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrationsJs from "../../drizzle/migrations";

import { Colors } from "@/constants/theme";
import { db } from "@/db/client";

const migrations = migrationsJs as unknown as Parameters<
  typeof useMigrations
>[1];

export const unstable_settings = { anchor: "(tabs)" };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === "dark";
  const colors = Colors[dark ? "dark" : "light"];
  const { success, error } = useMigrations(db, migrations);

  // Theme the native stack container too, otherwise its default white
  // background flashes during screen transitions.
  const navTheme = useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        primary: colors.accent,
      },
    };
  }, [dark, colors]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

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
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, justifyContent: "center", padding: 24, gap: 8 },
  errorTitle: { fontSize: 18, fontWeight: "700" },
  errorBody: { fontSize: 13, opacity: 0.7 },
});
