import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "../db/client";
import { expensesTable, type Expense } from "../db/schema";
import { CATEGORIES, emojiFor } from "../lib/categories";
import { CURRENCY, formatMoney, parseAmount } from "../lib/money";

const C = {
  bg: "#F2F4F7",
  surface: "#FFFFFF",
  ink: "#14213D",
  muted: "#667085",
  line: "#E4E7EC",
  accent: "#0F766E",
  accentSoft: "#D5EFEC",
};

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function Tracker() {
  const [month, setMonth] = useState(() => startOfMonth());
  const [rows, setRows] = useState<Expense[]>([]);
  const [formOpen, setFormOpen] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].key);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const start = month.getTime();
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1).getTime();
    const result = await db
      .select()
      .from(expensesTable)
      .where(and(gte(expensesTable.spentAt, start), lt(expensesTable.spentAt, end)))
      .orderBy(desc(expensesTable.spentAt));
    setRows(result);
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const { total, breakdown } = useMemo(() => {
    const totals = new Map<string, number>();
    let sum = 0;
    for (const r of rows) {
      sum += r.amount;
      totals.set(r.category, (totals.get(r.category) ?? 0) + r.amount);
    }
    const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    return { total: sum, breakdown: sorted };
  }, [rows]);

  const isCurrentMonth = month.getTime() === startOfMonth().getTime();

  function shiftMonth(delta: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }

  function openForm() {
    setAmount("");
    setNote("");
    setCategory(CATEGORIES[0].key);
    setFormOpen(true);
  }

  async function save() {
    const minor = parseAmount(amount);
    if (minor === null) {
      Alert.alert("Enter an amount", "Use a number greater than 0, like 85 or 120.50.");
      return;
    }
    await db.insert(expensesTable).values({
      amount: minor,
      category,
      note: note.trim(),
      spentAt: Date.now(),
    });
    setFormOpen(false);
    // New Date object forces a reload and jumps to the current month
    setMonth(startOfMonth());
  }

  function confirmDelete(item: Expense) {
    Alert.alert("Delete expense?", `${formatMoney(item.amount)} · ${item.note || item.category}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.delete(expensesTable).where(eq(expensesTable.id, item.id));
          load();
        },
      },
    ]);
  }

  const header = (
    <View>
      <View style={styles.monthRow}>
        <Pressable onPress={() => shiftMonth(-1)} hitSlop={12}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </Text>
        <Pressable onPress={() => shiftMonth(1)} hitSlop={12} disabled={isCurrentMonth}>
          <Text style={[styles.arrow, isCurrentMonth && { opacity: 0.25 }]}>›</Text>
        </Pressable>
      </View>

      <Text style={styles.total}>{formatMoney(total)}</Text>
      <Text style={styles.totalCaption}>
        spent across {rows.length} {rows.length === 1 ? "expense" : "expenses"}
      </Text>

      {breakdown.length > 0 && (
        <View style={styles.breakdown}>
          {breakdown.map(([cat, sum]) => (
            <View key={cat} style={styles.barRow}>
              <Text style={styles.barLabel}>
                {emojiFor(cat)} {cat}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(sum / total) * 100}%` }]} />
              </View>
              <Text style={styles.barValue}>{formatMoney(sum)}</Text>
            </View>
          ))}
        </View>
      )}

      {rows.length > 0 && <Text style={styles.sectionTitle}>Expenses</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No expenses this month. Tap “Add expense” to log your first one.
          </Text>
        }
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => confirmDelete(item)} style={styles.item}>
            <Text style={styles.itemEmoji}>{emojiFor(item.category)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.note || item.category}
              </Text>
              <Text style={styles.itemMeta}>
                {item.category} ·{" "}
                {new Date(item.spentAt).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
            <Text style={styles.itemAmount}>{formatMoney(item.amount)}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          rows.length > 0 ? (
            <Text style={styles.hint}>Press and hold an expense to delete it.</Text>
          ) : undefined
        }
      />

      <Pressable style={styles.fab} onPress={openForm}>
        <Text style={styles.fabText}>Add expense</Text>
      </Pressable>

      <Modal
        visible={formOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFormOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalWrap}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setFormOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>New expense</Text>

            <Text style={styles.fieldLabel}>Amount ({CURRENCY})</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
              autoFocus
              style={[styles.input, styles.amountInput]}
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((c) => {
                const active = c.key === category;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCategory(c.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && { color: C.accent, fontWeight: "600" }]}
                    >
                      {c.emoji} {c.key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Lunch, BTS card top-up…"
              placeholderTextColor={C.muted}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={save}
            />

            <View style={styles.sheetActions}>
              <Pressable onPress={() => setFormOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={{ color: C.ink, fontWeight: "600" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={save} style={[styles.btn, styles.btnPrimary]}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Save expense</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  arrow: { fontSize: 32, color: C.ink, paddingHorizontal: 8 },
  monthLabel: { fontSize: 16, fontWeight: "600", color: C.ink },
  total: { fontSize: 52, fontWeight: "700", color: C.ink, letterSpacing: -1.5, marginTop: 16 },
  totalCaption: { fontSize: 14, color: C.muted, marginTop: 2 },
  breakdown: { marginTop: 24, gap: 10 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  barLabel: { width: 110, fontSize: 13, color: C.ink },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.line, overflow: "hidden" },
  barFill: { height: 8, backgroundColor: C.accent, borderRadius: 4 },
  barValue: { width: 84, textAlign: "right", fontSize: 13, color: C.muted },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: C.ink, marginTop: 32, marginBottom: 8 },
  empty: { marginTop: 40, textAlign: "center", color: C.muted, fontSize: 15, lineHeight: 22 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  itemEmoji: { fontSize: 24 },
  itemTitle: { fontSize: 16, color: C.ink },
  itemMeta: { fontSize: 13, color: C.muted, marginTop: 2 },
  itemAmount: { fontSize: 16, fontWeight: "600", color: C.ink },
  hint: { textAlign: "center", color: C.muted, fontSize: 12, marginTop: 20 },
  fab: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    backgroundColor: C.accent,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 4,
  },
  fabText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalWrap: { flex: 1, backgroundColor: "rgba(20,33,61,0.35)" },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: C.ink, marginBottom: 8 },
  fieldLabel: { fontSize: 13, color: C.muted, marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: C.ink,
  },
  amountInput: { fontSize: 28, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
  },
  chipActive: { backgroundColor: C.accentSoft, borderColor: C.accent },
  chipText: { fontSize: 14, color: C.ink },
  sheetActions: { flexDirection: "row", gap: 12, marginTop: 28 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnGhost: { backgroundColor: C.bg },
  btnPrimary: { backgroundColor: C.accent },
});