import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text,
  TextInput, View, useWindowDimensions, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Waveform } from "@/src/components/Waveform";
import { SeoHead } from "@/src/components/SeoHead";
import { api } from "@/src/lib/api";
import { useI18n } from "@/src/lib/i18n";
import { colors, gradient, radius } from "@/src/lib/theme";

const LOGO = require("@/assets/images/hearme-logo.jpg");

// Sample audio is intentionally disabled for now — the audio section keeps
// its design (player chrome + animated waveform) but plays nothing. We will
// plug a real recording back in here when the user is happy with the voice.
const SAMPLE_AUDIO_DISABLED = true;

export default function Landing() {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = !isDesktop;
  const isNarrowMobile = width <= 360;
  const sampleWaveformBars = isDesktop ? 22 : width <= 340 ? 9 : width <= 390 ? 11 : 13;

  const [foundingRemaining, setFoundingRemaining] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [playing, setPlaying] = useState(false);

  // Load founding stats live.
  useEffect(() => {
    api.get<{ remaining: number; total: number; cap: number }>("/founding/stats")
      .then((r) => setFoundingRemaining(typeof r.remaining === "number" ? r.remaining : null))
      .catch(() => {});
  }, []);

  const submitEmail = async () => {
    if (!email.trim() || !email.includes("@")) {
      setErr(t("landing.email.invalid"));
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const r = await api.post<{ position: number; already: boolean }>("/waitlist", {
        email: email.trim().toLowerCase(),
        source: "landing",
        language: lang,
      });
      setPosition(r.position);
    } catch (e: any) {
      setErr(e?.message || t("landing.email.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToWaitlist = useCallback(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.getElementById("waitlist")?.scrollIntoView?.({ behavior: "smooth" });
    }
  }, []);

  const playSample = useCallback(async () => {
    // Audio playback is intentionally disabled (sample voice removed).
    // Keep the visual feedback so the player chrome still feels alive —
    // toggle the "playing" state briefly so the waveform animates.
    if (SAMPLE_AUDIO_DISABLED) {
      setPlaying((p) => !p);
      setTimeout(() => setPlaying(false), 1800);
      return;
    }
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 80 }}
      testID="landing-page"
    >
      <SeoHead
        title="HEAR ME — Voice First Dating · Listen first. Judge later."
        description="The first dating app where people connect through voice before photos. Meet real people through short voice intros and authentic conversations. Founding 100 spots open."
        url="https://hearmedating.com/"
        image="https://hearmedating.com/assets/assets/images/og-share.jpg"
        siteName="HEAR ME"
        locale={lang === "fr" ? "fr_FR" : lang === "es" ? "es_ES" : "en_US"}
      />
      {/* ============ NAV ============ */}
      <View style={[styles.nav, isDesktop && styles.navDesktop, isNarrowMobile && styles.navNarrow]}>
        <View style={styles.brandRow}>
          <Image source={LOGO} style={styles.logoSm} />
          <Text style={styles.brandWord}>HEAR ME</Text>
        </View>
        <View style={styles.langRow}>
          {(["en", "fr", "es"] as const).map((l) => (
            <Pressable
              key={l}
              onPress={() => setLang(l)}
              testID={`landing-lang-${l}`}
              style={[styles.langPill, lang === l && styles.langPillActive]}
            >
              <Text style={[styles.langText, lang === l && styles.langTextActive]}>{l.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ============ HERO ============ */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <View style={{ flex: 1, alignItems: isDesktop ? "flex-start" : "center" }}>
          <Image source={LOGO} style={styles.logoLg} />
          <Text style={[styles.eyebrow, isMobile && styles.eyebrowMobile]}>HEAR ME · VOICE FIRST DATING · 18+</Text>
          <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile, isNarrowMobile && styles.heroTitleNarrow, !isDesktop && { textAlign: "center" }]}>
            {t("landing.hero.title")}
          </Text>
          <Text style={[styles.heroSub, isMobile && styles.heroSubMobile, !isDesktop && { textAlign: "center" }]}>
            {t("landing.hero.sub")}
          </Text>

          {/* Sample voice */}
          <Pressable
            onPress={playSample}
            style={[styles.samplePill, isMobile && styles.samplePillMobile]}
            testID="landing-play-sample"
          >
            <View style={styles.sampleIcon}>
              <Ionicons name={playing ? "pause" : "play"} size={16} color={colors.text} />
            </View>
            <View style={[styles.sampleBody, isMobile && styles.sampleBodyMobile]}>
              <Text style={[styles.sampleText, isMobile && styles.sampleTextMobile]}>
                {playing ? t("landing.sample.playing") : t("landing.sample.cta")}
              </Text>
              <View style={[styles.sampleWaveform, isMobile && styles.sampleWaveformMobile]}>
                <Waveform
                  active={playing}
                  bars={sampleWaveformBars}
                  height={isMobile ? 34 : 70}
                  barWidth={isMobile ? 3 : 4}
                  gap={isMobile ? 3 : 4}
                  maxBarHeight={isMobile ? 26 : 56}
                />
              </View>
            </View>
          </Pressable>

          {/* CTAs */}
          <View style={[styles.ctaRow, !isDesktop && { flexDirection: "column", alignSelf: "stretch" }]}>
            <Pressable
              onPress={scrollToWaitlist}
              style={[styles.ctaPrimary, !isDesktop && { width: "100%" }]}
              testID="landing-cta-founding"
            >
              <LinearGradient
                colors={[gradient.primary[0], gradient.primary[1]]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="star" size={16} color={colors.text} />
              <Text style={styles.ctaPrimaryText}>{t("landing.cta.founding")}</Text>
            </Pressable>
            <Pressable
              onPress={scrollToWaitlist}
              style={[styles.ctaSecondary, !isDesktop && { width: "100%", marginTop: 12 }]}
              testID="landing-cta-notify"
            >
              <Text style={styles.ctaSecondaryText}>{t("landing.cta.notify")}</Text>
            </Pressable>
          </View>

          {/* Founding live counter */}
          {foundingRemaining !== null ? (
            <View style={[styles.foundingTicker, isMobile && styles.foundingTickerMobile]} testID="landing-founding-ticker">
              <View style={styles.foundingDot} />
              <Text style={[styles.foundingText, isMobile && styles.foundingTextMobile]}>
                {t("landing.founding.ticker", { remaining: foundingRemaining })}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Right column: phone mockup */}
        {isDesktop ? (
          <View style={styles.phoneMock}>
            <LinearGradient
              colors={["rgba(224,60,104,0.18)", "rgba(140,82,255,0.15)"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Image source={LOGO} style={{ width: 110, height: 110, marginBottom: 20 }} />
            <Waveform active bars={36} />
            <Text style={[styles.heroSub, { marginTop: 20, fontSize: 14, textAlign: "center" }]}>
              {t("brand.slogan")}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ============ HOW IT WORKS ============ */}
      <View style={[styles.section, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionEyebrow}>{t("landing.how.eyebrow")}</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>{t("landing.how.title")}</Text>
        <View style={[styles.steps, isDesktop && { flexDirection: "row" }]}>
          {[
            { icon: "🎙️", titleKey: "landing.step1.title", subKey: "landing.step1.sub" },
            { icon: "❤️", titleKey: "landing.step2.title", subKey: "landing.step2.sub" },
            { icon: "👀", titleKey: "landing.step3.title", subKey: "landing.step3.sub" },
          ].map((s, i) => (
            <View key={i} style={[styles.stepCard, isDesktop && { flex: 1 }]}>
              <Text style={styles.stepIcon}>{s.icon}</Text>
              <Text style={styles.stepTitle}>{t(s.titleKey)}</Text>
              <Text style={styles.stepSub}>{t(s.subKey)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ============ DIFFERENT ============ */}
      <View style={[styles.section, styles.sectionDark, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionEyebrow}>{t("landing.diff.eyebrow")}</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile, { textAlign: "center" }]}>
          {t("landing.diff.title")}
        </Text>
        <Text style={[styles.diffOther, isMobile && styles.diffOtherMobile]}>{t("landing.diff.other")}</Text>
        <Text style={[styles.diffUs, isMobile && styles.diffUsMobile]}>{t("landing.diff.us")}</Text>
        <View style={[styles.diffWaveform, isMobile && styles.diffWaveformMobile]}>
          <Waveform active bars={isMobile ? 18 : 26} height={isMobile ? 52 : 70} maxBarHeight={isMobile ? 38 : 56} />
        </View>
      </View>

      {/* ============ FOUNDING 100 ============ */}
      <View style={[styles.section, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionEyebrow}>{t("landing.founding.eyebrow")}</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>{t("landing.founding.headline")}</Text>
        <View style={[styles.foundingCard, isDesktop && { maxWidth: 720, alignSelf: "center" }]}>
          <LinearGradient
            colors={["rgba(212,175,55,0.10)", "rgba(212,175,55,0.04)"]}
            style={StyleSheet.absoluteFill}
          />
          {[
            { icon: "infinite", k: "landing.founding.benefit1" },
            { icon: "ribbon", k: "landing.founding.benefit2" },
            { icon: "eye", k: "landing.founding.benefit3" },
          ].map((b) => (
            <View key={b.k} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon as any} size={16} color={colors.gold} />
              </View>
              <Text style={styles.benefitText}>{t(b.k)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ============ COMING SOON ============ */}
      <View style={[styles.section, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionEyebrow}>{t("landing.stores.eyebrow")}</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>{t("landing.stores.title")}</Text>
        <View style={[styles.storesRow, isDesktop && { justifyContent: "center" }, isMobile && styles.storesRowMobile]}>
          <View style={[styles.storeBadge, isMobile && styles.storeBadgeMobile]}>
            <Ionicons name="logo-apple" size={28} color={colors.text} />
            <View>
              <Text style={styles.storeSmall}>{t("landing.stores.appleSmall")}</Text>
              <Text style={styles.storeLarge}>App Store</Text>
            </View>
          </View>
          <View style={[styles.storeBadge, isMobile && styles.storeBadgeMobile]}>
            <Ionicons name="logo-google-playstore" size={28} color={colors.text} />
            <View>
              <Text style={styles.storeSmall}>{t("landing.stores.googleSmall")}</Text>
              <Text style={styles.storeLarge}>Google Play</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ============ WAITLIST ============ */}
      <View nativeID="waitlist" style={[styles.section, styles.sectionDark, isMobile && styles.sectionMobile, { paddingBottom: 56 }]}>
        <Text style={styles.sectionEyebrow}>{t("landing.email.eyebrow")}</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile, { textAlign: "center" }]}>{t("landing.email.title")}</Text>
        <Text style={[styles.heroSub, isMobile && styles.heroSubMobile, { textAlign: "center", maxWidth: 520, alignSelf: "center", marginBottom: 24 }]}>
          {t("landing.email.sub")}
        </Text>

        {position !== null ? (
          <View style={[styles.successCard, isDesktop && { maxWidth: 520, alignSelf: "center" }]} testID="waitlist-success">
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.successTitle}>{t("landing.email.successTitle")}</Text>
            <Text style={styles.successSub}>
              {t("landing.email.successSub", { position })}
            </Text>
          </View>
        ) : (
          <View style={[styles.formRow, isDesktop && { maxWidth: 520, alignSelf: "center" }, isMobile && styles.formRowMobile]}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder={t("landing.email.placeholder")}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, isMobile && styles.inputMobile]}
              testID="waitlist-email-input"
            />
            <Pressable
              onPress={submitEmail}
              disabled={submitting}
              style={[styles.submit, isMobile && styles.submitMobile, submitting && { opacity: 0.6 }]}
              testID="waitlist-submit"
            >
              <LinearGradient
                colors={[gradient.primary[0], gradient.primary[1]]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {submitting ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.submitText}>{t("landing.email.cta")}</Text>
              )}
            </Pressable>
          </View>
        )}
        {err ? <Text style={styles.errText}>{err}</Text> : null}
      </View>

      {/* ============ FOOTER ============ */}
      <View style={styles.footer}>
        <View style={styles.brandRow}>
          <Image source={LOGO} style={styles.logoSm} />
          <Text style={styles.footerBrand}>HEAR ME · Voice First Dating</Text>
        </View>
        <Text style={styles.footerSlogan}>{t("brand.slogan")}</Text>
        <Text style={styles.footerLegal}>hearmedating.com  ·  hearmedating.app  ·  © 2026 HEAR ME</Text>
        <View style={{ flexDirection: "row", gap: 16, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Pressable onPress={() => router.push("/privacy")} testID="footer-privacy">
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Privacy</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/terms")} testID="footer-terms">
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Terms</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/data-deletion")} testID="footer-data-deletion">
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Data deletion</Text>
          </Pressable>
          <Text style={{ color: colors.textMuted, fontSize: 12 }} selectable>hello@hearmedating.com</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
  },
  navDesktop: { paddingHorizontal: 56, paddingTop: 28 },
  navNarrow: { paddingHorizontal: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoSm: { width: 36, height: 36, borderRadius: 18 },
  logoLg: { width: 96, height: 96, borderRadius: 48, marginBottom: 20 },
  brandWord: { color: colors.text, fontSize: 16, fontWeight: "700", letterSpacing: 2 },
  langRow: { flexDirection: "row", gap: 6 },
  langPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  langPillActive: { borderColor: colors.primary, backgroundColor: "rgba(224,60,104,0.15)" },
  langText: { color: colors.textSecondary, fontSize: 11, fontWeight: "700", letterSpacing: 1.4 },
  langTextActive: { color: colors.text },

  hero: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 56, alignItems: "center" },
  heroDesktop: { flexDirection: "row", paddingHorizontal: 56, paddingTop: 40, gap: 48, alignItems: "center", maxWidth: 1240, alignSelf: "center", width: "100%" },
  eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 16 },
  eyebrowMobile: { textAlign: "center", fontSize: 10, letterSpacing: 1.5, lineHeight: 16, maxWidth: "100%" },
  heroTitle: { color: colors.text, fontSize: 48, fontWeight: "800", lineHeight: 56, marginBottom: 16, letterSpacing: -1 },
  heroTitleMobile: { fontSize: 40, lineHeight: 46, maxWidth: "100%" },
  heroTitleNarrow: { fontSize: 36, lineHeight: 42 },
  heroSub: { color: colors.textSecondary, fontSize: 18, lineHeight: 26, marginBottom: 28, maxWidth: 520 },
  heroSubMobile: { fontSize: 16, lineHeight: 24, marginBottom: 24, maxWidth: "100%" },

  samplePill: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radius.lg, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 28, width: "100%", maxWidth: 420,
  },
  samplePillMobile: { alignItems: "center", maxWidth: 430 },
  sampleIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.primary,
  },
  sampleBody: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center" },
  sampleBodyMobile: { flexDirection: "column", alignItems: "flex-start", gap: 2 },
  sampleText: { color: colors.text, fontSize: 13, fontWeight: "600", flexShrink: 0, zIndex: 2 },
  sampleTextMobile: { fontSize: 14, lineHeight: 19, flexShrink: 1, maxWidth: "100%" },
  sampleWaveform: { flex: 1, marginLeft: 12, minWidth: 0 },
  sampleWaveformMobile: { width: "100%", maxWidth: 96, marginLeft: 0, flex: 0, opacity: 0.95 },

  ctaRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  ctaPrimary: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999, overflow: "hidden", minWidth: 220,
  },
  ctaPrimaryText: { color: colors.text, fontSize: 15, fontWeight: "700" },
  ctaSecondary: {
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999, borderWidth: 1,
    borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  ctaSecondaryText: { color: colors.text, fontSize: 15, fontWeight: "600" },

  foundingTicker: {
    flexDirection: "row", alignItems: "center", gap: 10, marginTop: 24,
    backgroundColor: "rgba(212,175,55,0.10)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.3)",
  },
  foundingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  foundingTickerMobile: { alignSelf: "stretch", borderRadius: radius.md, paddingHorizontal: 12 },
  foundingText: { color: colors.gold, fontSize: 13, fontWeight: "600" },
  foundingTextMobile: { flex: 1, lineHeight: 18 },

  phoneMock: {
    width: 360, height: 540, borderRadius: 36, overflow: "hidden",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border,
  },

  section: { paddingHorizontal: 24, paddingVertical: 56, maxWidth: 1100, alignSelf: "center", width: "100%" },
  sectionMobile: { paddingHorizontal: 20, paddingVertical: 48 },
  sectionDark: { backgroundColor: "rgba(255,255,255,0.02)", maxWidth: "100%" as any, paddingHorizontal: 24 },
  sectionEyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 2, textAlign: "center", marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 36, letterSpacing: -0.5 },
  sectionTitleMobile: { fontSize: 28, lineHeight: 34, marginBottom: 28 },

  steps: { gap: 16 },
  stepCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 24,
    borderWidth: 1, borderColor: colors.border, alignItems: "flex-start",
  },
  stepIcon: { fontSize: 32, marginBottom: 12 },
  stepTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 6 },
  stepSub: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },

  diffOther: { color: colors.textMuted, fontSize: 18, textAlign: "center", marginBottom: 8 },
  diffOtherMobile: { fontSize: 16, lineHeight: 22 },
  diffUs: { color: colors.text, fontSize: 24, fontWeight: "700", textAlign: "center" },
  diffUsMobile: { fontSize: 21, lineHeight: 28 },
  diffWaveform: { marginTop: 24, alignSelf: "center", width: 220 },
  diffWaveformMobile: { width: 140 },

  foundingCard: { borderRadius: radius.lg, padding: 24, borderWidth: 1, borderColor: "rgba(212,175,55,0.25)", overflow: "hidden" },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  benefitIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(212,175,55,0.15)" },
  benefitText: { color: colors.text, fontSize: 15, flex: 1, fontWeight: "500" },

  storesRow: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  storesRowMobile: { flexDirection: "column", alignItems: "stretch", gap: 12 },
  storeBadge: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, minWidth: 180,
  },
  storeBadgeMobile: { width: "100%", minWidth: 0, justifyContent: "center" },
  storeSmall: { color: colors.textMuted, fontSize: 10, fontWeight: "600" },
  storeLarge: { color: colors.text, fontSize: 16, fontWeight: "700" },

  formRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  formRowMobile: { flexDirection: "column", flexWrap: "nowrap", gap: 12 },
  input: {
    flex: 1, minWidth: 220, backgroundColor: colors.surface, color: colors.text, fontSize: 15,
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  inputMobile: { width: "100%", minWidth: 0, flexGrow: 0, flexShrink: 0 },
  submit: {
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  submitMobile: { width: "100%" },
  submitText: { color: colors.text, fontSize: 15, fontWeight: "700" },
  errText: { color: colors.danger, marginTop: 12, textAlign: "center" },

  successCard: {
    alignItems: "center", padding: 24, borderRadius: radius.lg,
    backgroundColor: "rgba(76,217,100,0.08)", borderWidth: 1, borderColor: "rgba(76,217,100,0.25)",
  },
  successTitle: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 12 },
  successSub: { color: colors.textSecondary, fontSize: 14, marginTop: 6, textAlign: "center" },

  footer: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, alignItems: "center", gap: 8 },
  footerBrand: { color: colors.text, fontSize: 14, fontWeight: "700", letterSpacing: 1.5 },
  footerSlogan: { color: colors.textSecondary, fontSize: 13, fontStyle: "italic" },
  footerLegal: { color: colors.textMuted, fontSize: 11, marginTop: 8, textAlign: "center" },
});
