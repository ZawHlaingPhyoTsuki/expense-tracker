import { NativeTabs } from "expo-router/native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.accentSoft}
      tintColor={colors.accent}
      labelStyle={{ selected: { color: colors.accent } }}
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
    </NativeTabs>
  );
}
