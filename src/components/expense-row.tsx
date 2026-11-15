import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import type { Expense } from "@/db/schema";
import { emojiFor } from "@/lib/categories";
import { formatTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

type Props = { item: Expense; onLongPress: (item: Expense) => void };

export function ExpenseRow({ item, onLongPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onLongPress={() => onLongPress(item)}
      style={[styles.row, { borderBottomColor: theme.border }]}
    >
      <ThemedText style={styles.emoji}>{emojiFor(item.category)}</ThemedText>
      <View style={{ flex: 1 }}>
        <ThemedText numberOfLines={1}>{item.note || item.category}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.meta}>
          {item.category} · {formatTime(item.spentAt)}
        </ThemedText>
      </View>
      <ThemedText style={styles.amount}>{formatMoney(item.amount)}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emoji: { fontSize: 24, lineHeight: 30 },
  meta: { fontSize: 13, lineHeight: 18 },
  amount: { fontWeight: 700 },
});
