import { createClient } from "@supabase/supabase-js";
import { viewAs } from "./viewAs";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://missing-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "missing-anon-key";

if (
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn(
    "Supabase environment variables are missing. Authentication is disabled until .env is configured.",
  );
}

export function timeoutSignal(ms = 8000) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export const supabase = viewAs
  ? readOnly(
      createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${viewAs.token}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: "k-talim-view-as" },
      }),
    )
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    });

const READ_ONLY_RPCS = new Set(["get_announcement", "get_premium_prices", "is_feedback_admin", "my_league", "speaking_live_status"]);
const WRITES = new Set(["insert", "update", "upsert", "delete"]);
const STOPPED = { data: null, error: { message: "View only: nothing is saved", code: "VIEW_ONLY" }, count: null, status: 403, statusText: "View only" };

function stopped() {
  const chain = new Proxy(function chainable() {}, {
    get: (target, prop) => (prop === "then" ? (resolve) => resolve(STOPPED) : () => chain),
    apply: () => chain,
  });
  return chain;
}

function without(object, blocked, result) {
  return new Proxy(object, {
    get(target, prop) {
      if (blocked.has(prop)) return result;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

const FILE_WRITES = new Set(["upload", "update", "remove", "move", "copy", "uploadToSignedUrl"]);

function readOnly(client) {
  const from = client.from.bind(client);
  client.from = (table) => without(from(table), WRITES, () => stopped());
  const rpc = client.rpc.bind(client);
  client.rpc = (name, ...args) => (READ_ONLY_RPCS.has(name) ? rpc(name, ...args) : stopped());
  const storage = client.storage;
  const bucket = storage.from.bind(storage);
  storage.from = (name) => without(bucket(name), FILE_WRITES, () => Promise.resolve(STOPPED));
  Object.defineProperty(client, "storage", { configurable: true, value: storage });
  client.channel = () => stopped();
  return client;
}
