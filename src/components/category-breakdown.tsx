import { StyleSheet, View } from "react-native";
import { Bar } from "@/components/bar";
import { ThemedText } from "@/components/themed-text";
import { emojiFor } from "@/lib/categories";
import { formatMoney } from "@/lib/money";

type Props = { breakdown: [string, number][]; total: number };

export function CategoryBreakdown({ breakdown, total }: Props) {
  if (breakdown.length === 0 || total === 0) return null;
  return (
    <View style={styles.wrap}>
      {breakdown.map(([cat, sum]) => (
        <View key={cat} style={styles.row}>
          <ThemedText style={styles.label}>
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
  wrap: { marginTop: 24, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { width: 110, fontSize: 13, lineHeight: 18 },
  value: { width: 84, textAlign: "right", fontSize: 13, lineHeight: 18 },
});
