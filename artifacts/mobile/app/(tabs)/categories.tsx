import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { type Category, useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";

function buildEncoded(data: object): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function getOrigin(): string {
  if (Platform.OS === "web") return window.location.origin;
  return `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;
}

async function copyOrShare(url: string, title: string) {
  if (Platform.OS === "web") {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  } else {
    await Share.share({ message: `${title}\n${url}`, url, title });
  }
}

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, items, deleteCategory, reorderCategories } = useLibrary();
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  function flashCopied(id: string) {
    setCopiedId(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function handleShareCat(cat: Category) {
    const catItems = items.filter((it) => it.categoryId === cat.id && !it.isArchived);
    if (catItems.length === 0) return;
    const encoded = buildEncoded({
      type: "cat",
      n: cat.name,
      i: cat.icon,
      c: cat.color,
      items: catItems.map((it) => ({ t: it.title, u: it.url })),
    });
    const url = `${getOrigin()}/playlist?d=${encoded}`;
    try {
      await copyOrShare(url, `${cat.name} Playlist — SkillSee`);
      flashCopied(cat.id);
    } catch { }
  }

  async function handleShareAll() {
    const nonEmpty = categories
      .map((cat) => ({
        n: cat.name,
        i: cat.icon,
        c: cat.color,
        items: items
          .filter((it) => it.categoryId === cat.id && !it.isArchived)
          .map((it) => ({ t: it.title, u: it.url })),
      }))
      .filter((c) => c.items.length > 0);
    if (nonEmpty.length === 0) return;
    const encoded = buildEncoded({ type: "lib", cats: nonEmpty });
    const url = `${getOrigin()}/playlist?d=${encoded}`;
    try {
      await copyOrShare(url, "My SkillSee Library");
      flashCopied("all");
    } catch { }
  }

  function handleDelete(cat: Category) {
    const others = categories.filter((c) => c.id !== cat.id);
    if (others.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCatToDelete(cat);
  }

  function buildDeleteActions(cat: Category) {
    const count = items.filter((it) => it.categoryId === cat.id).length;
    const others = categories.filter((c) => c.id !== cat.id);
    const target = others.find((c) => c.name === "Learning") ?? others[0];
    const actions = [{ label: "Cancel", onPress: () => {} }] as Array<{
      label: string;
      onPress: () => void;
      destructive?: boolean;
      primary?: boolean;
    }>;
    if (count > 0) {
      actions.push({
        label: `Move ${count} item${count !== 1 ? "s" : ""} to ${target.name}`,
        primary: true,
        onPress: () => {
          deleteCategory(cat.id, target.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      });
    }
    actions.push({
      label: count > 0 ? "Delete Category & Items" : "Delete",
      destructive: true,
      onPress: () => {
        deleteCategory(cat.id, null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      },
    });
    return actions;
  }

  const totalItems = items.filter((it) => !it.isArchived).length;

  function renderItem({ item: cat, drag, isActive }: RenderItemParams<Category>) {
    const count = items.filter((it) => it.categoryId === cat.id && !it.isArchived).length;
    const isCopied = copiedId === cat.id;

    return (
      <ScaleDecorator activeScale={1.03}>
        <View
          style={[
            styles.row,
            {
              backgroundColor: isActive ? colors.secondary : colors.card,
              borderColor: isActive ? cat.color + "66" : colors.border,
              marginBottom: 8,
            },
          ]}
        >
          {/* Drag handle */}
          <TouchableOpacity
            onLongPress={drag}
            onPressIn={drag}
            delayLongPress={0}
            activeOpacity={0.6}
            style={styles.dragHandle}
          >
            <Ionicons name="reorder-three-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Main tappable area → open category */}
          <TouchableOpacity
            style={styles.rowLeft}
            onPress={() => router.push(`/category/${cat.id}`)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: cat.color + "22" }]}>
              <Ionicons name={cat.icon as any} size={22} color={cat.color} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.catName, { color: colors.foreground }]}>{cat.name}</Text>
              <Text style={[styles.catCount, { color: colors.mutedForeground }]}>
                {count} {count === 1 ? "item" : "items"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Action buttons */}
          <View style={styles.rowActions}>
            {count > 0 && (
              <TouchableOpacity
                onPress={() => handleShareCat(cat)}
                activeOpacity={0.6}
                style={[styles.actionBtn, isCopied && styles.actionBtnCopied]}
              >
                <Ionicons
                  name={isCopied ? "checkmark" : "share-outline"}
                  size={17}
                  color={isCopied ? "#10B981" : colors.mutedForeground}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => router.push(`/category/${cat.id}?edit=1`)}
              activeOpacity={0.6}
              style={styles.actionBtn}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(cat)}
              activeOpacity={0.6}
              style={styles.actionBtn}
            >
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        </View>
      </ScaleDecorator>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <DraggableFlatList
          data={categories}
          keyExtractor={(c) => c.id}
          showsVerticalScrollIndicator={false}
          onDragBegin={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          onDragEnd={({ data }) => {
            reorderCategories(data);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          contentContainerStyle={[
            styles.list,
            {
              paddingTop: topInset + 16,
              paddingBottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100,
            },
          ]}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.foreground }]}>Categories</Text>
                <View style={styles.headerActions}>
                  {totalItems > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.headerBtn,
                        { backgroundColor: copiedId === "all" ? "#10B98122" : colors.secondary },
                      ]}
                      onPress={handleShareAll}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={copiedId === "all" ? "checkmark" : "share-outline"}
                        size={18}
                        color={copiedId === "all" ? "#10B981" : colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push("/new-category")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
              {copiedId === "all" && (
                <View style={[styles.toast, { backgroundColor: "#10B98122", borderColor: "#10B98144" }]}>
                  <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                  <Text style={[styles.toastText, { color: "#10B981" }]}>
                    Full library link copied — share it anywhere!
                  </Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="grid-outline"
              title="No categories"
              description="Create categories to organize your saved content."
              actionLabel="Create Category"
              onAction={() => router.push("/new-category")}
            />
          }
          renderItem={renderItem}
        />

        {catToDelete && (
          <ConfirmModal
            visible={!!catToDelete}
            title={`Delete "${catToDelete.name}"?`}
            message={
              items.filter((it) => it.categoryId === catToDelete.id).length > 0
                ? `This category has items. Choose what to do with them.`
                : "This category will be permanently deleted."
            }
            onDismiss={() => setCatToDelete(null)}
            actions={buildDeleteActions(catToDelete)}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  toastText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
  },
  dragHandle: {
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingRight: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: { flex: 1, gap: 2 },
  catName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  catCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 10,
  },
  actionBtn: { padding: 10 },
  actionBtnCopied: { backgroundColor: "#10B98120", borderRadius: 8 },
});
