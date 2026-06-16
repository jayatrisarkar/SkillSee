import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const TAB_ICONS: Record<string, { outline: string; filled: string; label: string }> = {
  index:    { outline: "library-outline",       filled: "library",           label: "Library" },
  search:   { outline: "search-outline",        filled: "search",            label: "Search" },
  insights: { outline: "bar-chart-outline",     filled: "bar-chart",         label: "Insights" },
  profile:  { outline: "person-circle-outline", filled: "person-circle",     label: "Profile" },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const bottomPad = isWeb ? 16 : insets.bottom || 12;

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomPad, borderTopColor: colors.border }]}>
      {/* background blur on iOS */}
      {isIOS && (
        <BlurView
          intensity={80}
          tint={colorScheme === "dark" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      )}
      {!isIOS && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
      )}

      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        const isFocused = state.index === index;

        // Skip hidden routes (categories)
        if (descriptor.options.href === null) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        // Center + button
        if (route.name === "add") {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.addWrap}
              onPress={() => router.push("/add")}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#818CF8", "#6366F1", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addBtn}
              >
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        const tabInfo = TAB_ICONS[route.name];
        if (!tabInfo) return null;
        const iconName = isFocused ? tabInfo.filled : tabInfo.outline;
        const tint = isFocused ? colors.primary : colors.mutedForeground;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {isIOS ? (
              <SymbolView
                name={
                  route.name === "index"
                    ? isFocused ? "books.vertical.fill" : "books.vertical"
                    : route.name === "search"
                    ? isFocused ? "magnifyingglass.circle.fill" : "magnifyingglass"
                    : route.name === "insights"
                    ? isFocused ? "chart.bar.xaxis.ascending.fill" : "chart.bar.xaxis"
                    : isFocused ? "person.circle.fill" : "person.circle"
                }
                tintColor={tint}
                size={24}
              />
            ) : (
              <Ionicons name={iconName as any} size={22} color={tint} />
            )}
            <Text style={[styles.tabLabel, { color: tint }]}>{tabInfo.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "books.vertical", selected: "books.vertical.fill" }} />
        <Label>Library</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass.circle.fill" }} />
        <Label>Search</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <Icon sf={{ default: "chart.bar.xaxis", selected: "chart.bar.xaxis.ascending.fill" }} />
        <Label>Insights</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="categories" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...(Platform.OS === "web" ? { height: 84 } : {}),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  addWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
