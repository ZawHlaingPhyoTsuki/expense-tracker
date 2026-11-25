import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Bar } from "@/components/bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useMonthlyStats } from "@/hooks/use-monthly-stats";
import { addMonths, monthLabel } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export default function MonthsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { totals, stats, allTotal, max, loaded, error, retry } =
    useMonthlyStats();

  const { thisTotal, lastTotal, diff, pct } = stats;
  const diffColor =
    diff > 0 ? theme.danger : diff < 0 ? theme.good : theme.textSecondary;
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "–";

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.lg,
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
      >
        <ThemedText type="subtitle" style={styles.title}>
          Months
        </ThemedText>

        {error ? (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText style={styles.errorTitle}>
              Could not load months
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.errorText}>
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
        ) : (
          <>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {totals.length} {totals.length === 1 ? "month" : "months"} tracked
              · {formatMoney(allTotal)} total
            </ThemedText>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText type="label" themeColor="textSecondary">
                This month vs last month
              </ThemedText>

              <View style={styles.compareRow}>
                <View style={styles.compareCol}>
                  <ThemedText themeColor="textSecondary" style={styles.small}>
                    {monthLabel(new Date())}
                  </ThemedText>
                  <ThemedText style={styles.big}>
                    {formatMoney(thisTotal)}
                  </ThemedText>
                </View>
                <View style={[styles.compareCol, styles.compareRight]}>
                  <ThemedText themeColor="textSecondary" style={styles.small}>
                    {monthLabel(addMonths(new Date(), -1))}
                  </ThemedText>
                  <ThemedText style={styles.big}>
                    {formatMoney(lastTotal)}
                  </ThemedText>
                </View>
              </View>

              <View
                style={[
                  styles.delta,
                  { backgroundColor: theme.backgroundSubtle },
                ]}
              >
                <ThemedText style={[styles.deltaText, { color: diffColor }]}>
                  {lastTotal === 0
                    ? "No data last month"
                    : `${arrow} ${formatMoney(Math.abs(diff))} (${diff > 0 ? "+" : ""}${pct}%)`}
                </ThemedText>
              </View>
            </View>

            <ThemedText
              type="label"
              themeColor="textSecondary"
              style={styles.section}
            >
              All months
            </ThemedText>

            {loaded && totals.length === 0 ? (
              <View
                style={[
                  styles.empty,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}
              >
                <ThemedText themeColor="textSecondary">
                  No expenses yet.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.list}>
                {totals.map(([key, total]) => (
                  <View
                    key={key}
                    style={[
                      styles.monthRow,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.monthTop}>
                      <ThemedText style={styles.monthLabel}>
                        {monthLabel(new Date(key))}
                      </ThemedText>
                      <ThemedText style={styles.monthValue}>
                        {formatMoney(total)}
                      </ThemedText>
                    </View>
                    <Bar ratio={total / max} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 28, lineHeight: 34 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: Spacing.xs },
  card: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  compareRow: { flexDirection: "row", justifyContent: "space-between" },
  compareCol: { gap: 2 },
  compareRight: { alignItems: "flex-end" },
  small: { fontSize: 13, lineHeight: 18 },
  big: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  delta: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  deltaText: { fontSize: 13, lineHeight: 18, fontWeight: "700" },
  section: { marginTop: Spacing.xl, marginBottom: Spacing.sm },
  list: { gap: Spacing.sm },
  monthRow: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  monthTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthLabel: { fontSize: 15, fontWeight: "600" },
  monthValue: {
    fontSize: 15,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  empty: {
    padding: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  errorTitle: { fontSize: 16, lineHeight: 22, fontWeight: "700" },
  errorText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  retryButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  retryText: { fontSize: 14, fontWeight: "700" },
});