import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export const AVAILABLE_ICONS = [
  // ── Beauty & Makeup ──
  "sparkles-outline",
  "rose-outline",
  "water-outline",
  "sunny-outline",
  "ribbon-outline",
  "eye-outline",
  "eyedrop-outline",
  "cut-outline",
  // ── Fashion & Style ──
  "shirt-outline",
  "bag-outline",
  "bag-handle-outline",
  "glasses-outline",
  "watch-outline",
  "diamond-outline",
  "accessibility-outline",
  // ── Nails & Hands ──
  "hand-left-outline",
  "hand-right-outline",
  // ── Art & Design ──
  "color-palette-outline",
  "brush-outline",
  "pencil-outline",
  "easel-outline",
  "image-outline",
  "aperture-outline",
  "shapes-outline",
  // ── Tech ──
  "hardware-chip-outline",
  "phone-portrait-outline",
  "desktop-outline",
  "laptop-outline",
  "wifi-outline",
  "code-slash-outline",
  "terminal-outline",
  "layers-outline",
  "cube-outline",
  "cloud-outline",
  // ── Learning ──
  "book-outline",
  "school-outline",
  "library-outline",
  "journal-outline",
  "bulb-outline",
  "flask-outline",
  "language-outline",
  // ── Music & Audio ──
  "musical-notes-outline",
  "mic-outline",
  "musical-note-outline",
  "headset-outline",
  "radio-outline",
  // ── Fitness & Health ──
  "barbell-outline",
  "bicycle-outline",
  "body-outline",
  "fitness-outline",
  "medkit-outline",
  "heart-outline",
  "leaf-outline",
  "flower-outline",
  // ── Media & Content ──
  "camera-outline",
  "film-outline",
  "videocam-outline",
  "play-circle-outline",
  "podcast-outline",
  "tv-outline",
  // ── Business & Growth ──
  "trending-up-outline",
  "briefcase-outline",
  "rocket-outline",
  "trophy-outline",
  "star-outline",
  "analytics-outline",
  "cash-outline",
  // ── Lifestyle ──
  "restaurant-outline",
  "pizza-outline",
  "airplane-outline",
  "globe-outline",
  "home-outline",
  "car-outline",
  "paw-outline",
  "planet-outline",
  "people-outline",
  "person-outline",
  "hammer-outline",
  "game-controller-outline",
];

export const AVAILABLE_COLORS = [
  "#EC4899",
  "#A855F7",
  "#8B5CF6",
  "#6366F1",
  "#3B82F6",
  "#22D3EE",
  "#10B981",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#64748B",
  "#84CC16",
];

interface IconPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (icon: string) => void;
  onSelectColor: (color: string) => void;
}

export function IconPicker({ selectedIcon, selectedColor, onSelectIcon, onSelectColor }: IconPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>COLOR</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow} contentContainerStyle={styles.colorRowContent}>
        {AVAILABLE_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorDot,
              { backgroundColor: c },
              selectedColor === c && styles.colorDotSelected,
            ]}
            onPress={() => onSelectColor(c)}
          />
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 16 }]}>ICON</Text>
      <View style={styles.iconGrid}>
        {AVAILABLE_ICONS.map((icon) => {
          const isSelected = icon === selectedIcon;
          return (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isSelected ? selectedColor + "33" : colors.secondary,
                  borderColor: isSelected ? selectedColor : "transparent",
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => onSelectIcon(icon)}
            >
              <Ionicons name={icon as any} size={22} color={isSelected ? selectedColor : colors.mutedForeground} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  colorRow: {
    flexGrow: 0,
  },
  colorRowContent: {
    gap: 10,
    paddingVertical: 4,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
