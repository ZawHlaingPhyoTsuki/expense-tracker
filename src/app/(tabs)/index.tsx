import { useMemo, useState } from "react";
import { Alert, SectionList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { eq } from "drizzle-orm";

import { CategoryBreakdown } from "@/components/category-breakdown";
import { ExpenseRow } from "@/components/expense-row";
import { MonthSwitcher } from "@/components/month-switcher";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { db } from "@/db/client";
import { expensesTable, type Expense } from "@/db/schema";
import { useMonthExpenses } from "@/hooks/use-month-expenses";
import {
  addMonths,
  daysInMonth,
  formatDay,
  startOfDay,
  startOfMonth,
} from "@/lib/dates";
import { formatMoney } from "@/lib/money";

type DaySection = { title: string; total: number; data: Expense[] };

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => startOfMonth());
  const { rows, reload } = useMonthExpenses(month);

  const isCurrentMonth = month.getTime() === startOfMonth().getTime();

  const { total, breakdown, sections } = useMemo(() => {
    const cats = new Map<string, number>();
    const days = new Map<number, DaySection>();
    let sum = 0;
    // rows are already newest first, so Map insertion order = newest day first
    for (const r of rows) {
      sum += r.amount;
      cats.set(r.category, (cats.get(r.category) ?? 0) + r.amount);
      const key = startOfDay(new Date(r.spentAt)).getTime();
      let day = days.get(key);
      if (!day) {
        day = { title: formatDay(r.spentAt), total: 0, data: [] };
        days.set(key, day);
      }
      day.total += r.amount;
      day.data.push(r);
    }
    return {
      total: sum,
      breakdown: [...cats.entries()].sort((a, b) => b[1] - a[1]),
      sections: [...days.values()],
    };
  }, [rows]);

  // current month: divide by days passed so far; past months: by all days
  const daysCounted = isCurrentMonth
    ? new Date().getDate()
    : daysInMonth(month);
  const avgPerDay = Math.round(total / Math.max(1, daysCounted));

  function confirmDelete(item: Expense) {
    Alert.alert(
      "Delete expense?",
      `${formatMoney(item.amount)} · ${item.note || item.category}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.delete(expensesTable).where(eq(expensesTable.id, item.id));
            reload();
          },
        },
      ],
    );
  }

  const header = (
    <View>
      <MonthSwitcher
        month={month}
        onShift={(d) => setMonth(addMonths(month, d))}
        disableNext={isCurrentMonth}
      />
      <ThemedText style={styles.total}>{formatMoney(total)}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.caption}>
        {rows.length} {rows.length === 1 ? "expense" : "expenses"} · avg{" "}
        {formatMoney(avgPerDay)}/day
      </ThemedText>
      <CategoryBreakdown breakdown={breakdown} total={total} />
    </View>
  );

  return (
    <ThemedView style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            No expenses this month. Tap “Add expense” to log your first one.
          </ThemedText>
        }
        ListFooterComponent={
          rows.length > 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Press and hold an expense to delete it.
            </ThemedText>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {section.title}
            </ThemedText>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {formatMoney(section.total)}
            </ThemedText>
          </ThemedView>
        )}
        renderItem={({ item }) => (
          <ExpenseRow item={item} onLongPress={confirmDelete} />
        )}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  total: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: 700,
    letterSpacing: -1.5,
    marginTop: 16,
  },
  caption: { fontSize: 14, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 24,
    paddingBottom: 6,
  },
  empty: { marginTop: 40, textAlign: "center" },
  hint: { textAlign: "center", fontSize: 12, marginTop: 20 },
});
