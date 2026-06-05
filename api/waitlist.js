const {
  addWaitlistEmail,
  allowMethods,
  json,
  normalizeEmail,
  readJson,
  validateEmail,
} = require("./_waitlistStore");
const { notifyAdminWaitlistSignup } = require("./_email");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const email = normalizeEmail(body.email);
    if (!validateEmail(email)) {
      return json(res, 400, { detail: "Please enter a valid email address." });
    }

    const result = await addWaitlistEmail({
      email,
      source: body.source,
      language: body.language,
    });

    if (!result.already) {
      await notifyAdminWaitlistSignup(result);
    }

    return json(res, 200, { position: result.position, already: result.already });
  } catch (error) {
    return json(res, error.statusCode || 500, { detail: error.message || "Could not join the waitlist." });
  }
};
