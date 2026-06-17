import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useLibrary, type Category } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";
import { PLATFORM_COLORS, type SourcePlatform } from "@/lib/categorize";

export interface SharePayload {
  url: string;
  title: string;
  platform: SourcePlatform;
  suggestedCategoryId: string;
  thumbnailUrl?: string;
}

interface ShareSaveModalProps {
  visible: boolean;
  payload: SharePayload | null;
  onSave: (categoryId: string, title: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const PLATFORM_ICONS: Record<SourcePlatform, React.ComponentProps<typeof Ionicons>["name"]> = {
  YouTube: "logo-youtube",
  Instagram: "logo-instagram",
  TikTok: "musical-notes",
  Facebook: "logo-facebook",
  "Twitter/X": "logo-twitter",
  Threads: "chatbubbles",
  LinkedIn: "logo-linkedin",
  Website: "globe-outline",
};

export function ShareSaveModal({ visible, payload, onSave, onCancel, isSaving }: ShareSaveModalProps) {
  const colors = useColors();
  const { categories } = useLibrary();
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [showCatPicker, setShowCatPicker] = useState(false);
  const titleRef = useRef<TextInput>(null);

  useEffect(() => {
    if (payload) {
      setSelectedCatId(payload.suggestedCategoryId);
      setTitle(payload.title);
      setShowCatPicker(false);
    }
  }, [payload]);

  const selectedCat = categories.find((c) => c.id === selectedCatId);
  const platformColor = payload ? (PLATFORM_COLORS[payload.platform] ?? "#6366F1") : "#6366F1";
  const platformIcon = payload ? PLATFORM_ICONS[payload.platform] : "globe-outline";

  function handleSave() {
    if (!title.trim()) return;
    onSave(selectedCatId || "cat_learning", title.trim());
  }

  function renderCategoryItem({ item }: { item: Category }) {
    const isSelected = item.id === selectedCatId;
    return (
      <TouchableOpacity
        style={[
          styles.catItem,
          { borderBottomColor: colors.border },
          isSelected && { backgroundColor: colors.primary + "12" },
        ]}
        onPress={() => {
          setSelectedCatId(item.id);
          setShowCatPicker(false);
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.catIcon, { backgroundColor: item.color + "20" }]}>
          <Ionicons name={item.icon as any} size={18} color={item.color} />
        </View>
        <Text style={[styles.catName, { color: colors.foreground }]}>{item.name}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  }

  if (!payload) return null;

  // ── Category picker sub-modal ──────────────────────────────────────────────
  if (showCatPicker) {
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setShowCatPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCatPicker(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.pickerSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />
                <Text style={[styles.pickerTitle, { color: colors.foreground }]}>Choose Category</Text>
                <FlatList
                  data={categories}
                  keyExtractor={(c) => c.id}
                  renderItem={renderCategoryItem}
                  style={{ maxHeight: 400 }}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  // ── Main save modal ────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />

              {/* Header */}
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Save to SkillSee</Text>
                <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {/* Content Preview */}
              <View style={[styles.preview, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {/* Platform badge */}
                <View style={[styles.platformBadge, { backgroundColor: platformColor + "18" }]}>
                  <Ionicons name={platformIcon} size={22} color={platformColor} />
                </View>
                <View style={styles.previewText}>
                  <View style={[styles.platformPill, { backgroundColor: platformColor + "18" }]}>
                    <Text style={[styles.platformPillText, { color: platformColor }]}>
                      {payload.platform}
                    </Text>
                  </View>
                  <Text
                    style={[styles.previewUrl, { color: colors.mutedForeground }]}
                    numberOfLines={1}
                  >
                    {payload.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 50)}
                  </Text>
                </View>
              </View>

              {/* Title input */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Title</Text>
                <TextInput
                  ref={titleRef}
                  value={title}
                  onChangeText={setTitle}
                  style={[
                    styles.titleInput,
                    { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  placeholder="Add a title…"
                  placeholderTextColor={colors.mutedForeground}
                  maxLength={120}
                  multiline
                />
              </View>

              {/* Category picker */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
                <TouchableOpacity
                  style={[styles.catSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setShowCatPicker(true)}
                  activeOpacity={0.7}
                >
                  {selectedCat ? (
                    <View style={[styles.catIcon, { backgroundColor: selectedCat.color + "20" }]}>
                      <Ionicons name={selectedCat.icon as any} size={16} color={selectedCat.color} />
                    </View>
                  ) : (
                    <Ionicons name="albums-outline" size={16} color={colors.mutedForeground} />
                  )}
                  <Text style={[styles.catSelectorText, { color: selectedCat ? colors.foreground : colors.mutedForeground }]}>
                    {selectedCat?.name ?? "Choose category…"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {/* Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!title.trim() || isSaving}
                  activeOpacity={0.85}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={["#6366F1", "#A855F7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.saveBtn, (!title.trim() || isSaving) && { opacity: 0.5 }]}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="bookmark" size={15} color="#FFFFFF" />
                        <Text style={styles.saveBtnText}>Save</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  platformBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: { flex: 1, gap: 4 },
  platformPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  platformPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  previewUrl: { fontSize: 12, fontFamily: "Inter_400Regular" },

  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 44,
  },

  catSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  catSelectorText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  catIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_700Bold" },

  // Category picker sub-modal
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    paddingBottom: 32,
    gap: 12,
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  pickerTitle: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  catName: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
});
