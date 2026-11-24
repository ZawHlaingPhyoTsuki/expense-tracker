import "@/global.css";

import { DEFAULT_THEME_ID, getThemeById, type AppPalette } from "./themes";

export { THEMES, DEFAULT_THEME_ID, getThemeById } from "./themes";
export type { AppPalette, ThemeDefinition, ThemeId } from "./themes";

// Default palette used before preference hydration and by non-context consumers.
export const Colors = {
  light: getThemeById(DEFAULT_THEME_ID).light,
  dark: getThemeById(DEFAULT_THEME_ID).dark,
} as const satisfies Record<"light" | "dark", AppPalette>;

export type ThemeColor = keyof AppPalette;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;
