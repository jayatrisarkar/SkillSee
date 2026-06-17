import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow();
      if (createdSessionId && setActiveOAuth) {
        await setActiveOAuth({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch {
      setError("Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow, router]);

  const handleEmailSignIn = useCallback(async () => {
    if (!isLoaded || !email || !password) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Sign in failed. Check your details.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

  return (
    <LinearGradient colors={["#06080E", "#0C1424", "#07090F"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoGlow}>
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.appName}>SkillSee</Text>
            <Text style={styles.tagline}>Save. Learn. Master.</Text>
          </View>

          {/* Headline */}
          <View style={styles.headlineWrap}>
            <Text style={styles.headline}>Welcome back</Text>
            <Text style={[styles.headlineSub, { color: colors.mutedForeground }]}>
              Sign in to access your library
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Google — primary hero button ── */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading && !showEmail ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <>
                <View style={styles.googleLogoWrap}>
                  <Text style={styles.googleLogoG}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── "Use email instead" toggle ── */}
          <TouchableOpacity
            style={styles.emailToggle}
            onPress={() => setShowEmail((v) => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.dividerLine, { backgroundColor: "#1E2D42" }]} />
            <Text style={styles.emailToggleText}>
              {showEmail ? "Hide email" : "Use email instead"}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: "#1E2D42" }]} />
          </TouchableOpacity>

          {/* ── Email / password (hidden by default) ── */}
          {showEmail && (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: "#0C1220", borderColor: "#1A2540", color: "#E8EDF5" }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#3A4A62"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, { backgroundColor: "#0C1220", borderColor: "#1A2540", color: "#E8EDF5" }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#3A4A62"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={[styles.eyeBtn, { backgroundColor: "#0C1220", borderColor: "#1A2540" }]}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={17}
                    color="#3A4A62"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.emailBtn, { opacity: loading || !email || !password ? 0.45 : 1 }]}
                onPress={handleEmailSignIn}
                disabled={loading || !email || !password}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#818CF8", "#6366F1", "#4338CA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emailBtnGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.emailBtnText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>No account?  </Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 28 },

  logoWrap: { alignItems: "center", marginBottom: 48 },
  logoGlow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 28,
    marginBottom: 14,
  },
  logoImage: { width: 72, height: 72, borderRadius: 20 },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#E8EDF5",
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  tagline: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#6366F1", letterSpacing: 0.4 },

  headlineWrap: { marginBottom: 32 },
  headline: { fontSize: 30, fontWeight: "700", color: "#E8EDF5", letterSpacing: -0.7, marginBottom: 6 },
  headlineSub: { fontSize: 14 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#7F1D1D18",
    borderWidth: 1,
    borderColor: "#EF444440",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },

  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  googleLogoWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  googleLogoG: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4285F4",
    fontFamily: "Inter_700Bold",
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.1,
  },

  emailToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1 },
  emailToggleText: {
    fontSize: 13,
    color: "#4D6080",
    fontFamily: "Inter_400Regular",
    flexShrink: 0,
  },

  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    marginBottom: 12,
    fontFamily: "Inter_400Regular",
  },
  passwordRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  passwordInput: { flex: 1, marginBottom: 0 },
  eyeBtn: {
    borderWidth: 1,
    borderRadius: 14,
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  emailBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4, marginBottom: 24 },
  emailBtnGradient: { paddingVertical: 16, alignItems: "center" },
  emailBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2, fontFamily: "Inter_700Bold" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, color: "#818CF8", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
