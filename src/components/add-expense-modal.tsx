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
      style={[
        styles.chip,
        { borderColor: active ? theme.accent : theme.border },
        active && { backgroundColor: theme.accentSoft },
      ]}
    >
      <ThemedText style={[styles.chipText, active && { fontWeight: 700 }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function AddExpenseModal({ visible, onClose, onSaved }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].key);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [wasVisible, setWasVisible] = useState(false);

  // start fresh every time the sheet opens (adjust state during render)
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setAmount("");
      setCategory(CATEGORIES[0].key);
      setNote("");
      setDate(startOfDay(new Date()));
    }
  }

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
    const minor = parseAmount(amount);
    if (minor === null) {
      Alert.alert(
        "Enter an amount",
        "Use numbers greater than 0, like 85, 120.50 or 45+25.",
      );
      return;
    }
    // selected day + current time of day, so ordering inside a day stays sensible
    const now = new Date();
    const spentAt = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
    ).getTime();

    await db
      .insert(expensesTable)
      .values({ amount: minor, category, note: note.trim(), spentAt });
    onSaved();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <ThemedView style={styles.screen}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <ThemedText style={styles.headerTitle}>New expense</ThemedText>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText style={[styles.headerAction, { color: theme.accent }]}>
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
            <ThemedText themeColor="textSecondary" style={styles.label}>
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
              {/* decimal-pad has no "+" key on Android */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add another amount"
                onPress={() =>
                  setAmount((a) => (a && !a.endsWith("+") ? a + "+" : a))
                }
                style={[
                  styles.plus,
                  {
                    backgroundColor: theme.accentSoft,
                    borderColor: theme.accent,
                  },
                ]}
              >
                <ThemedText style={styles.plusText}>+</ThemedText>
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

            <ThemedText themeColor="textSecondary" style={styles.label}>
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

            <ThemedText themeColor="textSecondary" style={styles.label}>
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
                label={isCustom ? `📅 ${formatShortDate(date)}` : "📅 Pick date"}
                active={isCustom}
                onPress={pickDate}
              />
            </View>

            <ThemedText themeColor="textSecondary" style={styles.label}>
              Note (optional)
            </ThemedText>
            <ThemedInput
              value={note}
              onChangeText={setNote}
              placeholder="Lunch, coffee, taxi…"
              returnKeyType="done"
              onSubmitEditing={save}
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingBottom: insets.bottom + 12,
                backgroundColor: theme.background,
                borderTopColor: theme.border,
              },
            ]}
          >
            <Pressable
              onPress={save}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.save,
                { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <ThemedText style={[styles.saveText, { color: theme.onAccent }]}>
                {parsed !== null
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontWeight: 700 },
  headerAction: { fontSize: 16, fontWeight: 600 },
  content: { padding: 20, paddingBottom: 24 },
  label: { fontSize: 13, marginTop: 20, marginBottom: 6 },
  amountRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  amountInput: { fontSize: 28, fontWeight: 700 },
  preview: { marginTop: 6, fontSize: 14 },
  plus: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { fontSize: 26, lineHeight: 30, fontWeight: 700 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, lineHeight: 20 },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  save: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  saveText: { fontSize: 16, fontWeight: 700 },
});
