import { useMemo, useState } from "react";
import { Alert, Pressable, SectionList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { eq } from "drizzle-orm";

import { AddExpenseModal } from "@/components/add-expense-modal";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { ExpenseRow } from "@/components/expense-row";
import { MonthSwitcher } from "@/components/month-switcher";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";
import { db } from "@/db/client";
import { expensesTable, type Expense } from "@/db/schema";
import { useMonthExpenses } from "@/hooks/use-month-expenses";
import { useTheme } from "@/hooks/use-theme";
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
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => startOfMonth());
  const [adding, setAdding] = useState(false);
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
  const daysCounted = isCurrentMonth ? new Date().getDate() : daysInMonth(month);
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
            try {
              await db
                .delete(expensesTable)
                .where(eq(expensesTable.id, item.id));
              await reload();
            } catch {
              Alert.alert("Could not delete expense", "Please try again.");
            }
          },
        },
      ],
    );
  }

  const header = (
    <View style={styles.header}>
      <MonthSwitcher
        month={month}
        onShift={(d) => setMonth(addMonths(month, d))}
        disableNext={isCurrentMonth}
      />

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}
      >
        <ThemedText type="label" themeColor="textSecondary">
          Spent this month
        </ThemedText>
        <ThemedText style={styles.total}>{formatMoney(total)}</ThemedText>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>{rows.length}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              {rows.length === 1 ? "expense" : "expenses"}
            </ThemedText>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.border }]}
          />
          <View style={styles.stat}>
            <ThemedText style={styles.statValue}>
              {formatMoney(avgPerDay)}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              avg / day
            </ThemedText>
          </View>
        </View>
      </View>

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
          <View
            style={[
              styles.empty,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText style={styles.emptyTitle}>No expenses yet</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Tap + to log your first expense for this month.
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          rows.length > 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Hold an expense to delete it.
            </ThemedText>
          ) : undefined
        }
        renderSectionHeader={({ section }) => (
          <ThemedView style={styles.sectionHeader}>
            <ThemedText type="smallBold">{section.title}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.sectionTotal}>
              {formatMoney(section.total)}
            </ThemedText>
          </ThemedView>
        )}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <ExpenseRow item={item} onLongPress={confirmDelete} />
          </View>
        )}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + 96,
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        onPress={() => setAdding(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing.lg,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <ThemedText style={[styles.fabText, { color: theme.onAccent }]}>
          +
        </ThemedText>
      </Pressable>

      <AddExpenseModal
        visible={adding}
        onClose={() => setAdding(false)}
        onSaved={reload}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { marginBottom: Spacing.sm },
  summaryCard: {
    marginTop: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  total: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "700",
    letterSpacing: -1.5,
    fontVariant: ["tabular-nums"],
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  stat: { gap: 2 },
  statValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  statLabel: { fontSize: 13, lineHeight: 18 },
  statDivider: { width: 1, height: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  sectionTotal: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  rowWrap: { marginBottom: Spacing.sm },
  empty: {
    marginTop: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  emptyTitle: { fontSize: 18, lineHeight: 24, fontWeight: "700" },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  hint: { textAlign: "center", fontSize: 12, marginTop: Spacing.lg },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 32, lineHeight: 36, fontWeight: "500", marginTop: -2 },
});