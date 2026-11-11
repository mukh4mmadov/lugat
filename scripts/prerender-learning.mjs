// After `vite build` and the Korea pages: static HTML for the home page and the
// learning pages, so search engines read real content without running the app:
// lessons with their words, grammar points, stories, speaking topics and TOPIK.
// Each page is the app shell with its own title, description, readable content
// and structured data; the app takes over on load. Everything written here is
// taken from the data the app itself uses, so it only describes what exists.
//
// The home page goes to dist/index.html, so the plain shell is copied to
// dist/app.html first: vercel.json sends every other route there.
//
//   node scripts/prerender-learning.mjs   (run by `npm run build`)

import fs from "node:fs";
import path from "node:path";
import { GRAMMAR } from "../src/data/grammar/index.js";
import { STORIES } from "../src/data/stories/index.js";
import { SPEAKING_TOPICS } from "../src/data/speakingTopics.js";
import { TOPIK_EXAMS } from "../src/data/topik/exams.js";
import { GUIDES } from "../src/data/guides.js";
import uz from "../src/locales/uz.js";

const SITE = "https://www.ktalim.uz";
const shell = fs.readFileSync("dist/index.html", "utf8");
// The shell serves every route without a page of its own, so it must not name
// the home page as their address: the app sets the right one on load.
fs.writeFileSync("dist/app.html", shell.replace(/\s*<link rel="canonical"[^>]*>/, "").replace(/\s*<meta property="og:url"[^>]*>/, ""));

const escape = (text) => String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clip = (text, length) => (text.length > length ? `${text.slice(0, length - 1).replace(/\s+\S*$/, "")}…` : text);
const plain = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

const lessons = JSON.parse(fs.readFileSync("data/lessons.json", "utf8")).map((lesson) => ({
  ...lesson,
  topic: uz[lesson.category] || "",
  words: JSON.parse(fs.readFileSync(`data/lesson${lesson.lesson}.json`, "utf8")),
}));
const wordCount = lessons.reduce((sum, lesson) => sum + lesson.words.length, 0);
const isPremiumStory = (story) => story.id.endsWith("-b");
// Most grammar titles already name the pattern; the others get it added.
const grammarName = (point) => (/[가-힣]/.test(point.title.uz) ? plain(point.title.uz) : `${point.pattern} — ${plain(point.title.uz)}`);
const LEVELS = { beginner: "boshlang'ich", intermediate: "o'rta", advanced: "yuqori" };

const learningResource = (url, name, description, extra = {}) => ({
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name,
  description,
  url,
  inLanguage: ["ko", "uz"],
  educationalLevel: "Beginner",
  isAccessibleForFree: true,
  provider: { "@type": "Organization", name: "K-TALIM", url: SITE },
  ...extra,
});

function page({ url, title, description, body, data }) {
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escape(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escape(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escape(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escape(description)}$2`)
    .replace(/<link rel="canonical"[^>]*>/, "");
  const json = data ? `  <script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>\n` : "";
  html = html.replace("</head>", `  <link rel="canonical" href="${url}" />\n${json}  </head>`);
  // Readable content for crawlers; React replaces #root on load.
  return html.replace(/<div id="root">[\s\S]*?<!--\/splash--><\/div>/, `<div id="root"><main style="max-width:760px;margin:0 auto;padding:24px;font-family:sans-serif;line-height:1.6">${body}</main></div>`);
}

const written = [];
function write(route, html) {
  const file = path.join("dist", route, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (route) written.push(`${SITE}/${route}`);
}
const nav = `<p><a href="/">Bosh sahifa</a> · <a href="/courses">Darslar</a> · <a href="/grammar">Grammatika</a> · <a href="/stories">Hikoyalar</a> · <a href="/speaking">Gaplashish</a> · <a href="/topik">TOPIK I</a> · <a href="/korea">Koreyada o'qish</a> · <a href="/guides">Qo'llanmalar</a></p>`;

// Lessons: every word with its reading and meaning.
for (const lesson of lessons) {
  const url = `${SITE}/study/${lesson.lesson}`;
  const sample = lesson.words.slice(0, 6).map((word) => `${word.korean} (${word.uzbek})`).join(", ");
  const description = clip(`Koreys tili ${lesson.lesson}-dars${lesson.topic ? `: ${lesson.topic}` : ""}. ${lesson.words.length} ta so'z o'zbekcha tarjimasi va o'qilishi bilan: ${sample}. Kartochka, test va eshitish mashqlari.`, 160);
  const rows = lesson.words.map((word) => `<tr><td lang="ko">${escape(word.korean)}</td><td>${escape(word.romanization)}</td><td>${escape(word.uzbek)}</td></tr>`).join("");
  write(
    `study/${lesson.lesson}`,
    page({
      url,
      title: `${lesson.lesson}-dars${lesson.topic ? `: ${lesson.topic}` : ""} — koreyscha so'zlar | K-TALIM`,
      description,
      body: `${nav}<h1>Koreys tili ${lesson.lesson}-dars${lesson.topic ? `: ${escape(lesson.topic)}` : ""}</h1><p>${lesson.words.length} ta so'z (kurs ${escape(lesson.course)}). Har bir so'zni kartochka, test, eshitish, yozish va diktant mashqlarida o'rganasiz, takrorlash jadvali esa unutilayotgan so'zlarni o'z vaqtida qaytaradi.</p><table><thead><tr><th>Koreyscha</th><th>O'qilishi</th><th>O'zbekcha</th></tr></thead><tbody>${rows}</tbody></table><p><a href="/study/${lesson.lesson}">Darsni boshlash</a>${lesson.lesson < lessons.length ? ` · <a href="/study/${lesson.lesson + 1}">${lesson.lesson + 1}-dars</a>` : ""}</p>`,
      data: learningResource(url, `${lesson.lesson}-dars: koreyscha so'zlar`, description, { learningResourceType: "Vocabulary list", teaches: lesson.topic || "Korean vocabulary" }),
    }),
  );
}

// Grammar points.
write(
  "grammar",
  page({
    url: `${SITE}/grammar`,
    title: "Koreys tili grammatikasi o'zbek tilida — 56 mavzu | K-TALIM",
    description: `Koreys tili grammatikasi o'zbekcha tushuntirish bilan: ${GRAMMAR.length} ta mavzu, misollar, ko'p uchraydigan xatolar va mashqlar. AI gapingizni tekshirib beradi.`,
    body: `${nav}<h1>Koreys tili grammatikasi</h1><p>${GRAMMAR.length} ta mavzu, har biri o'zbekcha tushuntirish, misollar, ko'p uchraydigan xatolar va mashqlar bilan.</p><ul>${GRAMMAR.map((point) => `<li><a href="/grammar/${point.id}">${escape(grammarName(point))}</a> (${point.lesson}-dars)</li>`).join("")}</ul>`,
  }),
);
for (const point of GRAMMAR) {
  const url = `${SITE}/grammar/${point.id}`;
  const description = clip(`${grammarName(point)}. ${plain(point.explain.uz)}`, 160);
  const rules = (point.rules || []).map(([pattern, text]) => `<li><b lang="ko">${escape(pattern)}</b> — ${escape(text)}</li>`).join("");
  const examples = (point.examples || []).map(([korean, text]) => `<li><span lang="ko">${escape(korean)}</span> — ${escape(text)}</li>`).join("");
  const mistakes = (point.mistakes || []).map(([wrong, right, note]) => `<li>✗ <span lang="ko">${escape(wrong)}</span> → ✓ <span lang="ko">${escape(right)}</span> — ${escape(note?.uz)}</li>`).join("");
  write(
    `grammar/${point.id}`,
    page({
      url,
      title: `${grammarName(point)} | Koreys grammatikasi | K-TALIM`,
      description,
      body: `${nav}<h1>${escape(grammarName(point))}</h1><p>Qolip: <b lang="ko">${escape(point.pattern)}</b></p><p>${escape(point.explain.uz)}</p>${rules ? `<h2>Qoida</h2><ul>${rules}</ul>` : ""}${examples ? `<h2>Misollar</h2><ul>${examples}</ul>` : ""}${mistakes ? `<h2>Ko'p uchraydigan xatolar</h2><ul>${mistakes}</ul>` : ""}<p>${point.lesson}-dars grammatikasi · <a href="/grammar">Barcha mavzular</a></p>`,
      data: learningResource(url, grammarName(point), description, { learningResourceType: "Grammar explanation", teaches: point.pattern }),
    }),
  );
}

// Stories. A Premium story shows its title and opening only.
write(
  "stories",
  page({
    url: `${SITE}/stories`,
    title: "Koreyscha qisqa hikoyalar o'zbekcha tarjima bilan | K-TALIM",
    description: `${STORIES.length} ta koreyscha qisqa hikoya darsdagi so'zlar bilan: har bir gap o'zbekcha tarjimasi bilan, so'zni bosib ma'nosini ko'rish va savollar.`,
    body: `${nav}<h1>Koreyscha qisqa hikoyalar</h1><p>Har bir darsga ikkita hikoya, faqat o'rganilgan so'zlar va grammatika bilan yozilgan. Har bir gapning o'zbekcha tarjimasi bor, so'zni bosib ma'nosini ko'rasiz, oxirida savollar bor.</p><ul>${STORIES.map((story) => `<li><a href="/stories/${story.id}">${escape(story.title.ko)} — ${escape(story.title.uz)}</a> (${story.lesson}-dars${isPremiumStory(story) ? ", Premium" : ""})</li>`).join("")}</ul>`,
  }),
);
for (const story of STORIES) {
  const url = `${SITE}/stories/${story.id}`;
  const premium = isPremiumStory(story);
  const shown = premium ? story.lines.slice(0, 2) : story.lines;
  const description = clip(`${story.title.ko} — ${story.title.uz}. ${story.lesson}-dars so'zlari bilan koreyscha qisqa hikoya, har bir gap o'zbekcha tarjimasi bilan.`, 160);
  const lines = shown.map(([korean, text]) => `<p><span lang="ko">${escape(korean)}</span><br />${escape(text)}</p>`).join("");
  write(
    `stories/${story.id}`,
    page({
      url,
      title: `${story.title.ko} — ${story.title.uz} | Koreyscha hikoya | K-TALIM`,
      description,
      body: `${nav}<h1><span lang="ko">${escape(story.title.ko)}</span> — ${escape(story.title.uz)}</h1><p>${story.lesson}-dars · so'zlar: <span lang="ko">${escape(story.words.join(", "))}</span></p>${lines}${premium ? "<p>Hikoyaning davomi Premium bilan ochiladi.</p>" : ""}<p><a href="/stories">Barcha hikoyalar</a></p>`,
      data: learningResource(url, `${story.title.ko} — ${story.title.uz}`, description, { learningResourceType: "Reading", isAccessibleForFree: !premium }),
    }),
  );
}

// Speaking.
write(
  "speaking",
  page({
    url: `${SITE}/speaking`,
    title: "Koreyscha gaplashish mashqi — AI suhbatdosh va jonli qo'ng'iroq | K-TALIM",
    description: `Koreys tilida ovoz bilan gaplashing: AI suhbatdosh Friday ${SPEAKING_TOPICS.length} ta mavzuda siz bilan suhbatlashadi, boshqa o'quvchilar bilan jonli qo'ng'iroq ham bor.`,
    body: `${nav}<h1>Koreyscha gaplashish</h1><p>AI suhbatdosh Friday bilan koreys tilida ovoz orqali gaplashasiz: u savol beradi, javobingizni tinglaydi va davom ettiradi. Boshqa o'quvchilar bilan jonli qo'ng'iroq orqali ham mashq qilish mumkin.</p><h2>Mavzular</h2><ul>${SPEAKING_TOPICS.map((topic) => `<li><span lang="ko">${escape(topic.ko)}</span> — ${escape(topic.uz)} (${LEVELS[topic.level] || topic.level})</li>`).join("")}</ul>`,
  }),
);

// TOPIK I.
const examList = TOPIK_EXAMS.map((exam) => `${exam.number}-imtihon`).join(" va ");
write(
  "topik",
  page({
    url: `${SITE}/topik`,
    title: "TOPIK I mock imtihon onlayn — tinglash va o'qish | K-TALIM",
    description: `TOPIK I mock imtihoni: ${examList}, har biri ${TOPIK_EXAMS[0].questions.length} savol, haqiqiy vaqt bilan yoki bo'limma-bo'lim. Natija, daraja va AI xato tushuntirishi.`,
    body: `${nav}<h1>TOPIK I mock imtihon</h1><p>${TOPIK_EXAMS.length} ta haqiqiy TOPIK I varianti (${examList}), har biri ${TOPIK_EXAMS[0].questions.length} savol: tinglash va o'qish. To'liq imtihonni vaqt bilan yoki har bir bo'limni alohida yeching. Oxirida ball, taxminiy daraja va AI xatolaringizni o'zbekcha tushuntiradi. Har bir imtihonning muhim so'zlari ham alohida sahifada.</p><ul>${TOPIK_EXAMS.map((exam) => `<li><a href="/topik/words/${exam.id}">${exam.number}-imtihon so'zlari</a></li>`).join("")}</ul><p><a href="/guides/topik">TOPIK nima va qanday topshiriladi</a></p>`,
  }),
);

// Guides: the same text the app shows at /guides/<slug>.
function guideBlock(block) {
  if (block.p) return `<p>${escape(block.p)}</p>`;
  if (block.list) return `<ul>${block.list.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>`;
  if (block.links) return `<p>${block.links.map((link) => `<a href="${link.to}">${escape(link.label)}</a>`).join(" · ")}</p>`;
  const { head, rows, ko } = block.table;
  const cell = (text, index) => (index === ko ? `<td lang="ko">${escape(text)}</td>` : `<td>${escape(text)}</td>`);
  return `<table><thead><tr>${head.map((text) => `<th>${escape(text)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map(cell).join("")}</tr>`).join("")}</tbody></table>`;
}
write(
  "guides",
  page({
    url: `${SITE}/guides`,
    title: "Koreys tili bo'yicha qo'llanmalar: alifbo, raqamlar, TOPIK | K-TALIM",
    description: "Koreys tilini o'zbek tilida o'rganuvchilar uchun qo'llanmalar: Hangul alifbosi, koreyscha raqamlar va TOPIK imtihoni haqida to'liq ma'lumot.",
    body: `${nav}<h1>Koreys tili bo'yicha qo'llanmalar</h1><ul>${GUIDES.map((guide) => `<li><a href="/guides/${guide.slug}">${escape(guide.title)}</a> — ${escape(guide.description)}</li>`).join("")}</ul>`,
  }),
);
for (const guide of GUIDES) {
  const url = `${SITE}/guides/${guide.slug}`;
  write(
    `guides/${guide.slug}`,
    page({
      url,
      title: `${guide.title} | K-TALIM`,
      description: guide.description,
      body: `${nav}<article lang="uz"><h1>${escape(guide.title)}</h1><p>${escape(guide.intro)}</p>${guide.sections.map((section, index) => `<h2>${index + 1}. ${escape(section.heading)}</h2>${section.blocks.map(guideBlock).join("")}`).join("")}</article>`,
      data: { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, url, inLanguage: "uz", author: { "@type": "Organization", name: "K-TALIM", url: SITE }, publisher: { "@type": "Organization", name: "K-TALIM", url: SITE } },
    }),
  );
}

// The home page: what K-TALIM has, with a link to each part.
const homeDescription = `Koreys tilini o'zbek tilida o'rganing: ${lessons.length} dars va ${wordCount} so'z, grammatika, hikoyalar, AI bilan gaplashish, TOPIK I mock imtihon va Koreyada o'qish bo'yicha qo'llanma.`;
const home = page({
  url: `${SITE}/`,
  title: "K-TALIM — koreys tilini o'zbek tilida o'rganing | TOPIK, so'zlar, gaplashish",
  description: homeDescription,
  body: `<h1>K-TALIM — koreys tilini o'zbek tilida o'rganing</h1><p>${escape(homeDescription)}</p>
<h2><a href="/courses">So'z yodlash: ${lessons.length} dars, ${wordCount} so'z</a></h2><p>Har bir so'z o'qilishi, o'zbekcha, inglizcha va ruscha tarjimasi hamda misol gap bilan. Mashqlar: kartochkalar, test, eshitish, yozish va diktant. Takrorlash jadvali so'zni unutayotganingizda qaytaradi.</p>
<h2><a href="/grammar">Grammatika: ${GRAMMAR.length} mavzu</a></h2><p>O'zbekcha tushuntirish, misollar, ko'p uchraydigan xatolar va mashqlar. Gap tuzsangiz, AI uni tekshirib beradi.</p>
<h2><a href="/stories">Hikoyalar: ${STORIES.length} ta</a></h2><p>Darsdagi so'zlar bilan yozilgan qisqa hikoyalar, so'zni bosib tarjimasini ko'rish va savollar.</p>
<h2><a href="/speaking">Gaplashish</a></h2><p>AI suhbatdosh Friday bilan ${SPEAKING_TOPICS.length} ta mavzuda koreyscha ovozli suhbat va boshqa o'quvchilar bilan jonli qo'ng'iroq.</p>
<h2><a href="/topik">TOPIK I mock imtihon</a></h2><p>${examList}: vaqt bilan to'liq imtihon yoki bo'limma-bo'lim, ball, daraja va AI xato tushuntirishi.</p>
<h2>AI ustoz</h2><p>Koreys tili bo'yicha savollaringizga o'zbek tilida javob beradi.</p>
<h2><a href="/guides">Qo'llanmalar</a></h2><p>${GUIDES.map((guide) => `<a href="/guides/${guide.slug}">${escape(guide.title)}</a>`).join(" · ")}</p>
<h2><a href="/korea">Koreyada o'qish</a></h2><p>Koreya universitetlari, rasmiy kontrakt narxlari, GKS stipendiyasi va viza bo'yicha qo'llanma.</p>
<h2><a href="/leaderboard">XP, darajalar va ligalar</a></h2><p>Har kuni o'qish uchun XP, yutuqlar, haftalik liga va streak.</p>
<p>Boshlash bepul. <a href="/premium">Premium</a> qo'shimcha imkoniyatlar beradi.</p>`,
  data: {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "K-TALIM", url: `${SITE}/`, inLanguage: ["uz", "en", "ru"], description: homeDescription },
      { "@type": "Organization", name: "K-TALIM", url: `${SITE}/`, logo: `${SITE}/icon-512.png` },
    ],
  },
});
write("", home);

// The sitemap: these pages replace any older entries for the same sections,
// and the /lesson/N addresses (which open the flashcards) give way to /study/N.
const sitemapPath = "dist/sitemap.xml";
const sections = /\s*<url><loc>[^<]*\/(grammar|stories|speaking|topik|study|lesson|guides)(\/[^<]*)?<\/loc><\/url>/g;
const sitemap = fs.readFileSync(sitemapPath, "utf8").replace(sections, "");
written.push(`${SITE}/study`);
const urls = written.map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n");
fs.writeFileSync(sitemapPath, sitemap.replace("</urlset>", `${urls}\n</urlset>`));
console.log(`Prerendered ${written.length + 1} learning pages and the home page`);
