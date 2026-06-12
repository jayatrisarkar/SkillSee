import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "@/components/CategoryCard";
import { ContentCard } from "@/components/ContentCard";
import { EmptyState } from "@/components/EmptyState";
import { useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, items, deleteItem } = useLibrary();

  const recentItems = useMemo(
    () => items.filter((it) => !it.isArchived).slice(0, 10),
    [items]
  );

  const categoryData = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        count: items.filter((it) => it.categoryId === cat.id && !it.isArchived).length,
      })),
    [categories, items]
  );

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={recentItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topInset + 16,
            paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 100,
          },
        ]}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                  Your Vault
                </Text>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  My Library
                </Text>
              </View>
              <View style={[styles.totalBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.totalText, { color: colors.mutedForeground }]}>
                  {items.filter((it) => !it.isArchived).length} saved
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              CATEGORIES
            </Text>
            <FlatList
              data={categoryData}
              keyExtractor={(c) => c.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.catRow}
              contentContainerStyle={styles.catGrid}
              renderItem={({ item: cat }) => (
                <CategoryCard
                  name={cat.name}
                  icon={cat.icon}
                  color={cat.color}
                  count={cat.count}
                  onPress={() => router.push(`/category/${cat.id}`)}
                />
              )}
            />

            {recentItems.length > 0 && (
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>
                RECENTLY SAVED
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const cat = categories.find((c) => c.id === item.categoryId);
          return (
            <ContentCard
              item={item}
              categoryColor={cat?.color}
              categoryName={cat?.name}
              showCategory
              onPress={() => router.push(`/content/${item.id}`)}
              onDelete={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                deleteItem(item.id);
              }}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="archive-outline"
            title="Your vault is empty"
            description="Save videos, links, and resources to build your personal knowledge library."
            actionLabel="Save Your First Item"
            onAction={() => router.push("/add")}
          />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/add");
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  totalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  catGrid: { gap: 10 },
  catRow: { gap: 10 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
