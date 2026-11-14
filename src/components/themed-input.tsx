import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

export function ThemedInput(props: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      {...props}
      style={[
        styles.input,
        {
          backgroundColor: theme.backgroundElement,
          color: theme.text,
          borderColor: theme.textSecondary + "40", // 25% opacity border
        },
        props.style,
      ]}
      placeholderTextColor={theme.textSecondary}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 52, // Minimum touch target height
  },
});
