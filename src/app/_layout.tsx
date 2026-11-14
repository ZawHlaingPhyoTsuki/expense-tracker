import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrationsJs from "../../drizzle/migrations"; // Import generated migrations

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { db } from "@/db/client";

const migrations = migrationsJs as unknown as Parameters<
  typeof useMigrations
>[1];

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Run migrations automatically when the layout mounts
  const { success, error } = useMigrations(db, migrations);

if (error) {
  console.error("Migration error:", error);
  console.error("Underlying cause:", error.cause);

  if (error.cause instanceof Error) {
    console.error("SQLite message:", error.cause.message);
    console.error("SQLite stack:", error.cause.stack);
  }

  return null;
}

  if (!success) {
    // Optionally show a loading screen while migrating
    return null;
  }

  // Only render the app after migrations are successful
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
