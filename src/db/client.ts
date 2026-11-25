import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

const expo = SQLite.openDatabaseSync("app.db", { enableChangeListener: true });
export const db = drizzle(expo);