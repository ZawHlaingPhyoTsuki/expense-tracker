import Storage from "expo-sqlite/kv-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { Appearance, useColorScheme as useRNColorScheme } from "react-native";

import {
  DEFAULT_THEME_ID,
  getThemeById,
  type AppPalette,
  type ThemeId,
} from "@/constants/theme";

export type ColorMode = "system" | "light" | "dark";

type ThemePreferenceContextValue = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  resolvedScheme: "light" | "dark";
  palette: AppPalette;
};

const COLOR_MODE_KEY = "theme.colorMode";
const THEME_ID_KEY = "theme.id";

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(
  null,
);

function isColorMode(value: string | null): value is ColorMode {
  return value === "system" || value === "light" || value === "dark";
}

function readStoredColorMode(): ColorMode {
  try {
    const value = Storage.getItemSync(COLOR_MODE_KEY);
    return isColorMode(value) ? value : "system";
  } catch {
    return "system";
  }
}

function readStoredThemeId(): ThemeId {
  try {
    const value = Storage.getItemSync(THEME_ID_KEY);
    return value ? (getThemeById(value).id as ThemeId) : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useRNColorScheme();
  const [colorMode, setColorModeState] = useState<ColorMode>(readStoredColorMode);
  const [themeId, setThemeIdState] = useState<ThemeId>(readStoredThemeId);

  useEffect(() => {
    Appearance.setColorScheme(
      colorMode === "system" ? "unspecified" : colorMode,
    );
  }, [colorMode]);

  const resolvedScheme: "light" | "dark" =
    colorMode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : colorMode;

  const palette = useMemo(
    () => getThemeById(themeId)[resolvedScheme],
    [themeId, resolvedScheme],
  );

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    try {
      Storage.setItemSync(COLOR_MODE_KEY, mode);
    } catch {}
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    try {
      Storage.setItemSync(THEME_ID_KEY, id);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ colorMode, setColorMode, themeId, setThemeId, resolvedScheme, palette }),
    [colorMode, setColorMode, themeId, setThemeId, resolvedScheme, palette],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error("useThemePreference must be used within ThemePreferenceProvider");
  }
  return ctx;
}

export function useOptionalThemePreference() {
  return useContext(ThemePreferenceContext);
}
