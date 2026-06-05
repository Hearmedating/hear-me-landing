const { allowMethods, checkAdmin, json, listWaitlist } = require("../_waitlistStore");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    checkAdmin(req);
    const { searchParams } = new URL(req.url, "http://localhost");
    const data = await listWaitlist(searchParams.get("q") || "");
    return json(res, 200, data);
  } catch (error) {
    return json(res, error.statusCode || 500, { detail: error.message || "Could not load waitlist." });
  }
};
