const BUCKET = "topik-premium";
const LINK_SECONDS = 4 * 60 * 60;
const cache = new Map();

export async function privatePaper(db, examId) {
  if (!cache.has(examId)) {
    const load = db.storage
      .from(BUCKET)
      .download(`${examId}/paper.json`)
      .then(async ({ data, error }) => {
        if (error || !data) throw Object.assign(new Error(`TOPIK paper ${examId} is unavailable`), { status: 503 });
        return JSON.parse(await data.text());
      })
      .catch((error) => {
        cache.delete(examId);
        throw error;
      });
    cache.set(examId, load);
  }
  return cache.get(examId);
}

export async function privatePaperFiles(db, examId) {
  const { data, error } = await db.storage.from(BUCKET).createSignedUrls([`${examId}/paper.pdf`, `${examId}/listening.mp3`], LINK_SECONDS);
  if (error || !data) return { pdf: null, audio: null };
  const [pdf, audio] = data;
  return { pdf: pdf?.signedUrl || null, audio: audio?.signedUrl || null };
}

export async function canOpenPrivatePapers(db, user, isPremium) {
  if (!user) return false;
  if (isPremium(user)) return true;
  const { data } = await db.from("feedback_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return Boolean(data);
}
