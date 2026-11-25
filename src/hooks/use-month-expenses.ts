import { and, desc, gte, lt } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { db } from "@/db/client";
import { expensesTable } from "@/db/schema";
import { addMonths } from "@/lib/dates";

/** Loads one month of expenses (newest first), live-updating on DB changes. */
export function useMonthExpenses(month: Date) {
  const start = month.getTime();
  const end = addMonths(new Date(start), 1).getTime();

  const { data, updatedAt } = useLiveQuery(
    db
      .select()
      .from(expensesTable)
      .where(and(gte(expensesTable.spentAt, start), lt(expensesTable.spentAt, end)))
      .orderBy(desc(expensesTable.spentAt)),
    [start, end],
  );

  return { rows: data ?? [], loaded: updatedAt !== undefined };
}