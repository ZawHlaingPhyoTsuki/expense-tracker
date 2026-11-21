import "@/global.css";

export const Colors = {
  light: {
    text: "#18201B",
    background: "#F5F6F4",
    backgroundElement: "#FFFFFF",
    backgroundSubtle: "#ECEFEB",
    textSecondary: "#68756D",
    accent: "#1F6A57",
    accentSoft: "#E3F0EC",
    onAccent: "#FFFFFF",
    border: "#DDE3DF",
    danger: "#C44B3F",
    good: "#2F7A4F",
  },
  dark: {
    text: "#EFF3F0",
    background: "#141816",
    backgroundElement: "#1C211E",
    backgroundSubtle: "#252B28",
    textSecondary: "#97A39C",
    accent: "#79C7AE",
    accentSoft: "#1E332E",
    onAccent: "#10231D",
    border: "#303833",
    danger: "#F07167",
    good: "#7DD3A7",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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

