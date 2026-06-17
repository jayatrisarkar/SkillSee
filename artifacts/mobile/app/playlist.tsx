import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

interface PlaylistItem { t: string; u: string }
interface CatBlock { n: string; i: string; c: string; items: PlaylistItem[] }

type PlaylistData =
  | { type: "cat"; n: string; i: string; c: string; items: PlaylistItem[] }
  | { type: "lib"; cats: CatBlock[] };

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  return domain ? `https://${domain}/api` : "/api";
}

function getAppUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
  return domain ? `https://${domain}` : "https://skillsee.replit.app";
}

function ItemRow({ item, index, color }: { item: PlaylistItem; index: number; color: string }) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => Linking.openURL(item.u)}
      activeOpacity={0.72}
    >
      <View style={[styles.num, { backgroundColor: color + "20" }]}>
        <Text style={[styles.numText, { color }]}>{index + 1}</Text>
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.t}</Text>
        <Text style={styles.itemUrl} numberOfLines={1}>{item.u}</Text>
      </View>
      <Ionicons name="open-outline" size={15} color="#555" />
    </TouchableOpacity>
  );
}

function DownloadBanner() {
  if (Platform.OS !== "web") return null;
  return (
    <View style={styles.banner}>
      <View style={styles.bannerLeft}>
        <View style={styles.bannerIcon}>
          <Ionicons name="library" size={20} color="#818CF8" />
        </View>
        <View>
          <Text style={styles.bannerTitle}>Save this playlist</Text>
          <Text style={styles.bannerSub}>Organize your learning with SkillSee</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bannerBtn}
        onPress={() => Linking.openURL(getAppUrl())}
        activeOpacity={0.82}
      >
        <Text style={styles.bannerBtnText}>Get SkillSee</Text>
      </TouchableOpacity>
    </View>
  );
}

function PlaylistContent({ data }: { data: PlaylistData }) {
  if (data.type === "cat") {
    const color = data.c ?? "#6366F1";
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <LinearGradient colors={[color + "55", "#070A10"]} style={styles.header}>
          <View style={styles.appBadge}>
            <Ionicons name="library" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.appBadgeText}>SkillSee</Text>
          </View>
          <View style={[styles.iconWrap, { backgroundColor: color + "30" }]}>
            <Ionicons name={(data.i as any) ?? "list-outline"} size={36} color={color} />
          </View>
          <Text style={styles.catName}>{data.n}</Text>
          <Text style={styles.catCount}>
            {data.items.length} {data.items.length === 1 ? "resource" : "resources"}
          </Text>
        </LinearGradient>
        <View style={styles.listWrap}>
          <Text style={styles.listLabel}>Playlist</Text>
          {data.items.map((item, i) => (
            <ItemRow key={i} item={item} index={i} color={color} />
          ))}
        </View>
        <DownloadBanner />
        <Text style={styles.footer}>Made with SkillSee · Save. Learn. Master.</Text>
      </ScrollView>
    );
  }

  const totalCount = data.cats.reduce((s, c) => s + c.items.length, 0);
  const primaryColor = data.cats[0]?.c ?? "#6366F1";

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <LinearGradient colors={[primaryColor + "44", "#070A10"]} style={styles.header}>
        <View style={styles.appBadge}>
          <Ionicons name="library" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
          <Text style={styles.appBadgeText}>SkillSee</Text>
        </View>
        <View style={[styles.iconWrap, { backgroundColor: primaryColor + "30" }]}>
          <Ionicons name="library-outline" size={36} color={primaryColor} />
        </View>
        <Text style={styles.catName}>My Library</Text>
        <Text style={styles.catCount}>
          {totalCount} {totalCount === 1 ? "resource" : "resources"} · {data.cats.length} {data.cats.length === 1 ? "category" : "categories"}
        </Text>
      </LinearGradient>

      {data.cats.map((cat, ci) => (
        <View key={ci} style={styles.catSection}>
          <View style={styles.catSectionHeader}>
            <View style={[styles.catSectionIcon, { backgroundColor: cat.c + "25" }]}>
              <Ionicons name={(cat.i as any) ?? "folder-outline"} size={18} color={cat.c} />
            </View>
            <Text style={[styles.catSectionName, { color: cat.c }]}>{cat.n}</Text>
            <Text style={styles.catSectionCount}>{cat.items.length} videos</Text>
          </View>
          {cat.items.map((item, i) => (
            <ItemRow key={i} item={item} index={i} color={cat.c} />
          ))}
        </View>
      ))}

      <DownloadBanner />
      <Text style={styles.footer}>Made with SkillSee · Save. Learn. Master.</Text>
    </ScrollView>
  );
}

export default function PlaylistPage() {
  const params = useLocalSearchParams<{ d?: string; id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const d = Array.isArray(params.d) ? params.d[0] : params.d;

  const [apiData, setApiData] = useState<PlaylistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${getApiBase()}/playlist/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((row) => {
        setApiData({
          type: "cat",
          n: row.title,
          i: row.icon,
          c: row.color,
          items: row.items as PlaylistItem[],
        });
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const base64Data = useMemo<PlaylistData | null>(() => {
    if (!d) return null;
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(d))));
      if (!parsed.type && parsed.items) return { type: "cat", ...parsed };
      return parsed as PlaylistData;
    } catch {
      return null;
    }
  }, [d]);

  if (id) {
    if (loading) {
      return (
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }
    if (apiError || !apiData) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#6366F1" />
          <Text style={styles.errorTitle}>Playlist not found</Text>
          <Text style={styles.errorSub}>This link may be invalid or expired.</Text>
          <DownloadBanner />
        </View>
      );
    }
    return <PlaylistContent data={apiData} />;
  }

  if (!base64Data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#6366F1" />
        <Text style={styles.errorTitle}>Playlist not found</Text>
        <Text style={styles.errorSub}>This link may be invalid or expired.</Text>
        <DownloadBanner />
      </View>
    );
  }

  return <PlaylistContent data={base64Data} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#070A10" },
  pageContent: { paddingBottom: 60 },

  errorContainer: {
    flex: 1,
    backgroundColor: "#070A10",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  errorTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  errorSub: { color: "#666", fontSize: 14, textAlign: "center" },

  header: {
    padding: 32,
    paddingTop: 56,
    alignItems: "center",
    gap: 10,
  },
  appBadge: {
    backgroundColor: "#FFFFFF18",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  appBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 4,
    textAlign: "center",
  },
  catCount: { color: "#FFFFFFAA", fontSize: 14, fontWeight: "500" },

  listWrap: { padding: 20, gap: 8 },
  listLabel: {
    color: "#4D5D7A",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: "uppercase",
  },

  catSection: { paddingHorizontal: 20, paddingBottom: 8, gap: 8, marginTop: 20 },
  catSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  catSectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catSectionName: { fontSize: 15, fontWeight: "700", flex: 1 },
  catSectionCount: { color: "#4D5D7A", fontSize: 12 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C1018",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  num: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numText: { fontSize: 12, fontWeight: "700" },
  itemBody: { flex: 1 },
  itemTitle: { color: "#E8EDF5", fontSize: 13, fontWeight: "600", marginBottom: 2 },
  itemUrl: { color: "#4D5D7A", fontSize: 11 },

  banner: {
    margin: 20,
    marginTop: 28,
    backgroundColor: "#0C1018",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#6366F118",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    color: "#E8EDF5",
    fontSize: 14,
    fontWeight: "700",
  },
  bannerSub: {
    color: "#4D5D7A",
    fontSize: 12,
    marginTop: 1,
  },
  bannerBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bannerBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  footer: { color: "#1A2030", fontSize: 11, textAlign: "center", marginTop: 8, marginBottom: 8 },
});
