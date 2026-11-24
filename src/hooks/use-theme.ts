import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";
import { useOptionalThemePreference } from "@/providers/theme-preference";

export function useTheme() {
  const preference = useOptionalThemePreference();
  const scheme = useColorScheme();
  if (preference) return preference.palette;
  return Colors[scheme === "dark" ? "dark" : "light"];
}
