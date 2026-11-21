// Quick live check after a deploy: key pages answer 200 with real content,
// the app bundle is referenced, and the public APIs respond.
//
//   node scripts/smoke.mjs [https://www.ktalim.uz]
const BASE = (process.argv[2] || "https://www.ktalim.uz").replace(/\/$/, "");
const pages = [
  ["/", "K-TALIM"],
  ["/topik", "TOPIK"],
  ["/topik/words/36th", ""],
  ["/grammar", "grammatika"],
  ["/grammar/approx-jjeum", "쯤"],
  ["/guides/topik", "TOPIK"],
  ["/robots.txt", "Sitemap"],
  ["/sitemap.xml", "<urlset"],
];
let failed = 0;
const check = async (path, needle) => {
  try {
    const res = await fetch(BASE + path, { redirect: "follow" });
    const text = await res.text();
    const ok = res.ok && (!needle || text.toLowerCase().includes(needle.toLowerCase()));
    if (!ok) failed++;
    console.log(`${ok ? "OK  " : "FAIL"} ${res.status} ${path}${ok ? "" : ` (missing "${needle}")`}`);
    return text;
  } catch (error) {
    failed++;
    console.log(`FAIL --- ${path} ${error.message}`);
    return "";
  }
};
const home = await check("/", "K-TALIM");
const bundle = home.match(/\/assets\/index-[\w-]+\.js/)?.[0];
if (bundle) await check(bundle, "");
else { failed++; console.log("FAIL no index bundle in home page"); }
for (const [path, needle] of pages.slice(1)) await check(path, needle);
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
