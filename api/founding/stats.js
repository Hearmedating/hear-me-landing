const { allowMethods, countWaitlist, json } = require("../_waitlistStore");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    const total = await countWaitlist();
    const cap = Number(process.env.FOUNDING_MEMBER_CAP || 100);
    return json(res, 200, { total, cap, remaining: Math.max(cap - total, 0) });
  } catch (error) {
    return json(res, error.statusCode || 500, { detail: error.message || "Could not load founding stats." });
  }
};
