import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PlaylistItem { t: string; u: string }
interface CatBlock { n: string; i: string; c: string; items: PlaylistItem[] }

type PlaylistData =
  | { type: "cat"; n: string; i: string; c: string; items: PlaylistItem[] }
  | { type: "lib"; cats: CatBlock[] };

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

export default function PlaylistPage() {
  const { d } = useLocalSearchParams<{ d?: string }>();

  const data = useMemo<PlaylistData | null>(() => {
    const raw = Array.isArray(d) ? d[0] : d;
    if (!raw) return null;
    try {
      const parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
      // backward-compat: old format had no `type` field
      if (!parsed.type && parsed.items) return { type: "cat", ...parsed };
      return parsed as PlaylistData;
    } catch {
      return null;
    }
  }, [d]);

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#6366F1" />
        <Text style={styles.errorTitle}>Playlist not found</Text>
        <Text style={styles.errorSub}>This link may be invalid or expired.</Text>
      </View>
    );
  }

  if (data.type === "cat") {
    const color = data.c ?? "#6366F1";
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <LinearGradient colors={[color + "55", "#0A0A0F"]} style={styles.header}>
          <View style={styles.appBadge}>
            <Text style={styles.appBadgeText}>📚 SkillSee</Text>
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
          <Text style={styles.listLabel}>PLAYLIST</Text>
          {data.items.map((item, i) => (
            <ItemRow key={i} item={item} index={i} color={color} />
          ))}
        </View>
        <Text style={styles.footer}>Made with SkillSee · Save. Learn. Master.</Text>
      </ScrollView>
    );
  }

  // type === "lib" — full library, grouped by category
  const totalCount = data.cats.reduce((s, c) => s + c.items.length, 0);
  const primaryColor = data.cats[0]?.c ?? "#6366F1";

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <LinearGradient colors={[primaryColor + "44", "#0A0A0F"]} style={styles.header}>
        <View style={styles.appBadge}>
          <Text style={styles.appBadgeText}>📚 SkillSee</Text>
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

      <Text style={styles.footer}>Made with SkillSee · Save. Learn. Master.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0A0A0F" },
  pageContent: { paddingBottom: 60 },

  errorContainer: {
    flex: 1,
    backgroundColor: "#0A0A0F",
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
  },
  catCount: { color: "#FFFFFFAA", fontSize: 14, fontWeight: "500" },

  listWrap: { padding: 20, gap: 8 },
  listLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
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
  catSectionCount: { color: "#555", fontSize: 12 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF0C",
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
  itemTitle: { color: "#F0F0F0", fontSize: 13, fontWeight: "600", marginBottom: 2 },
  itemUrl: { color: "#555", fontSize: 11 },

  footer: { color: "#2A2A2A", fontSize: 11, textAlign: "center", marginTop: 32 },
});
