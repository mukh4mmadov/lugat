/* eslint-env node */
// Vercel Serverless Function: AI Chat proxy for Korean learning tutor
// Route: POST /api/ai-chat
//
// IMPORTANT:
// - GEMINI_API_KEY must be set as a Vercel Environment Variable (Server-side only).
// - Never expose this key to the client. This endpoint is the ONLY place it is used.
// - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for persistent rate limiting.
// - If Upstash is not configured, falls back to the existing in-memory limiter.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a friendly, patient Korean language learning assistant for the K-TALIM app.
Your role:
- Help users with Korean vocabulary, grammar, sentence construction, and pronunciation.
- Explain words, particles, honorifics, and common expressions clearly for beginners.
- Give study advice and memory tips.
- Keep answers concise and actionable.

Rules:
- If the user asks something unrelated to Korean language learning, answer briefly but politely, then add a short reminder: "Note: I'm primarily here to help you with Korean vocabulary, grammar, and study tips. Feel free to ask me anything about Korean!"
- Never mention that you are an AI or language model.
- Do not provide harmful, unsafe, or inappropriate content.
- Use simple English by default.

Site knowledge (use only when the user asks about the app, navigation, features, or how to contact the developer; do not bring this up unprompted during normal Korean-learning conversations):
- K-TALIM is a Korean vocabulary learning web app built around the K-TALIM 1A textbook word list.
- Flashcards: lesson-based flashcard practice for learning new vocabulary.
- Study: dedicated lesson study mode with guided practice.
- Courses: organized course/lesson listing.
- Listening: audio/listening exercises for lesson vocabulary.
- Quiz: multiple-choice or typed quizzes per lesson.
- Writing: writing practice for lesson vocabulary.
- Review: spaced-repetition review queue that schedules words for optimal review timing.
- Weak Words: adaptive practice that targets the words you struggle with most.
- Search: search all vocabulary entries across the full dictionary.
- Favorites: save words you want to review later.
- Difficult: automatically collects words you marked as "Don't Know" during practice.
- Statistics: learning analytics including daily streak, accuracy, mastery overview, achievements, and recent activity.
- Future Updates: roadmap of planned features.
- Settings: pronunciation settings and the ability to reset all local progress.
- Developer contact: for bugs, errors, or feedback, reach out on Telegram at @mukh4mmadov.`;

// Supabase auth for token verification
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
let supabaseAuth = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error("Failed to initialize Supabase auth client:", error);
  }
}

// Basic in-memory rate limiter fallback: { key: { count, resetAt } }
const memoryRateLimiters = new Map();

function getHeader(req, name) {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

function getClientIp(req) {
  const forwarded = getHeader(req, "x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return getHeader(req, "x-real-ip") || "unknown";
}

function checkMemoryRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();

  const record = memoryRateLimiters.get(key);
  if (!record || now > record.resetAt) {
    memoryRateLimiters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true };
}

async function verifyAuthToken(token) {
  if (!supabaseAuth || !token) return null;
  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

// Cleanup old entries periodically
if (Math.random() < 0.05) {
  const now = Date.now();
  for (const [key, record] of memoryRateLimiters) {
    if (now > record.resetAt) memoryRateLimiters.delete(key);
  }
}

// Upstash Redis setup
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
let redis = null;
let userLimiter = null;
let ipLimiter = null;
let deviceLimiter = null;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    const { Redis } = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
    userLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, "24 h"),
      prefix: "ratelimit:user",
    });
    ipLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, "24 h"),
      prefix: "ratelimit:ip",
    });
    deviceLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "24 h"),
      prefix: "ratelimit:device",
    });
  } catch (error) {
    console.error("Failed to initialize Upstash Redis:", error);
  }
} else {
  console.warn("Upstash Redis env vars not set. Falling back to in-memory rate limiting.");
}

async function checkRateLimit(ip, deviceId, authToken) {
  const user = await verifyAuthToken(authToken);

  if (user && userLimiter) {
    const userResult = await userLimiter.limit(`user:${user.id}`);
    if (!userResult.success) {
      return {
        allowed: false,
        reason: "Daily AI chat limit reached. Please try again tomorrow.",
        resetAt: userResult.reset || Date.now() + 24 * 60 * 60 * 1000,
        isGuest: false,
      };
    }
    return { allowed: true };
  }

  if (ipLimiter && deviceLimiter) {
    const [ipResult, deviceResult] = await Promise.all([
      ipLimiter.limit(ip),
      deviceId ? deviceLimiter.limit(deviceId) : Promise.resolve({ success: true, reset: 0 }),
    ]);

    if (!ipResult.success || !deviceResult.success) {
      const ipReset = ipResult.reset || 0;
      const deviceReset = deviceResult.reset || 0;
      const resetAt = Math.max(ipReset, deviceReset);
      return {
        allowed: false,
        reason: "Daily AI chat limit reached. Please try again tomorrow.",
        resetAt: resetAt || Date.now() + 24 * 60 * 60 * 1000,
        isGuest: true,
      };
    }

    return { allowed: true };
  }

  // Fallback to in-memory limiter
  const memoryResult = user
    ? checkMemoryRateLimit(`user:${user.id}`, 15, 24 * 60 * 60 * 1000)
    : checkMemoryRateLimit(`ip:${ip}`, 2, 24 * 60 * 60 * 1000);
  if (!memoryResult.allowed) {
    return {
      allowed: false,
      reason: "Too many requests. Please wait a moment before trying again.",
      resetAt: memoryResult.resetAt,
      isGuest: !user,
    };
  }

  return { allowed: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "AI service is not configured." });
  }

  const ip = getClientIp(req);

  let body;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const message = typeof body === "string" ? body : body?.message;
  const deviceId = typeof body === "string" ? null : body?.deviceId;

  if (!deviceId || typeof deviceId !== "string" || deviceId.trim().length === 0) {
    console.warn("Missing or invalid deviceId from request. Skipping device-based rate limit.");
  }

  const authHeader = getHeader(req, "authorization");
  const authToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const rateLimitResult = await checkRateLimit(ip, deviceId, authToken);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: rateLimitResult.reason,
      resetAt: rateLimitResult.resetAt,
      isGuest: rateLimitResult.isGuest,
    });
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const trimmed = message.trim();
  if (trimmed.length > 2000) {
    return res.status(400).json({ error: "Message is too long. Please keep it under 2000 characters." });
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: trimmed }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("Gemini API error:", response.status, errorText);
      return res.status(502).json({ error: "AI service is temporarily unavailable. Please try again later." });
    }

    const data = await response.json();

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      return res.status(502).json({ error: "AI service returned an empty response. Please try again." });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI chat proxy error:", error);
    return res.status(502).json({ error: "AI service is temporarily unavailable. Please try again later." });
  }
}
