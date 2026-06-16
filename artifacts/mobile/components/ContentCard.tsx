import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { type ContentItem } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";

interface ContentCardProps {
  item: ContentItem;
  categoryColor?: string;
  onPress: () => void;
  onDelete?: () => void;
  showCategory?: boolean;
  categoryName?: string;
}

const STATUS_CONFIG = {
  none: null,
  learning: { label: "Learning", color: "#3B82F6", icon: "book-outline" },
  completed: { label: "Completed", color: "#10B981", icon: "checkmark-circle-outline" },
} as const;

function formatSavedAt(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}

function extractDomain(url: string): string {
  try {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s?#]+)/);
    return match ? match[1] : url;
  } catch {
    return url;
  }
}

function getPlatformIcon(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "logo-youtube";
  if (lower.includes("instagram.com")) return "logo-instagram";
  if (lower.includes("tiktok.com")) return "musical-notes-outline";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "logo-twitter";
  if (lower.includes("linkedin.com")) return "logo-linkedin";
  if (lower.includes("github.com")) return "logo-github";
  if (lower.includes("reddit.com")) return "logo-reddit";
  return "link-outline";
}

export function ContentCard({
  item,
  categoryColor,
  onPress,
  onDelete,
  showCategory,
  categoryName,
}: ContentCardProps) {
  const colors = useColors();
  const statusConfig = STATUS_CONFIG[item.status];
  const hasThumbnail = !!item.thumbnailUrl;
  const [pendingDelete, setPendingDelete] = useState(false);

  const handleLongPress = () => {
    if (!onDelete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingDelete(true);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: pendingDelete ? "#EF4444" : colors.border }]}
      onPress={pendingDelete ? () => setPendingDelete(false) : onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      {hasThumbnail ? (
        <View style={styles.thumbnailWrap}>
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={300}
          />
          {categoryColor && <View style={[styles.thumbnailAccent, { backgroundColor: categoryColor }]} />}
        </View>
      ) : (
        categoryColor && <View style={[styles.accent, { backgroundColor: categoryColor }]} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons
              name={getPlatformIcon(item.url) as any}
              size={14}
              color={colors.mutedForeground}
            />
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL(item.url)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.domain, { color: colors.mutedForeground }]} numberOfLines={1}>
            {extractDomain(item.url)}
          </Text>
          <Text style={[styles.savedAt, { color: colors.mutedForeground }]}>
            · {formatSavedAt(item.createdAt)}
          </Text>
        </View>

        {(item.description || item.notes) ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.description || item.notes}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.tags}>
            {showCategory && categoryName ? (
              <View style={[styles.tag, { backgroundColor: (categoryColor ?? colors.primary) + "22" }]}>
                <Text style={[styles.tagText, { color: categoryColor ?? colors.primary }]}>{categoryName}</Text>
              </View>
            ) : null}
            {item.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 2 && (
              <Text style={[styles.tagText, { color: colors.mutedForeground }]}>+{item.tags.length - 2}</Text>
            )}
          </View>

          {statusConfig && (
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + "22" }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          )}

          {onDelete && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); setPendingDelete(true); }}
              style={styles.trashBtn}
              hitSlop={6}
            >
              <Ionicons name="trash-outline" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {pendingDelete && (
        <View style={[styles.deleteStrip, { backgroundColor: "#EF444422", borderTopColor: "#EF4444" }]}>
          <Text style={styles.deleteStripText}>Delete this item?</Text>
          <View style={styles.deleteStripBtns}>
            <TouchableOpacity
              style={[styles.deleteStripBtn, { backgroundColor: "#EF4444" }]}
              onPress={(e) => { e.stopPropagation?.(); onDelete?.(); setPendingDelete(false); }}
            >
              <Text style={styles.deleteStripBtnText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteStripBtn, { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border }]}
              onPress={(e) => { e.stopPropagation?.(); setPendingDelete(false); }}
            >
              <Text style={[styles.deleteStripBtnText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  thumbnailWrap: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: 160,
  },
  thumbnailAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  accent: {
    height: 4,
    width: "100%",
  },
  content: {
    padding: 14,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
  },
  domain: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  savedAt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  description: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    flexWrap: "wrap",
    gap: 6,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  trashBtn: {
    marginLeft: "auto",
    padding: 4,
  },
  deleteStrip: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  deleteStripText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#EF4444",
    flex: 1,
  },
  deleteStripBtns: {
    flexDirection: "row",
    gap: 8,
  },
  deleteStripBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  deleteStripBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
