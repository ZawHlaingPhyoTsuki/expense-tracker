import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";
import { eq } from "drizzle-orm";

import { Radius, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { db } from "@/db/client";
import { expensesTable, type Expense } from "@/db/schema";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney } from "@/lib/money";

type Props = { expense: Expense | null; onClose: () => void };

export function DeleteExpenseDialog({ expense, onClose }: Props) {
  const theme = useTheme();
  const [deleting, setDeleting] = useState(false);

  function close() {
    if (!deleting) onClose();
  }

  async function onDelete() {
    if (!expense || deleting) return;
    setDeleting(true);
    try {
      await db.delete(expensesTable).where(eq(expensesTable.id, expense.id));
      onClose();
    } catch {
      Alert.alert("Could not delete expense", "Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      visible={expense !== null}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <Pressable
        accessible={false}
        style={styles.backdrop}
        onPress={close}
      >
        <Pressable
          accessible={false}
          style={[
            styles.card,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}
          onPress={() => {}}
        >
          <ThemedText style={styles.title}>Delete expense?</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.body}>
            {expense
              ? `${formatMoney(expense.amount)} · ${expense.note || expense.category}`
              : ""}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.note}>
            This cannot be undone.
          </ThemedText>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              disabled={deleting}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundSubtle,
                  opacity: deleting ? 0.5 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => void onDelete()}
              disabled={deleting}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: theme.danger,
                  opacity: deleting ? 0.55 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <ThemedText style={[styles.buttonText, { color: "#fff" }]}>
                {deleting ? "Deleting…" : "Delete"}
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  title: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  body: { fontSize: 15, lineHeight: 22 },
  note: { fontSize: 13, lineHeight: 18 },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: { borderWidth: 1 },
  buttonText: { fontSize: 15, fontWeight: "700" },
});
