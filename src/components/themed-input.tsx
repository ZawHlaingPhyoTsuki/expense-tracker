import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function ThemedInput(props: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[
        styles.input,
        {
          backgroundColor: theme.backgroundSubtle,
          color: theme.text,
          borderColor: theme.border,
        },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52,
  },
});
