import { pushAdminNotifications } from "./push.js";

const DAY = 24 * 60 * 60 * 1000;

async function newUsers(db, since) {
  let count = 0;
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) break;
    count += data.users.filter((user) => Date.parse(user.created_at) >= since).length;
    if (data.users.length < 1000) break;
  }
  return count;
}

const money = (amount) => amount.toLocaleString("en-US").replaceAll(",", " ");

// The last 24 hours in one line, for the admins' phones.
export async function digestText(db) {
  const since = Date.now() - DAY;
  const sinceIso = new Date(since).toISOString();
  const [users, active, sales, tickets, reports, deletions, errors] = await Promise.all([
    newUsers(db, since),
    db.from("user_progress").select("user_id", { count: "exact", head: true }).gte("updated_at", sinceIso),
    db.from("premium_log").select("amount").gte("created_at", sinceIso).limit(1000),
    db.from("feedback_tickets").select("last_message_by").in("status", ["open", "in_progress"]).limit(1000),
    db.from("speaking_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("account_deletion_requests").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("app_errors").select("message").gte("created_at", sinceIso).limit(1000),
  ]);
  const income = (sales.data || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const waiting = (tickets.data || []).filter((ticket) => ticket.last_message_by !== "admin").length;
  // The main model being busy is not a problem when the backup answered.
  const problems = (errors.data || []).filter(({ message }) => !message.startsWith("AI tutor: ")).length;
  const todo = waiting + (reports.count || 0) + (deletions.count || 0);
  return `Yangi: ${users} · Faol: ${active.count || 0} · Daromad: ${money(income)} so'm · Ish: ${todo} · Xato: ${problems}`;
}

export async function sendDigest(db) {
  const text = await digestText(db);
  const { error } = await db.from("admin_notifications").insert({ kind: "digest", data: { text }, link: "/admin" });
  if (error) throw error;
  return { text, pushes: await pushAdminNotifications(db) };
}
