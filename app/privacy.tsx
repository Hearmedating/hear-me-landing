import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/src/lib/theme";

export default function Privacy() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} testID="privacy-back">
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.eyebrow}>HEAR ME · Effective: June 2026</Text>
        <Text style={styles.h1}>What we collect</Text>
        <Text style={styles.p}>
          Your email, name, age, gender, looking-for preference, voice intro recording, optional photos, optional location, and basic
          activity timestamps. Payment data is processed by Stripe — we never see card numbers.
        </Text>
        <Text style={styles.h1}>How we use it</Text>
        <Text style={styles.p}>
          To run matching, voice playback, photo reveals, chat, anti-spam, and to honour your Founding Member benefits.
          We do not sell or rent your data. We do not run advertising networks inside HEAR ME.
        </Text>
        <Text style={styles.h1}>Your rights (GDPR)</Text>
        <Text style={styles.p}>
          You can access, export, correct, or delete your data at any time. Email privacy@hearmedating.com.
          Account deletion removes your profile, voice intros, photos, swipes, matches, and messages within 30 days.
        </Text>
        <Text style={styles.h1}>Cookies & analytics</Text>
        <Text style={styles.p}>
          Essential session cookies only. No tracking pixels, no ad networks. We may add privacy-friendly analytics
          (Plausible / PostHog) in future versions; you'll be notified.
        </Text>
        <Text style={styles.h1}>Contact</Text>
        <Text style={styles.p}>
          privacy@hearmedating.com  ·  HEAR ME  ·  hearmedating.com
        </Text>
        <Text style={styles.legalNote}>
          This is an MVP draft. Please consult a lawyer before public launch. Hear Me reserves the right to update this policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.border },
  headerTitle: { color: colors.text, fontSize: 17, fontWeight: "600" },
  body: { padding: 24, paddingBottom: 80 },
  eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1.6, marginBottom: 16 },
  h1: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  p: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  legalNote: { color: colors.textMuted, fontSize: 12, marginTop: 32, fontStyle: "italic" },
});
