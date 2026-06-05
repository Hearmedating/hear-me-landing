# HEAR ME — DNS & Custom Domain Setup

> Audience: anyone wiring `hearmedating.com` / `hearmedating.app` to a hosted build.
> Last updated: 2026-06-04
> Status: **DNS work pending** — app is live on the preview URL but not yet on the custom domain.

---

## 1 · Current state

| | |
|---|---|
| Owned domains | `hearmedating.com` · `hearmedating.app` (Namecheap) |
| Live preview URL | https://audio-match-app.preview.emergentagent.com (Emergent ingress, dev) |
| Production hosting | **Not yet provisioned** — happens when you click **Publish** in Emergent |
| Custom domain | **Not yet pointed** at the production build |
| SSL | Auto-issued by the hosting layer once the domain is verified (no work for you) |

---

## 2 · Target setup

| Hostname | Behaviour |
|---|---|
| `www.hearmedating.com` | **Primary URL** — serves the full app (landing, /privacy, /terms, /data-deletion, /(auth), /(tabs), …) |
| `hearmedating.com` (apex) | **301 permanent redirect** → `https://www.hearmedating.com` |
| `hearmedating.app` | Reserved for **Universal Links / Android App Links** when the iOS & Android builds ship. No web traffic yet. |

Why `www` as primary? Apex (`hearmedating.com`) cannot have a CNAME pointing at the hosting platform, only an A/ALIAS — `www` can use a CNAME and is easier to manage. We then redirect the apex → `www`.

---

## 3 · What you actually need to do

The exact records depend on **which hosting target you publish to**. We support two paths — pick one.

### Path A · Publish via Emergent (recommended)

Emergent will give you a target hostname like `something.emergentagent.com` after you press **Publish**. Wire DNS as follows in **Namecheap → Domain List → hearmedating.com → Manage → Advanced DNS**:

| Type | Host | Value | TTL |
|---|---|---|---|
| `CNAME` | `www` | `<your-emergent-host>.emergentagent.com.` | Automatic |
| `URL Redirect` | `@` | `https://www.hearmedating.com` (Permanent 301) | — |

> Namecheap does NOT allow a CNAME on the apex. Use their built-in **URL Redirect Record** with type **Permanent (301)**, source `@` → `https://www.hearmedating.com`. That is the standard, fully SSL-supported way on Namecheap.

After saving, also add (one-time) to **prove ownership / let SSL auto-issue**:

| Type | Host | Value |
|---|---|---|
| `CAA` (optional but recommended) | `@` | `0 issue "letsencrypt.org"` |

DNS propagation: 5 min – 48 h. Usually under 30 min.

### Path B · Publish via Vercel / Netlify / Cloudflare Pages

If you take the Expo web build and host it externally (we can do this with one `npx expo export -p web` and an upload), the records are:

| Hosting | Records |
|---|---|
| **Vercel** | `CNAME www → cname.vercel-dns.com.` + apex `A 76.76.21.21` (or use Vercel's "Redirect" feature for the apex) |
| **Cloudflare Pages** | `CNAME www → <project>.pages.dev.` + apex `CNAME @ → <project>.pages.dev.` (Cloudflare's flattening handles apex CNAMEs) |
| **Netlify** | `CNAME www → <site>.netlify.app.` + apex `A 75.2.60.5` (Netlify load-balancer) |

I will tell you the exact hostname once you choose a target.

For Vercel, the landing page is not static-only anymore: the repo includes
Serverless Functions under `api/` for `POST /api/waitlist`,
`GET /api/waitlist/count`, `GET /api/founding/stats`, and the admin waitlist
routes. Add these Vercel environment variables before deploying:

```env
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
ADMIN_TOKEN=...
FOUNDING_MEMBER_CAP=100
RESEND_API_KEY=...          # only needed for real waitlist broadcasts
WAITLIST_FROM_EMAIL=HEAR ME <no-reply@hearmedating.com>
```

Leave `EXPO_PUBLIC_BACKEND_URL` empty when using these same-origin Vercel
Functions. If it is set to an Emergent preview backend at build time, the web
bundle will keep posting there instead of to `/api` on Vercel.

---

## 4 · Verification checklist (after DNS propagation)

Run from any terminal — should all return 200 / 301 / valid TLS:

```bash
# Primary URL serves the app
curl -s -o /dev/null -w "%{http_code}\n" https://www.hearmedating.com

# Apex 301-redirects to www
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://hearmedating.com

# Three legally-required pages reachable
curl -s -o /dev/null -w "privacy %{http_code}\n" https://www.hearmedating.com/privacy
curl -s -o /dev/null -w "terms %{http_code}\n" https://www.hearmedating.com/terms
curl -s -o /dev/null -w "data-deletion %{http_code}\n" https://www.hearmedating.com/data-deletion

# Waitlist API responds
curl -s https://www.hearmedating.com/api/waitlist/count
```

Expected:

```
200
301 -> https://www.hearmedating.com/
privacy 200
terms 200
data-deletion 200
{"count": N}
```

---

## 5 · `hearmedating.app` (mobile builds)

Hold off on DNS for `.app` until iOS/Android builds are generated. When that happens we will add:

| Type | Host | Value | Purpose |
|---|---|---|---|
| `TXT` | `apple-app-site-association` *or* a `/.well-known/apple-app-site-association` file at the root | (provided when the iOS bundle is built) | Universal Links |
| `TXT` | `/.well-known/assetlinks.json` | (provided when the Android bundle is signed) | Android App Links |

This is what lets `https://hearmedating.app/u/<userId>` open the iOS / Android app directly.

---

## 6 · Open items I (the dev) need from you

1. Tell me which **hosting target** you want: **Emergent Publish** (one click) *or* one of Vercel / Netlify / Cloudflare (I'll prepare the export).
2. Once chosen, I'll give you the **exact CNAME target hostname** and you paste it into Namecheap. Five minutes of work.
3. After propagation, I'll run the verification checklist above and confirm everything's green.

---

## 7 · Resend (transactional email) DNS records

Once you've added the domain `hearmedating.com` in your **Resend dashboard → Domains**, Resend will show you **4 DNS records to copy into Namecheap**. The values are unique to your Resend account, but here is the *shape* so you know what to expect and can add them at the same time as the Emergent CNAME:

| # | Type | Host (in Namecheap) | Value (from Resend) | Purpose |
|---|---|---|---|---|
| 1 | `MX` | `send` | `feedback-smtp.<region>.amazonses.com` · Priority `10` | Receive bounces/complaints |
| 2 | `TXT` | `send` | `v=spf1 include:amazonses.com ~all` | SPF — proves Resend can send for you |
| 3 | `TXT` | `resend._domainkey` | `p=…` (very long string Resend gives you) | DKIM — cryptographic signature |
| 4 | `TXT` (recommended, not strictly required) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@hearmedating.com; pct=100; adkim=s; aspf=s` | DMARC — anti-spoofing policy + reporting |

> Resend will display the EXACT values for #1, #2 and #3 in the dashboard once you click **Verify DNS**. Just paste those values into Namecheap → Advanced DNS → Add New Record. Hit ✓ to save each row.
> Record #4 (DMARC) is optional but **highly recommended** — it dramatically improves inbox placement and bounces back any spoofing attempts.

After you save all 4 records:
- Wait 5-15 min for DNS propagation.
- Hit **Verify** in the Resend dashboard. All 4 indicators should turn green ✓.
- You're cleared to send from `no-reply@hearmedating.com`.

### Vercel / backend email environment (once domain is verified)

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxx
WAITLIST_FROM_EMAIL=HEAR ME <no-reply@hearmedating.com>
ADMIN_TOKEN=...
```

On Vercel, `RESEND_API_KEY` enables real sends from the admin broadcast route.
If you are running the original FastAPI backend separately, keep its
`EMAIL_PROVIDER=resend` / `ADMIN_NOTIFY_EMAIL` settings there too.

### Admin dashboard

- URL (after deploy): `https://www.hearmedating.com/admin/waitlist`
- Paste your `ADMIN_TOKEN` on first visit (stored only in memory — re-paste each session for security)
- Features: paginated list, email search, language/source filters, CSV download, broadcast composer (with dry-run safety)
- CSV direct download (works in any browser): `https://www.hearmedating.com/api/admin/waitlist.csv?token=<ADMIN_TOKEN>`
