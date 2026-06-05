# HEAR ME — Landing-page export

This folder is a self-contained snapshot of every file required to reproduce
the official HEAR ME landing page (with EN/FR/ES i18n, Privacy, Terms,
Data-deletion and the admin/waitlist screen) in any **Expo + Expo Router**
project.

Source project: `/app/frontend` (Expo SDK 54, expo-router 3, React Native Web).

---

## What's inside

```
.
├── app/
│   ├── +html.tsx              ← Web HTML shell (SEO meta, fonts, etc.)
│   ├── landing.tsx            ← Public marketing landing page
│   ├── privacy.tsx            ← Privacy Policy page
│   ├── terms.tsx              ← Terms of Service page
│   ├── data-deletion.tsx      ← Public data-deletion instructions (Play / Apple compliance)
│   └── admin/
│       └── waitlist.tsx       ← Token-protected admin dashboard
├── api/                      ← Vercel serverless waitlist API routes
│   ├── waitlist.js            ← POST /api/waitlist
│   ├── waitlist/count.js      ← GET /api/waitlist/count
│   ├── founding/stats.js      ← GET /api/founding/stats
│   └── admin/                 ← Admin list, CSV export, broadcast endpoints
├── src/
│   ├── components/
│   │   ├── SeoHead.tsx        ← <head> meta + og + twitter cards
│   │   ├── Waveform.tsx       ← Audio waveform animation used by the player chrome
│   │   └── Button.tsx         ← Shared button primitive
│   ├── lib/
│   │   ├── i18n.tsx           ← Full EN/FR/ES dictionary + provider
│   │   ├── theme.ts           ← Design tokens (colours, radius, gradient)
│   │   ├── constants.ts       ← Brand constants (sender email, tagline, app name)
│   │   └── api.ts             ← Fetch wrapper (only the waitlist endpoint is needed here)
│   └── utils/
│       └── storage/           ← AsyncStorage / web-localStorage shim used by i18n
├── assets/
│   └── images/
│       ├── hearme-logo.jpg
│       ├── og-share.jpg
│       ├── favicon.png
│       └── app-image.png
├── app.json                   ← Reference Expo config (web bundler, scheme, infoPlist)
├── package.json               ← Reference dependencies & versions
├── tsconfig.json              ← Path alias `@/*` → root
├── PROJECT_STATUS.md          ← Full status report (architecture, features, blockers)
├── DOMAIN_SETUP.md            ← DNS & custom-domain (Namecheap) playbook
└── README.md                  ← (this file)
```

---

## How to integrate into `hear-me-marketing`

### 1 · Copy files in
Drop the four directories (`app/`, `src/`, `assets/`) straight into the root
of your `hear-me-marketing` Expo project, keeping the same relative paths.

If your target project already has an `app/` and a `src/`, **only copy these
files** (so you don't clobber unrelated routes):

```
app/landing.tsx
app/privacy.tsx
app/terms.tsx
app/data-deletion.tsx
app/+html.tsx
app/admin/waitlist.tsx
src/components/SeoHead.tsx
src/components/Waveform.tsx
src/components/Button.tsx
src/lib/i18n.tsx
src/lib/theme.ts
src/lib/constants.ts
src/lib/api.ts
src/utils/storage/index.ts
src/utils/storage/index.web.ts
src/utils/storage/storage-base.ts
assets/images/hearme-logo.jpg
assets/images/og-share.jpg
assets/images/favicon.png
```

### 2 · Make sure these dependencies exist
Open the included `package.json` and copy the relevant lines into your target
project's `package.json`, then `yarn install` (or `npm install`):

```
"@expo/vector-icons": "*",
"expo": "~54.x",
"expo-router": "~3.x",
"expo-linear-gradient": "*",
"expo-web-browser": "*",
"react": "18.x",
"react-native": "0.74.x",
"react-native-safe-area-context": "*",
"react-native-screens": "*"
```

(Exact versions are already pinned in the bundled `package.json`.)

### 3 · TypeScript path alias
Make sure your target project's `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

The included `tsconfig.json` is already set up.

### 4 · Waitlist API for Vercel
The landing form posts to `POST /api/waitlist`, the count widget reads
`GET /api/waitlist/count`, the Founding 100 ticker reads
`GET /api/founding/stats`, and the admin dashboard uses these routes:

- `GET /api/admin/waitlist`
- `GET /api/admin/waitlist.csv`
- `POST /api/admin/waitlist/broadcast`

These routes are now included as Vercel Serverless Functions under `api/`. They
persist signups in Vercel KV / Upstash Redis via its REST API, so the deployed
site no longer needs the Emergent preview proxy to reach the original FastAPI
backend.

Configure these environment variables in Vercel before deploying:

| Variable | Required | Purpose |
|---|---:|---|
| `KV_REST_API_URL` | Yes | Vercel KV REST URL. `UPSTASH_REDIS_REST_URL` also works. |
| `KV_REST_API_TOKEN` | Yes | Vercel KV REST token. `UPSTASH_REDIS_REST_TOKEN` also works. |
| `ADMIN_TOKEN` | Yes for `/admin/waitlist` | Token checked against the `X-Admin-Token` header and CSV `token` query param. |
| `FOUNDING_MEMBER_CAP` | No | Founding-member cap; defaults to `100`. |
| `RESEND_API_KEY` | Only for real broadcasts | Enables admin broadcast email sends. Dry runs that do not send email work without it. |
| `WAITLIST_FROM_EMAIL` | No | Sender for Resend broadcasts; defaults to `HEAR ME <no-reply@hearmedating.com>`. |
| `EXPO_PUBLIC_BACKEND_URL` | No for Vercel Functions | Leave empty for same-origin `/api`. Set only if intentionally proxying to a separate backend. |

If the storage variables are missing, the API returns a clear JSON `503` error
instead of allowing the frontend to parse Vercel's `index.html` fallback as if it
were an API response.

### 5 · Web-bundle the landing
From the project root:

```bash
npx expo export -p web
```

This produces a `dist/` folder containing the static HTML/JS/CSS that you can
upload to Vercel, Cloudflare Pages, Netlify, or any static host.

---

## Brand constants you can change in one place

`src/lib/constants.ts` — tagline (`Listen first. Judge later.`), sender email,
support email, app name, website URL.

`src/lib/theme.ts` — colours, radius, gradient.

`src/lib/i18n.tsx` — full EN/FR/ES copy. All visible strings are keyed; no
hard-coded text inside the page files.

---

## Notes

- The landing's "Hear a sample voice" button is intentionally a visual placeholder
  (no MP3 ships in this export).
- The admin screen lives at `/admin/waitlist?token=<ADMIN_TOKEN>` and is gated
  by an `X-Admin-Token` header — the Vercel `ADMIN_TOKEN` environment variable
  must match.
- The `+html.tsx` file is the canonical place to add Google Analytics, Plausible,
  or other site-wide scripts.
- All routes are server-side-renderable by Expo Router on web — no client-only
  hacks required.

Generated automatically from the live `/app/frontend` source tree on 2026-06-04.
