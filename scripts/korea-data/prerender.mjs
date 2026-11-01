// After `vite build`: static HTML for /korea and every /korea/u/<id> page, so
// search engines see each university's name, tuition and certification, plus
// those URLs in dist/sitemap.xml. Each page is the normal app shell with its
// own title, description and readable content; the app takes over on load.
// Vercel serves these files before the SPA rewrite.
//
//   node scripts/korea-data/prerender.mjs   (run by `npm run build`)

import fs from "node:fs";
import path from "node:path";
import { SOURCES, UNIVERSITIES } from "../../src/data/korea/universities.js";

const SITE = "https://lugat-six.vercel.app";
const shell = fs.readFileSync("dist/index.html", "utf8");
const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const won = (value) => (value ? `₩${Math.round(value).toLocaleString("en-US")}` : null);
const STATUS = { certified: "IEQAS sertifikatlangan", scrutiny: "viza tekshiruvi kuchaytirilgan", none: "IEQAS sertifikatsiz" };

function page({ url, title, description, body }) {
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escape(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escape(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  html = html.replace(/<link rel="canonical"[^>]*>/, "");
  html = html.replace("</head>", `  <link rel="canonical" href="${url}" />\n  </head>`);
  // Readable content for crawlers; React replaces #root on load.
  html = html.replace(/<div id="root">[\s\S]*?<!--\/splash--><\/div>/, `<div id="root"><main style="max-width:720px;margin:0 auto;padding:24px;font-family:sans-serif">${body}</main></div>`);
  return html;
}

function write(route, html) {
  const file = path.join("dist", route, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const certified = UNIVERSITIES.filter((uni) => uni.ieqas.degree === "certified").length;
write(
  "korea",
  page({
    url: `${SITE}/korea`,
    title: "Koreyada o'qish — universitetlar, kontrakt narxlari, GKS, viza | K-TALIM",
    description: `Koreyaning ${UNIVERSITIES.length} ta universiteti rasmiy kontrakt narxlari (KOSAF ${SOURCES.kosaf.date}), ${certified} ta IEQAS sertifikatlangan universitet, GKS stipendiyasi, D-2 va D-4 viza, AI qabul yordamchisi — o'zbek tilida.`,
    body: `<h1>Koreyada o'qish</h1><p>Koreya universitetlari ro'yxati: rasmiy kontrakt narxlari, IEQAS sertifikati, GKS stipendiyasi va viza bo'yicha qo'llanma.</p><ul>${UNIVERSITIES.filter((uni) => uni.featured)
      .map((uni) => `<li><a href="/korea/u/${uni.id}">${escape(uni.en || uni.ko)} (${escape(uni.ko)})</a></li>`)
      .join("")}</ul>`,
  }),
);

for (const uni of UNIVERSITIES) {
  const name = uni.en ? `${uni.en} (${uni.ko})` : uni.ko;
  const tuition = won(uni.tuition);
  const status = STATUS[uni.ieqas.degree];
  write(
    `korea/u/${uni.id}`,
    page({
      url: `${SITE}/korea/u/${uni.id}`,
      title: `${name} — kontrakt narxi, IEQAS, qabul | K-TALIM`,
      description: `${name}: ${tuition ? `o'rtacha yillik kontrakt ${tuition} (KOSAF ${SOURCES.kosaf.date})` : "kontrakt ma'lumoti yo'q"}, ${status} (${SOURCES.ieqas.date}). TOPIK talablari, qabul vaqtlari va AI qabul yordamchisi.`,
      body: `<h1>${escape(name)}</h1><p>${tuition ? `O'rtacha yillik kontrakt: ${tuition} (manba: KOSAF, ${SOURCES.kosaf.date}).` : ""} Holati: ${status} (manba: Adliya va Ta'lim vazirliklari, ${SOURCES.ieqas.date}).</p><p><a href="/korea">Barcha universitetlar</a></p>`,
    }),
  );
}

// Add the pages to the sitemap.
const sitemapPath = "dist/sitemap.xml";
const sitemap = fs.readFileSync(sitemapPath, "utf8").replace(/\s*<url><loc>[^<]*\/korea[^<]*<\/loc><\/url>/g, "");
const urls = [`${SITE}/korea`, ...UNIVERSITIES.map((uni) => `${SITE}/korea/u/${uni.id}`)].map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n");
fs.writeFileSync(sitemapPath, sitemap.replace("</urlset>", `${urls}\n</urlset>`));
console.log(`Prerendered ${UNIVERSITIES.length + 1} Korea pages`);
