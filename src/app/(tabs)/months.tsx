import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { Bar } from "@/components/bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { db } from "@/db/client";
import { expensesTable } from "@/db/schema";
import { useTheme } from "@/hooks/use-theme";
import { addMonths, monthLabel, startOfMonth } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export default function MonthsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  // [monthStartMs, total][] newest first
  const [totals, setTotals] = useState<[number, number][]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const result = await db
          .select({
            amount: expensesTable.amount,
            spentAt: expensesTable.spentAt,
          })
          .from(expensesTable);
        if (!alive) return;
        const map = new Map<number, number>();
        for (const r of result) {
          // bucket by LOCAL month
          const key = startOfMonth(new Date(r.spentAt)).getTime();
          map.set(key, (map.get(key) ?? 0) + r.amount);
        }
        setTotals([...map.entries()].sort((a, b) => b[0] - a[0]));
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const map = new Map(totals);
  const thisMonth = startOfMonth();
  const thisTotal = map.get(thisMonth.getTime()) ?? 0;
  const lastTotal = map.get(addMonths(thisMonth, -1).getTime()) ?? 0;
  const diff = thisTotal - lastTotal;
  const pct = lastTotal > 0 ? Math.round((diff / lastTotal) * 100) : null;
  const diffColor =
    diff > 0 ? theme.danger : diff < 0 ? theme.good : theme.textSecondary;
  const arrow = diff > 0 ? "▲" : diff < 0 ? "▼" : "–";
  const max = Math.max(1, ...totals.map(([, t]) => t));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        <ThemedText style={styles.title}>Months</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            This month vs last month
          </ThemedText>
          <View style={styles.cardRow}>
            <View>
              <ThemedText themeColor="textSecondary" style={styles.small}>
                {monthLabel(thisMonth)}
              </ThemedText>
              <ThemedText style={styles.big}>
                {formatMoney(thisTotal)}
              </ThemedText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <ThemedText themeColor="textSecondary" style={styles.small}>
                {monthLabel(addMonths(thisMonth, -1))}
              </ThemedText>
              <ThemedText style={styles.big}>
                {formatMoney(lastTotal)}
              </ThemedText>
            </View>
          </View>
          {lastTotal === 0 ? (
            <ThemedText themeColor="textSecondary">
              No data last month
            </ThemedText>
          ) : (
            <ThemedText style={{ color: diffColor, fontWeight: 600 }}>
              {arrow} {formatMoney(Math.abs(diff))} ({diff > 0 ? "+" : ""}
              {pct}%)
            </ThemedText>
          )}
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          All months
        </ThemedText>

        {totals.length === 0 && (
          <ThemedText themeColor="textSecondary">No expenses yet.</ThemedText>
        )}

        {totals.map(([key, total]) => (
          <View key={key} style={styles.monthRow}>
            <View style={styles.monthTop}>
              <ThemedText>{monthLabel(new Date(key))}</ThemedText>
              <ThemedText style={{ fontWeight: 700 }}>
                {formatMoney(total)}
              </ThemedText>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Bar ratio={total / max} />
            </View>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 28, lineHeight: 36, fontWeight: 700 },
  card: { marginTop: 16, padding: 16, borderRadius: 16, gap: 12 },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  small: { fontSize: 13, lineHeight: 18 },
  big: { fontSize: 24, lineHeight: 32, fontWeight: 700 },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    marginTop: 32,
    marginBottom: 8,
  },
  monthRow: { paddingVertical: 10, gap: 8 },
  monthTop: { flexDirection: "row", justifyContent: "space-between" },
});
