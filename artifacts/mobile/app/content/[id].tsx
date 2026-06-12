import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type ContentStatus, useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";

export default function ContentDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { items, categories, updateItem, deleteItem } = useLibrary();

  const item = items.find((it) => it.id === params.id);

  const [title, setTitle] = useState(item?.title ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [status, setStatus] = useState<ContentStatus>(item?.status ?? "none");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? "");
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const tagRef = useRef<TextInput>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const selectedCategory = categories.find((c) => c.id === categoryId);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          <Text style={[styles.backText, { color: colors.foreground }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Item not found.</Text>
        </View>
      </View>
    );
  }

  function markDirty() {
    if (!isDirty) setIsDirty(true);
  }

  function handleSave() {
    if (!title.trim()) return;
    updateItem(item.id, { title: title.trim(), notes: notes.trim(), tags, status, categoryId });
    setIsDirty(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  function handleDelete() {
    Alert.alert("Delete Item", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteItem(item.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  }

  function handleArchive() {
    updateItem(item.id, { isArchived: !item.isArchived });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      markDirty();
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
    markDirty();
  }

  const STATUS_OPTIONS: { key: ContentStatus; label: string; color: string }[] = [
    { key: "none", label: "None", color: colors.mutedForeground },
    { key: "learning", label: "Learning", color: "#3B82F6" },
    { key: "completed", label: "Completed", color: "#10B981" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => {
          if (isDirty) {
            Alert.alert("Unsaved Changes", "Save your changes?", [
              { text: "Discard", style: "destructive", onPress: () => router.back() },
              { text: "Save", onPress: handleSave },
              { text: "Keep editing", style: "cancel" },
            ]);
          } else {
            router.back();
          }
        }}>
          <Ionicons name="chevron-back" size={26} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={() => Linking.openURL(item.url)}
            style={[styles.actionPill, { backgroundColor: colors.secondary }]}
          >
            <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.actionPillText, { color: colors.mutedForeground }]}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleArchive}
            style={[styles.actionPill, { backgroundColor: colors.secondary }]}
          >
            <Ionicons name="archive-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.actionPillText, { color: colors.mutedForeground }]}>
              {item.isArchived ? "Unarchive" : "Archive"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionPill, { backgroundColor: colors.destructive + "22" }]}
          >
            <Ionicons name="trash-outline" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: Platform.OS === "web" ? 34 + 40 : insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={title}
          onChangeText={(t) => { setTitle(t); markDirty(); }}
          style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
          multiline
          placeholder="Title"
          placeholderTextColor={colors.mutedForeground}
        />

        <TouchableOpacity
          style={[styles.urlRow, { backgroundColor: colors.secondary }]}
          onPress={() => Linking.openURL(item.url)}
        >
          <Ionicons name="link-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.urlText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.url}
          </Text>
          <Ionicons name="open-outline" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>STATUS</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((opt) => {
            const isActive = status === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: isActive ? opt.color + "22" : colors.secondary,
                    borderColor: isActive ? opt.color : "transparent",
                    borderWidth: 1,
                  },
                ]}
                onPress={() => { setStatus(opt.key); markDirty(); }}
              >
                <Text style={[styles.statusBtnText, { color: isActive ? opt.color : colors.mutedForeground }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CATEGORY</Text>
        <TouchableOpacity
          style={[styles.catSelector, { backgroundColor: colors.secondary, borderColor: selectedCategory ? selectedCategory.color + "66" : colors.border }]}
          onPress={() => setShowCatPicker(!showCatPicker)}
        >
          {selectedCategory && (
            <View style={[styles.catDot, { backgroundColor: selectedCategory.color + "33" }]}>
              <Ionicons name={selectedCategory.icon as any} size={16} color={selectedCategory.color} />
            </View>
          )}
          <Text style={[styles.catText, { color: selectedCategory ? colors.foreground : colors.mutedForeground }]}>
            {selectedCategory?.name ?? "Select category"}
          </Text>
          <Ionicons name={showCatPicker ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        {showCatPicker && (
          <View style={[styles.catPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catOption, categoryId === cat.id && { backgroundColor: cat.color + "22" }]}
                onPress={() => {
                  setCategoryId(cat.id);
                  setShowCatPicker(false);
                  markDirty();
                }}
              >
                <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                <Text style={[styles.catOptionText, { color: colors.foreground }]}>{cat.name}</Text>
                {categoryId === cat.id && (
                  <Ionicons name="checkmark" size={16} color={cat.color} style={{ marginLeft: "auto" }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NOTES</Text>
        <TextInput
          value={notes}
          onChangeText={(t) => { setNotes(t); markDirty(); }}
          style={[styles.notesInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
          multiline
          placeholder="Your thoughts, key takeaways..."
          placeholderTextColor={colors.mutedForeground}
          textAlignVertical="top"
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TAGS</Text>
        <View style={[styles.tagInputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <TextInput
            ref={tagRef}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.tagTextInput, { color: colors.foreground }]}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={addTag}
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={addTag}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {tags.length > 0 && (
          <View style={styles.tagWrap}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, { backgroundColor: colors.secondary }]}
                onPress={() => removeTag(tag)}
              >
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
                <Ionicons name="close" size={12} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
          Saved {new Date(item.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </Text>

        {isDirty && (
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveBtnText, { color: "#FFFFFF" }]}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 6,
  },
  backText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  actionPillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  form: { padding: 16, gap: 12 },
  titleInput: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
    letterSpacing: -0.3,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  urlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 8,
  },
  statusRow: { flexDirection: "row", gap: 10 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  statusBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  catSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  catDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  catText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  catPicker: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  catOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  catOptionText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 100,
    lineHeight: 22,
  },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  tagTextInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  tagText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
