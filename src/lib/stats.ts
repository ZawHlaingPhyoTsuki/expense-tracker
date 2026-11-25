import type { Expense } from "@/db/schema";
import {
  addMonths,
  daysInMonth,
  formatDay,
  startOfDay,
  startOfMonth,
} from "@/lib/dates";

/** One day group for the Daily screen SectionList. Amounts are minor units. */
export type DaySection = { title: string; total: number; data: Expense[] };

/**
 * Aggregates one month's expenses for the Daily screen.
 *
 * Input rows should be newest-first (the UI keeps that order). Amounts are in
 * minor units, so totals are summed as integers.
 */
export function summarizeMonth(rows: Expense[]) {
  const cats = new Map<string, number>();
  const days = new Map<number, DaySection>();
  let total = 0;

  for (const r of rows) {
    total += r.amount;
    cats.set(r.category, (cats.get(r.category) ?? 0) + r.amount);

    const key = startOfDay(new Date(r.spentAt)).getTime();
    let day = days.get(key);
    if (!day) {
      // First row seen for this day sets its title/order; rows are newest-first.
      day = { title: formatDay(r.spentAt), total: 0, data: [] };
      days.set(key, day);
    }
    day.total += r.amount;
    day.data.push(r);
  }

  return {
    total,
    /** Category totals, highest first, for the breakdown chart. */
    breakdown: [...cats.entries()].sort((a, b) => b[1] - a[1]),
    /** Day sections, newest day first. */
    sections: [...days.values()],
  };
}

/**
 * Average daily spend for a month, in minor units.
 *
 * Current month uses days elapsed so far; past months use the full month length.
 */
export function averagePerDay(total: number, month: Date) {
  const isCurrent = month.getTime() === startOfMonth().getTime();
  const days = isCurrent ? new Date().getDate() : daysInMonth(month);
  return Math.round(total / Math.max(1, days));
}

type MonthRow = { amount: number; spentAt: number };

/** Groups expense rows by month start (ms) and returns [monthStartMs, total], newest first. */
export function totalsByMonth(rows: MonthRow[]): [number, number][] {
  const map = new Map<number, number>();
  for (const r of rows) {
    const key = startOfMonth(new Date(r.spentAt)).getTime();
    map.set(key, (map.get(key) ?? 0) + r.amount);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

/**
 * Compares the current month to the previous month.
 *
 * `pct` is null when there is no previous-month baseline to compare against.
 */
export function compareMonths(totals: [number, number][], now = startOfMonth()) {
  const map = new Map(totals);
  const thisTotal = map.get(now.getTime()) ?? 0;
  const lastTotal = map.get(addMonths(now, -1).getTime()) ?? 0;
  const diff = thisTotal - lastTotal;
  const pct = lastTotal > 0 ? Math.round((diff / lastTotal) * 100) : null;
  return { thisTotal, lastTotal, diff, pct };
}

