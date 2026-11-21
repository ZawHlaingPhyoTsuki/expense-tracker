import { StyleSheet, View } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { Bar } from "@/components/bar";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { emojiFor } from "@/lib/categories";
import { formatMoney } from "@/lib/money";

type Props = { breakdown: [string, number][]; total: number };

export function CategoryBreakdown({ breakdown, total }: Props) {
  const theme = useTheme();
  if (breakdown.length === 0 || total === 0) return null;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <ThemedText type="label" themeColor="textSecondary">
        Where it went
      </ThemedText>
      <View style={styles.list}>
        {breakdown.map(([cat, sum]) => (
          <View key={cat} style={styles.row}>
            <ThemedText style={styles.label} numberOfLines={1}>
              {emojiFor(cat)} {cat}
            </ThemedText>
            <Bar ratio={sum / total} />
            <ThemedText themeColor="textSecondary" style={styles.value}>
              {formatMoney(sum)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  list: { gap: Spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  label: { width: 104, fontSize: 14, lineHeight: 20 },
  value: {
    width: 76,
    textAlign: "right",
    fontSize: 13,
    lineHeight: 18,
    fontVariant: ["tabular-nums"],
  },
});
