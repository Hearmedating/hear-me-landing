const DEFAULT_FROM_EMAIL = "HEAR ME <hello@hearmedating.com>";

async function sendResendEmail({ to, subject, html, text, from = process.env.WAITLIST_FROM_EMAIL || DEFAULT_FROM_EMAIL }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const err = new Error("RESEND_API_KEY is not configured.");
    err.statusCode = 503;
    throw err;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
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

function waitlistSignupNotificationBody({ email, position, language, source, created_at }) {
  return [
    "New waitlist registration",
    "",
    `Email: ${email}`,
    `Position: ${position}`,
    `Language: ${language}`,
    `Source: ${source}`,
    `Date: ${created_at}`,
  ].join("\n");
}

async function notifyAdminWaitlistSignup(signup) {
  try {
    const text = waitlistSignupNotificationBody(signup);
    await sendResendEmail({
      to: "hello@hearmedating.com",
      subject: "New HEAR ME Waitlist Signup",
      text,
      html: text.replace(/\n/g, "<br />"),
    });
  } catch (error) {
    console.error("[waitlist] Admin signup notification failed", {
      email: signup?.email,
      position: signup?.position,
      error: error?.message || String(error),
    });
  }
}

module.exports = {
  DEFAULT_FROM_EMAIL,
  notifyAdminWaitlistSignup,
  sendResendEmail,
  waitlistSignupNotificationBody,
};
