import { Pressable, StyleSheet, View } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import type { Expense } from "@/db/schema";
import { emojiFor } from "@/lib/categories";
import { formatTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

type Props = {
  item: Expense;
  onPress: (item: Expense) => void;
  onLongPress: (item: Expense) => void;
};

export function ExpenseRow({ item, onPress, onLongPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
      accessibilityHint="Tap to edit, hold to delete"
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: theme.border,
          backgroundColor: pressed
            ? theme.backgroundSubtle
            : theme.backgroundElement,
        },
      ]}
    >
      <View
        style={[styles.icon, { backgroundColor: theme.backgroundSubtle }]}
      >
        <ThemedText style={styles.emoji}>{emojiFor(item.category)}</ThemedText>
      </View>
      <View style={styles.body}>
        <ThemedText numberOfLines={1} style={styles.title}>
          {item.note || item.category}
        </ThemedText>
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
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 20, lineHeight: 24 },
  body: { flex: 1, gap: 2 },
  title: { fontWeight: "600" },
  meta: { fontSize: 13, lineHeight: 18 },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
