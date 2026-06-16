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

interface PlaylistData {
  n: string;
  i: string;
  c: string;
  items: { t: string; u: string }[];
}

export default function PlaylistPage() {
  const { d } = useLocalSearchParams<{ d?: string }>();

  const data = useMemo<PlaylistData | null>(() => {
    const raw = Array.isArray(d) ? d[0] : d;
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(escape(atob(raw))));
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

  const color = data.c ?? "#6366F1";

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <LinearGradient
        colors={[color + "55", "#0A0A0F"]}
        style={styles.header}
      >
        <View style={styles.appBadge}>
          <Text style={styles.appBadgeText}>📚 SkillSee</Text>
        </View>

        <View style={[styles.iconWrap, { backgroundColor: color + "30" }]}>
          <Ionicons name={(data.i as any) ?? "list-outline"} size={36} color={color} />
        </View>
        <Text style={styles.catName}>{data.n}</Text>
        <Text style={styles.catCount}>
          {data.items.length} saved {data.items.length === 1 ? "resource" : "resources"}
        </Text>
      </LinearGradient>

      <View style={styles.listWrap}>
        <Text style={styles.listLabel}>PLAYLIST</Text>
        {data.items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.item}
            onPress={() => Linking.openURL(item.u)}
            activeOpacity={0.72}
          >
            <View style={[styles.num, { backgroundColor: color + "20" }]}>
              <Text style={[styles.numText, { color }]}>{i + 1}</Text>
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.t}</Text>
              <Text style={styles.itemUrl} numberOfLines={1}>{item.u}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color="#555" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Save. Learn. Master.</Text>
        <Text style={styles.footerSub}>Created with SkillSee</Text>
      </View>
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

  listWrap: { padding: 20, gap: 10 },
  listLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF0C",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  num: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numText: { fontSize: 14, fontWeight: "700" },
  itemBody: { flex: 1 },
  itemTitle: { color: "#F0F0F0", fontSize: 14, fontWeight: "600", marginBottom: 3 },
  itemUrl: { color: "#666", fontSize: 11 },

  footer: { alignItems: "center", marginTop: 32, gap: 4 },
  footerText: { color: "#333", fontSize: 13, fontWeight: "600" },
  footerSub: { color: "#2A2A2A", fontSize: 11 },
});
