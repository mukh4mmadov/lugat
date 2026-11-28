import { supabase } from "./supabase";
import { setPrivatePaperLoader } from "../data/topik/exams";


const CACHE = "topik-premium-v1";
const cacheKey = (examId) => `/topik-premium/${encodeURIComponent(examId)}`;

export class PremiumRequiredError extends Error {
  constructor() {
    super("Premium needed");
    this.premiumRequired = true;
  }
}

async function fromCache(examId) {
  try {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(cacheKey(examId));
    return hit ? await hit.json() : null;
  } catch {
    return null;
  }
}

async function toCache(examId, paper) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(cacheKey(examId), new Response(JSON.stringify(paper), { headers: { "Content-Type": "application/json" } }));
  } catch {
  }
}

export async function clearPremiumPapers() {
  try {
    await caches.delete(CACHE);
  } catch {
  }
}

export async function loadPremiumPaper(exam) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new PremiumRequiredError();
  let response;
  try {
    response = await fetch(`/api/rewards?topik=${encodeURIComponent(exam.id)}`, { headers: { Authorization: `Bearer ${token}` } });
  } catch (networkError) {
    const cached = await fromCache(exam.id);
    if (cached) return cached;
    throw networkError;
  }
  if (response.status === 401 || response.status === 403) {
    await clearPremiumPapers();
    throw new PremiumRequiredError();
  }
  if (!response.ok) {
    const cached = await fromCache(exam.id);
    if (cached) return cached;
    throw new Error(`TOPIK paper failed to load (${response.status})`);
  }
  const paper = await response.json();
  await toCache(exam.id, paper);
  return paper;
}

setPrivatePaperLoader(loadPremiumPaper);
