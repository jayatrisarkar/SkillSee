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
    <View style={[styles.container, { opacity: achievement.earned ? 1 : 0.4 }]}>
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
            borderColor: achievement.earned ? achievement.color + "66" : colors.border,
            borderWidth: achievement.earned ? 1.5 : 1,
          },
        ]}
      >
        <Ionicons
          name={achievement.icon as any}
          size={iconSize}
          color={achievement.earned ? achievement.color : colors.mutedForeground}
        />
        {achievement.earned && (
          <View style={[styles.checkDot, { backgroundColor: achievement.color, borderColor: colors.background }]}>
            <Ionicons name="checkmark" size={8} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.title,
          {
            color: achievement.earned ? colors.foreground : colors.mutedForeground,
            fontSize: isSm ? 10 : 11,
          },
        ]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
      {!achievement.earned && achievement.progressText && (
        <Text style={[styles.progress, { color: colors.mutedForeground }]}>
          {achievement.progressText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 5,
    width: 82,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  checkDot: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  title: {
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 14,
  },
  progress: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
