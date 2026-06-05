import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Linking, Platform, Pressable,
  ScrollView, StyleSheet, Switch, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { BACKEND_URL } from "@/src/lib/api";
import { colors, radius } from "@/src/lib/theme";

type Row = {
  position: number; email: string; language: string; source: string;
  created_at: string; confirmation_sent: boolean; launch_email_sent: boolean;
};

export default function AdminWaitlist() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState((params.token || "").toString().trim());
  const [tokenInput, setTokenInput] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [bcastSubject, setBcastSubject] = useState("HEAR ME is live ");
  const [bcastBodyEn, setBcastBodyEn] = useState("");
  const [bcastDry, setBcastDry] = useState(true);
  const [bcastTest, setBcastTest] = useState("");
  const [bcastBusy, setBcastBusy] = useState(false);
  const [bcastResult, setBcastResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setRefreshing(true);
    try {
      const q = search ? `?q=${encodeURIComponent(search)}` : "";
      const r = await fetch(`${BACKEND_URL}/api/admin/waitlist${q}`, {
        headers: { "X-Admin-Token": token },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setRows(j.items || []);
      setTotal(j.total || 0);
    } catch (e: any) {
      setError(e?.message || "Could not load.");
    } finally {
      setRefreshing(false);
    }
  }, [token, search]);

  useEffect(() => { if (token) load(); }, [token, load]);

  const exportCsv = () => {
    if (!token) return;
    const url = `${BACKEND_URL}/api/admin/waitlist.csv?token=${encodeURIComponent(token)}`;
    if (Platform.OS === "web") (window as any).open(url, "_blank");
    else Linking.openURL(url);
  };

  const runBroadcast = async () => {
    if (!token || !bcastBodyEn.trim()) return;
    setBcastBusy(true); setBcastResult(null);
    try {
      const body: any = { subject: bcastSubject, body_en: bcastBodyEn, dry_run: bcastDry };
      if (bcastDry && bcastTest) body.test_to = bcastTest;
      const r = await fetch(`${BACKEND_URL}/api/admin/waitlist/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.detail || `HTTP ${r.status}`);
      setBcastResult(`✓ ${bcastDry ? "Dry-run" : "Sent"} · targets=${j.targets ?? 0} · sent=${j.sent ?? 0} · failed=${j.failed ?? 0}`);
      await load();
    } catch (e: any) {
      setBcastResult(`✗ ${e?.message || "Failed"}`);
    } finally { setBcastBusy(false); }
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.root}>
        <Stack.Screen options={{ headerShown: false, title: "HEAR ME · Admin" }} />
        <View style={styles.center}>
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          <Text style={styles.gateTitle}>Admin access</Text>
          <Text style={styles.gateSub}>Paste your admin token to continue.</Text>
          <TextInput
            value={tokenInput} onChangeText={setTokenInput}
            placeholder="X-Admin-Token" placeholderTextColor={colors.textMuted}
            secureTextEntry autoCapitalize="none" autoCorrect={false}
            style={styles.gateInput} testID="admin-token-input"
          />
          <Pressable onPress={() => setToken(tokenInput.trim())} style={styles.primaryBtn} testID="admin-token-submit">
            <Text style={styles.primaryBtnText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false, title: "Waitlist · Admin" }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          <Text style={styles.h1}>Waitlist</Text>
          <Text style={styles.h1count}>{total} signups</Text>
        </View>

        <View style={styles.row}>
          <TextInput
            value={search} onChangeText={setSearch}
            placeholder="Search email…" placeholderTextColor={colors.textMuted}
            autoCapitalize="none" style={[styles.input, { flex: 1 }]}
          />
          <Pressable onPress={load} style={styles.iconBtn} testID="admin-refresh">
            <Ionicons name="refresh" size={18} color={colors.text} />
          </Pressable>
          <Pressable onPress={exportCsv} style={styles.iconBtn} testID="admin-csv">
            <Ionicons name="download" size={18} color={colors.text} />
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {rows === null ? <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} /> : (
          <View style={styles.list}>
            {rows.length === 0 ? (
              <Text style={styles.empty}>No signups yet.</Text>
            ) : rows.map((r) => (
              <View key={r.email} style={styles.rowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowEmail}>#{r.position}  {r.email}</Text>
                  <Text style={styles.rowMeta}>
                    {r.language.toUpperCase()} · {r.source} · {new Date(r.created_at).toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Badge ok={r.confirmation_sent} label="conf" />
                  <Badge ok={r.launch_email_sent} label="launch" />
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.h2}>Broadcast</Text>
        <View style={styles.card}>
          <TextInput
            value={bcastSubject} onChangeText={setBcastSubject}
            placeholder="Subject" placeholderTextColor={colors.textMuted} style={styles.input}
          />
          <TextInput
            value={bcastBodyEn} onChangeText={setBcastBodyEn}
            placeholder="Body (English — used as fallback for FR/ES)"
            placeholderTextColor={colors.textMuted} multiline
            style={[styles.input, { minHeight: 110, textAlignVertical: "top" }]}
          />
          <View style={[styles.row, { marginTop: 6 }]}>
            <Switch value={bcastDry} onValueChange={setBcastDry} />
            <Text style={{ color: colors.text, marginLeft: 8 }}>Dry-run</Text>
          </View>
          {bcastDry ? (
            <TextInput
              value={bcastTest} onChangeText={setBcastTest}
              placeholder="Send dry-run to this email (optional)"
              placeholderTextColor={colors.textMuted} autoCapitalize="none"
              keyboardType="email-address" style={styles.input}
            />
          ) : (
            <Text style={styles.warn}>
              ⚠ Real send. This will email every waitlist subscriber whose launch_email_sent is still false.
            </Text>
          )}
          <Pressable
            onPress={runBroadcast} disabled={bcastBusy || !bcastBodyEn.trim()}
            style={[styles.primaryBtn, (bcastBusy || !bcastBodyEn.trim()) && { opacity: 0.5 }]}
            testID="admin-broadcast"
          >
            <Text style={styles.primaryBtnText}>{bcastBusy ? "Sending…" : (bcastDry ? "Run dry-run" : "Send broadcast")}</Text>
          </Pressable>
          {bcastResult ? <Text style={styles.bcastResult}>{bcastResult}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: ok ? "rgba(91,217,165,0.18)" : "rgba(255,255,255,0.06)" }]}>
      <Text style={{ color: ok ? colors.success : colors.textMuted, fontSize: 11, fontWeight: "700" }}>
        {ok ? "✓" : "·"} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  gateTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 8 },
  gateSub: { color: colors.textSecondary, fontSize: 13, textAlign: "center", maxWidth: 280 },
  gateInput: {
    width: "100%", maxWidth: 360, backgroundColor: colors.surface, color: colors.text,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 14,
  },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  h1: { color: colors.text, fontSize: 24, fontWeight: "800" },
  h1count: { color: colors.textSecondary, fontSize: 14 },
  h2: { color: colors.text, fontSize: 16, fontWeight: "700", paddingHorizontal: 20, marginTop: 28, marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, alignItems: "center", paddingHorizontal: 20, marginTop: 8 },
  input: {
    backgroundColor: colors.surface, color: colors.text, fontSize: 14,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 10, marginTop: 8,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 999, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  list: { paddingHorizontal: 20, marginTop: 12, gap: 8 },
  rowItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  rowEmail: { color: colors.text, fontSize: 14, fontWeight: "600" },
  rowMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 24 },
  error: { color: colors.danger, paddingHorizontal: 20, marginTop: 12, fontSize: 13 },
  card: {
    marginHorizontal: 20, padding: 16, backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 4,
  },
  primaryBtn: {
    marginTop: 16, paddingVertical: 12, borderRadius: 999,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  primaryBtnText: { color: colors.text, fontWeight: "700", letterSpacing: 0.3 },
  warn: { color: "#F59E0B", fontSize: 12, marginTop: 8 },
  bcastResult: { color: colors.text, fontSize: 12, marginTop: 10 },
});
