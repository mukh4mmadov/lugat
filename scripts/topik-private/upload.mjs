import { readdirSync, readFileSync } from "fs";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const BUCKET = "topik-premium";
const FILES = ["paper.pdf", "listening.mp3"];

async function call(path, options = {}) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(`${url}/storage/v1/${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
      const text = await response.text();
      return { status: response.status, text };
    } catch (error) {
      if (attempt >= 5) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

const bucket = await call("bucket", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false, file_size_limit: 50 * 1024 * 1024, allowed_mime_types: ["application/json", "application/pdf", "audio/mpeg", "audio/mp3"] }),
});
console.log("bucket", bucket.status, bucket.status === 200 ? "created" : bucket.text.slice(0, 80));

const dir = new URL("../../private/topik/", import.meta.url);
const ids = readdirSync(dir).filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -5));
for (const id of ids) {
  const body = readFileSync(new URL(`${id}.json`, dir));
  const result = await call(`object/${BUCKET}/${id}/paper.json`, { method: "POST", headers: { "Content-Type": "application/json", "x-upsert": "true" }, body });
  console.log(id, "paper.json", result.status);
  if (!process.argv.includes("--files")) continue;
  for (const file of FILES) {
    const copy = await call("object/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucketId: "topik-assets", sourceKey: `${id}/${file}`, destinationBucket: BUCKET, destinationKey: `${id}/${file}` }),
    });
    const exists = copy.status === 400 && /exists/i.test(copy.text);
    console.log(id, file, "copy", copy.status, exists ? "(already there)" : copy.status === 200 ? "" : copy.text.slice(0, 80));
    if (process.argv.includes("--remove-public") && (copy.status === 200 || exists)) {
      const removed = await call(`object/topik-assets`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [`${id}/${file}`] }) });
      console.log(id, file, "public copy removed", removed.status);
    }
  }
}
