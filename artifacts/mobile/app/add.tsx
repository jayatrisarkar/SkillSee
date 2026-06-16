import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";
import { classifyContent } from "@/utils/classify";

export default function AddScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const { categories, addItem } = useLibrary();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"none" | "learning" | "completed">("none");
  const [categoryId, setCategoryId] = useState<string>(
    params.categoryId ?? categories.find((c) => c.name === "Learning")?.id ?? categories[0]?.id ?? ""
  );
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const tagRef = useRef<TextInput>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  function extractYouTubeThumbnail(rawUrl: string): string | null {
    const patterns = [
      /youtube\.com\/watch\?v=([^&\s]+)/,
      /youtu\.be\/([^?\s]+)/,
      /youtube\.com\/shorts\/([^?\s\/]+)/,
      /youtube\.com\/embed\/([^?\s]+)/,
    ];
    for (const pat of patterns) {
      const match = rawUrl.match(pat);
      if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return null;
  }

  function handleUrlChange(text: string) {
    setUrl(text);
    const thumb = extractYouTubeThumbnail(text);
    setThumbnailUrl(thumb);
  }

  function handleAutoClassify() {
    if (!url && !title) return;
    const suggested = classifyContent(title || url, url, categories);
    setCategoryId(suggested);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleSave() {
    if (!url.trim()) {
      Alert.alert("URL Required", "Please enter a URL or link to save.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for this content.");
      return;
    }
    if (!categoryId) {
      Alert.alert("Category Required", "Please select a category.");
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    addItem({
      title: title.trim(),
      url: finalUrl,
      notes: notes.trim(),
      description: description.trim() || undefined,
      thumbnailUrl: thumbnailUrl ?? undefined,
      categoryId,
      tags,
      status,
      isArchived: false,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.modalTitle, { color: colors.foreground }]}>Save Content</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.saveBtnText, { color: "#FFFFFF" }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Field label="URL / LINK" colors={colors}>
          <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Ionicons name="link-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              value={url}
              onChangeText={handleUrlChange}
              onBlur={handleAutoClassify}
              placeholder="https://..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textInput, { color: colors.foreground }]}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </Field>

        <Field label="TITLE" colors={colors}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            onBlur={handleAutoClassify}
            placeholder="What is this about?"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.fieldInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
          />
        </Field>

        <Field label="DESCRIPTION" colors={colors}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description of this content..."
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.fieldInput,
              { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground },
            ]}
          />
        </Field>

        <Field label="NOTES" colors={colors}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add your thoughts, key takeaways..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            style={[
              styles.fieldInput,
              styles.notesInput,
              { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground },
            ]}
          />
        </Field>

        <Field label="CATEGORY" colors={colors}>
          <TouchableOpacity
            style={[styles.catSelector, { backgroundColor: colors.secondary, borderColor: selectedCategory ? selectedCategory.color : colors.border }]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            {selectedCategory && (
              <View style={[styles.catDot, { backgroundColor: selectedCategory.color + "33" }]}>
                <Ionicons name={selectedCategory.icon as any} size={16} color={selectedCategory.color} />
              </View>
            )}
            <Text style={[styles.catSelectorText, { color: selectedCategory ? colors.foreground : colors.mutedForeground }]}>
              {selectedCategory?.name ?? "Select a category"}
            </Text>
            <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          {showCategoryPicker && (
            <View style={[styles.catPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catOption,
                    categoryId === cat.id && { backgroundColor: cat.color + "22" },
                  ]}
                  onPress={() => {
                    setCategoryId(cat.id);
                    setShowCategoryPicker(false);
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
        </Field>

        <Field label="STATUS" colors={colors}>
          <View style={styles.statusRow}>
            {(["none", "learning", "completed"] as const).map((s) => {
              const labels = { none: "None", learning: "Learning", completed: "Completed" };
              const bgs = { none: colors.secondary, learning: "#3B82F633", completed: "#10B98133" };
              const fgs = { none: colors.mutedForeground, learning: "#3B82F6", completed: "#10B981" };
              const isActive = status === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusBtn,
                    {
                      backgroundColor: isActive ? bgs[s] : colors.secondary,
                      borderColor: isActive ? fgs[s] : "transparent",
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.statusBtnText, { color: isActive ? fgs[s] : colors.mutedForeground }]}>
                    {labels[s]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        <Field label="TAGS" colors={colors}>
          <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <TextInput
              ref={tagRef}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add a tag and press Enter"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textInput, { color: colors.foreground }]}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={addTag}
              blurOnSubmit={false}
            />
            <TouchableOpacity onPress={addTag} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {tags.length > 0 && (
            <View style={styles.tagRow}>
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
        </Field>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  form: { padding: 16, gap: 20 },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  fieldInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  notesInput: {
    height: 90,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
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
  catSelectorText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
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
  catOptionText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  statusBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
