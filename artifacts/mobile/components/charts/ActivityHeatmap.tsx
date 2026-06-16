import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const CELL = 14;
const GAP = 3;
const COLS = 7;
const ROWS = 7;

interface ActivityHeatmapProps {
  data: number[];
  color?: string;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function ActivityHeatmap({ data, color = "#6366F1" }: ActivityHeatmapProps) {
  const colors = useColors();
  const max = Math.max(...data, 1);
  const total = data.reduce((a, b) => a + b, 0);

  function getOpacity(val: number): number {
    if (val === 0) return 0;
    const intensity = val / max;
    return 0.2 + intensity * 0.8;
  }

  const gridW = COLS * (CELL + GAP) - GAP;
  const gridH = ROWS * (CELL + GAP) - GAP;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.dayLabels}>
          {DAY_LABELS.map((d, i) => (
            <Text key={i} style={[styles.dayLabel, { color: colors.mutedForeground }]}>{d}</Text>
          ))}
        </View>
        <View>
          <Svg width={gridW} height={gridH}>
            {Array.from({ length: COLS }).map((_, col) =>
              Array.from({ length: ROWS }).map((_, row) => {
                const idx = col * ROWS + row;
                const val = idx < data.length ? data[idx] : 0;
                const opacity = getOpacity(val);
                return (
                  <Rect
                    key={`${col}-${row}`}
                    x={col * (CELL + GAP)}
                    y={row * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={3}
                    fill={val === 0 ? colors.secondary : color}
                    opacity={val === 0 ? 1 : opacity}
                  />
                );
              })
            )}
          </Svg>
          <View style={[styles.weekRow, { width: gridW }]}>
            {Array.from({ length: COLS }).map((_, i) => (
              <Text key={i} style={[styles.weekLabel, { width: CELL + GAP, color: colors.mutedForeground }]} numberOfLines={1}>
                {i === COLS - 1 ? "now" : ""}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.legendRow}>
        <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Less</Text>
        {[0, 0.25, 0.5, 0.75, 1].map((op, i) => (
          <Svg key={i} width={CELL} height={CELL}>
            <Rect
              x={0}
              y={0}
              width={CELL}
              height={CELL}
              rx={3}
              fill={op === 0 ? colors.secondary : color}
              opacity={op === 0 ? 1 : 0.2 + op * 0.8}
            />
          </Svg>
        ))}
        <Text style={[styles.legendText, { color: colors.mutedForeground }]}>More</Text>
        <Text style={[styles.legendText, { color: colors.mutedForeground, marginLeft: "auto" }]}>{total} total</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  dayLabels: {
    gap: GAP,
    width: 14,
    alignItems: "center",
    paddingTop: 1,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    height: CELL,
    lineHeight: CELL,
    textAlign: "center",
  },
  weekRow: {
    flexDirection: "row",
    marginTop: 3,
  },
  weekLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
});
