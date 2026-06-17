import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTO_SAVE_KEY = "@skillsee:autoSave";

export async function getAutoSave(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(AUTO_SAVE_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

export async function setAutoSave(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTO_SAVE_KEY, enabled ? "true" : "false");
  } catch {}
}
