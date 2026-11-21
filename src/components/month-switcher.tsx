import { Pressable, StyleSheet, View } from "react-native";

import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "@/components/themed-text";
import { monthLabel } from "@/lib/dates";

type Props = {
  month: Date;
  onShift: (delta: number) => void;
  disableNext: boolean;
};

export function MonthSwitcher({ month, onShift, disableNext }: Props) {
  const theme = useTheme();
  const arrowStyle = {
    backgroundColor: theme.backgroundElement,
    borderColor: theme.border,
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onShift(-1)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
        style={({ pressed }) => [
          styles.button,
          arrowStyle,
          pressed && { opacity: 0.7 },
        ]}
      >
        <ThemedText style={styles.arrow}>‹</ThemedText>
      </Pressable>
      <ThemedText type="default" style={styles.label}>
        {monthLabel(month)}
      </ThemedText>
      <Pressable
        onPress={() => onShift(1)}
        hitSlop={8}
        disabled={disableNext}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        style={({ pressed }) => [
          styles.button,
          arrowStyle,
          disableNext && { opacity: 0.35 },
          pressed && !disableNext && { opacity: 0.7 },
        ]}
      >
        <ThemedText style={styles.arrow}>›</ThemedText>
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
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: { fontSize: 28, lineHeight: 32, marginTop: -2 },
  label: { fontSize: 16, fontWeight: "600", letterSpacing: -0.2 },
});
