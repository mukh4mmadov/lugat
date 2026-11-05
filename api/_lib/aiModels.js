// The two text models behind the AI tutor. The backup takes over when the main
// one is busy; admins can also put it first from the panel.
export const MAIN_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
export const BACKUP_MODEL = process.env.SPEAKING_FALLBACK_MODEL || "gemini-3.1-flash-lite";

export const modelUrl = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

// A tiny real request to one model: does it answer, and how fast.
export async function checkModel(model) {
  const started = Date.now();
  try {
    const response = await fetch(modelUrl(model), {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Say OK" }] }], generationConfig: { maxOutputTokens: 16 } }),
    });
    return { model, ok: response.ok, status: response.status, ms: Date.now() - started };
  } catch {
    return { model, ok: false, status: 0, ms: Date.now() - started };
  }
}
