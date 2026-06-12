import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  color = "#6366F1",
  trackColor = "#1E293B",
  label,
  sublabel,
  showPercent = true,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const offset = circ * (1 - clampedProgress);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color + "99"} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>
      <View style={styles.center}>
        {showPercent && (
          <Text style={[styles.pct, { color: "#F1F5F9", fontSize: size > 80 ? 20 : 14 }]}>
            {Math.round(clampedProgress * 100)}%
          </Text>
        )}
        {label && (
          <Text style={[styles.label, { color: "#64748B", fontSize: size > 80 ? 11 : 9 }]}>
            {label}
          </Text>
        )}
        {sublabel && (
          <Text style={[styles.label, { color: "#64748B", fontSize: 9 }]}>{sublabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  pct: { fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  label: { fontFamily: "Inter_500Medium", marginTop: 1 },
});
