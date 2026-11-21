import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const expensesTable = sqliteTable("expenses", {
  id: int().primaryKey({ autoIncrement: true }),
  // Stored in minor units (satang/cents) so there are no floating point errors
  amount: int().notNull(),
  category: text().notNull(),
  note: text().notNull().default(""),
  // Unix timestamp in milliseconds
  spentAt: int().notNull(),
});

export type Expense = typeof expensesTable.$inferSelect;