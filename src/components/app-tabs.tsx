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
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Daily</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: "today", selected: "today" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add">
        <NativeTabs.Trigger.Label>Add</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md={{ default: "add", selected: "add" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="months">
        <NativeTabs.Trigger.Label>Months</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "calendar_month", selected: "calendar_month" }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="testing">
        <NativeTabs.Trigger.Label>Testing</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "calendar_month", selected: "calendar_month" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
