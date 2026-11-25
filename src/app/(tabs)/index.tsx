import { useMemo, useState } from "react";
import { Pressable, SectionList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddExpenseModal } from "@/components/add-expense-modal";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { DeleteExpenseDialog } from "@/components/delete-expense-dialog";
import { ExpenseRow } from "@/components/expense-row";
import { MonthSwitcher } from "@/components/month-switcher";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";
import type { Expense } from "@/db/schema";
import { useMonthExpenses } from "@/hooks/use-month-expenses";
import { useTheme } from "@/hooks/use-theme";
import { addMonths, startOfMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { averagePerDay, summarizeMonth } from "@/lib/stats";

export default function DailyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(() => startOfMonth());
  const [form, setForm] = useState<{ expense?: Expense } | null>(null);
  const [addKey, setAddKey] = useState(0);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const { rows, loaded, error, retry } = useMonthExpenses(month);

  const isCurrentMonth = month.getTime() === startOfMonth().getTime();
  const { total, breakdown, sections } = useMemo(
    () => summarizeMonth(rows),
    [rows],
  );
  const avg = averagePerDay(total, month);

  const header = (
    <View style={styles.header}>
      {/* Month switcher */}
      <MonthSwitcher
        month={month}
        onShift={(d) => setMonth(addMonths(month, d))}
        disableNext={isCurrentMonth}
      />

      {/* Summary card */}
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
              {formatMoney(avg)}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.statLabel}>
              avg / day
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Category breakdown */}
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
          error ? (
            <View
              style={[
                styles.empty,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText style={styles.emptyTitle}>Could not load expenses</ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Check your database and try again.
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={retry}
                style={({ pressed }) => [
                  styles.retryButton,
                  {
                    backgroundColor: theme.accentSoft,
                    borderColor: theme.accent,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <ThemedText style={[styles.retryText, { color: theme.accent }]}>
                  Retry
                </ThemedText>
              </Pressable>
            </View>
          ) : loaded ? (
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
          ) : undefined
        }
        ListFooterComponent={
          rows.length > 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              Tap an expense to edit it. Hold to delete.
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
            <ExpenseRow
              item={item}
              onPress={(expense) => setForm({ expense })}
              onLongPress={setToDelete}
            />
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
        onPress={() => {
          setAddKey((k) => k + 1);
          setForm({});
        }}
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
        key={form?.expense ? `edit-${form.expense.id}` : `add-${addKey}`}
        visible={form !== null}
        expense={form?.expense}
        onClose={() => setForm(null)}
      />

      <DeleteExpenseDialog
        expense={toDelete}
        onClose={() => setToDelete(null)}
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
  retryButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
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
