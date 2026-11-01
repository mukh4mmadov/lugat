// Premium lives in app_metadata.premium_until; only the service role sets it.

const DAY = 24 * 60 * 60 * 1000;

export const premiumUntil = (user) => user.app_metadata?.premium_until || null;
export const isPremium = (user) => Boolean(premiumUntil(user)) && new Date(premiumUntil(user)).getTime() > Date.now();

// Adds days to premium, counting from the current expiry while it is still
// active. Zero days removes premium. Returns the new expiry (or null).
export async function extendPremium(db, userId, days) {
  const { data, error } = await db.auth.admin.getUserById(userId);
  if (error || !data?.user) throw Object.assign(new Error("User not found"), { status: 404 });
  const base = isPremium(data.user) ? new Date(premiumUntil(data.user)).getTime() : Date.now();
  const until = days === 0 ? null : new Date(base + days * DAY).toISOString();
  const { error: updateError } = await db.auth.admin.updateUserById(userId, {
    app_metadata: { ...data.user.app_metadata, premium_until: until },
  });
  if (updateError) throw Object.assign(new Error("Update failed"), { status: 500 });
  return until;
}
