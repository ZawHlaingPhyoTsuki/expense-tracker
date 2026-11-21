import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { Radius, Spacing } from "@/constants/theme";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { db } from "@/db/client";
import { expensesTable } from "@/db/schema";
import { useTheme } from "@/hooks/use-theme";
import { CATEGORIES } from "@/lib/categories";
import { addDays, formatShortDate, isSameDay, startOfDay } from "@/lib/dates";
import { CURRENCY, formatMoney, parseAmount } from "@/lib/money";

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: active ? theme.accent : theme.border,
          backgroundColor: active ? theme.accentSoft : theme.backgroundElement,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.chipText,
          { color: active ? theme.accent : theme.text },
          active && styles.chipTextActive,
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

export function AddExpenseModal({ visible, onClose, onSaved }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].key);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [saving, setSaving] = useState(false);

  const today = startOfDay(new Date());
  const yesterday = addDays(today, -1);
  const isToday = isSameDay(date, today);
  const isYesterday = isSameDay(date, yesterday);
  const isCustom = !isToday && !isYesterday;

  const parsed = parseAmount(amount);
  const previewInvalid = amount.includes("+") && parsed === null;

  function pickDate() {
    DateTimePickerAndroid.open({
      value: date,
      mode: "date",
      maximumDate: new Date(), // no future dates
      onChange: (event, picked) => {
        if (event.type === "set" && picked) setDate(startOfDay(picked));
      },
    });
  }

  async function save() {
    if (saving) return;
    const minor = parseAmount(amount);
    if (minor === null) {
      Alert.alert(
        "Enter an amount",
        "Use numbers greater than 0, like 85, 120.50 or 45+25.",
      );
      return;
    }

    const now = new Date();
    const spentAt = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    ).getTime();

    let inserted = false;
    setSaving(true);
    try {
      await db
        .insert(expensesTable)
        .values({ amount: minor, category, note: note.trim(), spentAt });
      inserted = true;
      await onSaved();
      onClose();
    } catch {
      if (inserted) {
        Alert.alert("Saved, but could not refresh the list", "Pull to refresh or reopen the app.");
        onClose();
      } else {
        Alert.alert("Could not save expense", "Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={saving ? () => {} : onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <ThemedView style={styles.screen}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.sm,
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <ThemedText type="subtitle" style={styles.headerTitle}>
            New expense
          </ThemedText>
          <Pressable
            onPress={onClose}
            disabled={saving}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityState={{ disabled: saving }}
          >
            <ThemedText
              style={[
                styles.headerAction,
                { color: theme.accent, opacity: saving ? 0.45 : 1 },
              ]}
            >
              Cancel
            </ThemedText>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.screen}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View
              style={[
                styles.amountCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <ThemedText type="label" themeColor="textSecondary">
                Amount ({CURRENCY})
              </ThemedText>
              <View style={styles.amountRow}>
                <View style={{ flex: 1 }}>
                  <ThemedInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    autoFocus
                    style={styles.amountInput}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add another amount"
                  onPress={() =>
                    setAmount((a) => (a && !a.endsWith("+") ? a + "+" : a))
                  }
                  style={({ pressed }) => [
                    styles.plus,
                    {
                      backgroundColor: theme.accentSoft,
                      borderColor: theme.accent,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <ThemedText style={[styles.plusText, { color: theme.accent }]}>
                    +
                  </ThemedText>
                </Pressable>
              </View>
              {amount.includes("+") && (
                <ThemedText
                  style={[
                    styles.preview,
                    { color: previewInvalid ? theme.danger : theme.accent },
                  ]}
                >
                  {previewInvalid
                    ? "Check the numbers"
                    : `= ${formatMoney(parsed ?? 0)}`}
                </ThemedText>
              )}
            </View>

            <View style={styles.section}>
              <ThemedText type="label" themeColor="textSecondary">
                Category
              </ThemedText>
              <View style={styles.chips}>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.key}
                    label={`${c.emoji} ${c.key}`}
                    active={c.key === category}
                    onPress={() => setCategory(c.key)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="label" themeColor="textSecondary">
                Date
              </ThemedText>
              <View style={styles.chips}>
                <Chip
                  label="Today"
                  active={isToday}
                  onPress={() => setDate(today)}
                />
                <Chip
                  label="Yesterday"
                  active={isYesterday}
                  onPress={() => setDate(yesterday)}
                />
                <Chip
                  label={
                    isCustom ? `📅 ${formatShortDate(date)}` : "📅 Pick date"
                  }
                  active={isCustom}
                  onPress={pickDate}
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="label" themeColor="textSecondary">
                Note (optional)
              </ThemedText>
              <ThemedInput
                value={note}
                onChangeText={setNote}
                placeholder="Lunch, coffee, taxi…"
                returnKeyType="done"
                onSubmitEditing={() => void save()}
              />
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingBottom: insets.bottom + Spacing.md,
                backgroundColor: theme.background,
                borderTopColor: theme.border,
              },
            ]}
          >
            <Pressable
              onPress={() => void save()}
              disabled={saving}
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
              style={({ pressed }) => [
                styles.save,
                {
                  backgroundColor: theme.accent,
                  opacity: saving ? 0.55 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <ThemedText style={[styles.saveText, { color: theme.onAccent }]}>
                {saving
                  ? "Saving…"
                  : parsed !== null
                    ? `Save ${formatMoney(parsed)}`
                    : "Save expense"}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 24, lineHeight: 30 },
  headerAction: { fontSize: 16, fontWeight: "600" },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.xl },
  amountCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  amountRow: { flexDirection: "row", gap: Spacing.sm, alignItems: "center" },
  amountInput: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    minHeight: 60,
  },
  preview: { fontSize: 14, fontWeight: "600" },
  plus: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { fontSize: 28, lineHeight: 32, fontWeight: "600" },
  section: { gap: Spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  chipTextActive: { fontWeight: "700" },
  footer: {
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  save: {
    minHeight: 54,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { fontSize: 16, fontWeight: "700" },
});