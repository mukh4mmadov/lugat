// Guides on Korean that people often search for: the alphabet, numbers and
// the TOPIK exam. The app shows them at /guides, and the build writes the same
// text as static pages for search engines (scripts/prerender-learning.mjs).
//
// A section is a heading and blocks:
//   { p: "text" }                         a paragraph
//   { list: ["text", ...] }               a bulleted list
//   { table: { head: [...], rows: [[...], ...], ko: 0 } }
//                                          a table; column `ko` is Korean and
//                                          can be listened to in the app
//   { links: [{ to: "/path", label }] }    links to other pages of the site

export const GUIDES = [
  {
    slug: "hangul",
    emoji: "가",
    title: "Koreys alifbosi (Hangul): harflar, o'qilishi va qoidalar",
    description: "Koreys alifbosi Hangul o'zbek tilida: 14 undosh va 10 unli, qo'shma unlilar, bo'g'in tuzilishi, batchim va asosiy o'qish qoidalari, misollar bilan.",
    intro: "Hangul (한글) — koreys tilining yozuvi. Uni 1443-yilda qirol Sejong yaratgan va 1446-yilda xalqqa e'lon qilgan. Hangulda 24 ta asosiy harf bor: 14 ta undosh va 10 ta unli. Harflar bo'g'in bloklariga birlashadi, shuning uchun alifboni bir-ikki kunda o'rganib, so'zlarni o'qiy boshlash mumkin.",
    sections: [
      {
        heading: "Asosiy undoshlar (14 ta)",
        blocks: [
          { p: "Lotin yozuvi Koreyaning rasmiy transliteratsiya qoidasiga mos. O'zbekcha talaffuz taxminiy: aniq tovushni har bir harfni eshitib o'rganing." },
          {
            table: {
              head: ["Harf", "Nomi", "Lotincha", "Qanday o'qiladi"],
              ko: 0,
              rows: [
                ["ㄱ", "기역", "g / k", "«g», so'z boshida «k» ga yaqin"],
                ["ㄴ", "니은", "n", "«n»"],
                ["ㄷ", "디귿", "d / t", "«d», so'z boshida «t» ga yaqin"],
                ["ㄹ", "리을", "r / l", "unlilar orasida «r», bo'g'in oxirida «l»"],
                ["ㅁ", "미음", "m", "«m»"],
                ["ㅂ", "비읍", "b / p", "«b», so'z boshida «p» ga yaqin"],
                ["ㅅ", "시옷", "s", "«s», ㅣ oldida «sh» ga yaqin"],
                ["ㅇ", "이응", "— / ng", "bo'g'in boshida o'qilmaydi, oxirida «ng»"],
                ["ㅈ", "지읒", "j", "«j» (o'zbekcha «j» kabi, «dj» ga yaqin)"],
                ["ㅊ", "치읓", "ch", "«ch», nafas bilan"],
                ["ㅋ", "키읔", "k", "«k», kuchli nafas bilan"],
                ["ㅌ", "티읕", "t", "«t», kuchli nafas bilan"],
                ["ㅍ", "피읖", "p", "«p», kuchli nafas bilan"],
                ["ㅎ", "히읗", "h", "«h»"],
              ],
            },
          },
        ],
      },
      {
        heading: "Asosiy unlilar (10 ta)",
        blocks: [
          {
            table: {
              head: ["Harf", "Lotincha", "Qanday o'qiladi"],
              ko: 0,
              rows: [
                ["ㅏ", "a", "«a»"],
                ["ㅑ", "ya", "«ya»"],
                ["ㅓ", "eo", "og'iz ochiq «o», o'zbekcha «o» ga yaqin"],
                ["ㅕ", "yeo", "«yo», og'iz ochiqroq"],
                ["ㅗ", "o", "lablar yumaloq, o'zbekcha «o'» ga yaqin"],
                ["ㅛ", "yo", "«yo'»"],
                ["ㅜ", "u", "«u»"],
                ["ㅠ", "yu", "«yu»"],
                ["ㅡ", "eu", "lablar cho'zilgan, «i» va «u» orasidagi tovush"],
                ["ㅣ", "i", "«i»"],
              ],
            },
          },
          { p: "Tik chiziqli unlilar (ㅏ ㅑ ㅓ ㅕ ㅣ) undoshning o'ng tomoniga, yotiq chiziqlilari (ㅗ ㅛ ㅜ ㅠ ㅡ) esa pastiga yoziladi: 가, 고." },
        ],
      },
      {
        heading: "Qo'shma unlilar (11 ta)",
        blocks: [
          {
            table: {
              head: ["Harf", "Lotincha", "Izoh"],
              ko: 0,
              rows: [
                ["ㅐ", "ae", "«e»; bugun ㅔ bilan deyarli bir xil o'qiladi"],
                ["ㅔ", "e", "«e»"],
                ["ㅒ", "yae", "«ye»"],
                ["ㅖ", "ye", "«ye»"],
                ["ㅘ", "wa", "«va», lablar yumaloq"],
                ["ㅙ", "wae", "«ve»"],
                ["ㅚ", "oe", "bugun ko'pincha «ve» deb o'qiladi"],
                ["ㅝ", "wo", "«vo»"],
                ["ㅞ", "we", "«ve»"],
                ["ㅟ", "wi", "«vi»"],
                ["ㅢ", "ui", "«ыи» ga yaqin; so'z o'rtasida ko'pincha «i»"],
              ],
            },
          },
        ],
      },
      {
        heading: "Qo'sh undoshlar (5 ta)",
        blocks: [
          { p: "Qo'sh undoshlar tarang, nafassiz va kuchliroq aytiladi. Ma'noni o'zgartiradi, shuning uchun farqini eshitib o'rganing: 달 (oy) — 딸 (qiz)." },
          {
            table: {
              head: ["Harf", "Lotincha", "Juftligi"],
              ko: 0,
              rows: [
                ["ㄲ", "kk", "ㄱ — ㅋ — ㄲ"],
                ["ㄸ", "tt", "ㄷ — ㅌ — ㄸ"],
                ["ㅃ", "pp", "ㅂ — ㅍ — ㅃ"],
                ["ㅆ", "ss", "ㅅ — ㅆ"],
                ["ㅉ", "jj", "ㅈ — ㅊ — ㅉ"],
              ],
            },
          },
        ],
      },
      {
        heading: "Bo'g'in qanday tuziladi",
        blocks: [
          {
            list: [
              "Har bir bo'g'in bitta blok: undosh + unli (가 = ㄱ + ㅏ) yoki undosh + unli + undosh (각 = ㄱ + ㅏ + ㄱ).",
              "Bo'g'in unli bilan boshlansa, oldiga o'qilmaydigan ㅇ yoziladi: 아, 오, 우.",
              "Bo'g'in oxiridagi undosh pastga yoziladi va «batchim» deyiladi: 한 = ㅎ + ㅏ + ㄴ.",
            ],
          },
          {
            table: {
              head: ["So'z", "Harflarga bo'linishi", "O'qilishi", "Ma'nosi"],
              ko: 0,
              rows: [
                ["한국", "ㅎ+ㅏ+ㄴ · ㄱ+ㅜ+ㄱ", "hanguk", "Koreya"],
                ["사람", "ㅅ+ㅏ · ㄹ+ㅏ+ㅁ", "saram", "odam"],
                ["학생", "ㅎ+ㅏ+ㄱ · ㅅ+ㅐ+ㅇ", "haksaeng", "talaba"],
              ],
            },
          },
        ],
      },
      {
        heading: "Batchim: bo'g'in oxiridagi undosh",
        blocks: [
          { p: "Bo'g'in oxirida undoshlar faqat 7 ta tovushdan biri bo'lib o'qiladi:" },
          {
            table: {
              head: ["Tovush", "Qaysi harflar", "Misol"],
              ko: 2,
              rows: [
                ["[k]", "ㄱ ㅋ ㄲ", "부엌 → [부억] bueok"],
                ["[n]", "ㄴ", "산 → san"],
                ["[t]", "ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ", "옷 → [옫] ot"],
                ["[l]", "ㄹ", "물 → mul"],
                ["[m]", "ㅁ", "밤 → bam"],
                ["[p]", "ㅂ ㅍ", "앞 → [압] ap"],
                ["[ng]", "ㅇ", "강 → gang"],
              ],
            },
          },
        ],
      },
      {
        heading: "Eng muhim o'qish qoidalari",
        blocks: [
          {
            list: [
              "Bog'lanish: batchimdan keyin unli bilan boshlangan bo'g'in kelsa, batchim keyingi bo'g'inga o'tib o'qiladi: 한국어 → [한구거] hangugeo, 음악 → [으막] eumak.",
              "Burun tovushiga aylanish: ㄱ, ㄷ, ㅂ batchimi ㄴ yoki ㅁ oldida [ㅇ], [ㄴ], [ㅁ] bo'lib o'qiladi: 합니다 → [함니다] hamnida, 감사합니다 → [감사함니다].",
              "ㅎ ning tushib qolishi: unlilar orasidagi ㅎ deyarli eshitilmaydi: 좋아요 → [조아요] joayo.",
              "ㄹ ning ta'siri: ㄴ va ㄹ yonma-yon kelsa, ikkalasi [ㄹㄹ] bo'ladi: 설날 → [설랄] seollal, 신라 → [실라] silla.",
            ],
          },
        ],
      },
      {
        heading: "Birinchi so'zlaringiz",
        blocks: [
          {
            table: {
              head: ["Koreyscha", "O'qilishi", "Ma'nosi"],
              ko: 0,
              rows: [
                ["안녕하세요", "annyeonghaseyo", "Assalomu alaykum"],
                ["감사합니다", "gamsahamnida", "Rahmat"],
                ["네", "ne", "Ha"],
                ["아니요", "aniyo", "Yo'q"],
                ["죄송합니다", "joesonghamnida", "Kechirasiz"],
                ["한국어", "hangugeo", "Koreys tili"],
                ["우즈베키스탄", "ujeubekiseutan", "O'zbekiston"],
              ],
            },
          },
        ],
      },
      {
        heading: "Keyingi qadam",
        blocks: [
          { p: "Harflarni o'rgangach, ularni so'zlarda mashq qiling: K-TALIM darslarida har bir so'zni eshitib, kartochka va testlar bilan yodlaysiz." },
          { links: [{ to: "/study/1", label: "1-darsni boshlash" }, { to: "/guides/korean-numbers", label: "Koreyscha raqamlar" }] },
        ],
      },
    ],
  },
  {
    slug: "korean-numbers",
    emoji: "🔢",
    title: "Koreyscha raqamlar: ikki tizim va qachon qaysi biri ishlatiladi",
    description: "Koreyscha raqamlar o'zbek tilida: xitoycha-koreyscha (il, i, sam) va sof koreyscha (hana, dul, set) sanoq, katta sonlar, sanoq so'zlari, soat, pul va sanani aytish.",
    intro: "Koreys tilida ikki xil sanoq tizimi bor: xitoydan kirgan xitoycha-koreyscha raqamlar (일, 이, 삼…) va sof koreyscha raqamlar (하나, 둘, 셋…). Qaysi birini ishlatish nimani sanayotganingizga bog'liq. Ikkalasini ham bilish kerak.",
    sections: [
      {
        heading: "Xitoycha-koreyscha raqamlar",
        blocks: [
          {
            table: {
              head: ["Raqam", "Koreyscha", "O'qilishi"],
              ko: 1,
              rows: [
                ["0", "영 / 공", "yeong / gong"],
                ["1", "일", "il"],
                ["2", "이", "i"],
                ["3", "삼", "sam"],
                ["4", "사", "sa"],
                ["5", "오", "o"],
                ["6", "육", "yuk"],
                ["7", "칠", "chil"],
                ["8", "팔", "pal"],
                ["9", "구", "gu"],
                ["10", "십", "sip"],
              ],
            },
          },
          { p: "Kattaroq sonlar qismlardan yig'iladi: 11 = 십일, 20 = 이십, 35 = 삼십오, 99 = 구십구. 100 «bitta yuz» emas, shunchaki 백 deyiladi." },
        ],
      },
      {
        heading: "Katta sonlar",
        blocks: [
          {
            table: {
              head: ["Son", "Koreyscha", "O'qilishi"],
              ko: 1,
              rows: [
                ["100", "백", "baek"],
                ["1 000", "천", "cheon"],
                ["10 000", "만", "man"],
                ["100 000", "십만", "simman"],
                ["1 000 000", "백만", "baengman"],
                ["100 000 000", "억", "eok"],
              ],
            },
          },
          { p: "Muhim farq: koreys tili sonlarni mingdan emas, o'n mingdan (만) guruhlaydi. 50 000 — «ellik ming» emas, 오만, ya'ni «besh man». 2026 = 이천이십육, 365 = 삼백육십오." },
        ],
      },
      {
        heading: "Sof koreyscha raqamlar",
        blocks: [
          {
            table: {
              head: ["Raqam", "Koreyscha", "O'qilishi", "Sanoq so'zi oldida"],
              ko: 1,
              rows: [
                ["1", "하나", "hana", "한"],
                ["2", "둘", "dul", "두"],
                ["3", "셋", "set", "세"],
                ["4", "넷", "net", "네"],
                ["5", "다섯", "daseot", "다섯"],
                ["6", "여섯", "yeoseot", "여섯"],
                ["7", "일곱", "ilgop", "일곱"],
                ["8", "여덟", "yeodeol", "여덟"],
                ["9", "아홉", "ahop", "아홉"],
                ["10", "열", "yeol", "열"],
                ["20", "스물", "seumul", "스무"],
                ["30", "서른", "seoreun", "서른"],
                ["40", "마흔", "maheun", "마흔"],
                ["50", "쉰", "swin", "쉰"],
                ["60", "예순", "yesun", "예순"],
                ["70", "일흔", "ilheun", "일흔"],
                ["80", "여든", "yeodeun", "여든"],
                ["90", "아흔", "aheun", "아흔"],
              ],
            },
          },
          { p: "Sof koreyscha raqamlar 99 gacha ishlatiladi: 11 = 열하나, 25 = 스물다섯. Sanoq so'zi oldida 1, 2, 3, 4 va 20 qisqaradi: 한 개, 두 명, 세 살, 스무 살." },
        ],
      },
      {
        heading: "Qachon qaysi biri ishlatiladi",
        blocks: [
          {
            list: [
              "Xitoycha-koreyscha: sana (2026년 11월 11일), pul (5 000원 = 오천 원), telefon raqami (010 = 공일공), daqiqa va soniya (30분 = 삼십 분), qavat (3층), dars va sahifa raqami (1과, 10쪽), matematika.",
              "Sof koreyscha: buyum va odamlarni sanash (사과 세 개, 학생 두 명), yosh (스무 살), soat (세 시), necha marta (한 번), necha oy davom etgani (두 달).",
            ],
          },
          { p: "Soat aytilganda ikkalasi birga keladi: soat sof koreyscha, daqiqa xitoycha-koreyscha. 3:30 = 세 시 삼십 분 (se si samsip bun)." },
        ],
      },
      {
        heading: "Ko'p ishlatiladigan sanoq so'zlari",
        blocks: [
          {
            table: {
              head: ["Sanoq so'zi", "Nimani sanaydi", "Raqam turi", "Misol"],
              ko: 0,
              rows: [
                ["개", "buyumlar", "sof koreyscha", "사과 두 개 — ikkita olma"],
                ["명", "odamlar", "sof koreyscha", "학생 세 명 — uchta talaba"],
                ["살", "yosh", "sof koreyscha", "스무 살 — 20 yosh"],
                ["시", "soat", "sof koreyscha", "다섯 시 — soat besh"],
                ["번", "marta", "sof koreyscha", "한 번 — bir marta"],
                ["권", "kitoblar", "sof koreyscha", "책 한 권 — bitta kitob"],
                ["마리", "hayvonlar", "sof koreyscha", "고양이 두 마리 — ikkita mushuk"],
                ["분", "daqiqa", "xitoycha-koreyscha", "십 분 — o'n daqiqa"],
                ["원", "von (pul)", "xitoycha-koreyscha", "만 원 — o'n ming von"],
                ["층", "qavat", "xitoycha-koreyscha", "삼 층 — uchinchi qavat"],
              ],
            },
          },
        ],
      },
      {
        heading: "Keyingi qadam",
        blocks: [
          { p: "Raqamlarni yodlashning eng yaxshi yo'li — ularni har kuni ishlatish: narxlarni, soatni va sanani koreyscha ayting. K-TALIM darslari va hikoyalarida raqamlar real gaplar ichida uchraydi." },
          { links: [{ to: "/study", label: "Darslar" }, { to: "/guides/hangul", label: "Koreys alifbosi (Hangul)" }] },
        ],
      },
    ],
  },
  {
    slug: "topik",
    emoji: "📝",
    title: "TOPIK nima va qanday topshiriladi: darajalar, tuzilish, tayyorgarlik",
    description: "TOPIK — koreys tilining rasmiy imtihoni: TOPIK I va TOPIK II tuzilishi, savollar, vaqt, darajalar uchun ballar, O'zbekistonda qayerda topshiriladi va qanday tayyorlanish kerak.",
    intro: "TOPIK (Test of Proficiency in Korean, 한국어능력시험) — koreys tilini bilish darajasini aniqlaydigan rasmiy imtihon. Uni Koreya Ta'lim vazirligi qoshidagi Milliy xalqaro ta'lim instituti (NIIED) o'tkazadi. TOPIK natijasi Koreya universitetlariga qabulda, stipendiyalarda va ishga kirishda talab qilinadi.",
    sections: [
      {
        heading: "TOPIK I va TOPIK II",
        blocks: [
          {
            list: [
              "TOPIK I — boshlang'ich daraja (1–2-daraja). Kundalik hayotdagi oddiy suhbat va matnlar.",
              "TOPIK II — o'rta va yuqori daraja (3–6-daraja). O'qish, ish va jamiyat mavzulari, yozma ish ham bor.",
            ],
          },
        ],
      },
      {
        heading: "Imtihon tuzilishi",
        blocks: [
          {
            table: {
              head: ["Imtihon", "Bo'lim", "Savollar", "Vaqt", "Ball"],
              rows: [
                ["TOPIK I", "Tinglash", "30 ta, test", "40 daqiqa", "100"],
                ["TOPIK I", "O'qish", "40 ta, test", "60 daqiqa", "100"],
                ["TOPIK II", "Tinglash", "50 ta, test", "60 daqiqa", "100"],
                ["TOPIK II", "Yozish", "4 ta topshiriq", "50 daqiqa", "100"],
                ["TOPIK II", "O'qish", "50 ta, test", "70 daqiqa", "100"],
              ],
            },
          },
          { p: "TOPIK I jami 200 ball, TOPIK II jami 300 ball. Test savollarida 4 ta javob varianti bo'ladi." },
        ],
      },
      {
        heading: "Darajalar uchun kerakli ball",
        blocks: [
          {
            table: {
              head: ["Imtihon", "Daraja", "Kerakli ball"],
              rows: [
                ["TOPIK I", "1-daraja", "200 dan 80+"],
                ["TOPIK I", "2-daraja", "200 dan 140+"],
                ["TOPIK II", "3-daraja", "300 dan 120+"],
                ["TOPIK II", "4-daraja", "300 dan 150+"],
                ["TOPIK II", "5-daraja", "300 dan 190+"],
                ["TOPIK II", "6-daraja", "300 dan 230+"],
              ],
            },
          },
          { p: "Natija e'lon qilingan kundan boshlab odatda 2 yil amal qiladi." },
        ],
      },
      {
        heading: "TOPIK nima uchun kerak",
        blocks: [
          {
            list: [
              "Koreya universitetlariga qabul: ko'p universitetlar ma'lum TOPIK darajasini talab qiladi, aniq talab universitet va yo'nalishga bog'liq.",
              "Stipendiyalar, masalan GKS, va universitetlarning o'z grantlari.",
              "Koreyada ish topish va ba'zi viza turlari.",
              "O'z darajangizni rasmiy hujjat bilan tasdiqlash.",
            ],
          },
          { links: [{ to: "/korea", label: "Koreya universitetlari va TOPIK talablari" }] },
        ],
      },
      {
        heading: "O'zbekistonda qanday topshiriladi",
        blocks: [
          {
            list: [
              "TOPIK yiliga bir necha marta o'tkaziladi. O'zbekistonda ro'yxatdan o'tish va imtihon tashkiloti Toshkentdagi Koreya ta'lim markazi orqali amalga oshiriladi: topiktashkec.uz.",
              "Imtihon Toshkentda va boshqa viloyat shaharlarida o'tkaziladi. Qaysi shaharlarda bo'lishi har bir imtihonda e'lon qilinadi.",
              "Imtihon qog'ozda (PBT) yoki kompyuterda (IBT) bo'lishi mumkin. Qaysi turi bo'lishini rasmiy e'londan tekshiring.",
              "Sanalar, ro'yxatdan o'tish muddati va narx har yili e'lon qilinadi va o'zgarib turadi. Ularni faqat rasmiy saytlardan oling: topik.go.kr va topiktashkec.uz.",
              "Ro'yxatdan o'tish odatda imtihondan bir necha oy oldin bo'ladi va joylar tez tugaydi, shuning uchun e'lonlarni oldindan kuzating.",
              "Natijalar topik.go.kr saytida e'lon qilinadi.",
            ],
          },
        ],
      },
      {
        heading: "Qanday tayyorlanish kerak",
        blocks: [
          {
            list: [
              "Avval darajangizni aniqlang: haqiqiy imtihon varag'ini vaqt bilan yechib ko'ring.",
              "So'z boyligini oshiring: TOPIK I uchun kundalik so'zlar va asosiy grammatika yetarli.",
              "Tinglashni har kuni mashq qiling: imtihonda har bir audio faqat bir yoki ikki marta eshittiriladi.",
              "Xatolaringizni tahlil qiling: qaysi turdagi savollarda ball yo'qotayotganingizni bilsangiz, tayyorgarlik tezlashadi.",
              "Imtihon oldidan kamida bir marta to'liq imtihonni vaqt bilan yeching.",
            ],
          },
          { p: "K-TALIM'da TOPIK I ning haqiqiy varaqlari asosida mock imtihonlar bor: vaqt bilan yoki bo'limma-bo'lim, natija va taxminiy daraja, xatolaringizni AI o'zbek tilida tushuntiradi. Har bir imtihonning muhim so'zlari ham alohida." },
          { links: [{ to: "/topik", label: "TOPIK I mock imtihonni boshlash" }, { to: "/grammar", label: "Grammatika" }, { to: "/study", label: "So'z yodlash" }] },
        ],
      },
      {
        heading: "Rasmiy manbalar",
        blocks: [
          { p: "Imtihon sanasi, narxi va qoidalari bo'yicha yakuniy ma'lumot faqat rasmiy saytlarda: topik.go.kr (TOPIK rasmiy sayti) va topiktashkec.uz (Toshkentdagi Koreya ta'lim markazi)." },
        ],
      },
    ],
  },
];

export const getGuide = (slug) => GUIDES.find((guide) => guide.slug === slug) || null;
