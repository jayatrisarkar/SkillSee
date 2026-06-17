import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@skillsee:pending_playlist_import";

export interface PendingPlaylistCat {
  name: string;
  icon: string;
  color: string;
  items: Array<{ t: string; u: string }>;
}

export interface PendingPlaylistImport {
  cats: PendingPlaylistCat[];
}

export async function setPendingImport(data: PendingPlaylistImport): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function getPendingImport(): Promise<PendingPlaylistImport | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingPlaylistImport) : null;
  } catch {
    return null;
  }
}

export async function clearPendingImport(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
