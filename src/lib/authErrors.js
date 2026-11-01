// Turns Supabase auth errors into translated messages instead of showing the
// raw English text ("Invalid login credentials", "Failed to fetch", ...).
const RULES = [
  [(error) => error.status === 0 || /failed to fetch|network|load failed/i.test(error.message || ""), "auth.error.network"],
  [(error) => error.code === "invalid_credentials" || /invalid login credentials/i.test(error.message || ""), "auth.error.invalidCredentials"],
  [(error) => error.code === "user_already_exists" || error.code === "email_exists" || /already (registered|exists)/i.test(error.message || ""), "auth.error.alreadyRegistered"],
  [(error) => error.code === "weak_password" || /password should/i.test(error.message || ""), "auth.error.weakPassword"],
  [(error) => error.code === "same_password" || /different from the old/i.test(error.message || ""), "auth.error.samePassword"],
  [(error) => error.code === "email_not_confirmed" || /email not confirmed/i.test(error.message || ""), "auth.error.emailNotConfirmed"],
  [(error) => /rate limit|too many/i.test(`${error.code || ""} ${error.message || ""}`), "auth.error.rateLimit"],
  [(error) => error.code === "validation_failed" || /invalid.*email|email.*invalid/i.test(error.message || ""), "auth.error.invalidEmail"],
];

export function authErrorMessage(error, t, fallbackKey) {
  if (!error) return t(fallbackKey);
  const match = RULES.find(([test]) => test(error));
  return t(match ? match[1] : fallbackKey);
}
