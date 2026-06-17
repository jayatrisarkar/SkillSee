import { useSignUp, useOAuth } from "@clerk/clerk-expo";
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

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"main" | "email" | "verify">("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignUp = useCallback(async () => {
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

  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !email || !password) return;
    setLoading(true);
    setError("");
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signUp]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded || !code) return;
    setLoading(true);
    setError("");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? "Wrong code. Try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, code, signUp, setActive, router]);

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

          {/* ── Step: main (Google + email toggle) ── */}
          {step === "main" && (
            <>
              <View style={styles.headlineWrap}>
                <Text style={styles.headline}>Get started free</Text>
                <Text style={[styles.headlineSub, { color: colors.mutedForeground }]}>
                  Build your personal learning vault
                </Text>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Google — primary hero button */}
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleSignUp}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
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

              {/* "Use email instead" toggle */}
              <TouchableOpacity
                style={styles.emailToggle}
                onPress={() => setStep("email")}
                activeOpacity={0.7}
              >
                <View style={[styles.dividerLine, { backgroundColor: "#1E2D42" }]} />
                <Text style={styles.emailToggleText}>Use email instead</Text>
                <View style={[styles.dividerLine, { backgroundColor: "#1E2D42" }]} />
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                  Already have an account?{"  "}
                </Text>
                <Link href="/sign-in" asChild>
                  <TouchableOpacity>
                    <Text style={styles.footerLink}>Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </>
          )}

          {/* ── Step: email form ── */}
          {step === "email" && (
            <>
              <View style={styles.headlineWrap}>
                <Text style={styles.headline}>Create account</Text>
                <Text style={[styles.headlineSub, { color: colors.mutedForeground }]}>
                  Start building your learning vault
                </Text>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

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
                  placeholder="Password (min 8 chars)"
                  placeholderTextColor="#3A4A62"
                  secureTextEntry={!showPassword}
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
                style={[styles.primaryBtn, { opacity: loading || !email || !password ? 0.45 : 1 }]}
                onPress={handleSignUp}
                disabled={loading || !email || !password}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#818CF8", "#6366F1", "#4338CA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradient}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Create Account</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep("main")} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={15} color="#818CF8" />
                <Text style={styles.footerLink}>Back</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step: verify email ── */}
          {step === "verify" && (
            <>
              <View style={styles.headlineWrap}>
                <View style={styles.verifyIconWrap}>
                  <View style={styles.verifyIconGlow}>
                    <Ionicons name="mail" size={28} color="#818CF8" />
                  </View>
                </View>
                <Text style={styles.headline}>Check your email</Text>
                <Text style={[styles.headlineSub, { color: colors.mutedForeground }]}>
                  We sent a 6-digit code to{"\n"}{email}
                </Text>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TextInput
                style={[styles.input, styles.codeInput, { backgroundColor: "#0C1220", borderColor: "#1A2540", color: "#E8EDF5" }]}
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor="#3A4A62"
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, { opacity: loading || code.length < 6 ? 0.45 : 1 }]}
                onPress={handleVerify}
                disabled={loading || code.length < 6}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#818CF8", "#6366F1", "#4338CA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGradient}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Verify Email</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep("email")} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={15} color="#818CF8" />
                <Text style={styles.footerLink}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 28 },

  logoWrap: { alignItems: "center", marginBottom: 44 },
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
  headlineSub: { fontSize: 14, lineHeight: 20 },

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
    marginBottom: 32,
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
  primaryBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8, marginBottom: 24 },
  primaryGradient: { paddingVertical: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2, fontFamily: "Inter_700Bold" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, color: "#818CF8", fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  verifyIconWrap: { alignItems: "center", marginBottom: 16 },
  verifyIconGlow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  codeInput: { textAlign: "center", fontSize: 28, letterSpacing: 10, marginBottom: 12 },
  backBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 },
});
