import { NativeTabs } from "expo-router/native-tabs";

import { useTheme } from "@/hooks/use-theme";

export default function AppTabs() {
  const theme = useTheme();

  return (
    <NativeTabs
      backgroundColor={theme.background}
      indicatorColor={theme.accentSoft}
      tintColor={theme.accent}
      rippleColor={theme.accentSoft}
      labelStyle={{ selected: { color: theme.accent } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Daily</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "receipt_long", selected: "receipt_long" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="months">
        <NativeTabs.Trigger.Label>Months</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "calendar_month", selected: "calendar_month" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "settings", selected: "settings" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
