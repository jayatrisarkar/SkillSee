import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ONBOARDED_KEY = "@skillflow:onboarded";

const FEATURES = [
  { icon: "bookmark", color: "#6366F1", title: "Save anything", desc: "Videos, reels, articles from any platform" },
  { icon: "grid", color: "#A855F7", title: "Auto-organize", desc: "AI categorizes your content into skill sets" },
  { icon: "bar-chart", color: "#F59E0B", title: "Track progress", desc: "Streaks, completion stats, learning insights" },
  { icon: "bulb", color: "#10B981", title: "Learn smarter", desc: "AI-powered recommendations & summaries" },
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

  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const botPad = (Platform.OS === "web" ? 34 : insets.bottom) + 24;

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen">
      <LinearGradient colors={["#06080E", "#0C1424", "#07090F"]} style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20, paddingBottom: botPad }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            {/* Real app icon */}
            <View style={styles.logoGlow}>
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.appName}>SkillSee</Text>
            <Text style={styles.tagline}>Save. Learn. Master.</Text>
            <Text style={styles.heroSub}>Your personal learning vault</Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + "18" }]}>
                  <Ionicons name={f.icon as any} size={19} color={f.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={handleGetStarted}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#818CF8", "#6366F1", "#4338CA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.privacyNote}>All data stored locally on your device</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 28,
    flexGrow: 1,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoGlow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 32,
    marginBottom: 16,
  },
  logoImage: {
    width: 84,
    height: 84,
    borderRadius: 22,
  },
  appName: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: "#E8EDF5",
    letterSpacing: -1.2,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#6366F1",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#4D5D7A",
  },
  features: {
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#E8EDF5",
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#4D5D7A",
    lineHeight: 19,
  },
  footer: {
    alignItems: "center",
    gap: 14,
  },
  ctaBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  privacyNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#2A3650",
  },
});
