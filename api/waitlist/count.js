const { allowMethods, countWaitlist, json } = require("../_waitlistStore");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    const count = await countWaitlist();
    return json(res, 200, { count });
  } catch (error) {
    return json(res, error.statusCode || 500, { detail: error.message || "Could not load the waitlist count." });
  }
};
