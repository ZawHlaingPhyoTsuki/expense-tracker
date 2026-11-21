import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { monthLabel } from "@/lib/dates";

type Props = {
  month: Date;
  onShift: (delta: number) => void;
  disableNext: boolean;
};

export function MonthSwitcher({ month, onShift, disableNext }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onShift(-1)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        style={styles.button}
      >
        <ThemedText style={styles.arrow}>‹</ThemedText>
      </Pressable>
      <ThemedText style={styles.label}>{monthLabel(month)}</ThemedText>
      <Pressable
        onPress={() => onShift(1)}
        hitSlop={12}
        disabled={disableNext}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        style={styles.button}
      >
        <ThemedText style={[styles.arrow, disableNext && { opacity: 0.25 }]}>
          ›
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { fontSize: 30, lineHeight: 34 },
  label: { fontSize: 16, fontWeight: 600 },
});
