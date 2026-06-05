# HEAR ME — Voice First Dating · Project Status

> **Tagline:** *Listen first. Judge later.*
> **Domains:** `hearmedating.com` · `hearmedating.app`
> **iOS bundle / Android package:** `com.hearmedating.app`
> **App display name:** *HEAR ME: Voice First Dating*
> **Languages:** English · French · Spanish (full i18n)
> **App version:** `1.0.0`
> **Document generated:** 2026-06-04

---

## 1 · Current architecture

### High-level

```
┌─────────────────────────────┐     HTTPS /api/*      ┌──────────────────────────────┐
│   Expo Router (RN web+ios+  │ ───────────────────▶  │  FastAPI (Uvicorn) :8001     │
│   android, SDK 54)          │     WS  /api/ws/*     │  Stripe SDK · WebSockets     │
│   React 18 · TypeScript     │ ◀───────────────────  │  Motor / PyMongo · Pydantic  │
└─────────────────────────────┘                       └─────────────┬────────────────┘
        │ AsyncStorage / SecureStore                                │
        │ expo-audio (rec & playback)                                ▼
        │ expo-image / expo-image-picker                ┌──────────────────────────────┐
        │ expo-linking · expo-web-browser               │   MongoDB (motor async)      │
        │ Ionicons                                      │   13 collections (see §2)    │
        ▼                                               └──────────────────────────────┘
   Kubernetes ingress
   `/`        → :3000 (Metro/Expo web)
   `/api/*`   → :8001 (FastAPI)
   `/api/ws/*` → :8001 (WebSocket upgrade)
```

### Frontend layout

```
/app/frontend
├── app/                          ← Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx          ← legal footer (Terms+Privacy) ✅
│   │   └── google.tsx            ← Emergent Google Auth bridge
│   ├── (tabs)/
│   │   ├── _layout.tsx           ← bottom tab nav (Discover/Matches/Premium/Profile)
│   │   ├── discover.tsx          ← swipe deck + safety overflow ✅
│   │   ├── matches.tsx           ← chat list (filters blocked) ✅
│   │   ├── premium.tsx           ← plan card, reveals, Restore + disclosure ✅
│   │   └── profile.tsx           ← editable profile, sign-out
│   ├── chat/[id].tsx             ← realtime chat + safety overflow ✅
│   ├── _layout.tsx               ← root provider stack
│   ├── +html.tsx                 ← web SEO shell
│   ├── index.tsx                 ← entry: routes to landing/auth/tabs
│   ├── landing.tsx               ← web marketing landing page
│   ├── onboarding.tsx            ← 5-step profile + voice intro recorder
│   ├── privacy.tsx               ← Privacy Policy (in-app + web)
│   └── terms.tsx                 ← Terms of Service (in-app + web)
└── src/
    ├── components/
    │   ├── Button.tsx · PlayButton.tsx · Waveform.tsx
    │   ├── FiltersSheet.tsx · PaywallSheet.tsx
    │   ├── ReportBlockSheet.tsx   ← NEW: unified safety sheet ✅
    │   └── SeoHead.tsx
    └── lib/
        ├── api.ts                ← typed fetch wrapper, ws helpers
        ├── auth.tsx              ← React Context auth provider
        ├── i18n.tsx              ← EN/FR/ES dictionaries + interpolation
        ├── theme.ts              ← design tokens (colors, radius, gradient)
        ├── voice.ts              ← expo-audio rec/play helpers
        └── filters.ts            ← discover filter state
```

### Backend layout (single-file FastAPI, will be split later)

```
/app/backend
├── server.py            ← all routes, models, WS hub, Stripe glue (~2 000 lines)
├── requirements.txt
├── .env                 ← LIVE Stripe keys, Mongo URL (protected)
└── tests/
    └── test_safety_endpoints.py  ← httpx-based, 15/15 passing
```

### REST endpoints (all prefixed `/api`)

| Group | Routes |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `GET /auth/me` · `POST /auth/google` |
| Profile | `GET /users/me` · `PATCH /users/me` · `GET /users/{user_id}` · `GET /meta/options` · `GET /voice-prompts` |
| Safety | `POST /users/report` · `POST /users/block` · `POST /users/unblock` · `GET /users/blocks` |
| Discover | `GET /discover` · `POST /swipe` · `GET /compatibility/{target_user_id}` |
| Matches | `GET /matches` · `GET /matches/{id}/messages` · `POST /matches/{id}/messages` · `POST /matches/{id}/reveal` |
| Premium | `GET /premium/likes-you` · `POST /premium/subscribe` · `POST /premium/cancel` |
| Reveals | `GET /reveals/me` · `POST /reveals/unlock` |
| Billing | `GET /billing/config` · `POST /billing/checkout` · `GET /billing/status/{session_id}` · `POST /billing/portal` · `POST /billing/cancel-subscription` · `POST /billing/restore` · `POST /billing/webhook` |
| Misc | `POST /waitlist` · `GET /waitlist/count` · `GET /founding/stats` · `GET /referral/me` |
| WebSocket | `WS /api/ws/chat/{match_id}?token=...` |

> **Critical ordering rule** in `server.py`: `GET /users/blocks` is declared **above** `GET /users/{user_id}` — FastAPI matches in declaration order, the catch-all would otherwise shadow it. Do not move.

### Tech stack

| Layer | Tech |
|---|---|
| Mobile / web | Expo SDK 54 · React Native · React Native Web · expo-router 3 · expo-audio · expo-image-picker · expo-linear-gradient · expo-web-browser · expo-secure-store · @expo/vector-icons |
| Backend | FastAPI · Uvicorn · Motor (async MongoDB) · PyMongo · Pydantic v2 · python-jose (JWT) · passlib (bcrypt) · stripe · httpx |
| DB | MongoDB (single instance, supervised) |
| Realtime | Native FastAPI WebSocket (`/api/ws/chat/{match_id}`) with in-process `ChatHub` for presence/typing/messages broadcast |
| Payments | Stripe (LIVE keys configured). Reveal SKUs auto-created on startup via `lookup_keys`. |
| Auth (current) | Email/password (bcrypt + JWT) **+** Emergent-managed Google Auth (web bridge) |
| Auth (planned) | Sign in with Apple |
| i18n | Custom React Context dictionary (`src/lib/i18n.tsx`), 3 locales, `t(key, vars)` interpolation |

### Environment & deployment

| Aspect | Status |
|---|---|
| Frontend dev server | `expo start` on port 3000, supervised. Tunnel via ngrok. |
| Backend dev server | `uvicorn server:app --host 0.0.0.0 --port 8001`, supervised. |
| Mongo | Local instance, URL in `backend/.env` (do not modify). |
| Public URL pattern | `https://<subdomain>.preview.emergentagent.com` (ingress; `/api/*` → 8001, everything else → 3000). |
| Build / Distribution | **Not yet generated** — to be produced via Emergent **Publish** flow. |
| Domains | Owned: `hearmedating.com` (web), `hearmedating.app` (universal links). DNS not yet wired to a hosted build. |

---

## 2 · Database schema (MongoDB)

All timestamps are stored as native `datetime` (UTC) unless noted.

### `users`
| Field | Type | Notes |
|---|---|---|
| `user_id` | string (uuid) | primary key, app-side |
| `email` | string | unique index |
| `hashed_password` | string | bcrypt |
| `name` | string | first name only |
| `age` | int | 18+ enforced |
| `gender` | string | one of meta-options |
| `looking_for` | string[] | preferences |
| `city`, `country` | string | geocoded via cache |
| `lat`, `lng` | float | optional |
| `bio` | string | ≤300 chars |
| `voice_intro_b64` | string | base64 audio, ≥15 s |
| `voice_intro_duration` | float | seconds |
| `voice_prompts` | object[] | `{question, answer_b64, duration}` |
| `photos` | string[] | base64 data URIs |
| `onboarding_complete` | bool | gate to `/discover` |
| `premium` | bool | derived/cached |
| `premium_until` | datetime | active subscription expiry |
| `premium_source` | string? | `stripe` · `founding` · `referral` |
| `founding_member` | bool | first 100 sign-ups |
| `founding_premium_until` | datetime | 1-year free Premium expiry |
| `reveal_credits` | int | unspent reveal credits |
| `referral_code` | string | self-share code |
| `referrals_count` | int | redeemed referrals |
| `last_active_at` | datetime | drives 6-mo inactivity revoke |
| Indexes | `email unique` |

### `swipes`
| Field | Notes |
|---|---|
| `actor_id`, `target_id` | composite unique index |
| `action` | `"like"` · `"pass"` · `"superlike"` · `"blind"` |
| `voice_reply_b64`, `voice_reply_duration` | attached to likes |
| `created_at` | |

### `matches`
| Field | Notes |
|---|---|
| `match_id` | unique index |
| `user_ids` | [a, b] (sorted) |
| `blind_match` | bool |
| `revealed` | bool |
| `last_message_at` | sort key in inbox |

### `messages`
| Field | Notes |
|---|---|
| `id`, `match_id` | indexed `(match_id, created_at)` |
| `sender_id` | |
| `type` | `text` · `voice` · `photo` |
| `content` | text (may be redacted) |
| `voice_b64`, `duration` | |
| `read_by` | string[] |
| `redacted` | bool — contact-redaction flag |

### `blocks`  *(NEW)*
| Field | Notes |
|---|---|
| `actor_id`, `target_id` | unique composite index |
| `created_at` | |

### `reports`  *(NEW)*
| Field | Notes |
|---|---|
| `actor_id`, `target_id` | indexed `(target_id, created_at desc)` |
| `reason` | `fake` · `harassment` · `inappropriate` · `scam` · `underage` · `other` |
| `detail` | optional free-text |
| `created_at` | |

### `photo_unlocks`
| Field | Notes |
|---|---|
| `actor_id`, `target_id` | profile-wide unlock — one row per pair |
| `source` | `credit` · `premium` · `match_reveal` |
| `created_at` | |

### `payment_sessions`
Stripe checkout audit log (`session_id`, `kind`, `user_id`, `status`, `metadata`).

### `processed_stripe_events`
Idempotency log for webhook event IDs (prevents double-credit on retries).

### `user_sessions`
JWT refresh / session metadata (device, last_seen).

### `waitlist`
Pre-launch email captures from landing page.

### `geocode_cache` · `compatibility_cache`
TTL caches for city → lat/lng and pairwise compatibility scores.

---

## 3 · Completed features

### Auth & onboarding
- ✅ Email/password registration with bcrypt + JWT
- ✅ Emergent-managed Google Auth (web bridge, `app/(auth)/google.tsx`)
- ✅ Age gate (18+ checkbox enforced both client and server)
- ✅ 5-step onboarding (name/age/city → gender/preferences → photos → voice intro ≥15 s → voice prompts)
- ✅ Referral code generation & redemption (referrer gets +30 days Premium)
- ✅ Legal disclosure on registration (Terms + Privacy links)

### Discover / matching
- ✅ Voice-first card stack — listen before judging
- ✅ Blurred photos for non-premium users (`PaywallSheet` paywall)
- ✅ Blind Match mode (photos completely hidden until reveal)
- ✅ Filters (distance, age range, looking-for) with active count badge
- ✅ Like / Pass / Super Like
- ✅ Voice Reply on Like (attach a recorded reply with a like)
- ✅ Compatibility score per profile (cached)

### Photo Reveals (monetization)
- ✅ 4 SKUs auto-created on Stripe startup (`reveal_single`, `pack5`, `pack10`, `pack25`)
- ✅ One-time profile-wide unlocks (`photo_unlocks` ledger)
- ✅ Premium users get unlimited reveals
- ✅ `PaywallSheet` UI showing credit balance + buy options
- ✅ Stripe webhook crediting `reveal_credits` and inserting unlock rows

### Premium subscription
- ✅ €9.99 / week via Stripe Checkout (LIVE keys)
- ✅ Founding-Member program (first 100 sign-ups): **1 year free Premium** + permanent badge + revoke after 6 mo inactivity
- ✅ Manage / cancel subscription in-app via Stripe billing portal
- ✅ **Restore Purchases** button (Apple Guideline 3.1.1 compliant)
- ✅ **Subscription terms disclosure** card on Premium screen (Plan / Length / Price / Auto-renew rules / Cancellation) — Apple Guideline 3.1.2 + Google Play Subscriptions Policy compliant
- ✅ "Likes you" gallery for premium users

### Chat
- ✅ WebSocket realtime (`/api/ws/chat/{match_id}`) with presence + typing
- ✅ Text · Voice notes · Photo messages
- ✅ Read receipts (per-message `read_by`)
- ✅ Match reveal flow (consensual photo reveal inside Blind Match)
- ✅ **Contact-detail redaction** (soft gate) — server-side regex strips emails, phone numbers and social handles in text messages until either party has revealed photos

### Safety, settings & account hygiene (this & last sessions)
- ✅ **Report user** flow — 6 reasons + optional detail + optional "also block" — `POST /api/users/report`
- ✅ **Block user** flow — bidirectional enforcement:
  - Hidden from each other's Discover deck
  - Hidden from each other's Matches inbox
  - Send-message returns 403
  - WebSocket connection refused (code 4403)
- ✅ Reusable `ReportBlockSheet` wired from Discover & Chat
- ✅ Indexes: `blocks(actor_id+target_id unique)`, `reports(target_id+created_at desc)`, `password_resets(token_hash unique)` + TTL on `expires_at`
- ✅ Critical route-ordering bug fixed (`GET /users/blocks` was shadowed)
- ✅ **In-app account deletion** — `DELETE /api/users/me` with full cascade
- ✅ **Blocked users management screen** — Profile → Blocked users
- ✅ **Forgot/Reset password** — `POST /api/auth/forgot-password` (email-enum safe, 30-min token) + `POST /api/auth/reset-password` (single-use, kills all sessions)
- ✅ Pluggable **email service** at `backend/email_service.py` (mock today, Resend / SendGrid stubs in place — one-line swap via `EMAIL_PROVIDER` env)
- ✅ **Settings screen** — language picker (EN/FR/ES) · contact support (`hello@hearmedating.com`) · Privacy · Terms · Data deletion · app version · tagline
- ✅ **Public `/data-deletion` page** — no auth required, EN/FR/ES, step-by-step instructions + what gets deleted + what we keep + subscription warning + mailto support
- ✅ Support email `hello@hearmedating.com` surfaced in: landing footer · settings · data-deletion · forgot/reset error states (`src/lib/constants.ts` is single source of truth)
- ✅ **38/38 backend tests passing** (15 safety + 10 delete-account + 13 password-reset)

### Internationalization
- ✅ Full i18n in EN / FR / ES across all screens: Landing, Auth, Onboarding, Discover, Matches, Chat, Premium, Profile, Privacy, Terms, ReportBlockSheet, PaywallSheet
- ✅ `t(key, { vars })` interpolation
- ✅ Language picker accessible from Profile

### Legal & compliance
- ✅ Privacy Policy page (`/privacy`) — in-app and web
- ✅ Terms of Service page (`/terms`) — in-app and web
- ✅ Accessible from: Landing footer · Register screen · Premium screen
- ✅ iOS `infoPlist` permission strings (microphone, photos)
- ✅ Android permissions declared (`RECORD_AUDIO`, `READ_MEDIA_IMAGES`)

---

## 4 · Pending features

### 🔴 Blockers for stores (see §6, §7)
- ⏳ **Sign in with Apple** (required because Google Auth is offered)
- ⏳ **Apple In-App Purchase / StoreKit** for iOS Premium + Reveals
- ⏳ **Google Play Billing** for Android digital content
- ⏳ **In-app account deletion** (Apple 5.1.1(v) + Google Play 2023+ policy)
- ⏳ **App Privacy "nutrition label"** filled in App Store Connect (no code)
- ⏳ **Data safety form** filled in Play Console (no code)

### 🟡 High-value polish
- ⏳ Settings screen (change language, change password, manage notifications)
- ⏳ Blocked-users management screen (list + unblock) — backend ready (`GET /api/users/blocks`)
- ⏳ Email verification flow (currently no email verification)
- ⏳ Password reset / forgot-password flow
- ⏳ Backend admin endpoints for the safety team (report queue, action review)
- ⏳ Server-side voice content moderation (e.g. OpenAI Whisper + classifier)

### 🟢 Backlog / future
- ⏳ Firebase Push Notifications (requires user-provided `google-services.json` + native build)
- ⏳ Native mobile build (iOS .ipa / Android .aab) via Emergent Publish
- ⏳ Refactor: split `server.py` into `routes/`, `models/`, `services/`
- ⏳ Stripe subscription auto-cancel test (live key, manual)
- ⏳ Founding-Member badge surfacing on Match cards & chat header
- ⏳ Hosted production deployment (custom domains `hearmedating.com` / `.app`)
- ⏳ App icon + splash polish for store listings
- ⏳ DSAR (Data Subject Access Request) export endpoint for GDPR
- ⏳ Off-app data-deletion landing page (URL submitted to Google Play)

---

## 5 · Stripe status

| Item | Status |
|---|---|
| API mode | **LIVE keys** (`pk_live_…`, `sk_live_…`) |
| Stripe account | `acct_1T4JQaB78NsRXSte` · email `espagnolcours89@gmail.com` · country `ES` · **dashboard display name "AstralLuxe"** (Kamelia Lemseffer Senhaji Mouhri) — i.e. HEAR ME products live inside the existing **AstralLuxe** Stripe account |
| Webhook secret | configured (`STRIPE_WEBHOOK_SECRET` in backend `.env`) |
| Webhook endpoints registered | **0** — none configured in Stripe Dashboard yet ⚠️ Needs to be added pointing at the production webhook URL after the custom domain goes live (see §8). Local dev uses Stripe CLI forwarding. |
| Products auto-creation | At every backend startup: products + prices ensured by `lookup_key` (idempotent). All 7 are present and active. |
| Current products & prices (verified live just now) | |

### HEAR ME · Stripe products (LIVE, in the AstralLuxe account)

| Product name | Product ID | Lookup key | Price ID | Amount | Type |
|---|---|---|---|---|---|
| **Hear Me Premium** | `prod_UdbS7gHvV73o1u` | `hearme_premium_weekly_eur_9_99` | `price_1TeKFDB78NsRXSteejyqifdb` | €9.99 / week | recurring |
| **Boost** | `prod_UdbSHly8Jrscfs` | `hearme_boost_eur_2_99` | `price_1TeKFDB78NsRXSte2elds7q8` | €2.99 | one-time |
| **Super Like** | `prod_UdbSd2WNrkO4IV` | `hearme_superlike_eur_0_99` | `price_1TeKFEB78NsRXSteAaBMjDkq` | €0.99 | one-time |
| **Photo Reveal** | `prod_UdeRgayYklie8w` | `hearme_reveal_single_eur_0_99` | `price_1TeN8SB78NsRXStepOLaeITT` | €0.99 | one-time |
| **5 Photo Reveals** | `prod_UdeRMi129pIWoj` | `hearme_reveal_pack5_eur_3_99` | `price_1TeN8TB78NsRXSte8hEzdLlB` | €3.99 | one-time |
| **10 Photo Reveals** | `prod_UdeRDOWyduMzOt` | `hearme_reveal_pack10_eur_6_99` | `price_1TeN8TB78NsRXSteBgqehS82` | €6.99 | one-time |
| **25 Photo Reveals** | `prod_UdeRhHNNzZohIB` | `hearme_reveal_pack25_eur_12_99` | `price_1TeN8UB78NsRXSte1pCoOg1u` | €12.99 | one-time |

> All EUR · all active · all in the **same Stripe account** as AstralLuxe. If you later want HEAR ME on a separate Stripe account, we can either (a) rotate keys + re-run startup to re-create the products in the new account or (b) move them via Stripe's product-clone API.

### Other Stripe flows
| Flow | Status |
|---|---|
| Checkout (subscription + one-time) | `POST /api/billing/checkout` — verified working |
| Webhook idempotency | `processed_stripe_events` collection — implemented |
| Restore | `POST /api/billing/restore` — 200 OK confirmed |
| Cancel | `POST /api/billing/cancel-subscription` — sets `cancel_at_period_end=true` |
| Portal | `POST /api/billing/portal` — Stripe-hosted billing portal session |
| iOS distribution caveat | **Stripe cannot remain the sole payment method on iOS** for digital content — see §6. Stripe stays for web & Android (and EU iOS via DMA, pending legal review). |

---

## 6 · Apple App Store status

**Readiness: 82 %**

### ✅ Done
- App identity: name *HEAR ME: Voice First Dating*, bundle `com.hearmedating.app`, v1.0.0
- iOS `infoPlist` permission strings present (mic, photo library)
- Associated domains declared for `hearmedating.com`
- Restore Purchases button (Guideline 3.1.1)
- Subscription terms disclosure (Guideline 3.1.2)
- Privacy Policy + Terms of Service accessible in-app
- Report / Block user flows (Guideline 1.2 — UGC apps must provide both)
- Age gate 18+

### ⏳ Required before App Review
1. **Sign in with Apple** — Apple Guideline 4.8 mandates parity if any other 3rd-party social login is offered. We offer Google Auth, so this is non-negotiable.
   - **Needed from user:** Apple Developer Team ID + a Services ID + an Apple Sign-In private key (`.p8`) + key ID.
2. **In-App Purchase via StoreKit** — Apple Guideline 3.1.1 forbids Stripe for digital subscriptions and consumables on iOS. We must:
   - Create matching products in App Store Connect (auto-renew subscription "Premium Weekly" + 4 consumables for the reveal packs).
   - Integrate `expo-iap` (recommended) or RevenueCat.
   - Backend: verify Apple receipts on a new `POST /api/billing/apple/verify` endpoint and credit the same `reveal_credits` / `premium_until` fields.
3. **In-app account deletion** (Guideline 5.1.1(v)) — backend has the data model; needs a "Delete account" button in Profile with double-confirm + 30-day soft-delete window.
4. **App Privacy "nutrition label"** — fill in App Store Connect (data types collected: contact info, audio, photos, location, payment info, etc.). Pure config, no code.
5. **App Tracking Transparency** — only required if we add 3rd-party ad SDKs; **not applicable today**.

### ⚠️ Likely review feedback to pre-empt
- App preview video featuring a voice intro (App Store Connect asset).
- Demo account credentials in App Review notes (`tester@hearme.com` / `password123`).
- Clear copy about content moderation in App Description and Support URL.

---

## 7 · Google Play status

**Readiness: 85 %**

### ✅ Done
- Package `com.hearmedating.app`, v1.0.0
- Android permissions declared (`RECORD_AUDIO`, `READ_MEDIA_IMAGES`)
- Privacy Policy + Terms hosted in-app and at `/privacy`, `/terms`
- UGC: report + block flows (Play Policy: Inappropriate Content)
- Age gate 18+

### ⏳ Required before Play Store submission
1. **In-app account deletion** — Play Policy 2023+. Same fix as Apple #3 above.
2. **Off-app data deletion URL** — public web page where users can request deletion without logging in. Mandatory link in Play Console.
3. **Data Safety form** — declare what data we collect (audio, photos, location, contacts none, payment info via Stripe/Play Billing), whether shared with 3rd parties.
4. **Content rating questionnaire** — IARC. Dating apps land Mature 17+.
5. **Target API level** — confirm `compileSdkVersion = 34` (Android 14). Expo SDK 54 already targets this; verify the prebuilt build matches.
6. **Google Play Billing** for Premium + reveal packs on Android (Play Payments Policy). Stripe stays for web.
   - In the EU, alternative billing via DMA is now allowed but adds compliance work. Recommend Play Billing for v1 simplicity.
7. **App content questionnaire**: ads (none), in-app purchases (yes), real-money gambling (no), target audience (18+), COVID-19 (no).

### ⚠️ Likely review feedback to pre-empt
- Demo account in Play Console testing instructions.
- 2 minimum store screenshots per device class (phone, 7" tablet, 10" tablet).
- Feature graphic 1024 × 500.

---

## 8 · Deployment status

| Area | State |
|---|---|
| Local preview (dev) | ✅ Running (Expo on :3000, FastAPI on :8001, Mongo local) |
| Public preview URL | ✅ Available via Emergent ingress (`https://audio-match-app.preview.emergentagent.com`) |
| Production web hosting | ❌ Not yet deployed |
| Custom domains | ✅ Owned: `hearmedating.com`, `hearmedating.app`. ❌ Not pointing to a hosted build yet |
| iOS build | ❌ Not generated. To be produced via **Emergent Publish** flow with Apple credentials. |
| Android build | ❌ Not generated. To be produced via **Emergent Publish** flow with Play credentials. |
| CDN / static assets | n/a — Expo bundles assets in the web build |
| Backups / DB | ⚠️ Local Mongo — no managed backup policy yet |
| Observability | ⚠️ Console logs only; no Sentry / Datadog yet |
| Secrets | LIVE Stripe keys in `backend/.env` (protected). Apple / Google credentials not yet provided. |

---

## 9 · Next recommended milestones

### Milestone M1 — Apple readiness sprint  *(~2-3 days of work)*
1. **Sign in with Apple** — call `integration_playbook_expert_v2`, wire `expo-apple-authentication`, add backend `POST /api/auth/apple`.
2. **In-app account deletion** — `DELETE /api/users/me` already exists; add Profile screen "Delete account" with 2-step confirmation + 30-day soft-delete grace period (mark `deleted_at`, scrub PII).
3. **Blocked users management screen** in Profile (list + unblock).
4. **Settings screen** — language picker, change password, contact support email.

### Milestone M2 — IAP integration  *(~3-5 days)*
1. Choose **RevenueCat** (recommended, abstracts iOS+Android) or **expo-iap** (lighter, more work backend-side).
2. Create matching products in App Store Connect + Play Console.
3. Implement client purchase flow + entitlement check.
4. Backend `POST /api/billing/apple/verify` and `/api/billing/google/verify` with idempotency.
5. Feature-flag Stripe to web-only on iOS/Android builds.

### Milestone M3 — Store submission  *(~1 day each)*
1. Fill App Privacy nutrition label + App Store Connect metadata (screenshots, preview video, app description in EN/FR/ES).
2. Fill Play Data Safety form + IARC questionnaire + screenshots.
3. Hit Publish (Emergent) → produce `.ipa` and `.aab`.
4. Submit for review.

### Milestone M4 — Production hosting  *(~half-day)*
1. Point `hearmedating.com` and `.app` DNS to the Emergent-hosted preview build (or to a separate prod deployment).
2. Verify universal links (`apple-app-site-association`) and Android Asset Links (`assetlinks.json`).
3. Switch backend logs to a managed observability stack (Sentry recommended).

### Milestone M5 — Growth & retention  *(post-launch)*
1. Push notifications (Firebase) — requires user-provided `google-services.json` + native build.
2. Email verification + transactional emails (Resend or SendGrid).
3. Voice content moderation pipeline.
4. Refer-a-friend campaign UI surfacing.

---

## Appendix · Test credentials (dev only)

See `/app/memory/test_credentials.md`. Primary account:
`tester@hearme.com` / `password123` — Founding Member · onboarded · 1 seeded match with demo profile *Aria*.

## Appendix · Critical do-not-touch rules

1. **Do not modify `metro.config.js`** or `EXPO_PACKAGER_PROXY_URL` / `EXPO_PACKAGER_HOSTNAME` / `MONGO_URL` in `.env`.
2. **Do not reorder** `GET /api/users/blocks` below `GET /api/users/{user_id}` — the catch-all will shadow it.
3. **Do not** downgrade Stripe keys from LIVE to TEST without explicit user request.
4. **Do not** suggest push notifications as a self-initiated feature; only build on explicit user request.
