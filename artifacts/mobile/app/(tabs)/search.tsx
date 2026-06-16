import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentCard } from "@/components/ContentCard";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { useLibrary } from "@/context/LibraryContext";
import { useColors } from "@/hooks/useColors";

type SortOption = "newest" | "oldest" | "completed" | "learning";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "completed", label: "Completed" },
  { key: "learning", label: "Learning" },
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, categories, deleteItem } = useLibrary();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const isSearching = query.trim().length > 0 || activeCatId !== null;

  const recentItems = useMemo(
    () => items.filter((it) => !it.isArchived).slice(0, 8),
    [items]
  );

  const filtered = useMemo(() => {
    let result = items.filter((it) => !it.isArchived);

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.notes.toLowerCase().includes(q) ||
          it.url.toLowerCase().includes(q) ||
          it.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (activeCatId) {
      result = result.filter((it) => it.categoryId === activeCatId);
    }

    if (sort === "newest") result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    else if (sort === "oldest") result = [...result].sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === "completed") result = result.filter((it) => it.status === "completed");
    else if (sort === "learning") result = result.filter((it) => it.status === "learning");

    return result;
  }, [items, query, sort, activeCatId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topInset + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>Search</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search videos, links, notes..."
        />

        {isSearching && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={styles.filterContent}
          >
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: sort === opt.key ? colors.primary : colors.secondary,
                  },
                ]}
                onPress={() => setSort(opt.key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: sort === opt.key ? "#FFFFFF" : colors.mutedForeground },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: activeCatId === null ? colors.secondary : colors.primary },
              ]}
              onPress={() => setActiveCatId(null)}
            >
              <Text style={[styles.chipText, { color: activeCatId === null ? colors.mutedForeground : "#FFFFFF" }]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: activeCatId === cat.id ? cat.color + "33" : colors.secondary,
                    borderWidth: activeCatId === cat.id ? 1 : 0,
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => setActiveCatId(activeCatId === cat.id ? null : cat.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: activeCatId === cat.id ? cat.color : colors.mutedForeground },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {isSearching ? (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100 },
          ]}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No results found"
              description={`Nothing matched "${query}". Try a different keyword.`}
            />
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
        />
      ) : (
        <FlatList
          data={recentItems}
          keyExtractor={(it) => it.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 100 },
          ]}
          ListHeaderComponent={
            recentItems.length > 0 ? (
              <Text style={[styles.recentLabel, { color: colors.mutedForeground }]}>
                RECENTLY SAVED
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Nothing saved yet"
              description="Save videos, links, and articles to start building your library."
            />
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  filterRow: { flexGrow: 0 },
  filterContent: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  separator: {
    width: 1,
    height: 28,
    alignSelf: "center",
    marginHorizontal: 4,
  },
  list: { padding: 16 },
  recentLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 12,
  },
});
