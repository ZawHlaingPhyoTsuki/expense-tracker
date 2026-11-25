import { useMemo, useState } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { db } from "@/db/client";
import { expensesTable } from "@/db/schema";
import { startOfMonth } from "@/lib/dates";
import { compareMonths, totalsByMonth } from "@/lib/stats";

export function useMonthlyStats() {
  const [retryNonce, setRetryNonce] = useState(0);
  
  const { data, error, updatedAt } = useLiveQuery(
    db
      .select({
        amount: expensesTable.amount,
        spentAt: expensesTable.spentAt,
      })
      .from(expensesTable),
    [retryNonce],
  );

  const loaded = updatedAt !== undefined;
  const totals = useMemo(() => totalsByMonth(data ?? []), [data]);
  const thisMonth = startOfMonth();
  const stats = useMemo(() => compareMonths(totals, thisMonth), [totals, thisMonth]);
  
  const allTotal = useMemo(() => totals.reduce((sum, [, t]) => sum + t, 0), [totals]);
  const max = useMemo(() => Math.max(1, ...totals.map(([, t]) => t)), [totals]);

  return {
    totals,
    stats,
    allTotal,
    max,
    loaded,
    error,
    retry: () => setRetryNonce((n) => n + 1),
  };
}