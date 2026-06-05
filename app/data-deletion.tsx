import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useI18n } from "@/src/lib/i18n";
import { colors, radius } from "@/src/lib/theme";
import { SUPPORT_EMAIL, supportMailto } from "@/src/lib/constants";
import { SeoHead } from "@/src/components/SeoHead";

export default function DataDeletionScreen() {
  const { t } = useI18n();
  const router = useRouter();

  const openMail = () => Linking.openURL(supportMailto(t("dataDeletion.support.subject"), t("dataDeletion.support.body")));

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false, title: "Data deletion · HEAR ME" }} />
      {Platform.OS === "web" ? (
        <SeoHead
          title="Account & data deletion · HEAR ME"
          description="How to delete your HEAR ME account and what data is removed."
        />
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} testID="datadel-back">
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("dataDeletion.headerTitle")}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="trash" size={28} color={colors.text} />
          <Text style={styles.title}>{t("dataDeletion.title")}</Text>
          <Text style={styles.sub}>{t("dataDeletion.sub")}</Text>
        </View>

        <Text style={styles.h2}>{t("dataDeletion.howTo.h2")}</Text>
        {[1, 2, 3, 4, 5].map((n) => (
          <View key={n} style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>{n}</Text></View>
            <Text style={styles.stepText}>{t(`dataDeletion.howTo.step${n}`)}</Text>
          </View>
        ))}

        <Text style={styles.h2}>{t("dataDeletion.removed.h2")}</Text>
        <View style={styles.bulletCard}>
          {[
            "dataDeletion.removed.bullet1",
            "dataDeletion.removed.bullet2",
            "dataDeletion.removed.bullet3",
            "dataDeletion.removed.bullet4",
            "dataDeletion.removed.bullet5",
          ].map((k) => (
            <View key={k} style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>{t(k)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>{t("dataDeletion.kept.h2")}</Text>
        <View style={styles.bulletCard}>
          {["dataDeletion.kept.bullet1", "dataDeletion.kept.bullet2"].map((k) => (
            <View key={k} style={styles.bulletRow}>
              <Ionicons name="information-circle" size={16} color={colors.textMuted} />
              <Text style={styles.bulletText}>{t(k)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.warnCard}>
          <Ionicons name="warning" size={20} color={"#F59E0B"} />
          <Text style={styles.warnText}>{t("dataDeletion.subscription.warn")}</Text>
        </View>

        <Text style={styles.h2}>{t("dataDeletion.contact.h2")}</Text>
        <Text style={styles.body2}>{t("dataDeletion.contact.body")}</Text>
        <Pressable onPress={openMail} style={styles.mailBtn} testID="datadel-mailto">
          <Ionicons name="mail" size={18} color={colors.text} />
          <Text style={styles.mailBtnText}>{SUPPORT_EMAIL}</Text>
        </Pressable>

        <Text style={styles.footer}>{t("dataDeletion.footer")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  body: { paddingHorizontal: 20, paddingBottom: 60 },

  heroCard: { borderRadius: 20, padding: 20, gap: 10, alignItems: "flex-start", backgroundColor: colors.primary },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 18 },

  h2: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 28, marginBottom: 10 },
  body2: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },

  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginVertical: 6 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  stepNumText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  stepText: { color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 },

  bulletCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8,
  },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  bulletText: { color: colors.text, fontSize: 13, lineHeight: 18, flex: 1 },

  warnCard: {
    marginTop: 20, flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.45)",
    borderWidth: 1, borderRadius: radius.md, padding: 14,
  },
  warnText: { color: colors.text, fontSize: 13, lineHeight: 18, flex: 1 },

  mailBtn: {
    marginTop: 14, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 999,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary,
  },
  mailBtnText: { color: colors.primary, fontSize: 14, fontWeight: "700" },

  footer: { color: colors.textMuted, fontSize: 11, textAlign: "center", marginTop: 32, lineHeight: 16 },
});
