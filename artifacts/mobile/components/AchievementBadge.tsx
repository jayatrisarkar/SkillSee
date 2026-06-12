import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { type Achievement } from "@/utils/insights";
import { useColors } from "@/hooks/useColors";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md";
}

export function AchievementBadge({ achievement, size = "md" }: AchievementBadgeProps) {
  const colors = useColors();
  const isSm = size === "sm";
  const dim = isSm ? 56 : 72;
  const iconSize = isSm ? 20 : 26;

  return (
    <View style={[styles.container, { opacity: achievement.earned ? 1 : 0.35 }]}>
      <View
        style={[
          styles.iconWrap,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 4,
            backgroundColor: achievement.earned
              ? achievement.color + "22"
              : colors.secondary,
            borderColor: achievement.earned ? achievement.color + "55" : colors.border,
          },
        ]}
      >
        <Ionicons
          name={achievement.icon as any}
          size={iconSize}
          color={achievement.earned ? achievement.color : colors.mutedForeground}
        />
        {achievement.earned && (
          <View style={[styles.checkDot, { backgroundColor: achievement.color }]}>
            <Ionicons name="checkmark" size={8} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text
        style={[styles.title, { color: achievement.earned ? colors.foreground : colors.mutedForeground, fontSize: isSm ? 10 : 11 }]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
    width: 80,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  checkDot: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#0D1117",
  },
  title: {
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 14,
  },
});
