// Hear Me — REST client. Reads token from secure storage and adds Bearer header.

import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL ?? "";

export const TOKEN_KEY = "hearme.token";

export async function getToken(): Promise<string | null> {
  return (await storage.secureGet(TOKEN_KEY, "")) || null;
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await storage.secureSet(TOKEN_KEY, token);
  else await storage.secureRemove(TOKEN_KEY);
}

type Json = Record<string, unknown> | unknown[] | null;

async function request<T>(method: string, path: string, body?: Json): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.detail) detail = String(j.detail);
    } catch {}
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(p: string) => request<T>("GET", p),
  post: <T>(p: string, b?: Json) => request<T>("POST", p, b ?? {}),
  patch: <T>(p: string, b?: Json) => request<T>("PATCH", p, b ?? {}),
  del: <T>(p: string) => request<T>("DELETE", p),
};

export const BACKEND_URL = BASE;

export type DiscoverFilters = {
  min_age?: number;
  max_age?: number;
  max_distance_km?: number;
  intention?: string;
};

export type UserPublic = {
  user_id: string;
  name: string;
  age?: number | null;
  bio?: string | null;
  location?: string | null;
  photos: string[];
  voice_intro_b64?: string | null;
  voice_intro_duration?: number | null;
  interests: string[];
  intention?: string | null;
  gender?: string | null;
  looking_for?: string | null;
  verified: boolean;
  blind_match: boolean;
  premium: boolean;
  premium_until?: string | null;
  boost_balance?: number;
  superlike_balance?: number;
  boost_active_until?: string | null;
  voice_prompt?: string | null;
  founding_member?: boolean;
  founding_premium_until?: string | null;
  premium_source?: string | null;
  reveal_credits?: number;
  referral_code?: string | null;
  referrals_count?: number;
  onboarding_complete: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

export type AuthResponse = { token: string; user: UserPublic };
export type MatchSummary = {
  match_id: string;
  other: UserPublic;
  blind_match: boolean;
  revealed: boolean;
  last_message?: string | null;
  last_message_at?: string | null;
  unread: number;
  voice_reply?: string | null;
  voice_reply_duration?: number | null;
};
export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  type: "text" | "voice" | "photo";
  content?: string | null;
  voice_b64?: string | null;
  duration?: number | null;
  created_at: string;
};
export type Compatibility = { score: number; insights: string[]; summary: string };
