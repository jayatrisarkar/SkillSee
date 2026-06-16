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
} from "react-native";
import { useColors } from "@/hooks/useColors";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const colors = useColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow();
      if (createdSessionId && setActiveOAuth) {
        await setActiveOAuth({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError("Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow, router]);

  return (
    <LinearGradient colors={["#0D1117", "#1a1f35"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={["#818CF8", "#6366F1", "#4F46E5"]}
              style={styles.logoGradient}
            >
              <Ionicons name="library" size={32} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>SkillSee</Text>
            <Text style={styles.tagline}>Save. Learn. Master.</Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Sign in to access your library
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Google */}
            <TouchableOpacity
              style={[styles.googleBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={[styles.googleBtnText, { color: colors.foreground }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Email */}
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                style={[styles.eyeBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleEmailSignIn}
              disabled={loading || !email || !password}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading || !email || !password ? ["#4B5563", "#374151"] : ["#818CF8", "#6366F1", "#4F46E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.signInGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                Don't have an account?{" "}
              </Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: 60 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoGradient: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  appName: { fontSize: 28, fontWeight: "700", color: "#fff", letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: "#818CF8", marginTop: 4 },
  card: { borderRadius: 20, padding: 24, borderWidth: 1 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  errorBox: { backgroundColor: "#7F1D1D22", borderWidth: 1, borderColor: "#EF4444", borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: "#EF4444", fontSize: 13 },
  googleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16 },
  googleBtnText: { fontSize: 15, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, marginBottom: 14 },
  passwordRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  passwordInput: { flex: 1, marginBottom: 0 },
  eyeBtn: { borderWidth: 1, borderRadius: 12, width: 50, alignItems: "center", justifyContent: "center" },
  signInBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4, marginBottom: 20 },
  signInGradient: { padding: 16, alignItems: "center" },
  signInText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, color: "#818CF8", fontWeight: "600" },
});
