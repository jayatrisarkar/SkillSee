import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface UpgradeModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  message?: string;
}

const UPGRADE_PERKS = [
  "Unlimited Categories",
  "Custom Icons & Colors",
  "Cloud Sync",
  "Advanced Organization",
  "Future AI Features",
];

export function UpgradeModal({
  visible,
  onDismiss,
  title = "Unlock SkillSee Premium",
  message = "You've reached the free limit of 10 categories.",
}: UpgradeModalProps) {
  const colors = useColors();
  const router = useRouter();

  function handleUpgrade() {
    onDismiss();
    router.push("/premium");
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Icon */}
              <LinearGradient
                colors={["#6366F1", "#A855F7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconWrap}
              >
                <Ionicons name="diamond" size={26} color="#FFFFFF" />
              </LinearGradient>

              {/* Title */}
              <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

              {/* Message */}
              <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
              <Text style={[styles.upgradeLabel, { color: colors.mutedForeground }]}>
                Upgrade to Premium and get:
              </Text>

              {/* Perks */}
              <View style={styles.perks}>
                {UPGRADE_PERKS.map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                    <Text style={[styles.perkText, { color: colors.foreground }]}>{perk}</Text>
                  </View>
                ))}
              </View>

              {/* Price */}
              <View style={[styles.priceRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Starting at</Text>
                <Text style={[styles.price, { color: colors.foreground }]}>$1.99</Text>
                <Text style={[styles.pricePer, { color: colors.mutedForeground }]}>/month</Text>
              </View>

              {/* Upgrade button */}
              <TouchableOpacity onPress={handleUpgrade} activeOpacity={0.85} style={styles.upgradeBtn}>
                <LinearGradient
                  colors={["#6366F1", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeBtnGradient}
                >
                  <Ionicons name="diamond-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Dismiss */}
              <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} style={styles.laterBtn}>
                <Text style={[styles.laterText, { color: colors.mutedForeground }]}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  sheet: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  upgradeLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginTop: 4,
  },
  perks: {
    alignSelf: "stretch",
    gap: 8,
    paddingHorizontal: 4,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  perkText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  price: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  pricePer: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  upgradeBtn: {
    alignSelf: "stretch",
    marginTop: 4,
  },
  upgradeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  upgradeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  laterBtn: {
    paddingVertical: 8,
  },
  laterText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
