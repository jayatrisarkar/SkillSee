import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { type Category, useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, items, deleteCategory } = useLibrary();
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  function handleDelete(cat: Category) {
    const others = categories.filter((c) => c.id !== cat.id);
    if (others.length === 0) return; // can't delete last category
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCatToDelete(cat);
  }

  function buildDeleteActions(cat: Category) {
    const count = items.filter((it) => it.categoryId === cat.id).length;
    const others = categories.filter((c) => c.id !== cat.id);
    const target = others.find((c) => c.name === "Learning") ?? others[0];
    const actions = [{ label: "Cancel", onPress: () => {} }] as Array<{ label: string; onPress: () => void; destructive?: boolean; primary?: boolean }>;
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: topInset + 16,
            paddingBottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>Categories</Text>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/new-category")}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
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
        renderItem={({ item: cat }) => {
          const count = items.filter((it) => it.categoryId === cat.id).length;
          return (
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
              <View style={styles.rowActions}>
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
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
  },
  rowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
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
    gap: 12,
    paddingRight: 14,
  },
  actionBtn: {
    padding: 10,
  },
});
