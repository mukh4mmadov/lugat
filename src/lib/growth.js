import { getDeviceId } from "./deviceId";
import { supabase } from "./supabase";

const REF_KEY = "k-talim:ref";
const DEVICE_SEEN_KEY = "k-talim:ref-device";

export const inviteLink = (code) => `https://lugat-six.vercel.app/?ref=${code}`;

// Keeps an invite code from the address (?ref=CODE) until the visitor has an
// account and the invite can be linked.
export function captureReferral() {
  try {
    const code = new URLSearchParams(window.location.search).get("ref");
    if (code && /^[A-Za-z0-9]{6}$/.test(code)) window.localStorage.setItem(REF_KEY, code.toUpperCase());
  } catch {
    // Storage blocked: the invite just isn't counted.
  }
}

// Called once a learner is signed in: links a pending invite, and notes this
// device for the learner's own code so friends on it don't count.
export async function syncReferral(userId) {
  const device = getDeviceId();
  try {
    if (window.localStorage.getItem(DEVICE_SEEN_KEY) !== userId) {
      const { error } = await supabase.rpc("my_referral", { p_device: device });
      if (!error) window.localStorage.setItem(DEVICE_SEEN_KEY, userId);
    }
    const code = window.localStorage.getItem(REF_KEY);
    if (!code) return;
    const { data, error } = await supabase.rpc("claim_referral", { p_code: code, p_device: device });
    if (!error && data) window.localStorage.removeItem(REF_KEY);
  } catch {
    // Try again on the next visit.
  }
}

function keyBytes(base64) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

export const pushSupported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

async function pushRequest(body) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

export async function pushState() {
  if (!pushSupported()) return { supported: false };
  const { publicKey } = await fetch("/api/push").then((response) => response.json()).catch(() => ({}));
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return { supported: true, configured: Boolean(publicKey), publicKey, on: Boolean(subscription) && Notification.permission === "granted", permission: Notification.permission };
}

export async function enablePush(publicKey, language) {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) }));
  await pushRequest({ action: "subscribe", subscription: subscription.toJSON(), language });
  return true;
}

export async function disablePush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  await pushRequest({ action: "unsubscribe", endpoint: subscription.endpoint }).catch(() => {});
  await subscription.unsubscribe();
}

// Asks the server to ping a few learners at the same level who turned on
// reminders; the server limits how often.
export const notifyPartnerWaiting = () => pushRequest({ action: "partnerWaiting" }).catch(() => {});
