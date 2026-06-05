const { allowMethods, checkAdmin, json, listWaitlist, readJson, updateEntry } = require("../../_waitlistStore");

async function sendResendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const err = new Error("RESEND_API_KEY is required for real broadcasts.");
    err.statusCode = 503;
    throw err;
  }

  const from = process.env.WAITLIST_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "HEAR ME <no-reply@hearmedating.com>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    let detail = `Resend HTTP ${response.status}`;
    try {
      const payload = await response.json();
      detail = payload?.message || payload?.error || detail;
    } catch {}
    throw new Error(detail);
  }
}

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    checkAdmin(req);
    const body = await readJson(req);
    const subject = String(body.subject || "HEAR ME is live").trim();
    const html = String(body.body_en || "").trim().replace(/\n/g, "<br />");
    const dryRun = body.dry_run !== false;

    if (!html) return json(res, 400, { detail: "body_en is required." });

    const { items } = await listWaitlist();
    const unsent = items.filter((item) => !item.launch_email_sent);
    const recipients = dryRun && body.test_to ? [{ email: String(body.test_to).trim() }] : unsent;

    let sent = 0;
    let failed = 0;
    const failures = [];

    if (!dryRun || body.test_to) {
      for (const recipient of recipients) {
        try {
          await sendResendEmail({ to: recipient.email, subject, html });
          sent += 1;
          if (!dryRun) await updateEntry(recipient.email, { launch_email_sent: true, launch_email_sent_at: new Date().toISOString() });
        } catch (error) {
          failed += 1;
          failures.push({ email: recipient.email, detail: error.message });
        }
      }
    }

    return json(res, 200, {
      targets: dryRun && body.test_to ? 1 : unsent.length,
      sent,
      failed,
      failures: failures.slice(0, 10),
      dry_run: dryRun,
    });
  } catch (error) {
    return json(res, error.statusCode || 500, { detail: error.message || "Broadcast failed." });
  }
};
