import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export const AVAILABLE_ICONS = [
  "book-outline",
  "musical-notes-outline",
  "mic-outline",
  "musical-note-outline",
  "code-slash-outline",
  "trending-up-outline",
  "barbell-outline",
  "restaurant-outline",
  "color-palette-outline",
  "camera-outline",
  "film-outline",
  "rocket-outline",
  "leaf-outline",
  "heart-outline",
  "star-outline",
  "trophy-outline",
  "flask-outline",
  "globe-outline",
  "language-outline",
  "laptop-outline",
  "brush-outline",
  "pencil-outline",
  "game-controller-outline",
  "airplane-outline",
  "bicycle-outline",
  "car-outline",
  "people-outline",
  "person-outline",
  "briefcase-outline",
  "bulb-outline",
  "cloud-outline",
  "flower-outline",
  "hammer-outline",
  "headset-outline",
  "home-outline",
  "paw-outline",
  "pizza-outline",
  "planet-outline",
  "school-outline",
  "shirt-outline",
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
