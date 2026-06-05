const { allowMethods, checkAdmin, json, listWaitlist, readJson, updateEntry } = require("../../_waitlistStore");
const { sendResendEmail } = require("../../_email");

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
          await sendResendEmail({
            to: recipient.email,
            subject,
            html,
            from: process.env.WAITLIST_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "HEAR ME <no-reply@hearmedating.com>",
          });
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
