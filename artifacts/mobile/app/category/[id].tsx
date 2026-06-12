import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentCard } from "@/components/ContentCard";
import { EmptyState } from "@/components/EmptyState";
import { IconPicker } from "@/components/IconPicker";
import { useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";

type SortOption = "newest" | "oldest" | "completed" | "learning";

export default function CategoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; edit?: string }>();
  const { categories, items, updateCategory, deleteItem } = useLibrary();

  const category = categories.find((c) => c.id === params.id);
  const [isEditing, setIsEditing] = useState(params.edit === "1");
  const [editName, setEditName] = useState(category?.name ?? "");
  const [editIcon, setEditIcon] = useState(category?.icon ?? "book-outline");
  const [editColor, setEditColor] = useState(category?.color ?? "#6366F1");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showArchived, setShowArchived] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const categoryItems = useMemo(() => {
    if (!category) return [];
    let result = items.filter(
      (it) => it.categoryId === category.id && (showArchived || !it.isArchived)
    );
    if (sort === "newest") result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    else if (sort === "oldest") result = [...result].sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === "completed") result = result.filter((it) => it.status === "completed");
    else if (sort === "learning") result = result.filter((it) => it.status === "learning");
    return result;
  }, [items, category, sort, showArchived]);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="alert-circle-outline" title="Category not found" description="" />
      </View>
    );
  }

  function saveEdit() {
    if (!editName.trim()) return;
    updateCategory(category!.id, { name: editName.trim(), icon: editIcon, color: editColor });
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const SORT_OPTIONS: { key: SortOption; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "completed", label: "Completed" },
    { key: "learning", label: "Learning" },
  ];

  if (isEditing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset + 12 }]}>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Category</Text>
          <TouchableOpacity onPress={saveEdit} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.saveBtnText, { color: "#FFFFFF" }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.editForm} showsVerticalScrollIndicator={false}>
          <View style={styles.editPreview}>
            <View style={[styles.previewIcon, { backgroundColor: editColor + "22" }]}>
              <Ionicons name={editIcon as any} size={32} color={editColor} />
            </View>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.editNameInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              placeholder="Category name"
              placeholderTextColor={colors.mutedForeground}
              maxLength={30}
            />
          </View>
          <IconPicker
            selectedIcon={editIcon}
            selectedColor={editColor}
            onSelectIcon={setEditIcon}
            onSelectColor={setEditColor}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={categoryItems}
        keyExtractor={(it) => it.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 80 },
        ]}
        ListHeaderComponent={
          <View>
            <View style={[styles.catHeader, { paddingTop: topInset + 12 }]}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <View style={[styles.catIconBig, { backgroundColor: category.color + "22" }]}>
                <Ionicons name={category.icon as any} size={28} color={category.color} />
              </View>
              <Text style={[styles.catTitle, { color: colors.foreground }]}>{category.name}</Text>
              <View style={styles.catActions}>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={[styles.catActionBtn, { backgroundColor: colors.secondary }]}
                >
                  <Ionicons name="pencil-outline" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/add?categoryId=${category.id}`)}
                  style={[styles.catActionBtn, { backgroundColor: category.color + "22" }]}
                >
                  <Ionicons name="add" size={20} color={category.color} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statChip, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {items.filter((it) => it.categoryId === category.id && !it.isArchived).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: "#10B98122" }]}>
                <Text style={[styles.statValue, { color: "#10B981" }]}>
                  {items.filter((it) => it.categoryId === category.id && it.status === "completed").length}
                </Text>
                <Text style={[styles.statLabel, { color: "#10B981" }]}>Done</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: "#3B82F622" }]}>
                <Text style={[styles.statValue, { color: "#3B82F6" }]}>
                  {items.filter((it) => it.categoryId === category.id && it.status === "learning").length}
                </Text>
                <Text style={[styles.statLabel, { color: "#3B82F6" }]}>Learning</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={styles.sortContent}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortChip, { backgroundColor: sort === opt.key ? category.color : colors.secondary }]}
                  onPress={() => setSort(opt.key)}
                >
                  <Text style={[styles.sortChipText, { color: sort === opt.key ? "#FFFFFF" : colors.mutedForeground }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.sortChip, { backgroundColor: showArchived ? colors.accent + "33" : colors.secondary }]}
                onPress={() => setShowArchived(!showArchived)}
              >
                <Ionicons name="archive-outline" size={14} color={showArchived ? colors.accent : colors.mutedForeground} />
                <Text style={[styles.sortChipText, { color: showArchived ? colors.accent : colors.mutedForeground }]}>
                  Archived
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <ContentCard
            item={item}
            categoryColor={category.color}
            onPress={() => router.push(`/content/${item.id}`)}
            onDelete={() => {
              Alert.alert("Delete Item", `Delete "${item.title}"?`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    deleteItem(item.id);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  },
                },
              ]);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState
              icon={category.icon}
              title="Nothing here yet"
              description={`Save content to your ${category.name} category to get started.`}
              actionLabel="Save Content"
              onAction={() => router.push(`/add?categoryId=${category.id}`)}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16 },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  catIconBig: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  catTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  catActions: {
    flexDirection: "row",
    gap: 8,
  },
  catActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  sortRow: { flexGrow: 0, marginBottom: 16 },
  sortContent: { gap: 8 },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  sortChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  emptyWrap: { flex: 1, paddingTop: 40 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  editForm: {
    padding: 20,
    gap: 24,
  },
  editPreview: {
    alignItems: "center",
    gap: 16,
    paddingBottom: 8,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  editNameInput: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    borderBottomWidth: 1,
    paddingBottom: 8,
    width: "100%",
  },
});
