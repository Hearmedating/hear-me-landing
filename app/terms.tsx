import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/src/lib/theme";

export default function Terms() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} testID="terms-back">
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.eyebrow}>HEAR ME · Effective: June 2026</Text>
        <Text style={styles.h1}>Who can use HEAR ME</Text>
        <Text style={styles.p}>
          You must be 18 or older. By creating an account you confirm you are an adult and the photos and voice intros you upload
          are your own. Impersonation, harassment, hate speech, nudity, scams, prostitution, and minors are strictly prohibited.
        </Text>
        <Text style={styles.h1}>Premium subscription (€9.99 / week)</Text>
        <Text style={styles.p}>
          Payment is charged at confirmation of purchase. The subscription auto-renews each week unless cancelled at least
          24 hours before the end of the current period. Manage or cancel anytime in the Premium screen or via your account settings.
          Cancellation takes effect at the end of the current billing period; no refunds for partial periods.
        </Text>
        <Text style={styles.h1}>One-time purchases (Photo Reveals)</Text>
        <Text style={styles.p}>
          Photo Reveal credits (€0.99 single · €3.99 / €6.99 / €12.99 packs) are non-refundable digital goods. Reveals don't expire
          and are tied to your account permanently.
        </Text>
        <Text style={styles.h1}>Founding Members</Text>
        <Text style={styles.p}>
          The first 100 sign-ups receive Premium free for one year, unlimited photo reveals during that period, and a permanent
          Founding Member badge. The Premium benefit is automatically revoked if the account is inactive for 6 consecutive months,
          and cannot be reinstated. The badge remains forever.
        </Text>
        <Text style={styles.h1}>User conduct & safety</Text>
        <Text style={styles.p}>
          We protect voices until faces are revealed. Sharing contact details in chat is redacted automatically until a photo
          is unlocked. You may Report or Block any user at any time. We reserve the right to suspend or remove accounts that
          violate these terms or community guidelines.
        </Text>
        <Text style={styles.h1}>Liability</Text>
        <Text style={styles.p}>
          HEAR ME is provided "as is". We are not responsible for content uploaded by other users or for the outcome of any
          connection made on the platform.
        </Text>
        <Text style={styles.h1}>Contact</Text>
        <Text style={styles.p}>
          legal@hearmedating.com  ·  HEAR ME  ·  hearmedating.com
        </Text>
        <Text style={styles.legalNote}>
          This is an MVP draft. Please consult a lawyer before public launch.
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
