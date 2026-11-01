// Guidance for studying in Korea. Each section names its official source; facts
// that change every year (dates, amounts, exact document lists) are not stated
// as numbers here — learners are sent to the official notice instead.

const t = (uz, en, ru) => ({ uz, en, ru });

export const OFFICIAL_LINKS = {
  studyInKorea: { url: "https://www.studyinkorea.go.kr", name: "Study in Korea (NIIED)" },
  gks: { url: "https://www.studyinkorea.go.kr", name: "GKS — Study in Korea (NIIED)" },
  visaPortal: { url: "https://www.visa.go.kr", name: "Korea Visa Portal" },
  hikorea: { url: "https://www.hikorea.go.kr", name: "HiKorea" },
  embassy: { url: "https://overseas.mofa.go.kr/uz-ko/index.do", name: t("Koreya Respublikasining O'zbekistondagi elchixonasi", "Embassy of the Republic of Korea in Uzbekistan", "Посольство Республики Корея в Узбекистане") },
  topik: { url: "https://www.topik.go.kr", name: "TOPIK (NIIED)" },
  ieqas: { url: "https://www.moj.go.kr/bbs/moj/182/603491/artclView.do", name: t("Adliya va Ta'lim vazirliklari e'loni, 2026-02-12", "MOJ & MOE announcement, 2026-02-12", "Объявление Минюста и Минобразования, 12.02.2026") },
};

export const TOPIK_GUIDE = {
  source: OFFICIAL_LINKS.ieqas,
  points: [
    t(
      "Har bir universitet o'z TOPIK talabini o'zi belgilaydi — aniq talab universitetning qabul qo'llanmasida (모집요강) bo'ladi.",
      "Each university sets its own TOPIK requirement — the exact level is in its admission guide (모집요강).",
      "Каждый вуз сам устанавливает требование TOPIK — точный уровень указан в его правилах приёма (모집요강).",
    ),
    t(
      "Davlat sertifikatlashi (IEQAS) mezonida yangi qabul qilingan talabalar uchun TOPIK 3 va undan yuqori, o'qiyotganlar uchun TOPIK 4 va undan yuqori ko'rsatkich hisobga olinadi. Shuning uchun ko'p universitetlar bakalavriatga kamida TOPIK 3 so'raydi.",
      "The government certification (IEQAS) counts new students with TOPIK 3 or higher and enrolled students with TOPIK 4 or higher, so many universities ask for at least TOPIK 3 for a bachelor's degree.",
      "Государственная сертификация (IEQAS) учитывает новых студентов с TOPIK 3 и выше и обучающихся с TOPIK 4 и выше, поэтому многие вузы требуют для бакалавриата минимум TOPIK 3.",
    ),
    t(
      "Til kursiga (어학연수, D-4 viza) odatda TOPIK talab qilinmaydi — u aynan tilni o'rganish uchun.",
      "Language programs (어학연수, D-4 visa) usually don't require TOPIK — they are for learning the language.",
      "Для языковых курсов (어학연수, виза D-4) TOPIK обычно не нужен — они как раз для изучения языка.",
    ),
  ],
};

export const IEQAS_GUIDE = {
  source: OFFICIAL_LINKS.ieqas,
  certified: t(
    "Sertifikatlangan universitet (IEQAS): talabalar vizasi soddalashtirilgan tartibda ko'rib chiqiladi.",
    "Certified university (IEQAS): student visas are screened in a simplified way.",
    "Сертифицированный вуз (IEQAS): студенческие визы рассматриваются по упрощённой процедуре.",
  ),
  excellent: t(
    "Eng yaxshi sertifikatlangan universitet: chet ellik talabalarni qo'llab-quvvatlashi alohida yuqori baholangan.",
    "Excellent certified university: specially recognised for supporting international students.",
    "Лучший сертифицированный вуз: особо отмечен за поддержку иностранных студентов.",
  ),
  scrutiny: t(
    "Viza tekshiruvi kuchaytirilgan universitet: 2026-yil kuzgi semestridan bir yil davomida yangi chet ellik talabalarga viza berish asosan to'xtatilgan. Bu yerga hujjat topshirishdan oldin yaxshilab o'ylang.",
    "Visa-scrutiny university: from the 2026 fall semester, visas for new international students are largely stopped for one year. Think carefully before applying here.",
    "Вуз с усиленной проверкой виз: с осеннего семестра 2026 года на один год выдача виз новым иностранным студентам в основном прекращена. Подумайте, прежде чем подавать сюда документы.",
  ),
  none: t(
    "Sertifikatlanmagan: viza umumiy tartibda, qo'shimcha tekshiruv bilan ko'rib chiqilishi mumkin.",
    "Not certified: visas follow the general procedure and may get extra checks.",
    "Не сертифицирован: визы оформляются в общем порядке, возможны дополнительные проверки.",
  ),
};

export const SCHOLARSHIPS = [
  {
    id: "gks-u",
    name: "GKS-U",
    title: t("GKS — bakalavriat (Koreya hukumati stipendiyasi)", "GKS — undergraduate (Korean Government Scholarship)", "GKS — бакалавриат (стипендия правительства Кореи)"),
    points: [
      t("To'liq o'qish to'lovi, oylik stipendiya, aviachipta, 1 yillik koreys tili kursi va tibbiy sug'urta.", "Full tuition, a monthly allowance, airfare, a one-year Korean language course and medical insurance.", "Полная оплата обучения, ежемесячная стипендия, авиабилет, годовой курс корейского и медстраховка."),
      t("Odatda 25 yoshgacha bo'lganlar, o'rtacha baho yuqori bo'lganlar topshiradi; abituriyent va ota-onasi Koreya fuqarosi bo'lmasligi kerak.", "Usually for applicants under 25 with high grades; neither the applicant nor the parents may hold Korean citizenship.", "Обычно для кандидатов до 25 лет с высоким средним баллом; ни кандидат, ни родители не должны иметь гражданство Кореи."),
      t("Ikki yo'l: elchixona orqali yoki universitet orqali. E'lon har yili kuzda chiqadi.", "Two tracks: through the embassy or through a university. The call opens every autumn.", "Два пути: через посольство или через вуз. Набор объявляется каждую осень."),
    ],
    season: "autumn",
    source: OFFICIAL_LINKS.gks,
  },
  {
    id: "gks-g",
    name: "GKS-G",
    title: t("GKS — magistratura va doktorantura", "GKS — master's and doctorate", "GKS — магистратура и докторантура"),
    points: [
      t("To'liq o'qish to'lovi, oylik stipendiya, aviachipta, til kursi, tadqiqot va tibbiy sug'urta xarajatlari.", "Full tuition, a monthly allowance, airfare, a language course, research and medical insurance support.", "Полная оплата обучения, стипендия, авиабилет, языковой курс, поддержка исследований и медстраховка."),
      t("Odatda 40 yoshgacha, bakalavr diplomi bilan; elchixona yoki universitet yo'li.", "Usually under 40 with a bachelor's degree; embassy or university track.", "Обычно до 40 лет с дипломом бакалавра; через посольство или вуз."),
      t("E'lon har yili bahor boshida chiqadi.", "The call opens every early spring.", "Набор объявляется каждую раннюю весну."),
    ],
    season: "spring",
    source: OFFICIAL_LINKS.gks,
  },
  {
    id: "university",
    name: "TOPIK",
    title: t("Universitet stipendiyalari (TOPIK darajasiga qarab)", "University scholarships (by TOPIK level)", "Стипендии вузов (по уровню TOPIK)"),
    points: [
      t("Ko'p universitetlar chet ellik talabalarga TOPIK darajasi yoki baholariga qarab o'qish to'lovidan chegirma beradi.", "Many universities give international students tuition discounts based on TOPIK level or grades.", "Многие вузы дают иностранным студентам скидку на обучение в зависимости от уровня TOPIK или оценок."),
      t("Chegirma miqdori har bir universitetda har xil — universitetning chet elliklar qabuli sahifasini tekshiring.", "The discount differs at every university — check its international admissions page.", "Размер скидки в каждом вузе свой — смотрите страницу приёма иностранцев."),
    ],
    source: OFFICIAL_LINKS.studyInKorea,
  },
];

export const VISA_STEPS = {
  source: [OFFICIAL_LINKS.visaPortal, OFFICIAL_LINKS.embassy, OFFICIAL_LINKS.hikorea],
  types: [
    { id: "D-4", title: t("D-4 — til kursi (어학연수)", "D-4 — language program (어학연수)", "D-4 — языковой курс (어학연수)") },
    { id: "D-2", title: t("D-2 — bakalavriat, magistratura, doktorantura", "D-2 — bachelor's, master's, doctorate", "D-2 — бакалавриат, магистратура, докторантура") },
  ],
  steps: [
    t("Universitetni tanlang va unga hujjat topshiring (til kursi yoki daraja).", "Choose a university and apply (language program or degree).", "Выберите вуз и подайте документы (языковой курс или программа)."),
    t("Universitet sizga standart qabul xati (표준입학허가서) beradi.", "The university issues a standard admission letter (표준입학허가서).", "Вуз выдаёт стандартное письмо о зачислении (표준입학허가서)."),
    t("Viza hujjatlarini yig'ing va elchixonaga topshiring. Ro'yxat va qabul tartibi elchixona e'lonida.", "Collect the visa documents and submit them to the embassy. The list and procedure are in the embassy's notice.", "Соберите документы на визу и подайте в посольство. Список и порядок — в объявлении посольства."),
    t("Viza chiqqach, Koreyaga kelib 90 kun ichida chet elliklar karta (외국인등록증) oling.", "After the visa is issued, come to Korea and get an alien registration card (외국인등록증) within 90 days.", "После выдачи визы приезжайте в Корею и в течение 90 дней получите карту иностранца (외국인등록증)."),
  ],
  // Typical documents; the embassy's current list decides.
  documents: [
    { id: "form", label: t("Viza ariza shakli va foto", "Visa application form and photo", "Анкета на визу и фото") },
    { id: "passport", label: t("Pasport (va nusxasi)", "Passport (and a copy)", "Паспорт (и копия)") },
    { id: "admission", label: t("Standart qabul xati (표준입학허가서)", "Standard admission letter (표준입학허가서)", "Стандартное письмо о зачислении (표준입학허가서)") },
    { id: "diploma", label: t("Oxirgi o'qish joyi diplomi — apostil bilan", "Your latest diploma — apostilled", "Диплом последнего места учёбы — с апостилем") },
    { id: "grades", label: t("Baholar varaqasi (transkript) — apostil bilan", "Transcript — apostilled", "Выписка оценок — с апостилем") },
    { id: "finance", label: t("Moliyaviy imkoniyat hujjati (bank qoldig'i)", "Proof of funds (bank balance)", "Подтверждение финансов (остаток на счёте)") },
    { id: "family", label: t("Oila tarkibi hujjati (ota-ona bilan qarindoshlik)", "Family relationship document", "Документ о составе семьи") },
    { id: "topik", label: t("TOPIK sertifikati (bo'lsa)", "TOPIK certificate (if you have one)", "Сертификат TOPIK (если есть)") },
    { id: "fee", label: t("Viza yig'imi", "Visa fee", "Визовый сбор") },
  ],
  warnings: [
    {
      text: t(
        "Ba'zi universitetlar O'zbekistondan kelganlar uchun bank qoldig'i ma'lumotnomasini faqat ma'lum bankdan (masalan, KDB) qabul qiladi.",
        "Some universities accept a bank-balance certificate from applicants from Uzbekistan only from a specific bank (for example KDB).",
        "Некоторые вузы принимают от абитуриентов из Узбекистана справку об остатке только из определённого банка (например, KDB).",
      ),
      source: { url: "https://uni.dongseo.ac.kr/ikle/index.php?pCode=MN3000036", name: "Dongseo University" },
    },
    {
      text: t(
        "O'zbekiston apostil yoki konsullik tasdig'i talab qilinadigan davlatlar ro'yxatida — diplom va oila hujjatlarini oldindan apostil qildiring.",
        "Uzbekistan is on the list of countries that need apostilled or consular-certified documents — get your diploma and family documents apostilled in advance.",
        "Узбекистан входит в список стран, где нужны апостиль или консульское заверение — заранее апостилируйте диплом и семейные документы.",
      ),
      source: { url: "https://ajou.ac.kr/gs/admission/visa.do", name: "Ajou University" },
    },
  ],
};

export const INTAKES = [
  {
    id: "spring",
    title: t("Bahorgi qabul (mart)", "Spring intake (March)", "Весенний набор (март)"),
    window: t("Hujjatlar odatda oldingi yilning sentyabr–noyabr oylarida qabul qilinadi.", "Applications usually run from September to November of the previous year.", "Документы обычно принимаются в сентябре–ноябре предыдущего года."),
    startMonth: 3,
    applyMonths: [9, 10, 11],
  },
  {
    id: "fall",
    title: t("Kuzgi qabul (sentyabr)", "Fall intake (September)", "Осенний набор (сентябрь)"),
    window: t("Hujjatlar odatda mart–may oylarida qabul qilinadi.", "Applications usually run from March to May.", "Документы обычно принимаются в марте–мае."),
    startMonth: 9,
    applyMonths: [3, 4, 5],
  },
];

export const REGIONS = {
  서울: t("Seul", "Seoul", "Сеул"),
  부산: t("Pusan", "Busan", "Пусан"),
  대구: t("Tegu", "Daegu", "Тэгу"),
  인천: t("Inchxon", "Incheon", "Инчхон"),
  광주: t("Kvanju", "Gwangju", "Кванджу"),
  대전: t("Tejon", "Daejeon", "Тэджон"),
  울산: t("Ulsan", "Ulsan", "Ульсан"),
  세종: t("Sejong", "Sejong", "Седжон"),
  경기: t("Kyonggi", "Gyeonggi", "Кёнгидо"),
  강원: t("Kanvon", "Gangwon", "Канвондо"),
  충북: t("Shimoliy Chxunchxon", "North Chungcheong", "Северная Чхунчхон"),
  충남: t("Janubiy Chxunchxon", "South Chungcheong", "Южная Чхунчхон"),
  전북: t("Shimoliy Cholla", "North Jeolla", "Северная Чолла"),
  전남: t("Janubiy Cholla", "South Jeolla", "Южная Чолла"),
  경북: t("Shimoliy Kyonsan", "North Gyeongsang", "Северная Кёнсан"),
  경남: t("Janubiy Kyonsan", "South Gyeongsang", "Южная Кёнсан"),
  제주: t("Chejudo", "Jeju", "Чеджу"),
};
