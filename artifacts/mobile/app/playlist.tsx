import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { Category, useLibrary } from "@/context/LibraryContext";
import { isUserSignedIn, onAuthStateChange } from "@/context/clerkBridge";
import { setPendingImport } from "@/context/pendingImport";
import { useToast } from "@/context/ToastContext";

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

function CategoryPickerSheet({
  visible,
  categories,
  playlistName,
  playlistColor,
  onClose,
  onSelect,
}: {
  visible: boolean;
  categories: Category[];
  playlistName: string;
  playlistColor: string;
  onClose: () => void;
  onSelect: (categoryId: string | null) => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Save to…</Text>
          <Text style={styles.sheetSub}>
            Pick an existing category or create a new one for "{playlistName}"
          </Text>

          <TouchableOpacity
            style={styles.sheetNewRow}
            onPress={() => onSelect(null)}
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={[playlistColor + "30", playlistColor + "18"]}
              style={styles.sheetNewIcon}
            >
              <Ionicons name="add" size={20} color={playlistColor} />
            </LinearGradient>
            <View style={styles.sheetRowBody}>
              <Text style={[styles.sheetRowName, { color: playlistColor }]}>
                Create new category
              </Text>
              <Text style={styles.sheetRowMeta}>Named "{playlistName}"</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={playlistColor} />
          </TouchableOpacity>

          {categories.length > 0 && (
            <View style={styles.sheetDivider}>
              <View style={styles.sheetDividerLine} />
              <Text style={styles.sheetDividerLabel}>OR ADD TO EXISTING</Text>
              <View style={styles.sheetDividerLine} />
            </View>
          )}

          <ScrollView
            style={styles.sheetList}
            contentContainerStyle={styles.sheetListContent}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.sheetCatRow}
                onPress={() => onSelect(cat.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.sheetCatIcon, { backgroundColor: cat.color + "25" }]}>
                  <Ionicons name={(cat.icon as any) ?? "folder-outline"} size={18} color={cat.color} />
                </View>
                <Text style={styles.sheetRowName} numberOfLines={1}>{cat.name}</Text>
                <Ionicons name="chevron-forward" size={16} color="#3A4560" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SavePlaylistButton({ data }: { data: PlaylistData }) {
  const { addCategory, addItem, categories } = useLibrary();
  const { showToast } = useToast();
  const [signedIn, setSignedIn] = useState(isUserSignedIn);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => onAuthStateChange(setSignedIn), []);

  const doImport = useCallback((targetCategoryId?: string | null) => {
    setSaving(true);
    try {
      let totalItems = 0;
      if (data.type === "cat") {
        let catId: string;
        let destName: string;
        if (targetCategoryId) {
          catId = targetCategoryId;
          destName = categories.find((c) => c.id === targetCategoryId)?.name ?? data.n;
        } else {
          const cat = addCategory(data.n, data.i ?? "folder-outline", data.c ?? "#6366F1");
          catId = cat.id;
          destName = data.n;
        }
        for (const item of data.items) {
          addItem({
            title: item.t,
            url: item.u,
            notes: "",
            categoryId: catId,
            tags: [],
            status: "none",
            isArchived: false,
          });
          totalItems++;
        }
        const itemWord = totalItems === 1 ? "item" : "items";
        showToast(`${totalItems} ${itemWord} added to ${destName}`);
      } else {
        const catCount = data.cats.length;
        const firstName = data.cats[0]?.n ?? "your library";
        for (const block of data.cats) {
          const cat = addCategory(block.n, block.i ?? "folder-outline", block.c ?? "#6366F1");
          for (const item of block.items) {
            addItem({
              title: item.t,
              url: item.u,
              notes: "",
              categoryId: cat.id,
              tags: [],
              status: "none",
              isArchived: false,
            });
            totalItems++;
          }
        }
        const itemWord = totalItems === 1 ? "item" : "items";
        const dest = catCount === 1 ? firstName : `${catCount} categories`;
        showToast(`${totalItems} ${itemWord} added to ${dest}`);
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [data, categories, addCategory, addItem, showToast]);

  const handleSave = useCallback(async () => {
    if (!signedIn) {
      const cats =
        data.type === "cat"
          ? [{ name: data.n, icon: data.i ?? "folder-outline", color: data.c ?? "#6366F1", items: data.items }]
          : data.cats.map((b) => ({ name: b.n, icon: b.i ?? "folder-outline", color: b.c ?? "#6366F1", items: b.items }));
      await setPendingImport({ cats });
      router.push("/sign-in");
      return;
    }
    if (data.type === "cat") {
      setShowPicker(true);
    } else {
      doImport();
    }
  }, [signedIn, data, doImport]);

  const handlePickerSelect = useCallback((categoryId: string | null) => {
    setShowPicker(false);
    doImport(categoryId);
  }, [doImport]);

  if (saved) {
    return (
      <View style={[styles.saveBtn, styles.saveBtnSuccess]}>
        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
        <Text style={[styles.saveBtnText, { color: "#10B981" }]}>Saved to your library!</Text>
      </View>
    );
  }

  const playlistColor = data.type === "cat" ? (data.c ?? "#6366F1") : (data.cats[0]?.c ?? "#6366F1");

  return (
    <>
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        activeOpacity={0.82}
        disabled={saving}
      >
        <LinearGradient
          colors={["#818CF8", "#6366F1", "#4338CA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.saveBtnGradient}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="bookmark" size={17} color="#fff" />
              <Text style={styles.saveBtnText}>
                {signedIn ? "Save to my library" : "Save to SkillSee"}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {data.type === "cat" && (
        <CategoryPickerSheet
          visible={showPicker}
          categories={categories}
          playlistName={data.n}
          playlistColor={playlistColor}
          onClose={() => setShowPicker(false)}
          onSelect={handlePickerSelect}
        />
      )}
    </>
  );
}

function GetAppBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.bannerLeft}>
        <View style={styles.bannerIcon}>
          <Ionicons name="library" size={20} color="#818CF8" />
        </View>
        <View>
          <Text style={styles.bannerTitle}>Discover SkillSee</Text>
          <Text style={styles.bannerSub}>Organize your learning, track your progress</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bannerBtn}
        onPress={() => Linking.openURL(getAppUrl())}
        activeOpacity={0.82}
      >
        <Text style={styles.bannerBtnText}>Learn more</Text>
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
        <SavePlaylistButton data={data} />
        <View style={styles.listWrap}>
          <Text style={styles.listLabel}>Playlist</Text>
          {data.items.map((item, i) => (
            <ItemRow key={i} item={item} index={i} color={color} />
          ))}
        </View>
        <GetAppBanner />
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

      <SavePlaylistButton data={data} />

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

      <GetAppBanner />
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
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${getApiBase()}/playlist/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          if (body?.error === "Playlist expired") {
            setIsExpired(true);
          } else {
            setApiError(true);
          }
          return null;
        }
        return r.json();
      })
      .then((row) => {
        if (!row) return;
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
    if (isExpired) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.expiredIcon}>
            <Ionicons name="time-outline" size={36} color="#818CF8" />
          </View>
          <Text style={styles.errorTitle}>This link has expired</Text>
          <Text style={styles.errorSub}>Shared playlist links are only valid for 30 days.</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => Linking.openURL(getAppUrl())}
            activeOpacity={0.82}
          >
            <LinearGradient
              colors={["#818CF8", "#6366F1", "#4338CA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtnGradient}
            >
              <Ionicons name="library" size={16} color="#fff" />
              <Text style={styles.ctaBtnText}>Get SkillSee</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    if (apiError || !apiData) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#6366F1" />
          <Text style={styles.errorTitle}>Playlist not found</Text>
          <Text style={styles.errorSub}>This link may be invalid or expired.</Text>
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

  expiredIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#6366F118",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaBtn: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
  },
  ctaBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  ctaBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

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

  saveBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    overflow: "hidden",
  },
  saveBtnSuccess: {
    backgroundColor: "#0C1018",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

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
    backgroundColor: "#6366F118",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bannerBtnText: {
    color: "#818CF8",
    fontSize: 13,
    fontWeight: "700",
  },

  footer: { color: "#1A2030", fontSize: 11, textAlign: "center", marginTop: 8, marginBottom: 8 },

  sheetOverlay: {
    flex: 1,
    backgroundColor: "#000000AA",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#0C1018",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: "80%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2A3348",
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    color: "#E8EDF5",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sheetSub: {
    color: "#4D5D7A",
    fontSize: 13,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sheetNewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: "#141920",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  sheetNewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRowBody: { flex: 1 },
  sheetRowName: {
    color: "#E8EDF5",
    fontSize: 14,
    fontWeight: "600",
  },
  sheetRowMeta: {
    color: "#4D5D7A",
    fontSize: 12,
    marginTop: 2,
  },
  sheetDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sheetDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1A2030",
  },
  sheetDividerLabel: {
    color: "#2A3A50",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  sheetList: {
    maxHeight: 280,
  },
  sheetListContent: {
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sheetCatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#141920",
    borderRadius: 12,
  },
  sheetCatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
