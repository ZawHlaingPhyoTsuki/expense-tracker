import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrationsJs from "../../drizzle/migrations";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { db } from "@/db/client";

const migrations = migrationsJs as unknown as Parameters<
  typeof useMigrations
>[1];

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    console.error("Migration error:", error, error.cause);
    return null;
  }
  if (!success) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="test"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: [0.7, 0.9], // Opens at 50% height, expandable to 90%
            sheetGrabberVisible: true, // Shows the top drag handle
            headerShown: true,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
