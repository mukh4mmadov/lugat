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
- Use simple English by default.`;

// Basic in-memory rate limiter fallback: { ip: { count, resetAt } }
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

function checkMemoryRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10;

  const record = memoryRateLimiters.get(ip);
  if (!record || now > record.resetAt) {
    memoryRateLimiters.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

// Cleanup old entries periodically
if (Math.random() < 0.05) {
  const now = Date.now();
  for (const [ip, record] of memoryRateLimiters) {
    if (now > record.resetAt) memoryRateLimiters.delete(ip);
  }
}

// Upstash Redis setup
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
let redis = null;
let ipLimiter = null;
let deviceLimiter = null;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    const { Redis } = await import("@upstash/redis");
    const { Ratelimit } = await import("@upstash/ratelimit");
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
    ipLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "24 h"),
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

async function checkRateLimit(ip, deviceId) {
  if (ipLimiter && deviceLimiter) {
    const [ipResult, deviceResult] = await Promise.all([
      ipLimiter.limit(ip),
      deviceId ? deviceLimiter.limit(deviceId) : Promise.resolve({ success: true }),
    ]);

    if (!ipResult.success) {
      return { allowed: false, reason: "Daily AI chat limit reached. Please try again tomorrow." };
    }

    if (!deviceResult.success) {
      return { allowed: false, reason: "Daily AI chat limit reached. Please try again tomorrow." };
    }

    return { allowed: true };
  }

  // Fallback to in-memory limiter
  if (!checkMemoryRateLimit(ip)) {
    return { allowed: false, reason: "Too many requests. Please wait a moment before trying again." };
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

  const rateLimitResult = await checkRateLimit(ip, deviceId);
  if (!rateLimitResult.allowed) {
    return res.status(429).json({ error: rateLimitResult.reason });
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
