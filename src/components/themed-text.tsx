import { StyleSheet, Text, type TextProps } from "react-native";

import { ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "subtitle" | "label" | "caption" | "smallBold";
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[{ color: theme[themeColor ?? "text"] }, styles[type], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
});
