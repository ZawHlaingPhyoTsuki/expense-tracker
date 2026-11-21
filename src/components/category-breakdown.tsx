import { StyleSheet, View } from "react-native";
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
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        By category
      </ThemedText>
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
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 20, padding: 16, borderRadius: 16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { width: 100, fontSize: 13, lineHeight: 18 },
  value: { width: 78, textAlign: "right", fontSize: 13, lineHeight: 18 },
});
