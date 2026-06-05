const { allowMethods, checkAdmin, listWaitlist, json, text } = require("../_waitlistStore");

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    checkAdmin(req);
    const { items } = await listWaitlist();
    const header = ["position", "email", "language", "source", "created_at", "confirmation_sent", "launch_email_sent"];
    const rows = items.map((item) => header.map((key) => csvCell(item[key])).join(","));
    res.setHeader("Content-Disposition", 'attachment; filename="hear-me-waitlist.csv"');
    return text(res, 200, [header.join(","), ...rows].join("\n"), "text/csv; charset=utf-8");
  } catch (error) {
    return json(res, error.statusCode || 500, { detail: error.message || "Could not export waitlist." });
  }
};
