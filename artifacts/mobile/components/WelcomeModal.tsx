import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ONBOARDED_KEY = "@skillflow:onboarded";
const { height: SCREEN_H } = Dimensions.get("window");

interface Feature {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  { icon: "bookmark-outline", color: "#6366F1", title: "Save Content", desc: "Videos, reels, articles from any platform" },
  { icon: "grid-outline", color: "#A855F7", title: "Organize Skills", desc: "Smart AI categorization into skill sets" },
  { icon: "bar-chart-outline", color: "#F59E0B", title: "Track Progress", desc: "Streaks, insights, and completion stats" },
  { icon: "bulb-outline", color: "#10B981", title: "Learn Smarter", desc: "AI-powered recommendations and insights" },
];

export function WelcomeModal() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  async function handleGetStarted() {
    await AsyncStorage.setItem(ONBOARDED_KEY, "1");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setVisible(false);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <LinearGradient
          colors={["#4F46E5", "#7C3AED", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: (Platform.OS === "web" ? 60 : insets.top) + 40 }]}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>📚</Text>
            </View>
            <Text style={styles.logoName}>SkillFlow</Text>
          </View>
          <Text style={styles.tagline}>Save. Learn. Master.</Text>
          <Text style={styles.heroSub}>Your personal learning vault</Text>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.bodyTitle}>Everything you need to grow</Text>
          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + "22" }]}>
                  <Ionicons name={f.icon as any} size={22} color={f.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 24 }]}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleGetStarted}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedGradient}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.privacyNote}>All data stored locally on your device</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  hero: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: "center",
    gap: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 28 },
  logoName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.3,
  },
  heroSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },
  bodyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#F1F5F9",
    letterSpacing: -0.3,
  },
  features: { gap: 18 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1, gap: 2 },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#F1F5F9",
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 12,
    alignItems: "center",
  },
  getStartedBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  getStartedGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  getStartedText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  privacyNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#475569",
  },
});
