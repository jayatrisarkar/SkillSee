import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useProfile } from "@/context/ProfileContext";
import { useColors } from "@/hooks/useColors";

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "words"}
        style={[
          styles.input,
          {
            backgroundColor: colors.secondary,
            borderColor: colors.border,
            color: colors.foreground,
          },
        ]}
      />
    </View>
  );
}

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [avatarUri, setAvatarUri] = useState<string | null>(profile.avatarUri ?? null);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function pickPhoto() {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  function removePhoto() {
    setAvatarUri(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleSave() {
    updateProfile({
      name: name.trim() || "Learner",
      username: username.trim() || "@learner",
      email: email.trim(),
      avatarUri: avatarUri ?? null,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.cancel, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveBtnText, { color: "#FFFFFF" }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar picker ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.initials, { color: colors.primary }]}>
                  {initials || "?"}
                </Text>
              </View>
            )}
            <View style={[styles.cameraBtn, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.avatarActions}>
            <TouchableOpacity
              style={[styles.photoBtn, { backgroundColor: colors.primary }]}
              onPress={pickPhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={16} color="#FFFFFF" />
              <Text style={styles.photoBtnText}>
                {avatarUri ? "Change Photo" : "Add Photo"}
              </Text>
            </TouchableOpacity>
            {avatarUri && (
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={removePhoto}
                activeOpacity={0.8}
              >
                <Text style={[styles.removeBtnText, { color: colors.destructive }]}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Field label="DISPLAY NAME" value={name} onChangeText={setName} placeholder="Your name" colors={colors} />
        <Field
          label="USERNAME"
          value={username}
          onChangeText={setUsername}
          placeholder="@username"
          autoCapitalize="none"
          colors={colors}
        />
        <Field
          label="EMAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          colors={colors}
        />

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            All data is stored locally on your device. Nothing is sent to external servers.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cancel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  form: { padding: 16, gap: 20 },

  avatarSection: { alignItems: "center", gap: 16, paddingVertical: 8 },
  avatarWrap: { position: "relative" },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 32, fontFamily: "Inter_700Bold" },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  photoBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  removeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
  },
  removeBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  field: { gap: 8 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
