import { registerTopikExams } from "../data/topik/exams";
import { contentChanged, showDrafts } from "./contentVersion";
import { supabase } from "./supabase";

const CACHE_KEY = "k-talim:custom-topik";

function apply(rows) {
  const drafts = showDrafts();
  registerTopikExams(rows.filter((row) => drafts || !row.hidden).map((row) => ({ ...row.data, id: row.item_id })));
  contentChanged();
}

export async function refreshCustomTopik() {
  const { data, error } = await supabase.from("content_overrides").select("item_id, data, hidden").eq("kind", "topik");
  if (error || !data) return;
  apply(data);
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
  }
}

try {
  apply(JSON.parse(window.localStorage.getItem(CACHE_KEY) || "[]"));
} catch {
}
refreshCustomTopik();
