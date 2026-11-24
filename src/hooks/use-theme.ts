import { useThemePreference } from "@/providers/theme-preference";

export function useTheme() {
  return useThemePreference().palette;
}
