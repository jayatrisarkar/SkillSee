import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
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

function extractDomain(url: string): string {
  try {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s?#]+)/);
    return match ? match[1] : url;
  } catch {
    return url;
  }
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

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(item.title, "What would you like to do?", [
      { text: "Open Link", onPress: () => Linking.openURL(item.url) },
      { text: "Edit", onPress },
      { text: "Delete", style: "destructive", onPress: onDelete },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      {categoryColor && <View style={[styles.accent, { backgroundColor: categoryColor }]} />}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(item.url)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="open-outline" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.domain, { color: colors.mutedForeground }]} numberOfLines={1}>
          {extractDomain(item.url)}
        </Text>

        {item.notes ? (
          <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.notes}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.tags}>
            {showCategory && categoryName ? (
              <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{categoryName}</Text>
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
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 10,
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 21,
  },
  domain: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  notes: {
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
});
