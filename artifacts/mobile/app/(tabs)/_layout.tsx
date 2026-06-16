import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, useRouter } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

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
  const colors = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  // Center the button in the tab bar
  const tabBarHeight = isWeb ? 84 : 49 + (insets.bottom || 0);
  const btnBottom = Math.round(tabBarHeight / 2) - 23; // 23 = half button height

  return (
    <View style={styles.wrapper}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 0,
            ...(isWeb ? { height: 84 } : {}),
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={80}
                tint={colorScheme === "dark" ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : isWeb ? (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Library",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="books.vertical" tintColor={color} size={24} />
              ) : (
                <Ionicons name="library-outline" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="magnifyingglass" tintColor={color} size={24} />
              ) : (
                <Ionicons name="search-outline" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="chart.bar.xaxis" tintColor={color} size={24} />
              ) : (
                <Ionicons name="bar-chart-outline" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="person.circle" tintColor={color} size={24} />
              ) : (
                <Ionicons name="person-circle-outline" size={22} color={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{ href: null }}
        />
      </Tabs>

      {/* Center + button floating over the tab bar */}
      <TouchableOpacity
        style={[styles.addBtn, { bottom: btnBottom }]}
        onPress={() => router.push("/add")}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={["#818CF8", "#6366F1", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addGradient}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  addBtn: {
    position: "absolute",
    left: "50%" as any,
    marginLeft: -23,
    zIndex: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
