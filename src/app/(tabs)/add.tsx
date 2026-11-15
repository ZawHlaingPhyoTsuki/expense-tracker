import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
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

export default function AddExpense() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].key);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => startOfDay(new Date()));

  const today = startOfDay(new Date());
  const yesterday = addDays(today, -1);
  const isToday = isSameDay(date, today);
  const isYesterday = isSameDay(date, yesterday);
  const isCustom = !isToday && !isYesterday;

  const preview = amount.includes("+") ? parseAmount(amount) : null;
  const previewInvalid = amount.includes("+") && preview === null;

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
    router.back(); // screens reload on focus
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <ThemedText themeColor="textSecondary" style={styles.label}>
            Amount ({CURRENCY})
          </ThemedText>
          <View style={styles.amountRow}>
            <View style={{ flex: 1 }}>
              <ThemedInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00  (or 45+25)"
                keyboardType="decimal-pad"
                autoFocus
                style={styles.amountInput}
              />
            </View>
            {/* decimal-pad has no "+" key on Android */}
            <Pressable
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
              style={{
                marginTop: 6,
                color: previewInvalid ? theme.danger : theme.accent,
              }}
            >
              {previewInvalid
                ? "Check the numbers"
                : `= ${formatMoney(preview ?? 0)}`}
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
            placeholder="Lunch, 90-day report…"
            returnKeyType="done"
            onSubmitEditing={save}
          />

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.btn, { backgroundColor: theme.backgroundElement }]}
            >
              <ThemedText style={{ fontWeight: 600 }}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={save}
              style={[styles.btn, { backgroundColor: theme.accent }]}
            >
              <ThemedText style={{ fontWeight: 600, color: theme.onAccent }}>
                Save expense
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginTop: 20, marginBottom: 6 },
  amountRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  amountInput: { fontSize: 28, fontWeight: 700 },
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
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 12, marginTop: 32 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
});
