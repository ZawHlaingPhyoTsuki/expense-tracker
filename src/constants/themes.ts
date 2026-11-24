export type AppPalette = {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSubtle: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  border: string;
  danger: string;
  good: string;
};

export type ThemeDefinition = {
  id: string;
  name: string;
  light: AppPalette;
  dark: AppPalette;
};

// Themes converted from themes/*.md (tweakcn/shadcn tokens, oklch -> hex).
// Mapping: foreground->text, background, card->backgroundElement, muted->backgroundSubtle,
// muted-foreground->textSecondary, primary->accent, primary tint->accentSoft,
// primary-foreground->onAccent, border, destructive->danger, chart green->good.
export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "sagegreen",
    name: "Sage Green",
    light: {
      text: "#000000",
      background: "#fdfdfd",
      backgroundElement: "#fdfdfd",
      backgroundSubtle: "#f5f5f5",
      textSecondary: "#878787",
      accent: "#afbea5",
      accentSoft: "#f2f4f1",
      onAccent: "#000000",
      border: "#e7e7ee",
      danger: "#b3191f",
      good: "#2f7a4f",
    },
    dark: {
      text: "#f9f8f7",
      background: "#070503",
      backgroundElement: "#100d08",
      backgroundSubtle: "#1e1a14",
      textSecondary: "#928f8a",
      accent: "#afbea5",
      accentSoft: "#292a23",
      onAccent: "#040302",
      border: "#2f281b",
      danger: "#b3191f",
      good: "#7dd3a7",
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    light: {
      text: "#000000",
      background: "#fcfcfc",
      backgroundElement: "#ffffff",
      backgroundSubtle: "#f5f5f5",
      textSecondary: "#525252",
      accent: "#000000",
      accentSoft: "#d9d9d9",
      onAccent: "#ffffff",
      border: "#e4e4e4",
      danger: "#e54b4f",
      good: "#1a7f37",
    },
    dark: {
      text: "#ffffff",
      background: "#000000",
      backgroundElement: "#090909",
      backgroundSubtle: "#1d1d1d",
      textSecondary: "#a4a4a4",
      accent: "#ffffff",
      accentSoft: "#333333",
      onAccent: "#000000",
      border: "#242424",
      danger: "#ff5b5b",
      good: "#3fb950",
    },
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    light: {
      text: "#000000",
      background: "#ffffff",
      backgroundElement: "#ffffff",
      backgroundSubtle: "#f3f3f3",
      textSecondary: "#666666",
      accent: "#f38020",
      accentSoft: "#fdede0",
      onAccent: "#ffffff",
      border: "#d9d9d9",
      danger: "#d72222",
      good: "#15803d",
    },
    dark: {
      text: "#f9fafb",
      background: "#111111",
      backgroundElement: "#1c1c1c",
      backgroundSubtle: "#262626",
      textSecondary: "#a1a1aa",
      accent: "#f6821f",
      accentSoft: "#3f2814",
      onAccent: "#ffffff",
      border: "#27272a",
      danger: "#ef4444",
      good: "#4ade80",
    },
  },
  {
    id: "twitter",
    name: "Twitter",
    light: {
      text: "#0f1419",
      background: "#ffffff",
      backgroundElement: "#f7f8f8",
      backgroundSubtle: "#e5e5e6",
      textSecondary: "#0f1419",
      accent: "#1e9df1",
      accentSoft: "#dff1fd",
      onAccent: "#ffffff",
      border: "#e1eaef",
      danger: "#f4212e",
      good: "#17bf63",
    },
    dark: {
      text: "#e7e9ea",
      background: "#000000",
      backgroundElement: "#17181c",
      backgroundSubtle: "#181818",
      textSecondary: "#72767a",
      accent: "#1c9cf0",
      accentSoft: "#061f30",
      onAccent: "#ffffff",
      border: "#242628",
      danger: "#f4212e",
      good: "#17bf63",
    },
  },
  {
    id: "claude",
    name: "Claude",
    light: {
      text: "#3d3929",
      background: "#faf9f5",
      backgroundElement: "#faf9f5",
      backgroundSubtle: "#ede9de",
      textSecondary: "#83827d",
      accent: "#c96442",
      accentSoft: "#f3e4dc",
      onAccent: "#ffffff",
      border: "#dad9d4",
      danger: "#141413",
      good: "#2f7a4f",
    },
    dark: {
      text: "#c3c0b6",
      background: "#262624",
      backgroundElement: "#262624",
      backgroundSubtle: "#1b1b19",
      textSecondary: "#b7b5a9",
      accent: "#d97757",
      accentSoft: "#4a362e",
      onAccent: "#ffffff",
      border: "#3e3e38",
      danger: "#ef4444",
      good: "#7dd3a7",
    },
  },
  {
    id: "supabase",
    name: "Supabase",
    light: {
      text: "#171717",
      background: "#fcfcfc",
      backgroundElement: "#fcfcfc",
      backgroundSubtle: "#ededed",
      textSecondary: "#202020",
      accent: "#72e3ad",
      accentSoft: "#e9f9f1",
      onAccent: "#1e2723",
      border: "#dfdfdf",
      danger: "#ca3214",
      good: "#10b981",
    },
    dark: {
      text: "#e2e8f0",
      background: "#121212",
      backgroundElement: "#171717",
      backgroundSubtle: "#1f1f1f",
      textSecondary: "#a2a2a2",
      accent: "#006239",
      accentSoft: "#0e221a",
      onAccent: "#dde8e3",
      border: "#292929",
      danger: "#541c15",
      good: "#4ade80",
    },
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = "sagegreen";

export function getThemeById(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
