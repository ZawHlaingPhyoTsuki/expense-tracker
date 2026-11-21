import { StyleSheet, View } from "react-native";

import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/** ratio: 0..1 */
export function Bar({ ratio }: { ratio: number }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSubtle }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, backgroundColor: theme.accent },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, height: 7, borderRadius: Radius.pill, overflow: "hidden" },
  fill: { height: 7, borderRadius: Radius.pill },
});
