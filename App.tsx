import { ActivityIndicator, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "./db/client";
import migrationsJs from "./drizzle/migrations";
import Tracker from "./screens/Tracker";

// drizzle-orm 1.0.0-rc.5 typings still describe the v0 migrations shape
const migrations = migrationsJs as unknown as Parameters<typeof useMigrations>[1];

export default function App() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text style={{ color: "#B42318" }}>Database error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Tracker />
    </SafeAreaProvider>
  );
}
