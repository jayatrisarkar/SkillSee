import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface BarChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  barRadius?: number;
}

export function BarChart({
  data,
  labels,
  color = "#6366F1",
  height = 120,
  barRadius = 5,
}: BarChartProps) {
  const colors = useColors();
  const max = Math.max(...data, 1);
  const barCount = data.length;
  const chartWidth = 280;
  const barWidth = Math.floor((chartWidth - (barCount - 1) * 6) / barCount);

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.3" />
          </LinearGradient>
        </Defs>
        {data.map((val, i) => {
          const barH = Math.max(4, (val / max) * height);
          const x = i * (barWidth + 6);
          const y = height - barH;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={barRadius}
              fill={val > 0 ? "url(#barGrad)" : colors.secondary}
            />
          );
        })}
      </Svg>
      {labels && (
        <View style={[styles.labelRow, { width: chartWidth }]}>
          {labels.map((label, i) => (
            <Text
              key={i}
              style={[styles.label, { width: barWidth + 6, color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "flex-start" },
  labelRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
