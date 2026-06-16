import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const NOTIF_ENABLED_KEY = "@skillflow:notif_enabled";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getNotificationsEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
  return val === "1";
}

export async function requestAndEnableNotifications(): Promise<boolean> {
  if (Platform.OS === "web") {
    // Web doesn't support push notifications — save preference only
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "1");
    return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return false;
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "1");
  await scheduleDailyReminder();
  return true;
}

export async function disableNotifications(): Promise<void> {
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, "0");
  if (Platform.OS !== "web") {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export async function scheduleDailyReminder(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚 Time to keep learning!",
      body: "Your SkillSee library is waiting. Keep your streak going!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });
}

export async function sendWeeklySummaryNotification(
  saved: number,
  completed: number
): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🏆 Weekly SkillSee Summary",
      body: `This week: ${saved} saved, ${completed} completed. Great work!`,
    },
    trigger: null,
  });
}
