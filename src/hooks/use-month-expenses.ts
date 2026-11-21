import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { and, desc, gte, lt } from "drizzle-orm";
import { db } from "@/db/client";
import { expensesTable, type Expense } from "@/db/schema";
import { addMonths } from "@/lib/dates";

/** Loads one month of expenses (newest first). Reloads every time the screen is focused. */
export function useMonthExpenses(month: Date) {
  const [rows, setRows] = useState<Expense[]>([]);
  const start = month.getTime();

  const load = useCallback(async () => {
    const end = addMonths(new Date(start), 1).getTime();
    const result = await db
      .select()
      .from(expensesTable)
      .where(and(gte(expensesTable.spentAt, start), lt(expensesTable.spentAt, end)))
      .orderBy(desc(expensesTable.spentAt));
    setRows(result);
  }, [start]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { rows, reload: load };
}