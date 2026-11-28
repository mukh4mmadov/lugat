export async function notify(db, userIds, kind, { link = null, data = {} } = {}) {
  const ids = [...new Set(userIds)].filter(Boolean);
  for (let index = 0; index < ids.length; index += 500) {
    const rows = ids.slice(index, index + 500).map((userId) => ({ user_id: userId, kind, link, data }));
    const { error } = await db.from("user_messages").insert(rows);
    if (error) {
      console.error(`Notification (${kind}) failed:`, error.message);
      return 0;
    }
  }
  return ids.length;
}

export async function notifiedSince(db, userIds, kind, since) {
  const found = new Set();
  const ids = [...new Set(userIds)];
  for (let index = 0; index < ids.length; index += 200) {
    const { data } = await db.from("user_messages").select("user_id").eq("kind", kind).gte("created_at", since).in("user_id", ids.slice(index, index + 200));
    for (const row of data || []) found.add(row.user_id);
  }
  return found;
}
