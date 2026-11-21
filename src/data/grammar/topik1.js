// Beginner grammar (TOPIK I, levels 1–2) that the K-TALIM lessons don't
// teach: NIKL 초급 items and forms seen in TOPIK I papers. Same shapes as
// course1A.js, plus `level: "topik1"` and a `group` (see TOPIK1_GROUPS);
// `lesson` is null. A `drill` is only set where grammarDrills can build a
// correct one from lesson words.

const t = (uz, en, ru) => ({ uz, en, ru });

export const TOPIK1_TEXT = {
  title: t("TOPIK I grammatikasi", "TOPIK I grammar", "Грамматика TOPIK I"),
  intro: t(
    "Darslarda o'tilmagan, lekin TOPIK I (1–2-daraja) imtihonida uchraydigan boshlang'ich grammatika. Mavzular turkumlarga bo'lingan.",
    "Beginner grammar that TOPIK I (levels 1–2) tests beyond the lessons above, grouped by type.",
    "Начальная грамматика, которая встречается в TOPIK I (уровни 1–2) помимо уроков выше. Темы разбиты по группам.",
  ),
};

export const TOPIK1_GROUPS = [
  { id: "particles", icon: "🔗", title: t("Qo'shimchalar (조사)", "Particles", "Частицы") },
  { id: "endings", icon: "🗣️", title: t("Gap oxiri va nutq uslublari", "Sentence endings and speech styles", "Окончания и стили речи") },
  { id: "connectors", icon: "🧩", title: t("Gaplarni bog'lash", "Connecting clauses", "Связь частей предложения") },
  { id: "modifiers", icon: "🏷️", title: t("Aniqlovchi va ravish", "Modifiers and adverbs", "Определения и наречия") },
  { id: "expressions", icon: "💡", title: t("Iboralar", "Expressions", "Выражения") },
  { id: "irregular", icon: "🔀", title: t("Noto'g'ri fe'llar", "Irregular verbs", "Неправильные глаголы") },
];

const point = (group, data) => ({ lesson: null, level: "topik1", group, ...data });

export default [
  // --- Particles ------------------------------------------------------------
  point("particles", {
    id: "topic-vs-subject", pattern: "은/는 vs 이/가",
    title: t("은/는 va 이/가 farqi", "은/는 vs 이/가", "은/는 и 이/가: разница"),
    explain: t(
      "Ikkalasi ham egani ko'rsatadi, lekin vazifasi boshqa. 이/가 yangi ma'lumotni, “kim? nima?” savoliga javobni belgilaydi. 은/는 esa allaqachon ma'lum mavzuni yoki boshqa narsaga qarshi qo'yishni bildiradi. Savol so'zlari (누가, 뭐가) doim 이/가 oladi.",
      "Both can mark the subject, but they do different jobs. 이/가 marks new information or the answer to “who?/what?”. 은/는 marks a topic that is already known, or a contrast with something else. Question words (누가, 뭐가) always take 이/가.",
      "Оба могут отмечать подлежащее, но роли у них разные. 이/가 выделяет новую информацию или ответ на вопрос «кто? что?». 은/는 отмечает уже известную тему или противопоставление. Вопросительные слова (누가, 뭐가) всегда берут 이/가.",
    ),
    rules: [
      ["누가 / 뭐가 → N이/가", "Savol va javobdagi yangi ma'lumot", "New information: question and answer", "Новая информация: вопрос и ответ"],
      ["N은/는 …, N은/는 …", "Qiyoslash, qarshi qo'yish", "Contrast between two things", "Противопоставление"],
      ["N은/는 + N이/가 + A", "Mavzu + uning belgisi: 저는 키가 커요", "Topic + its feature: 저는 키가 커요", "Тема + её признак: 저는 키가 커요"],
    ],
    examples: [
      ["누가 왔어요? — 민수가 왔어요.", "Kim keldi? — Minsu keldi.", "Who came? — Minsu did.", "Кто пришёл? — Минсу."],
      ["저는 커피를 좋아해요. 동생은 차를 좋아해요.", "Men qahvani yaxshi ko'raman, ukam esa choyni.", "I like coffee. My younger sibling likes tea.", "Я люблю кофе, а младший брат — чай."],
      ["저기 버스가 와요.", "Ana, avtobus kelyapti.", "Look, the bus is coming.", "Вон идёт автобус."],
      ["제 동생은 눈이 커요.", "Ukamning ko'zlari katta.", "My younger sibling has big eyes.", "У моего младшего брата большие глаза."],
      ["고기는 먹어요. 그런데 생선은 안 먹어요.", "Go'sht yeyman. Lekin baliq yemayman.", "Meat I eat. But fish I don't.", "Мясо я ем, а рыбу — нет."],
    ],
    mistakes: [
      ["누구는 왔어요?", "누가 왔어요?", t("누구 ega bo'lsa 누가 shakliga o'tadi va 은/는 olmaydi.", "When 누구 is the subject it becomes 누가; it never takes 은/는.", "누구 в роли подлежащего становится 누가 и не употребляется с 은/는.")],
      ["어? 비는 와요!", "어? 비가 와요!", t("Hozir ko'rib qolgan yangi holat — 이/가.", "Something you have just noticed is new information — 이/가.", "То, что вы только что заметили, — новая информация: 이/가.")],
    ],
    quiz: [
      ["___ 전화했어요?", ["누가", "누구는"], 0],
      ["저는 사과를 좋아해요. 언니___ 바나나를 좋아해요.", ["는", "가"], 0, t("Qiyoslash", "Contrast", "Противопоставление")],
      ["어? 밖에 눈___ 와요!", ["이", "은"], 0],
      ["저___ 머리가 아파요.", ["는", "가"], 0],
      ["교실에 누가 있어요? — 선생님___ 있어요.", ["이", "은"], 0],
    ],
  }),
  point("particles", {
    id: "possessive-ui", pattern: "N + 의",
    title: t("Qaratqich — 의", "Possessive — 의", "Притяжательная частица — 의"),
    explain: t(
      "Ikki otni bog'lab, birinchisi egasi ekanini bildiradi: 친구의 책 — do'stimning kitobi. Og'zaki nutqda 의 ko'pincha tushib qoladi (친구 책), aytilganda esa ko'pincha [에] deb talaffuz qilinadi. 저의 → 제, 나의 → 내, 너의 → 네 bo'lib qisqaradi.",
      "Links two nouns so that the first owns the second: 친구의 책 (my friend's book). In speech 의 is often dropped (친구 책), and when said it usually sounds like [에]. 저의 shortens to 제, 나의 to 내, 너의 to 네.",
      "Связывает два существительных: первое — владелец второго. 친구의 책 — книга друга. В речи 의 часто опускается (친구 책), а произносится обычно как [에]. 저의 сокращается до 제, 나의 — до 내, 너의 — до 네.",
    ),
    rules: [
      ["N1의 N2", "N1ning N2si", "N1's N2", "N2 (чей?) N1"],
      ["저의 → 제", "mening (hurmat bilan)", "my (polite)", "мой (вежливо)"],
      ["나의 → 내, 너의 → 네", "mening, sening (samimiy)", "my, your (casual)", "мой, твой (на «ты»)"],
    ],
    examples: [
      ["이것은 선생님의 가방이에요.", "Bu o'qituvchining sumkasi.", "This is the teacher's bag.", "Это сумка учителя."],
      ["제 동생은 고등학생이에요.", "Ukam litseyda o'qiydi.", "My younger sibling is a high school student.", "Мой младший брат — старшеклассник."],
      ["한국의 수도는 서울이에요.", "Koreyaning poytaxti — Seul.", "The capital of Korea is Seoul.", "Столица Кореи — Сеул."],
      ["친구 생일이 언제예요?", "Do'stingizning tug'ilgan kuni qachon?", "When is your friend's birthday?", "Когда день рождения у друга?"],
    ],
    mistakes: [
      ["제의 책", "제 책", t("제 allaqachon 저 + 의; unga yana 의 qo'shilmaydi.", "제 is already 저 + 의, so no second 의.", "제 — это уже 저 + 의, второй 의 не нужен.")],
    ],
    quiz: [
      ["이건 ___ 우산이에요.", ["제", "저"], 0, t("“mening”", "“my”", "«мой»")],
      ["이건 동생___ 휴대폰이에요.", ["의", "에"], 0],
      ["___ 친구는 한국 사람이에요.", ["내", "나"], 0, t("“mening” (samimiy)", "“my” (casual)", "«мой» (на «ты»)")],
      ["서울은 한국___ 수도예요.", ["의", "을"], 0],
    ],
  }),
  point("particles", {
    id: "also-do", pattern: "N + 도",
    title: t("“ham” — 도", "“also, too” — 도", "«тоже, и» — 도"),
    explain: t(
      "“…ham” ma'nosini beradi. 도 o'zi 이/가, 은/는, 을/를 o'rniga keladi: 저도, 커피도. 에, 에서, 에게 kabi qo'shimchalardan keyin esa ular saqlanib, 도 qo'shiladi: 학교에서도, 친구에게도. Inkor gapda “… ham emas” ma'nosida: 아무것도 없어요 — hech narsa yo'q.",
      "Means “also, too”. 도 replaces 이/가, 은/는 and 을/를: 저도, 커피도. After 에, 에서 or 에게 those stay and 도 is added: 학교에서도, 친구에게도. In negative sentences it means “not … either”, and 아무것도 없어요 means “there is nothing”.",
      "Значит «тоже, и». 도 заменяет 이/가, 은/는 и 을/를: 저도, 커피도. После 에, 에서, 에게 они сохраняются, а 도 добавляется: 학교에서도, 친구에게도. В отрицании — «тоже не»; 아무것도 없어요 — «ничего нет».",
    ),
    rules: [
      ["N도 (이/가, 은/는, 을/를 o'rnida)", "ularning o'rniga keladi", "replaces them", "заменяет их"],
      ["N에도 / N에서도 / N에게도", "ulardan keyin qo'shiladi", "is added after them", "добавляется после них"],
      ["아무것도 + 없다 / 안", "hech narsa", "nothing", "ничего"],
    ],
    examples: [
      ["저도 학생이에요.", "Men ham talabaman.", "I'm a student too.", "Я тоже студент."],
      ["사과를 샀어요. 바나나도 샀어요.", "Olma oldim. Banan ham oldim.", "I bought apples. I bought bananas too.", "Я купил яблоки. И бананы тоже."],
      ["주말에도 회사에 가요.", "Dam olish kunlari ham ishga boraman.", "I go to work on weekends too.", "Я хожу на работу и в выходные."],
      ["냉장고에 아무것도 없어요.", "Muzlatgichda hech narsa yo'q.", "There's nothing in the fridge.", "В холодильнике ничего нет."],
    ],
    mistakes: [
      ["저는도 가요.", "저도 가요.", t("도 은/는 o'rniga keladi, ular birga ishlatilmaydi.", "도 replaces 은/는; don't stack them.", "도 заменяет 은/는, вместе их не ставят.")],
      ["커피를도 마셔요.", "커피도 마셔요.", t("을/를 tushib qoladi.", "을/를 drops.", "을/를 опускается.")],
    ],
    quiz: [
      ["밥을 먹었어요. 빵___ 먹었어요.", ["도", "을"], 0],
      ["학교에서도 공부하고 ___ 공부해요.", ["집에서도", "집도"], 0],
      ["방에 아무것___ 없어요.", ["도", "만"], 0],
      ["언니가 키가 커요. 오빠___ 키가 커요.", ["도", "를"], 0],
    ],
  }),
  point("particles", {
    id: "only-man", pattern: "N + 만",
    title: t("“faqat” — 만", "“only” — 만", "«только» — 만"),
    explain: t(
      "“Faqat, …gina” ma'nosini beradi. 만 o'zi 이/가 va 을/를 o'rniga keladi (물만 마셔요), 에 va 에서 dan keyin esa qo'shiladi (집에서만). Ijobiy gapda ham, inkor gapda ham ishlatiladi.",
      "Means “only, just”. 만 replaces 이/가 and 을/를 (물만 마셔요) and is added after 에 or 에서 (집에서만). It works in both positive and negative sentences.",
      "Значит «только». 만 заменяет 이/가 и 을/를 (물만 마셔요), а после 에 и 에서 добавляется (집에서만). Употребляется и в утвердительных, и в отрицательных предложениях.",
    ),
    rules: [
      ["N만", "faqat N", "only N", "только N"],
      ["N에만 / N에서만", "faqat …da", "only at / in …", "только в …"],
      ["하나만 주세요", "Bittagina bering", "Just one, please", "Только одну, пожалуйста"],
    ],
    examples: [
      ["저는 아침에 커피만 마셔요.", "Ertalab faqat qahva ichaman.", "In the morning I only drink coffee.", "Утром я пью только кофе."],
      ["주말에만 운동해요.", "Faqat dam olish kunlari sport qilaman.", "I only exercise on weekends.", "Я занимаюсь спортом только по выходным."],
      ["동생만 집에 있어요.", "Uyda faqat ukam bor.", "Only my younger sibling is at home.", "Дома только младший брат."],
      ["잠깐만 기다려 주세요.", "Bir daqiqagina kuting.", "Please wait just a moment.", "Подождите минутку."],
    ],
    mistakes: [
      ["물을만 마셔요.", "물만 마셔요.", t("만 을/를 o'rniga keladi.", "만 replaces 을/를.", "만 заменяет 을/를.")],
    ],
    quiz: [
      ["저는 한국어___ 공부해요. 다른 언어는 안 배워요.", ["만", "도"], 0],
      ["이 식당은 ___ 문을 열어요.", ["점심에만", "점심만에"], 0],
      ["다른 사람은 다 왔어요. 민수___ 안 왔어요.", ["만", "도"], 0],
      ["하나___ 주세요.", ["만", "밖에"], 0],
    ],
  }),
  point("particles", {
    id: "only-bakke", pattern: "N + 밖에 + 없다 / 안 / 못",
    title: t("“… xolos” — 밖에", "“nothing but” — 밖에", "«всего лишь» — 밖에"),
    explain: t(
      "“Bor-yo'g'i …, faqat … xolos” degan ma'noni beradi, ko'pincha “kam, yetmaydi” degan his bilan. 밖에 dan keyin gap doim inkor bo'ladi: 없어요, 안 …, 못 …, 몰라요. Ma'nosi 만 ga yaqin, lekin 만 ijobiy fe'l bilan keladi.",
      "Means “only … (and that's not much)”. The verb after 밖에 is always negative: 없어요, 안 …, 못 …, 몰라요. The meaning is close to 만, but 만 goes with a positive verb.",
      "Значит «всего лишь …», часто с оттенком «мало». После 밖에 сказуемое всегда отрицательное: 없어요, 안 …, 못 …, 몰라요. По смыслу близко к 만, но 만 употребляется с утвердительным глаголом.",
    ),
    rules: [
      ["N밖에 없어요", "bor-yo'g'i N bor", "there is only N", "есть всего N"],
      ["N밖에 안 / 못 + V", "faqat N …di xolos", "only … (negative verb)", "только … (глагол с отрицанием)"],
      ["N만 있어요 = N밖에 없어요", "ma'nosi bir xil", "same meaning", "одно и то же"],
    ],
    examples: [
      ["지갑에 돈이 천 원밖에 없어요.", "Hamyonimda bor-yo'g'i ming von bor.", "I only have 1,000 won in my wallet.", "В кошельке всего тысяча вон."],
      ["어제 세 시간밖에 못 잤어요.", "Kecha atigi uch soat uxladim.", "I only got three hours of sleep last night.", "Вчера я спал всего три часа."],
      ["저는 한국어를 조금밖에 몰라요.", "Koreyschani ozgina bilaman xolos.", "I only know a little Korean.", "Я знаю корейский совсем немного."],
      ["교실에 학생이 두 명밖에 없어요.", "Sinfda bor-yo'g'i ikki talaba bor.", "There are only two students in the classroom.", "В классе всего два студента."],
    ],
    mistakes: [
      ["천 원밖에 있어요.", "천 원밖에 없어요.", t("밖에 dan keyin fe'l inkor bo'lishi shart.", "After 밖에 the verb must be negative.", "После 밖에 глагол должен быть отрицательным.")],
    ],
    quiz: [
      ["시간이 10분밖에 ___.", ["없어요", "있어요"], 0],
      ["저는 김치를 조금___ 안 먹어요.", ["밖에", "만"], 0],
      ["친구가 한 명___ 있어요.", ["만", "밖에"], 0],
      ["어제 한 시간밖에 공부 ___.", ["안 했어요", "했어요"], 0],
    ],
  }),
  point("particles", {
    id: "to-person", pattern: "N + 에게/한테 · 에게서/한테서",
    title: t("Kishiga / kishidan — 에게, 한테", "To / from a person — 에게, 한테", "Кому / от кого — 에게, 한테"),
    explain: t(
      "Harakat qaratilgan kishi yoki hayvonni bildiradi (“…ga”): 친구에게 선물을 줘요. 에게 yozma va rasmiyroq, 한테 og'zaki. Kattalarga 께 ishlatiladi. “Kishidan” ma'nosida 에게서/한테서. Joy va narsalar uchun esa 에: 회사에 전화해요.",
      "Marks the person or animal an action goes to: 친구에게 선물을 줘요 (I give my friend a present). 에게 is more written and formal, 한테 is spoken. For elders use 께. “From a person” is 에게서/한테서. Places and things take 에 instead: 회사에 전화해요.",
      "Обозначает человека или животное, к которому направлено действие: 친구에게 선물을 줘요 — дарю подарок другу. 에게 — письменный и официальный, 한테 — разговорный. Для старших — 께. «От кого» — 에게서/한테서. Для мест и предметов — 에: 회사에 전화해요.",
    ),
    rules: [
      ["사람 + 에게 / 한테", "kishiga", "to a person", "кому"],
      ["어른 + 께", "kattaga (hurmat bilan)", "to an elder (honorific)", "старшему (вежливо)"],
      ["사람 + 에게서 / 한테서", "kishidan", "from a person", "от кого"],
      ["장소, 물건 + 에", "joy yoki narsaga", "to a place or thing", "месту, предмету"],
    ],
    examples: [
      ["친구에게 이메일을 보냈어요.", "Do'stimga elektron xat yubordim.", "I sent an email to my friend.", "Я отправил письмо другу."],
      ["동생한테 전화할게요.", "Ukamga qo'ng'iroq qilaman.", "I'll call my younger sibling.", "Я позвоню младшему брату."],
      ["할머니께 꽃을 드렸어요.", "Buvimga gul sovg'a qildim.", "I gave my grandmother flowers.", "Я подарил бабушке цветы."],
      ["언니한테서 편지를 받았어요.", "Opamdan xat oldim.", "I got a letter from my older sister.", "Я получила письмо от старшей сестры."],
      ["강아지에게 밥을 줬어요.", "Kuchukchaga ovqat berdim.", "I fed the puppy.", "Я покормил щенка."],
    ],
    mistakes: [
      ["회사에게 전화했어요.", "회사에 전화했어요.", t("에게/한테 faqat odam va hayvonlar uchun; joy va tashkilotlarga 에.", "에게/한테 is only for people and animals; places and organisations take 에.", "에게/한테 — только для людей и животных; для мест и организаций — 에.")],
    ],
    quiz: [
      ["친구___ 생일 선물을 줬어요.", ["에게", "에"], 0],
      ["어제 학교___ 전화했어요.", ["에", "한테"], 0],
      ["친구___ 전화가 왔어요.", ["한테서", "한테"], 0, t("“…dan”", "“from”", "«от»")],
      ["할아버지___ 선물을 드렸어요.", ["께", "께서"], 0],
    ],
  }),
  point("particles", {
    id: "from-place", pattern: "N에서 N까지",
    title: t("…dan …gacha (joy) — 에서 ~ 까지", "From … to … (places) — 에서 ~ 까지", "От … до … (места) — 에서 ~ 까지"),
    explain: t(
      "Joy uchun “…dan …gacha” 에서 ~ 까지 bilan aytiladi: 집에서 학교까지. Vaqt uchun esa 부터 ~ 까지 (아홉 시부터 다섯 시까지). 에서 yolg'iz kelganda ham kelib chiqqan joyni bildiradi: 어디에서 왔어요? — qayerdan keldingiz?",
      "For places, “from … to …” is 에서 ~ 까지: 집에서 학교까지. For time it is 부터 ~ 까지 (아홉 시부터 다섯 시까지). On its own, 에서 can also mean “from” a place: 어디에서 왔어요? (Where are you from?)",
      "Для мест «от … до …» — 에서 ~ 까지: 집에서 학교까지. Для времени — 부터 ~ 까지 (아홉 시부터 다섯 시까지). Само по себе 에서 тоже может значить «откуда»: 어디에서 왔어요? — Откуда вы?",
    ),
    rules: [
      ["장소 + 에서 ~ 장소 + 까지", "…dan …gacha (joy)", "from … to … (place)", "от … до … (место)"],
      ["시간 + 부터 ~ 시간 + 까지", "…dan …gacha (vaqt)", "from … to … (time)", "с … до … (время)"],
      ["N에서 왔어요", "…dan keldim", "I come from …", "Я из …"],
    ],
    examples: [
      ["집에서 회사까지 지하철로 30분 걸려요.", "Uydan ishxonagacha metroda 30 daqiqa ketadi.", "It takes 30 minutes from home to work by subway.", "От дома до работы 30 минут на метро."],
      ["서울에서 부산까지 KTX로 가요.", "Seuldan Pusangacha KTXda boraman.", "I go from Seoul to Busan by KTX.", "Из Сеула в Пусан я еду на KTX."],
      ["저는 우즈베키스탄에서 왔어요.", "Men O'zbekistondan keldim.", "I'm from Uzbekistan.", "Я из Узбекистана."],
      ["여기에서 역까지 멀어요?", "Bu yerdan bekatgacha uzoqmi?", "Is it far from here to the station?", "Отсюда до станции далеко?"],
    ],
    mistakes: [
      ["집부터 학교까지", "집에서 학교까지", t("Joy uchun 에서, vaqt uchun 부터.", "Places take 에서, times take 부터.", "Для места — 에서, для времени — 부터.")],
    ],
    quiz: [
      ["공항___ 호텔까지 택시를 탔어요.", ["에서", "부터"], 0],
      ["월요일___ 금요일까지 일해요.", ["부터", "에서"], 0],
      ["학교에서 도서관___ 걸어서 5분이에요.", ["까지", "부터"], 0],
      ["어디___ 오셨어요?", ["에서", "까지"], 0],
    ],
  }),
  point("particles", {
    id: "each-mada", pattern: "N + 마다",
    title: t("“har …” — 마다", "“every” — 마다", "«каждый» — 마다"),
    explain: t(
      "Ot oxiriga qo'shilib “har …” ma'nosini beradi: 날마다 (har kuni), 주말마다 (har dam olish kuni), 사람마다 (har bir odam). Undan keyin 에 qo'shilmaydi. 매- bilan ma'nosi bir xil: 날마다 = 매일, 주마다 = 매주.",
      "Added to a noun to mean “every …”: 날마다 (every day), 주말마다 (every weekend), 사람마다 (each person). Don't add 에 after it. It means the same as 매-: 날마다 = 매일, 주마다 = 매주.",
      "Добавляется к существительному в значении «каждый»: 날마다 (каждый день), 주말마다 (каждые выходные), 사람마다 (у каждого человека). 에 после него не ставится. То же, что 매-: 날마다 = 매일, 주마다 = 매주.",
    ),
    rules: [
      ["N + 마다", "har N", "every N", "каждый N"],
      ["날마다 = 매일", "har kuni", "every day", "каждый день"],
      ["N시간마다 / N분마다", "har N soatda / daqiqada", "every N hours / minutes", "каждые N часов / минут"],
    ],
    examples: [
      ["저는 아침마다 산책해요.", "Har tongda sayr qilaman.", "I go for a walk every morning.", "Каждое утро я гуляю."],
      ["주말마다 부모님께 전화해요.", "Har dam olish kuni ota-onamga qo'ng'iroq qilaman.", "I call my parents every weekend.", "Каждые выходные я звоню родителям."],
      ["버스가 10분마다 와요.", "Avtobus har 10 daqiqada keladi.", "The bus comes every 10 minutes.", "Автобус ходит каждые 10 минут."],
      ["사람마다 생각이 달라요.", "Har kimning fikri har xil.", "Everyone thinks differently.", "У каждого своё мнение."],
    ],
    mistakes: [
      ["일요일마다에 수영해요.", "일요일마다 수영해요.", t("마다 dan keyin 에 qo'shilmaydi.", "No 에 after 마다.", "После 마다 не ставят 에.")],
    ],
    quiz: [
      ["저는 ___ 일곱 시에 일어나요.", ["날마다", "날에마다"], 0],
      ["이 약은 여섯 시간___ 드세요.", ["마다", "만"], 0],
      ["나라___ 문화가 달라요.", ["마다", "도"], 0],
      ["토요일___ 친구를 만나요.", ["마다", "마다에"], 0],
    ],
  }),
  point("particles", {
    id: "or-ina", pattern: "N + (이)나",
    title: t("“yoki” (otlar) — (이)나", "“or” between nouns — (이)나", "«или» между существительными — (이)나"),
    explain: t(
      "Ikki otdan birini tanlashni bildiradi: 커피나 차 — qahva yoki choy. Undosh bilan tugagan otdan keyin 이나, unlidan keyin 나. Fe'l va sifatlarni “yoki” bilan bog'lash uchun esa -거나 ishlatiladi.",
      "Offers a choice between nouns: 커피나 차 (coffee or tea). Use 이나 after a consonant and 나 after a vowel. To link verbs or adjectives with “or”, use -거나.",
      "Выражает выбор между существительными: 커피나 차 — кофе или чай. После согласной — 이나, после гласной — 나. Для глаголов и прилагательных используется -거나.",
    ),
    rules: [
      ["받침 O + 이나", "Undosh bilan tugasa", "Ends in a consonant", "Оканчивается на согласную"],
      ["받침 X + 나", "Unli bilan tugasa", "Ends in a vowel", "Оканчивается на гласную"],
    ],
    examples: [
      ["주말에 영화나 연극을 봐요.", "Dam olish kunlari kino yoki spektakl ko'raman.", "On weekends I watch a film or a play.", "По выходным я смотрю фильм или спектакль."],
      ["빵이나 과자를 사 오세요.", "Non yoki pechenye olib keling.", "Please buy some bread or snacks.", "Купите хлеба или печенья."],
      ["버스나 지하철로 오세요.", "Avtobus yoki metroda keling.", "Come by bus or subway.", "Приезжайте на автобусе или метро."],
      ["토요일이나 일요일에 만나요.", "Shanba yoki yakshanba kuni uchrashaylik.", "Let's meet on Saturday or Sunday.", "Давай встретимся в субботу или воскресенье."],
    ],
    mistakes: [
      ["책나 잡지", "책이나 잡지", t("책 undosh bilan tugaydi — 이나.", "책 ends in a consonant — 이나.", "책 оканчивается на согласную — 이나.")],
      ["영화를 보나 쉬어요.", "영화를 보거나 쉬어요.", t("Fe'llar -거나 bilan bog'lanadi.", "Verbs are linked with -거나.", "Глаголы соединяются через -거나.")],
    ],
    quiz: [
      ["물___ 주스를 주세요.", ["이나", "나"], 0],
      ["우유___ 커피를 마셔요.", ["나", "이나"], 0],
      ["빵___ 밥을 먹어요.", ["이나", "나"], 0],
      ["오늘___ 내일 전화할게요.", ["이나", "나"], 0],
    ],
  }),
  point("particles", {
    id: "like-cheoreom", pattern: "N + 처럼 / 같이",
    title: t("“…dek, …day” — 처럼", "“like” — 처럼 / 같이", "«как, словно» — 처럼 / 같이"),
    explain: t(
      "Ikki narsani o'xshatadi: 가수처럼 노래해요 — qo'shiqchidek kuylaydi. 처럼 va 같이 otga to'g'ridan-to'g'ri qo'shiladi va ma'nosi bir xil. Alohida turgan 같이 esa “birga” degani: 같이 가요.",
      "Compares two things: 가수처럼 노래해요 (sings like a singer). 처럼 and 같이 attach straight to the noun and mean the same. Standing on its own, 같이 means “together”: 같이 가요.",
      "Сравнивает: 가수처럼 노래해요 — поёт как певец. 처럼 и 같이 присоединяются прямо к существительному и значат одно и то же. Отдельно стоящее 같이 значит «вместе»: 같이 가요.",
    ),
    rules: [
      ["N처럼 = N같이", "N kabi, Ndek", "like N", "как N"],
      ["같이 + V", "birga", "together", "вместе"],
    ],
    examples: [
      ["동생이 인형처럼 귀여워요.", "Singlim qo'g'irchoqdek yoqimtoy.", "My little sister is as cute as a doll.", "Младшая сестра милая, как кукла."],
      ["한국 사람처럼 한국어를 잘하고 싶어요.", "Koreyslardek yaxshi gapirishni xohlayman.", "I want to speak Korean as well as a Korean.", "Хочу говорить по-корейски, как кореец."],
      ["오늘은 여름처럼 더워요.", "Bugun yozdagidek issiq.", "Today is as hot as summer.", "Сегодня жарко, как летом."],
      ["형은 아버지같이 키가 커요.", "Akam otamdek baland bo'yli.", "My older brother is tall like my father.", "Старший брат высокий, как отец."],
    ],
    mistakes: [
      ["가수가처럼", "가수처럼", t("처럼 dan oldin 이/가 qo'yilmaydi.", "No 이/가 before 처럼.", "Перед 처럼 не ставят 이/가.")],
    ],
    quiz: [
      ["눈이 별___ 반짝여요.", ["처럼", "보다"], 0],
      ["오늘은 봄___ 따뜻해요.", ["같이", "하고"], 0],
      ["친구하고 ___ 영화를 봤어요.", ["같이", "처럼"], 0],
      ["저도 선생님___ 친절한 사람이 되고 싶어요.", ["처럼", "마다"], 0],
    ],
  }),

  point("particles", {
    id: "approx-jjeum", pattern: "N + 쯤 / 정도",
    title: t("Taxminan — 쯤, 정도", "About, around — 쯤, 정도", "Примерно — 쯤, 정도"),
    explain: t(
      "Taxminiy miqdor, vaqt yoki narxni bildiradi: 세 시쯤 — soat uchlarda, 한 시간 정도 — bir soatcha. 쯤 oldingi so'zga qo'shib yoziladi, 정도 esa alohida. Ko'pincha bir-birining o'rnida keladi, lekin vaqt nuqtasi uchun (세 시쯤, 언제쯤) odatda 쯤 ishlatiladi.",
      "Marks an approximate amount, time or price: 세 시쯤 (around three o'clock), 한 시간 정도 (about an hour). 쯤 is written attached, 정도 with a space. They often swap, but for a point in time (세 시쯤, 언제쯤) 쯤 is the usual choice.",
      "Обозначает приблизительное количество, время или цену: 세 시쯤 — около трёх часов, 한 시간 정도 — примерно час. 쯤 пишется слитно, 정도 — раздельно. Часто взаимозаменяемы, но для момента времени (세 시쯤, 언제쯤) обычно берут 쯤.",
    ),
    rules: [
      ["N쯤", "…larda, …cha (taxminan)", "around, about", "около, примерно"],
      ["N 정도", "…cha (miqdor, davomiylik)", "about (amount, length)", "примерно (количество, длительность)"],
      ["언제쯤 / 얼마쯤", "taxminan qachon / qancha", "roughly when / how much", "примерно когда / сколько"],
    ],
    examples: [
      ["내일 세 시쯤 만나요.", "Ertaga soat uchlarda uchrashamiz.", "Let's meet around three tomorrow.", "Давайте встретимся завтра около трёх."],
      ["집에서 학교까지 30분 정도 걸려요.", "Uydan maktabgacha 30 daqiqacha ketadi.", "It takes about 30 minutes from home to school.", "От дома до школы примерно 30 минут."],
      ["언제쯤 한국에 가요?", "Taxminan qachon Koreyaga borasiz?", "Roughly when are you going to Korea?", "Примерно когда вы едете в Корею?"],
      ["사과를 열 개쯤 샀어요.", "O'ntacha olma sotib oldim.", "I bought about ten apples.", "Я купил около десяти яблок."],
      ["이 가방은 5만 원 정도예요.", "Bu sumka 50 ming von atrofida.", "This bag is about 50,000 won.", "Эта сумка стоит около 50 тысяч вон."],
    ],
    mistakes: [
      ["세 시 쯤", "세 시쯤", t("쯤 oldingi so'zga qo'shib yoziladi.", "쯤 is written attached to the word before it.", "쯤 пишется слитно с предыдущим словом.")],
    ],
    quiz: [
      ["몇 시___ 출발할까요?", ["쯤", "만"], 0],
      ["한 시간 ___ 기다렸어요.", ["정도", "마다"], 0],
      ["우리 반 학생은 스무 명___ 돼요.", ["쯤", "에서"], 0],
      ["___ 도착해요? — 다섯 시쯤 도착해요.", ["언제쯤", "어디쯤"], 0],
    ],
  }),
  point("particles", {
    id: "each-ssik", pattern: "N + 씩 · N에 (birlik)",
    title: t("“…tadan” — 씩", "“… each” — 씩", "«По …» — 씩"),
    explain: t(
      "Teng bo'lingan yoki takrorlanadigan miqdorni bildiradi: 한 사람에 두 개씩 — har kishiga ikkitadan. Son va hisob so'zidan keyin qo'shiladi: 하나씩, 조금씩, 하루에 세 번씩. Birlik narxi esa 에 bilan aytiladi: 한 개에 천 원 — bittasi ming von.",
      "Shows an equal share or a repeated amount: 한 사람에 두 개씩 (two each per person). Add it after a number and counter: 하나씩, 조금씩, 하루에 세 번씩. The price per unit uses 에: 한 개에 천 원 (a thousand won each).",
      "Показывает равную долю или повторяющееся количество: 한 사람에 두 개씩 — по два на человека. Ставится после числа со счётным словом: 하나씩, 조금씩, 하루에 세 번씩. Цена за единицу передаётся через 에: 한 개에 천 원 — тысяча вон за штуку.",
    ),
    rules: [
      ["수 + 단위 + 씩", "…tadan", "… each", "по …"],
      ["N에 + 수", "har … ga (birlik)", "per …", "за / в (единицу)"],
      ["조금씩, 하나씩", "ozdan-ozdan, bittadan", "little by little, one by one", "понемногу, по одному"],
    ],
    examples: [
      ["사과를 한 사람에 두 개씩 주세요.", "Har kishiga ikkitadan olma bering.", "Please give two apples to each person.", "Дайте каждому по два яблока."],
      ["이 약은 하루에 세 번씩 드세요.", "Bu dorini kuniga uch martadan iching.", "Take this medicine three times a day.", "Принимайте это лекарство три раза в день."],
      ["한국어 실력이 조금씩 늘어요.", "Koreys tilim ozdan-ozdan yaxshilanyapti.", "My Korean is improving little by little.", "Мой корейский понемногу улучшается."],
      ["이 귤은 한 개에 500원이에요.", "Bu mandarinning bittasi 500 von.", "These tangerines are 500 won each.", "Эти мандарины по 500 вон за штуку."],
      ["한 명씩 들어오세요.", "Bittadan kiring.", "Come in one at a time.", "Заходите по одному."],
    ],
    mistakes: [
      ["두 개 씩", "두 개씩", t("씩 qo'shib yoziladi.", "씩 is written attached.", "씩 пишется слитно.")],
    ],
    quiz: [
      ["학생들에게 공책을 두 권___ 나눠 줬어요.", ["씩", "쯤"], 0],
      ["이 사과는 한 개___ 천 원이에요.", ["에", "를"], 0],
      ["매일 단어를 열 개___ 외워요.", ["씩", "의"], 0],
      ["물을 조금___ 마시세요.", ["씩", "도"], 0],
    ],
  }),
  point("particles", {
    id: "called-irago", pattern: "N + (이)라고 하다",
    title: t("Ism va nom — (이)라고 하다", "Names — (이)라고 하다", "Имя и название — (이)라고 하다"),
    explain: t(
      "Ism yoki nomni aytish uchun: 저는 알리라고 합니다 — mening ismim Ali. Unli bilan tugagan otga 라고, undoshga 이라고. Narsaning koreyscha nomini so'rash: 이것을 한국어로 뭐라고 해요? — Buni koreyschada nima deyiladi?",
      "Gives a name or what something is called: 저는 알리라고 합니다 (My name is Ali). Nouns ending in a vowel take 라고, in a consonant 이라고. To ask for a word: 이것을 한국어로 뭐라고 해요? (What is this called in Korean?)",
      "Называет имя или название: 저는 알리라고 합니다 — меня зовут Али. После гласной — 라고, после согласной — 이라고. Спросить слово: 이것을 한국어로 뭐라고 해요? — Как это называется по-корейски?",
    ),
    rules: [
      ["받침 X + 라고 하다", "Unli bilan tugasa", "Vowel-final noun", "Существительное на гласную"],
      ["받침 O + 이라고 하다", "Undosh bilan tugasa", "Consonant-final noun", "Существительное на согласную"],
      ["뭐라고 해요?", "Nima deyiladi?", "What is it called?", "Как называется?"],
    ],
    examples: [
      ["처음 뵙겠습니다. 저는 사라라고 합니다.", "Tanishganimdan xursandman. Ismim Sara.", "Nice to meet you. My name is Sara.", "Очень приятно. Меня зовут Сара."],
      ["이 음식은 비빔밥이라고 해요.", "Bu taom bibimbap deb ataladi.", "This dish is called bibimbap.", "Это блюдо называется пибимпап."],
      ["'Thank you'를 한국어로 뭐라고 해요?", "'Thank you' koreyschada nima deyiladi?", "How do you say 'thank you' in Korean?", "Как по-корейски «thank you»?"],
      ["제 고향은 사마르칸트라고 하는 도시예요.", "Mening yurtim Samarqand degan shahar.", "My hometown is a city called Samarkand.", "Мой родной город называется Самарканд."],
    ],
    mistakes: [
      ["저는 민준라고 합니다", "저는 민준이라고 합니다", t("Undosh bilan tugagan ismga 이라고.", "Names ending in a consonant take 이라고.", "После имени на согласную — 이라고.")],
    ],
    quiz: [
      ["제 이름은 김지수___ 합니다.", ["라고", "이라고"], 0],
      ["이 산은 한라산___ 해요.", ["라고", "이라고"], 1],
      ["이건 한국어로 ___ 해요?", ["뭐라고", "뭐를"], 0],
      ["저는 아크말___ 합니다.", ["라고", "이라고"], 1],
    ],
  }),
  point("particles", {
    id: "become-doeda", pattern: "N + 이/가 되다",
    title: t("“…bo'lmoq” — 이/가 되다", "“To become” — 이/가 되다", "«Стать» — 이/가 되다"),
    explain: t(
      "“…bo'lmoq” (kasb, holat, yosh, yangi vaqt): 의사가 되고 싶어요 — shifokor bo'lmoqchiman. Ot 을/를 emas, 이/가 oladi. 되다 hozirgi zamonda 돼요, o'tganda 됐어요.",
      "“To become” (a job, a state, an age, a new season or time): 의사가 되고 싶어요 (I want to become a doctor). The noun takes 이/가, not 을/를. 되다 becomes 돼요 in the present and 됐어요 in the past.",
      "«Стать» (профессия, состояние, возраст, наступление времени): 의사가 되고 싶어요 — хочу стать врачом. Существительное берёт 이/가, а не 을/를. 되다 → 돼요 в настоящем, 됐어요 в прошедшем.",
    ),
    rules: [
      ["N이/가 되다", "…bo'lmoq", "to become N", "стать N"],
      ["되다 → 돼요 / 됐어요", "hozir / o'tgan", "present / past", "настоящее / прошедшее"],
      ["N이/가 되면", "…bo'lganda", "when it becomes N", "когда наступит / станет N"],
    ],
    examples: [
      ["저는 커서 선생님이 되고 싶어요.", "Katta bo'lsam o'qituvchi bo'lmoqchiman.", "I want to become a teacher when I grow up.", "Когда вырасту, хочу стать учителем."],
      ["벌써 봄이 됐어요.", "Allaqachon bahor keldi.", "It's already spring.", "Уже наступила весна."],
      ["제 동생은 올해 스무 살이 됐어요.", "Ukam bu yil yigirma yoshga to'ldi.", "My younger sibling turned twenty this year.", "Младшему брату в этом году исполнилось двадцать."],
      ["얼음이 물이 됐어요.", "Muz suvga aylandi.", "The ice turned into water.", "Лёд превратился в воду."],
    ],
    mistakes: [
      ["의사를 되고 싶어요", "의사가 되고 싶어요", t("되다 oldidagi ot 이/가 oladi.", "The noun before 되다 takes 이/가.", "Существительное перед 되다 берёт 이/가.")],
      ["가수가 됬어요", "가수가 됐어요", t("To'g'ri yozilishi: 됐어요 (되었어요).", "The correct spelling is 됐어요 (되었어요).", "Правильно: 됐어요 (되었어요).")],
    ],
    quiz: [
      ["저는 요리사___ 되고 싶어요.", ["가", "를"], 0],
      ["내년에 대학생___ 돼요.", ["이", "을"], 0],
      ["어느새 겨울이 ___.", ["됐어요", "됬어요"], 0],
      ["친구가 경찰___ 됐어요.", ["이", "가"], 0],
    ],
  }),
  point("particles", {
    id: "same-diff", pattern: "N과/와 같다 · 다르다",
    title: t("Bir xil va boshqa — 같다, 다르다", "Same and different — 같다, 다르다", "Такой же и другой — 같다, 다르다"),
    explain: t(
      "Ikki narsani solishtiradi: 제 생각은 친구 생각과 같아요 — fikrim do'stimniki bilan bir xil. 다르다 — farq qilmoq (르 noto'g'ri fe'li: 달라요). Og'zakida 하고, (이)랑 ham ishlatiladi. Ot oldida: 같은 N — bir xil N, 다른 N — boshqa N.",
      "Compares two things: 제 생각은 친구 생각과 같아요 (My opinion is the same as my friend's). 다르다 means “to be different” (르-irregular: 달라요). In speech 하고 or (이)랑 also work. Before a noun: 같은 N (the same N), 다른 N (a different / another N).",
      "Сравнивает две вещи: 제 생각은 친구 생각과 같아요 — моё мнение такое же, как у друга. 다르다 — отличаться (неправильный на 르: 달라요). В разговоре также 하고, (이)랑. Перед существительным: 같은 N — тот же N, 다른 N — другой N.",
    ),
    rules: [
      ["N과/와 같다", "N bilan bir xil", "the same as N", "такой же, как N"],
      ["N과/와 다르다", "N dan farq qiladi", "different from N", "отличается от N"],
      ["같은 N / 다른 N", "bir xil N / boshqa N", "the same N / another N", "тот же N / другой N"],
    ],
    examples: [
      ["제 가방은 친구 가방과 같아요.", "Mening sumkam do'stimniki bilan bir xil.", "My bag is the same as my friend's.", "Моя сумка такая же, как у друга."],
      ["한국 음식은 우즈베키스탄 음식과 많이 달라요.", "Koreys taomlari o'zbek taomlaridan ancha farq qiladi.", "Korean food is very different from Uzbek food.", "Корейская еда сильно отличается от узбекской."],
      ["우리는 같은 반이에요.", "Biz bir sinfdamiz.", "We are in the same class.", "Мы в одном классе."],
      ["다른 색깔은 없어요?", "Boshqa rangi yo'qmi?", "Do you have it in another colour?", "А другого цвета нет?"],
      ["언니하고 저는 성격이 달라요.", "Opam bilan fe'l-atvorimiz har xil.", "My older sister and I have different personalities.", "У нас с сестрой разные характеры."],
    ],
    mistakes: [
      ["달르요", "달라요", t("다르다 — 르 noto'g'ri fe'l: 달라요.", "다르다 is 르-irregular: 달라요.", "다르다 — неправильный на 르: 달라요.")],
      ["친구를 같아요", "친구와 같아요", t("같다/다르다 oldidagi ot 과/와 (하고, 랑) oladi.", "The noun before 같다/다르다 takes 과/와 (하고, 랑).", "Перед 같다/다르다 существительное берёт 과/와 (하고, 랑).")],
    ],
    quiz: [
      ["제 생일은 동생 생일___ 같아요.", ["과", "을"], 0],
      ["이 책은 그 책과 ___. (다르다)", ["달라요", "다르어요"], 0],
      ["우리는 ___ 회사에 다녀요.", ["같은", "같아"], 0],
      ["이 신발 말고 ___ 신발을 보여 주세요.", ["다른", "달라"], 0],
    ],
  }),
  point("particles", {
    id: "amu-do", pattern: "아무 N도 · 아무나 · 아무거나",
    title: t("Hech kim / istalgan — 아무", "Nobody / anybody — 아무", "Никто / кто угодно — 아무"),
    explain: t(
      "아무 — “hech qanday / har qanday”. Inkor bilan: 아무도 안 왔어요 — hech kim kelmadi; 아무것도 안 먹었어요 — hech narsa yemadim. (이)나 bilan esa “farqi yo'q, istalgan”: 아무거나 괜찮아요 — istalgani bo'laveradi; 아무나 — istalgan kishi.",
      "아무 means “no … / any …”. With a negative: 아무도 안 왔어요 (Nobody came), 아무것도 안 먹었어요 (I didn't eat anything). With (이)나 it means “any at all”: 아무거나 괜찮아요 (Anything is fine), 아무나 (anyone).",
      "아무 — «никакой / любой». С отрицанием: 아무도 안 왔어요 — никто не пришёл; 아무것도 안 먹었어요 — ничего не ел. С (이)나 — «какой угодно»: 아무거나 괜찮아요 — подойдёт что угодно; 아무나 — кто угодно.",
    ),
    rules: [
      ["아무도 + 안 / 없다", "hech kim", "nobody", "никто"],
      ["아무것도 + 안 / 없다", "hech narsa", "nothing", "ничего"],
      ["아무 데도 + 안 가다", "hech qayerga", "nowhere", "никуда"],
      ["아무나 / 아무거나 / 아무 때나", "istalgan kishi / narsa / vaqt", "anyone / anything / any time", "кто / что / когда угодно"],
    ],
    examples: [
      ["교실에 아무도 없어요.", "Sinfda hech kim yo'q.", "There's nobody in the classroom.", "В классе никого нет."],
      ["아침에 아무것도 안 먹었어요.", "Ertalab hech narsa yemadim.", "I didn't eat anything this morning.", "Утром я ничего не ел."],
      ["주말에 아무 데도 안 갔어요.", "Dam olish kuni hech qayerga bormadim.", "I didn't go anywhere at the weekend.", "В выходные я никуда не ходил."],
      ["뭐 마실래요? — 아무거나 괜찮아요.", "Nima ichasiz? — Istalgani bo'laveradi.", "What would you like to drink? — Anything is fine.", "Что будете пить? — Что угодно."],
      ["아무 때나 전화하세요.", "Istalgan vaqtda qo'ng'iroq qiling.", "Call me any time.", "Звоните в любое время."],
    ],
    mistakes: [
      ["아무도 왔어요", "아무도 안 왔어요", t("아무도, 아무것도 doim inkor bilan keladi.", "아무도 and 아무것도 always go with a negative.", "아무도 и 아무것도 всегда употребляются с отрицанием.")],
      ["아무거도", "아무것도", t("To'g'ri shakli: 아무것도.", "The correct form is 아무것도.", "Правильно: 아무것도.")],
    ],
    quiz: [
      ["방에 ___ 없어요.", ["아무도", "아무나"], 0],
      ["배가 아파서 ___ 못 먹었어요.", ["아무것도", "아무거나"], 0],
      ["뭐 먹을까요? — ___ 좋아요.", ["아무거나", "아무것도"], 0],
      ["어제는 ___ 안 나갔어요.", ["아무 데도", "아무 데나"], 0],
    ],
  }),

  // --- Sentence endings and speech styles ------------------------------------
  point("endings", {
    id: "formal-seumnida", pattern: "V/A + (스)ㅂ니다 / (스)ㅂ니까?",
    title: t("Rasmiy uslub — (스)ㅂ니다", "Formal style — (스)ㅂ니다", "Официальный стиль — (스)ㅂ니다"),
    explain: t(
      "Yangiliklar, e'lonlar, taqdimot, ish joyi va TOPIK savollarida ishlatiladigan eng rasmiy shakl. Unli bilan tugagan o'zakka ㅂ니다, undosh bilan tugaganiga 습니다 qo'shiladi; savol shakli ㅂ니까?/습니까?. ㄹ bilan tugagan o'zakda ㄹ tushadi: 살다 → 삽니다. O'tgan zamon: 았/었습니다, ot bilan: 입니다.",
      "The most formal style, used in news, announcements, presentations, at work and in TOPIK questions. Vowel stems take ㅂ니다, consonant stems 습니다; questions end in ㅂ니까?/습니까?. ㄹ drops: 살다 → 삽니다. Past: 았/었습니다; with nouns: 입니다.",
      "Самый официальный стиль: новости, объявления, презентации, работа и задания TOPIK. К основе на гласную — ㅂ니다, на согласную — 습니다; вопрос — ㅂ니까?/습니까?. ㄹ выпадает: 살다 → 삽니다. Прошедшее: 았/었습니다; с существительными: 입니다.",
    ),
    rules: [
      ["받침 X + ㅂ니다 (갑니다)", "Unli bilan tugasa", "Vowel stem", "Основа на гласную"],
      ["받침 O + 습니다 (먹습니다)", "Undosh bilan tugasa", "Consonant stem", "Основа на согласную"],
      ["ㄹ 탈락 + ㅂ니다 (삽니다)", "ㄹ tushadi", "ㄹ drops", "ㄹ выпадает"],
      ["N + 입니다", "…dir (ot bilan)", "is (with a noun)", "является (с существительным)"],
      ["V/A-았/었습니다", "o'tgan zamon", "past", "прошедшее время"],
    ],
    examples: [
      ["안녕하십니까? 저는 알리입니다.", "Assalomu alaykum! Men Aliman.", "Hello. I am Ali.", "Здравствуйте! Я Али."],
      ["저는 무역 회사에서 일합니다.", "Men savdo kompaniyasida ishlayman.", "I work at a trading company.", "Я работаю в торговой компании."],
      ["오늘은 날씨가 아주 춥습니다.", "Bugun havo juda sovuq.", "It is very cold today.", "Сегодня очень холодно."],
      ["이번 역은 서울역입니다.", "Bu bekat — Seul vokzali.", "This stop is Seoul Station.", "Эта станция — Сеульский вокзал."],
      ["어제 무엇을 했습니까?", "Kecha nima qildingiz?", "What did you do yesterday?", "Что вы делали вчера?"],
    ],
    mistakes: [
      ["먹읍니다", "먹습니다", t("Undoshdan keyin 습니다 (읍니다 — eskirgan imlo).", "After a consonant it is 습니다 (읍니다 is an old spelling).", "После согласной — 습니다 (읍니다 — устаревшее написание).")],
      ["만들습니다", "만듭니다", t("ㄹ bilan tugagan o'zakda ㄹ tushib, ㅂ니다 qo'shiladi.", "ㄹ stems drop ㄹ and take ㅂ니다.", "У основ на ㄹ она выпадает и добавляется ㅂ니다.")],
    ],
    drill: { kind: "form", form: "formal" },
    quiz: [
      ["저는 매일 신문을 ___. (읽다)", ["읽습니다", "읽읍니다", "읽니다"], 0],
      ["우리 회사는 서울에 ___. (있다)", ["있습니다", "있읍니다"], 0],
      ["어디에 ___? (살다)", ["삽니까", "살습니까", "사습니까"], 0],
      ["이분은 김 선생님___.", ["입니다", "습니다"], 0],
      ["어제 친구를 ___. (만나다)", ["만났습니다", "만납니다"], 0, t("o'tgan zamon", "past", "прошедшее")],
    ],
  }),
  point("endings", {
    id: "formal-command", pattern: "V + (으)십시오 / (으)ㅂ시다",
    title: t("Rasmiy iltimos va taklif — (으)십시오, (으)ㅂ시다", "Formal requests and “let's” — (으)십시오, (으)ㅂ시다", "Официальная просьба и «давайте» — (으)십시오, (으)ㅂ시다"),
    explain: t(
      "(으)십시오 — (으)세요 ning rasmiy shakli: e'lonlar, ko'rsatmalar va TOPIK topshiriqlarida uchraydi (고르십시오 — tanlang). (으)ㅂ시다 — “…aylik” degan rasmiy taklif: 같이 갑시다. Unli bilan tugagan o'zakka 십시오/ㅂ시다, undoshga 으십시오/읍시다. Kattalarga (으)ㅂ시다 deyilmaydi — ularga (으)ㄹ까요? qulayroq.",
      "(으)십시오 is the formal version of (으)세요, seen in announcements, instructions and TOPIK tasks (고르십시오 — choose). (으)ㅂ시다 is a formal “let's”: 같이 갑시다. Vowel stems take 십시오/ㅂ시다, consonant stems 으십시오/읍시다. Don't say (으)ㅂ시다 to an elder; (으)ㄹ까요? is safer.",
      "(으)십시오 — официальный вариант (으)세요: объявления, инструкции, задания TOPIK (고르십시오 — выберите). (으)ㅂ시다 — официальное «давайте»: 같이 갑시다. К основе на гласную — 십시오/ㅂ시다, на согласную — 으십시오/읍시다. Старшим (으)ㅂ시다 не говорят — лучше (으)ㄹ까요?",
    ),
    rules: [
      ["받침 X + 십시오 / ㅂ시다", "Unli bilan tugasa: 가십시오, 갑시다", "Vowel stem: 가십시오, 갑시다", "Основа на гласную: 가십시오, 갑시다"],
      ["받침 O + 으십시오 / 읍시다", "Undosh bilan tugasa: 앉으십시오, 앉읍시다", "Consonant stem: 앉으십시오, 앉읍시다", "Основа на согласную: 앉으십시오, 앉읍시다"],
      ["만들다 → 만드십시오 / 만듭시다", "ㄹ tushadi", "ㄹ drops", "ㄹ выпадает"],
      ["V-지 마십시오", "…mang (rasmiy)", "don't (formal)", "не … (официально)"],
    ],
    examples: [
      ["알맞은 것을 고르십시오.", "To'g'ri javobni tanlang.", "Choose the correct answer.", "Выберите правильный ответ."],
      ["여기에 앉으십시오.", "Bu yerga o'tiring.", "Please have a seat here.", "Садитесь сюда, пожалуйста."],
      ["시간이 없습니다. 빨리 갑시다.", "Vaqt yo'q. Tezroq boraylik.", "There's no time. Let's go quickly.", "Времени нет. Пойдёмте быстрее."],
      ["다음 주에 다시 만납시다.", "Kelasi hafta yana uchrashaylik.", "Let's meet again next week.", "Давайте встретимся на следующей неделе."],
      ["수업 시간에 휴대폰을 사용하지 마십시오.", "Dars paytida telefondan foydalanmang.", "Do not use your phone during class.", "Не пользуйтесь телефоном на уроке."],
    ],
    mistakes: [
      ["앉십시오", "앉으십시오", t("앉다 undosh bilan tugaydi — 으십시오.", "앉다 ends in a consonant — 으십시오.", "앉다 оканчивается на согласную — 으십시오.")],
      ["선생님, 같이 갑시다.", "선생님, 같이 가실까요?", t("(으)ㅂ시다 kattaga qo'pol eshitiladi.", "(으)ㅂ시다 sounds rude to an elder.", "Старшему (으)ㅂ시다 звучит грубовато.")],
    ],
    drill: { kind: "form", form: "formalCommand", chosen: true, label: "V-(으)십시오" },
    quiz: [
      ["다음 글을 잘 ___. (읽다)", ["읽으십시오", "읽십시오"], 0],
      ["여기에서 사진을 찍지 ___.", ["마십시오", "않십시오"], 0],
      ["점심시간이에요. 같이 ___. (먹다)", ["먹읍시다", "먹습시다"], 0],
      ["케이크를 같이 ___. (만들다)", ["만듭시다", "만들읍시다"], 0],
      ["잠시만 ___. (기다리다)", ["기다리십시오", "기다리으십시오"], 0],
    ],
  }),
  point("endings", {
    id: "copula-negative", pattern: "N + 이/가 아니에요",
    title: t("“…emas” — 이/가 아니에요", "“is not” — 이/가 아니에요", "«не является» — 이/가 아니에요"),
    explain: t(
      "이에요/예요 ning inkori. Otga 이 (undoshdan keyin) yoki 가 (unlidan keyin) qo'shilib, keyin 아니에요 keladi: 학생이 아니에요 — talaba emasman. Rasmiy shakli 아닙니다. “Yo'q, mavjud emas” ma'nosi uchun esa 없어요 ishlatiladi.",
      "The negative of 이에요/예요. Add 이 (after a consonant) or 가 (after a vowel) to the noun, then 아니에요: 학생이 아니에요 (I'm not a student). Formal: 아닙니다. For “there isn't”, use 없어요 instead.",
      "Отрицание 이에요/예요. К существительному добавляется 이 (после согласной) или 가 (после гласной), затем 아니에요: 학생이 아니에요 — я не студент. Официально: 아닙니다. Для «нет, отсутствует» — 없어요.",
    ),
    rules: [
      ["받침 O + 이 아니에요", "Undosh bilan tugasa", "Ends in a consonant", "Оканчивается на согласную"],
      ["받침 X + 가 아니에요", "Unli bilan tugasa", "Ends in a vowel", "Оканчивается на гласную"],
      ["아니에요 / 아닙니다", "odatiy / rasmiy", "polite / formal", "вежливо / официально"],
    ],
    examples: [
      ["저는 중국 사람이 아니에요. 우즈베키스탄 사람이에요.", "Men xitoylik emasman. O'zbekistonlikman.", "I'm not Chinese. I'm from Uzbekistan.", "Я не китаец. Я из Узбекистана."],
      ["이건 제 가방이 아니에요.", "Bu mening sumkam emas.", "This isn't my bag.", "Это не моя сумка."],
      ["그 사람은 의사가 아니에요.", "U kishi shifokor emas.", "That person isn't a doctor.", "Тот человек не врач."],
      ["물이에요? — 아니요, 물이 아니에요.", "Bu suvmi? — Yo'q, suv emas.", "Is it water? — No, it isn't water.", "Это вода? — Нет, не вода."],
    ],
    mistakes: [
      ["의사이 아니에요", "의사가 아니에요", t("의사 unli bilan tugaydi — 가.", "의사 ends in a vowel — 가.", "의사 оканчивается на гласную — 가.")],
      ["학생이 안이에요", "학생이 아니에요", t("Ot 안 bilan emas, 아니에요 bilan inkor qilinadi.", "Nouns are negated with 아니에요, not 안.", "Существительное отрицается через 아니에요, а не 안.")],
    ],
    drill: { kind: "particle", type: "subject" },
    quiz: [
      ["저는 선생님___ 아니에요.", ["이", "가"], 0],
      ["이건 커피___ 아니에요. 차예요.", ["가", "이"], 0],
      ["가방이 있어요? — 아니요, ___.", ["없어요", "아니에요"], 0],
      ["그건 제 책이 ___.", ["아니에요", "안 이에요"], 0],
    ],
  }),
  point("endings", {
    id: "long-negation", pattern: "V/A + 지 않다 / 지 못하다",
    title: t("Uzun inkor — 지 않다, 지 못하다", "Long negation — 지 않다, 지 못하다", "Длинное отрицание — 지 않다, 지 못하다"),
    explain: t(
      "안 + fe'l va 못 + fe'l ning uzun shakli. O'zakka 지 않아요 (“…maydi”) yoki 지 못해요 (“…a olmaydi”) qo'shiladi: 가지 않아요 = 안 가요. Uzun shakl yozma va rasmiy nutqda ko'proq uchraydi. Sifatlar faqat 지 않다 bilan keladi.",
      "The long form of 안 + verb and 못 + verb. Add 지 않아요 (“don't”) or 지 못해요 (“can't”) to the stem: 가지 않아요 = 안 가요. The long form is more common in writing and formal speech. Adjectives only take 지 않다.",
      "Длинная форма отрицаний 안 + глагол и 못 + глагол. К основе добавляется 지 않아요 («не делаю») или 지 못해요 («не могу»): 가지 않아요 = 안 가요. Длинная форма чаще в письменной и официальной речи. Прилагательные — только с 지 않다.",
    ),
    rules: [
      ["V/A-지 않아요 = 안 + V/A", "…maydi, … emas", "does not", "не …"],
      ["V-지 못해요 = 못 + V", "…a olmaydi", "cannot", "не может"],
      ["V/A-지 않았어요 / V-지 못했어요", "o'tgan zamon", "past", "прошедшее время"],
    ],
    examples: [
      ["저는 술을 마시지 않아요.", "Men spirtli ichimlik ichmayman.", "I don't drink alcohol.", "Я не пью алкоголь."],
      ["오늘은 날씨가 춥지 않아요.", "Bugun havo sovuq emas.", "It isn't cold today.", "Сегодня не холодно."],
      ["바빠서 친구를 만나지 못했어요.", "Band bo'lganim uchun do'stim bilan uchrasha olmadim.", "I was busy, so I couldn't meet my friend.", "Я был занят и не смог встретиться с другом."],
      ["이 영화는 재미있지 않았어요.", "Bu film qiziq emas edi.", "This film wasn't interesting.", "Этот фильм был неинтересный."],
      ["주말에는 일하지 않습니다.", "Dam olish kunlari ishlamaymiz.", "We don't work on weekends.", "По выходным мы не работаем."],
    ],
    mistakes: [
      ["안 가지 않아요", "가지 않아요", t("안 va 지 않다 birga ishlatilmaydi — bittasini tanlang.", "Use either 안 or 지 않다, not both.", "Используйте либо 안, либо 지 않다, но не оба сразу.")],
      ["춥지 못해요", "춥지 않아요", t("Sifat 지 못하다 bilan kelmaydi.", "Adjectives don't take 지 못하다.", "Прилагательные не употребляются с 지 못하다.")],
    ],
    drill: { kind: "form", form: "negative", label: "V/A-지 않아요" },
    quiz: [
      ["저는 고기를 먹___ 않아요.", ["지", "고"], 0],
      ["다리가 아파서 걷지 ___.", ["못해요", "않아요"], 0, t("“…olmayman”", "“can't”", "«не могу»")],
      ["이 가방은 비싸지 ___.", ["않아요", "못해요"], 0],
      ["어제 숙제를 하지 ___.", ["못했어요", "못해요"], 0, t("“qila olmadim”", "“couldn't”", "«не смог»")],
      ["오늘은 ___ 않아요. (바쁘다)", ["바쁘지", "바빠지"], 0],
    ],
  }),
  point("endings", {
    id: "will-gess", pattern: "V/A + 겠",
    title: t("Niyat va taxmin — 겠", "Intention and guess — 겠", "Намерение и предположение — 겠"),
    explain: t(
      "1) So'zlovchining niyati: 제가 하겠습니다 — men qilaman. 2) Ko'rib-eshitgan narsaga qarab taxmin: 맛있겠어요 — mazali bo'lsa kerak. 3) Odobli tayyor iboralar: 알겠습니다 (tushundim), 모르겠어요 (bilmayman), 처음 뵙겠습니다. O'zakka to'g'ridan-to'g'ri qo'shiladi; ob-havo ma'lumotida ham ko'p uchraydi: 비가 오겠습니다.",
      "1) The speaker's intention: 제가 하겠습니다 (I will do it). 2) A guess from what you see or hear: 맛있겠어요 (that must be tasty). 3) Polite set phrases: 알겠습니다 (understood), 모르겠어요 (I don't know), 처음 뵙겠습니다. It attaches straight to the stem and is common in weather forecasts: 비가 오겠습니다.",
      "1) Намерение говорящего: 제가 하겠습니다 — я сделаю. 2) Предположение по увиденному или услышанному: 맛있겠어요 — наверное, вкусно. 3) Вежливые фразы: 알겠습니다 (понял), 모르겠어요 (не знаю), 처음 뵙겠습니다. Присоединяется прямо к основе; часто в прогнозах погоды: 비가 오겠습니다.",
    ),
    rules: [
      ["V-겠습니다 / 겠어요", "niyat (men …)", "intention (I will)", "намерение (я …)"],
      ["V/A-겠어요", "taxmin (…bo'lsa kerak)", "guess (must be)", "предположение (наверное)"],
      ["알겠습니다 · 모르겠어요", "tayyor iboralar", "set phrases", "устойчивые фразы"],
    ],
    examples: [
      ["제가 내일까지 보고서를 보내겠습니다.", "Hisobotni ertagacha yuboraman.", "I will send the report by tomorrow.", "Я отправлю отчёт до завтра."],
      ["와, 이 케이크 정말 맛있겠어요!", "Voy, bu tort juda mazali bo'lsa kerak!", "Wow, this cake must be really tasty!", "Ого, этот торт, наверное, очень вкусный!"],
      ["내일은 전국에 비가 오겠습니다.", "Ertaga butun mamlakatda yomg'ir yog'adi.", "Tomorrow it will rain across the country.", "Завтра по всей стране пройдут дожди."],
      ["죄송하지만 잘 모르겠어요.", "Kechirasiz, bilmadim.", "Sorry, I'm not sure.", "Извините, не знаю."],
      ["네, 알겠습니다.", "Xo'p, tushundim.", "Yes, understood.", "Да, понял."],
    ],
    mistakes: [
      ["저는 배가 고프겠어요.", "저는 배가 고파요.", t("O'z his-tuyg'ungiz haqida taxmin shakli ishlatilmaydi.", "Don't use the guessing 겠 about your own feelings.", "О своих ощущениях форму предположения не используют.")],
    ],
    quiz: [
      ["하루 종일 일했어요? 많이 ___.", ["피곤하겠어요", "피곤해요"], 0, t("Suhbatdosh haqida taxmin", "A guess about the listener", "Предположение о собеседнике")],
      ["사장님, 이 일은 제가 ___.", ["하겠습니다", "했겠습니다"], 0],
      ["이 문제 답이 뭐예요? — 저도 잘 ___.", ["모르겠어요", "알겠어요"], 0],
      ["내일 오후에는 눈이 ___.", ["오겠습니다", "왔겠습니다"], 0],
    ],
  }),
  point("endings", {
    id: "tag-jiyo", pattern: "V/A + 지요(죠)?",
    title: t("“…-ku, shundaymi?” — 지요", "“…, right?” — 지요/죠", "«…, правда?» — 지요/죠"),
    explain: t(
      "Suhbatdosh ham biladi yoki rozi bo'ladi deb o'ylagan narsani tasdiqlatish uchun: 오늘 덥지요? — bugun issiq-a? Javobda “albatta” ma'nosini beradi: 그럼요, 알지요. Og'zaki nutqda ko'pincha 죠 ga qisqaradi. Ot bilan: 학생이지요? / 의사죠?",
      "Checks something you think the listener knows or agrees with: 오늘 덥지요? (It's hot today, isn't it?). In answers it means “of course”: 그럼요, 알지요. In speech it shortens to 죠. With nouns: 학생이지요? / 의사죠?",
      "Используется, когда вы ждёте согласия или уверены, что собеседник знает: 오늘 덥지요? — Сегодня жарко, правда? В ответе — «конечно»: 그럼요, 알지요. В речи сокращается до 죠. С существительными: 학생이지요? / 의사죠?",
    ),
    rules: [
      ["V/A-지요? → 죠?", "…-ku? (tasdiq so'rash)", "…, right?", "…, правда?"],
      ["N이지요? / N(이)죠?", "ot bilan", "with a noun", "с существительным"],
      ["V/A-았/었지요?", "o'tgan zamon", "past", "прошедшее время"],
    ],
    examples: [
      ["한국어 공부가 재미있지요?", "Koreys tilini o'rganish qiziq-a?", "Studying Korean is fun, isn't it?", "Учить корейский интересно, правда?"],
      ["어제 많이 피곤했죠?", "Kecha juda charchadingiz-a?", "You were really tired yesterday, weren't you?", "Вчера вы очень устали, да?"],
      ["저분이 민수 씨 어머니죠?", "Anavi kishi Minsuning onasi-ku?", "That's Minsu's mother, isn't it?", "Это ведь мама Минсу?"],
      ["내일 시험이 있지요? — 네, 있어요.", "Ertaga imtihon bor-a? — Ha, bor.", "There's a test tomorrow, right? — Yes, there is.", "Завтра ведь экзамен? — Да."],
    ],
    mistakes: [
      ["학생지요?", "학생이지요?", t("Undosh bilan tugagan otga 이지요.", "Nouns ending in a consonant take 이지요.", "После согласной — 이지요.")],
    ],
    quiz: [
      ["날씨가 정말 ___? (좋다)", ["좋지요", "좋아지요"], 0],
      ["저분이 선생님___?", ["이시죠", "시죠"], 0],
      ["저 사람이 가수___?", ["죠", "이죠"], 0],
      ["어제 많이 ___? (피곤하다)", ["피곤했죠", "피곤했어죠"], 0],
    ],
  }),
  point("endings", {
    id: "want-lae", pattern: "V + (으)ㄹ래요",
    title: t("“…aman / …asizmi?” — (으)ㄹ래요", "“I'll have / Do you want to?” — (으)ㄹ래요", "«Буду / Не хочешь?» — (으)ㄹ래요"),
    explain: t(
      "Yaqin odamlar bilan suhbatda o'z xohishingizni aytish (저는 커피 마실래요 — men qahva ichaman) yoki boshqaning xohishini so'rash (같이 갈래요? — birga borasizmi?) uchun. Unli va ㄹ bilan tugagan o'zakka ㄹ래요, undoshga 을래요. Rasmiy vaziyatda (으)시겠어요? qulayroq.",
      "A friendly way to say what you feel like doing (저는 커피 마실래요 — I'll have coffee) or to ask what the listener wants (같이 갈래요? — Do you want to come along?). Vowel and ㄹ stems take ㄹ래요, consonant stems 을래요. In formal settings, (으)시겠어요? is better.",
      "Дружеский способ сказать, чего вам хочется (저는 커피 마실래요 — я буду кофе), или спросить о желании собеседника (같이 갈래요? — Пойдёшь со мной?). К основе на гласную и ㄹ — ㄹ래요, на согласную — 을래요. В официальной обстановке лучше (으)시겠어요?",
    ),
    rules: [
      ["받침 X, ㄹ + ㄹ래요", "Unli yoki ㄹ bilan tugasa", "Vowel or ㄹ stem", "Основа на гласную или ㄹ"],
      ["받침 O + 을래요", "Undosh bilan tugasa", "Consonant stem", "Основа на согласную"],
      ["V-(으)ㄹ래요?", "…asizmi? (taklif)", "Do you want to …?", "Не хочешь …?"],
    ],
    examples: [
      ["저는 비빔밥 먹을래요.", "Men bibimbap yeyman.", "I'll have bibimbap.", "Я буду пибимпап."],
      ["주말에 같이 영화 볼래요?", "Dam olish kuni birga kino ko'ramizmi?", "Do you want to see a film this weekend?", "Посмотрим вместе фильм в выходные?"],
      ["피곤해서 오늘은 집에서 쉴래요.", "Charchadim, bugun uyda dam olaman.", "I'm tired, so I'll rest at home today.", "Я устал, так что сегодня отдохну дома."],
      ["뭐 마실래요? — 저는 녹차요.", "Nima ichasiz? — Men ko'k choy.", "What would you like to drink? — Green tea for me.", "Что будешь пить? — Мне зелёный чай."],
    ],
    mistakes: [
      ["먹래요", "먹을래요", t("Undosh bilan tugagan o'zakka 을래요.", "Consonant stems take 을래요.", "К основе на согласную — 을래요.")],
    ],
    drill: { kind: "euForm", ending: "ㄹ래요" },
    quiz: [
      ["같이 점심 ___? (먹다)", ["먹을래요", "먹래요"], 0],
      ["저는 여기에서 ___. (기다리다)", ["기다릴래요", "기다리을래요"], 0],
      ["뭐 ___? (만들다)", ["만들래요", "만들을래요"], 0],
      ["창문 좀 ___? (닫다)", ["닫을래요", "닫래요"], 0],
    ],
  }),
  point("endings", {
    id: "wish", pattern: "V/A + (으)면 좋겠어요",
    title: t("“…sa yaxshi bo'lardi” — (으)면 좋겠어요", "“I hope / I wish” — (으)면 좋겠어요", "«Хорошо бы …» — (으)면 좋겠어요"),
    explain: t(
      "Orzu yoki umidni bildiradi: 주말에 날씨가 좋으면 좋겠어요 — dam olish kuni havo yaxshi bo'lsa edi. (으)면 shakliga 좋겠어요 qo'shiladi. Kuchliroq istak uchun ko'pincha o'tgan zamon shakli ishlatiladi: 았/었으면 좋겠어요.",
      "Expresses a wish or hope: 주말에 날씨가 좋으면 좋겠어요 (I hope the weather is nice at the weekend). Add 좋겠어요 to the (으)면 form. For a stronger wish, the past form is common: 았/었으면 좋겠어요.",
      "Выражает желание или надежду: 주말에 날씨가 좋으면 좋겠어요 — хорошо бы в выходные была хорошая погода. К форме (으)면 добавляется 좋겠어요. Для более сильного желания часто берут прошедшую форму: 았/었으면 좋겠어요.",
    ),
    rules: [
      ["V/A-(으)면 좋겠어요", "…sa yaxshi bo'lardi", "I hope / it would be nice if", "хорошо бы"],
      ["V/A-았/었으면 좋겠어요", "kuchliroq istak", "a stronger wish", "более сильное желание"],
    ],
    examples: [
      ["빨리 방학이 되면 좋겠어요.", "Tezroq ta'til boshlansa edi.", "I wish the holidays would come soon.", "Скорее бы каникулы."],
      ["한국어를 잘했으면 좋겠어요.", "Koreyschani yaxshi bilsam edi.", "I wish I spoke Korean well.", "Хотелось бы хорошо говорить по-корейски."],
      ["내일은 비가 안 오면 좋겠어요.", "Ertaga yomg'ir yog'masa yaxshi bo'lardi.", "I hope it doesn't rain tomorrow.", "Хорошо бы завтра не было дождя."],
      ["집이 학교에서 가까우면 좋겠어요.", "Uy maktabga yaqin bo'lsa yaxshi bo'lardi.", "I wish my home were close to school.", "Хорошо бы дом был близко к школе."],
    ],
    mistakes: [
      ["시험에 합격하면 좋아요.", "시험에 합격하면 좋겠어요.", t("Orzu uchun 좋겠어요; 좋아요 umumiy fikrni bildiradi.", "For a wish use 좋겠어요; 좋아요 states a general fact.", "Для пожелания — 좋겠어요; 좋아요 — общее утверждение.")],
    ],
    drill: { kind: "euForm", ending: "면 좋겠어요" },
    quiz: [
      ["주말에 날씨가 ___ 좋겠어요. (좋다)", ["좋으면", "좋면"], 0],
      ["가족이 모두 건강하___ 좋겠어요.", ["면", "으면"], 0],
      ["한국에서 ___ 좋겠어요. (살다)", ["살면", "살으면"], 0],
      ["시험이 ___ 좋겠어요. (쉽다)", ["쉬우면", "쉽으면"], 0],
    ],
  }),
  point("endings", {
    id: "banmal", pattern: "반말: V/A + 아/어 · -자 · -니?",
    title: t("Samimiy uslub (반말)", "Casual speech (반말)", "Неформальный стиль (반말)"),
    explain: t(
      "Yaqin do'stlar, ukalar va bolalar bilan gaplashganda ishlatiladi. Eng oson yo'l — 아요/어요 shaklidan 요 ni olib tashlash: 가요 → 가, 먹었어요 → 먹었어. Ot bilan: 학생이야 / 친구야. “…aylik” — 자 (가자), so'roq — 니? yoki shunchaki 아/어? (먹었니? / 먹었어?). Notanish odamlar va kattalar bilan 반말 ishlatilmaydi.",
      "Used with close friends, younger siblings and children. The easy way: drop 요 from the 아요/어요 form: 가요 → 가, 먹었어요 → 먹었어. With nouns: 학생이야 / 친구야. “Let's” is 자 (가자); questions end in 니? or just 아/어? (먹었니? / 먹었어?). Never use 반말 with strangers or elders.",
      "Используется с близкими друзьями, младшими и детьми. Проще всего убрать 요 из формы 아요/어요: 가요 → 가, 먹었어요 → 먹었어. С существительными: 학생이야 / 친구야. «Давай» — 자 (가자), вопрос — 니? или просто 아/어? (먹었니? / 먹었어?). С незнакомыми и старшими 반말 не используют.",
    ),
    rules: [
      ["V/A-아/어 (요 tushadi)", "hozirgi zamon", "present", "настоящее время"],
      ["N이야 / N야", "ot bilan", "with a noun", "с существительным"],
      ["V-자", "…aylik", "let's", "давай"],
      ["V-니? / V-아/어?", "so'roq", "question", "вопрос"],
      ["저 → 나, 제 → 내", "men → men (samimiy)", "I → I (casual)", "я → я (на «ты»)"],
    ],
    examples: [
      ["어디 가? — 학교에 가.", "Qayerga ketyapsan? — Maktabga.", "Where are you going? — To school.", "Куда идёшь? — В школу."],
      ["밥 먹었어?", "Ovqatlandingmi?", "Have you eaten?", "Ты поел?"],
      ["우리 내일 같이 놀자.", "Ertaga birga o'ynaylik.", "Let's hang out tomorrow.", "Давай завтра погуляем вместе."],
      ["이거 누구 책이야? — 내 책이야.", "Bu kimning kitobi? — Meniki.", "Whose book is this? — It's mine.", "Чья это книга? — Моя."],
      ["숙제 다 했니?", "Uy vazifasini qilib bo'ldingmi?", "Did you finish your homework?", "Ты сделал домашку?"],
    ],
    mistakes: [
      ["학생이어", "학생이야", t("Ot bilan samimiy shakl — 이야/야.", "With nouns the casual form is 이야/야.", "С существительными — 이야/야.")],
      ["저는 학생이야.", "나는 학생이야.", t("반말 da 저 o'rniga 나, 제 o'rniga 내.", "In 반말, use 나 instead of 저 and 내 instead of 제.", "В 반말 вместо 저 — 나, вместо 제 — 내.")],
    ],
    drill: { kind: "aeoForm", rest: "", any: true, label: t("반말 (요 siz)", "반말 (without 요)", "반말 (без 요)") },
    quiz: [
      ["지금 뭐 ___? (하다)", ["해", "해요"], 0, t("do'stga", "to a friend", "другу")],
      ["이 사람은 내 동생___.", ["이야", "야"], 0],
      ["배고파. 우리 밥 먹___.", ["자", "요"], 0],
      ["어제 그 영화 ___? (보다)", ["봤어", "봤어요"], 0, t("do'stga", "to a friend", "другу")],
    ],
  }),

  point("endings", {
    id: "gunyo", pattern: "V + 는군요 · A + 군요",
    title: t("“…ekan-da!” — 군요", "“Oh, I see!” — 군요", "«Вот как!» — 군요"),
    explain: t(
      "Yangi bilib olgan narsaga hayrat yoki “aha, shunaqa ekan-da” degan munosabat: 한국어를 잘하시는군요! — koreyschani yaxshi bilar ekansiz! Sifat va 이다 ga 군요 (예쁘군요, 학생이군요), fe'lga 는군요 (가는군요). O'tgan zamon: 았/었군요. 네요 ga yaqin, lekin 군요 “endi bildim” ma'nosini kuchliroq beradi.",
      "Reacts to something you have just learned, with surprise or “oh, I see”: 한국어를 잘하시는군요! (You speak Korean well!). Adjectives and 이다 take 군요 (예쁘군요, 학생이군요); verbs take 는군요 (가는군요). Past: 았/었군요. Close to 네요, but 군요 stresses “now I realise”.",
      "Реакция на только что узнанное — удивление или «а, вот как»: 한국어를 잘하시는군요! — Вы хорошо говорите по-корейски! Прилагательные и 이다 — 군요 (예쁘군요, 학생이군요), глаголы — 는군요 (가는군요). Прошедшее: 았/었군요. Близко к 네요, но 군요 сильнее подчёркивает «теперь я понял».",
    ),
    rules: [
      ["A + 군요", "Sifat", "Adjective", "Прилагательное"],
      ["V + 는군요 (살다 → 사는군요)", "Fe'l", "Verb", "Глагол"],
      ["N + (이)군요", "Ot + 이다", "Noun + 이다", "Существительное + 이다"],
      ["V/A + 았/었군요", "O'tgan zamon", "Past", "Прошедшее"],
    ],
    examples: [
      ["와, 방이 정말 넓군요.", "Voy, xona juda keng ekan.", "Wow, the room is really big.", "Ого, комната очень просторная."],
      ["매일 운동하는군요. 대단해요!", "Har kuni sport qilar ekansiz. Zo'r!", "So you exercise every day. Impressive!", "Вы, значит, каждый день тренируетесь. Здорово!"],
      ["아, 민수 씨 동생이군요.", "A, Minsuning ukasi ekansiz-da.", "Ah, so you're Minsu's younger brother.", "А, так вы младший брат Минсу."],
      ["어제 비가 많이 왔군요.", "Kecha kuchli yomg'ir yog'ibdi-da.", "So it rained a lot yesterday.", "Вчера, оказывается, был сильный дождь."],
    ],
    mistakes: [
      ["좋는군요", "좋군요", t("Sifatlarga 는 qo'shilmaydi: 좋군요.", "Adjectives don't take 는: 좋군요.", "К прилагательным 는 не добавляется: 좋군요.")],
      ["먹군요", "먹는군요", t("Hozirgi zamon fe'liga 는군요.", "Present-tense verbs take 는군요.", "Глаголы в настоящем — 는군요.")],
    ],
    quiz: [
      ["이 옷이 정말 ___. (예쁘다)", ["예쁘군요", "예쁘는군요"], 0],
      ["한국 드라마를 자주 ___. (보다)", ["보는군요", "보군요"], 0],
      ["서울에 ___. (살다)", ["사는군요", "살는군요"], 0],
      ["어제 많이 ___. (바쁘다)", ["바빴군요", "바쁘는군요"], 0],
    ],
  }),
  point("endings", {
    id: "soft-question", pattern: "V + 나요? · A + (으)ㄴ가요?",
    title: t("Yumshoq savol — 나요?, (으)ㄴ가요?", "Soft questions — 나요?, (으)ㄴ가요?", "Мягкий вопрос — 나요?, (으)ㄴ가요?"),
    explain: t(
      "Muloyim, yumshoq savol: 지금 가나요? — hozir ketyapsizmi? Oddiy 아요/어요 savolidan yumshoqroq eshitiladi. Fe'lga, 있다/없다 ga va o'tgan zamonga (았/었) 나요; sifatga (으)ㄴ가요, otga (이)ㄴ가요. Og'zaki nutqda sifatlar ham ko'pincha 나요 oladi (좋나요?).",
      "A soft, polite question: 지금 가나요? (Are you leaving now?). It sounds gentler than a plain 아요/어요 question. Verbs, 있다/없다 and the past (았/었) take 나요; adjectives take (으)ㄴ가요, nouns (이)ㄴ가요. In speech adjectives often take 나요 too (좋나요?).",
      "Мягкий, вежливый вопрос: 지금 가나요? — Вы уже уходите? Звучит мягче обычного вопроса на 아요/어요. Глаголы, 있다/없다 и прошедшее (았/었) — 나요; прилагательные — (으)ㄴ가요, существительные — (이)ㄴ가요. В разговоре прилагательные тоже часто берут 나요 (좋나요?).",
    ),
    rules: [
      ["V / 있다·없다 + 나요?", "Fe'l", "Verb", "Глагол"],
      ["A + (으)ㄴ가요?", "Sifat", "Adjective", "Прилагательное"],
      ["N + (이)ㄴ가요?", "Ot", "Noun", "Существительное"],
      ["V/A + 았/었나요?", "O'tgan zamon", "Past", "Прошедшее"],
    ],
    examples: [
      ["이 버스가 시청에 가나요?", "Bu avtobus shahar hokimiyatiga boradimi?", "Does this bus go to City Hall?", "Этот автобус идёт до мэрии?"],
      ["혹시 시간 있나요?", "Bo'sh vaqtingiz bormi?", "Do you happen to have time?", "У вас случайно есть время?"],
      ["여기에서 학교까지 먼가요?", "Bu yerdan maktabgacha uzoqmi?", "Is it far from here to the school?", "Отсюда до школы далеко?"],
      ["이분이 새로 온 선생님인가요?", "Bu kishi yangi kelgan o'qituvchimi?", "Is this the new teacher?", "Это новый учитель?"],
      ["점심은 드셨나요?", "Tushlik qildingizmi?", "Have you had lunch?", "Вы уже обедали?"],
    ],
    mistakes: [
      ["멀은가요?", "먼가요?", t("ㄹ bilan tugagan sifatda ㄹ tushadi: 먼가요.", "ㄹ-stem adjectives drop ㄹ: 먼가요.", "У прилагательных на ㄹ она выпадает: 먼가요.")],
      ["학생나요?", "학생인가요?", t("Otga (이)ㄴ가요.", "Nouns take (이)ㄴ가요.", "Существительные берут (이)ㄴ가요.")],
    ],
    quiz: [
      ["내일도 회사에 ___? (가다)", ["가나요", "간가요"], 0],
      ["그 식당 음식이 ___? (비싸다)", ["비싼가요", "비싸는가요"], 0],
      ["어제 그 영화를 ___? (보다)", ["봤나요", "봤은가요"], 0],
      ["이 사과는 ___? (얼마)", ["얼마인가요", "얼마나요"], 0],
    ],
  }),
  point("endings", {
    id: "advice-neun-ge", pattern: "V + 는 게 어때요? · 는 게 좋겠어요",
    title: t("Maslahat — 는 게 어때요?", "Advice — 는 게 어때요?", "Совет — 는 게 어때요?"),
    explain: t(
      "Maslahat yoki taklif berish. 는 게 어때요? — “…sangiz-chi?”: 같이 가는 게 어때요? 는 게 좋겠어요 — “…ganingiz ma'qul”: 오늘은 쉬는 게 좋겠어요. (으)면 어때요? ham ishlatiladi: 내일 만나면 어때요? 게 — 것이 ning qisqa shakli; ㄹ bilan tugagan o'zakda ㄹ tushadi (만드는 게).",
      "Giving advice or a suggestion. 는 게 어때요? — “How about …?”: 같이 가는 게 어때요? 는 게 좋겠어요 — “It would be better to …”: 오늘은 쉬는 게 좋겠어요. (으)면 어때요? works too: 내일 만나면 어때요? 게 is short for 것이; ㄹ stems drop ㄹ (만드는 게).",
      "Совет или предложение. 는 게 어때요? — «Как насчёт …?»: 같이 가는 게 어때요? 는 게 좋겠어요 — «Лучше бы …»: 오늘은 쉬는 게 좋겠어요. Также (으)면 어때요?: 내일 만나면 어때요? 게 — сокращение от 것이; у основ на ㄹ она выпадает (만드는 게).",
    ),
    rules: [
      ["V + 는 게 어때요?", "…sangiz-chi? (taklif)", "How about …?", "Как насчёт …?"],
      ["V + (으)면 어때요?", "…sak-chi?", "What if …?", "А если …?"],
      ["V + 는 게 좋겠어요", "…ganingiz ma'qul", "You'd better …", "Лучше …"],
      ["V + 지 않는 게 좋겠어요", "…maganingiz ma'qul", "You'd better not …", "Лучше не …"],
    ],
    examples: [
      ["감기에 걸렸으면 병원에 가는 게 어때요?", "Shamollagan bo'lsangiz, shifoxonaga borsangiz-chi?", "If you've caught a cold, how about going to the hospital?", "Если простудились, может, сходите в больницу?"],
      ["주말에 같이 영화를 보면 어때요?", "Dam olish kuni birga kino ko'rsak-chi?", "What if we watch a film together at the weekend?", "Может, посмотрим фильм вместе в выходные?"],
      ["비가 오니까 우산을 가져가는 게 좋겠어요.", "Yomg'ir yog'yapti, soyabon olib ketganingiz ma'qul.", "It's raining, so you'd better take an umbrella.", "Идёт дождь, лучше взять зонт."],
      ["밤에는 커피를 마시지 않는 게 좋겠어요.", "Kechasi qahva ichmaganingiz ma'qul.", "You'd better not drink coffee at night.", "Вечером лучше не пить кофе."],
    ],
    mistakes: [
      ["만들는 게 어때요?", "만드는 게 어때요?", t("ㄹ bilan tugagan o'zakda ㄹ tushadi: 만드는.", "ㄹ stems drop ㄹ: 만드는.", "У основ на ㄹ она выпадает: 만드는.")],
    ],
    quiz: [
      ["피곤하면 좀 ___ 게 어때요? (쉬다)", ["쉬는", "쉰"], 0],
      ["늦었으니까 택시를 ___ 좋겠어요.", ["타는 게", "타서"], 0],
      ["내일 다시 ___ 어때요? (오다)", ["오면", "와서"], 0],
      ["케이크를 직접 ___ 게 어때요? (만들다)", ["만드는", "만들는"], 0],
    ],
  }),
  point("endings", {
    id: "better-ayagetda", pattern: "V + 아/어야겠다",
    title: t("“…ishim kerak” (qaror) — 아/어야겠어요", "“I'd better …” — 아/어야겠어요", "«Надо бы …» — 아/어야겠어요"),
    explain: t(
      "So'zlovchining o'zi uchun qilgan qarori: 내일은 일찍 일어나야겠어요 — ertaga erta turishim kerak (shunday qilaman). 아/어야 하다 qoida yoki majburiyatni aytadi, 아/어야겠다 esa “hozir o'yladim, shunday qilishim kerak” degan shaxsiy qarorni.",
      "The speaker's own decision that something is needed: 내일은 일찍 일어나야겠어요 (I'd better get up early tomorrow). 아/어야 하다 states a rule or duty; 아/어야겠다 is a decision made just now: “I think I should …”.",
      "Собственное решение говорящего: 내일은 일찍 일어나야겠어요 — завтра надо бы встать пораньше. 아/어야 하다 говорит о правиле или обязанности, а 아/어야겠다 — о только что принятом решении: «пожалуй, мне надо …».",
    ),
    rules: [
      ["V + 아야겠어요", "o'zakda ㅏ yoki ㅗ", "stem vowel ㅏ or ㅗ", "в основе ㅏ или ㅗ"],
      ["V + 어야겠어요", "boshqa unlilar", "other vowels", "другие гласные"],
      ["하다 → 해야겠어요", "하다 fe'llari", "하다 verbs", "глаголы на 하다"],
    ],
    examples: [
      ["시험이 다음 주예요. 열심히 공부해야겠어요.", "Imtihon keyingi haftada. Astoydil o'qishim kerak.", "The exam is next week. I'd better study hard.", "Экзамен на следующей неделе. Надо усердно заниматься."],
      ["벌써 열 시네요. 이제 집에 가야겠어요.", "Soat o'n bo'libdi. Endi uyga borishim kerak.", "It's already ten. I should go home now.", "Уже десять. Пора домой."],
      ["살이 쪘어요. 운동을 시작해야겠어요.", "Semirib qoldim. Sportni boshlashim kerak.", "I've put on weight. I'd better start exercising.", "Я поправился. Надо начать заниматься спортом."],
      ["우유가 없네요. 마트에 가서 사야겠어요.", "Sut yo'q ekan. Do'konga borib olishim kerak.", "We're out of milk. I'll have to go and buy some.", "Молоко кончилось. Надо сходить купить."],
    ],
    mistakes: [
      ["먹아야겠어요", "먹어야겠어요", t("먹다 ning unlisi ㅓ — 어야겠어요.", "먹다 has ㅓ, so it takes 어야겠어요.", "У 먹다 гласная ㅓ — 어야겠어요.")],
    ],
    drill: { kind: "aeoForm", rest: "야겠어요", label: "V-아/어야겠어요" },
    quiz: [
      ["감기에 걸렸어요. 약을 ___. (먹다)", ["먹어야겠어요", "먹아야겠어요"], 0],
      ["늦었어요. 빨리 ___. (가다)", ["가야겠어요", "가어야겠어요"], 0],
      ["방이 더러워요. 청소를 ___.", ["해야겠어요", "하야겠어요"], 0],
      ["너무 더워요. 창문을 ___. (열다)", ["열어야겠어요", "열아야겠어요"], 0],
    ],
  }),
  point("endings", {
    id: "quote-dago", pattern: "V/A + (ㄴ/는)다고 하다 · -대요",
    title: t("Ko'chirma gap — 다고 하다, 대요", "Reported speech — 다고 하다, 대요", "Косвенная речь — 다고 하다, 대요"),
    explain: t(
      "Boshqa kishining gapini yetkazish. Darak gap: fe'l + ㄴ다고/는다고 (간다고, 먹는다고), sifat + 다고 (좋다고), ot + (이)라고. O'tgan zamon: 았/었다고. Og'zakida qisqaradi: 간다고 해요 → 간대요, 학생이래요. So'roq: 냐고 묻다; buyruq: (으)라고 하다; taklif: 자고 하다.",
      "Reporting what someone else said. Statements: verb + ㄴ다고/는다고 (간다고, 먹는다고), adjective + 다고 (좋다고), noun + (이)라고. Past: 았/었다고. In speech it shortens: 간다고 해요 → 간대요, 학생이래요. Questions use 냐고 묻다, commands (으)라고 하다, suggestions 자고 하다.",
      "Передача чужих слов. Утверждение: глагол + ㄴ다고/는다고 (간다고, 먹는다고), прилагательное + 다고 (좋다고), существительное + (이)라고. Прошедшее: 았/었다고. В разговоре сокращается: 간다고 해요 → 간대요, 학생이래요. Вопрос — 냐고 묻다, просьба — (으)라고 하다, предложение — 자고 하다.",
    ),
    rules: [
      ["V + ㄴ/는다고 해요 → ㄴ/는대요", "fe'l (darak)", "verb (statement)", "глагол (утверждение)"],
      ["A + 다고 해요 → 대요", "sifat", "adjective", "прилагательное"],
      ["N + (이)라고 해요 → (이)래요", "ot", "noun", "существительное"],
      ["V/A + 았/었다고 해요 → 았/었대요", "o'tgan zamon", "past", "прошедшее"],
      ["V + 냐고 / (으)라고 / 자고 해요", "so'roq / buyruq / taklif", "question / command / suggestion", "вопрос / просьба / предложение"],
    ],
    examples: [
      ["민수 씨가 내일 학교에 안 온다고 했어요.", "Minsu ertaga maktabga kelmasligini aytdi.", "Minsu said he isn't coming to school tomorrow.", "Минсу сказал, что завтра не придёт в школу."],
      ["일기 예보에서 오후에 비가 온대요.", "Ob-havo ma'lumotiga ko'ra, tushdan keyin yomg'ir yog'armish.", "The forecast says it will rain in the afternoon.", "По прогнозу, после обеда будет дождь."],
      ["그 식당은 음식이 정말 맛있대요.", "Aytishlaricha, u restoranning taomlari juda mazali ekan.", "They say the food at that restaurant is really good.", "Говорят, в том ресторане очень вкусно."],
      ["친구가 저한테 언제 시간이 있냐고 물었어요.", "Do'stim mendan qachon bo'sh ekanimni so'radi.", "My friend asked me when I'm free.", "Друг спросил, когда я свободен."],
      ["선생님이 숙제를 내일까지 내라고 하셨어요.", "O'qituvchi uy vazifasini ertagacha topshirishni aytdilar.", "The teacher told us to hand in the homework by tomorrow.", "Учитель сказал сдать домашнее задание до завтра."],
    ],
    mistakes: [
      ["간는다고", "간다고", t("Unli bilan tugagan fe'lga ㄴ다고: 가다 → 간다고.", "Vowel-final verbs take ㄴ다고: 가다 → 간다고.", "Глаголы на гласную берут ㄴ다고: 가다 → 간다고.")],
      ["좋는다고", "좋다고", t("Sifatlarga faqat 다고.", "Adjectives take just 다고.", "Прилагательные берут просто 다고.")],
    ],
    quiz: [
      ["친구가 내일 부산에 ___ 했어요. (가다)", ["간다고", "가다고"], 0],
      ["뉴스에서 내일 날씨가 ___. (춥다)", ["춥대요", "춥는대요"], 0],
      ["동생이 밥을 ___ 했어요. (먹다)", ["먹는다고", "먹다고"], 0],
      ["저 사람이 새 선생님___.", ["이래요", "이대요"], 0],
      ["엄마가 일찍 ___ 하셨어요. (자다)", ["자라고", "자자고"], 0, t("Buyruq", "Command", "Просьба, приказ")],
    ],
  }),

  // --- Connecting clauses ------------------------------------------------------
  point("connectors", {
    id: "reason-aseo", pattern: "V/A + 아서/어서 (sabab)",
    title: t("Sabab — 아서/어서", "Reason — 아서/어서", "Причина — 아서/어서"),
    explain: t(
      "“…gani uchun, …ib” degan sababni bildiradi: 배가 아파서 병원에 갔어요 — qornim og'rigani uchun shifoxonaga bordim. 아요/어요 shaklidagi 요 o'rniga 서 qo'yiladi (아파요 → 아파서). Ot bilan: 이라서/라서. Ikki qoida: 아서/어서 dan oldin 았/었 qo'yilmaydi, undan keyin esa buyruq yoki taklif kelmaydi — buning uchun (으)니까 ishlatiladi.",
      "Gives a reason or cause: 배가 아파서 병원에 갔어요 (My stomach hurt, so I went to the hospital). Replace 요 in the 아요/어요 form with 서 (아파요 → 아파서). With nouns: 이라서/라서. Two rules: no 았/었 before 아서/어서, and no command or suggestion after it — use (으)니까 for that.",
      "Выражает причину: 배가 아파서 병원에 갔어요 — болел живот, поэтому я пошёл в больницу. Вместо 요 в форме 아요/어요 ставится 서 (아파요 → 아파서). С существительными: 이라서/라서. Два правила: перед 아서/어서 не ставят 았/었, а после него не бывает просьбы или предложения — для этого (으)니까.",
    ),
    rules: [
      ["V/A-아서/어서/해서", "…gani uchun", "because, so", "потому что, поэтому"],
      ["N이라서 / N라서", "ot bilan", "with a noun", "с существительным"],
      ["✗ 았/었어서 · ✗ + (으)세요", "o'tgan zamon ham, buyruq ham yo'q", "no past tense, no command", "без прошедшего и без просьбы"],
    ],
    examples: [
      ["늦어서 죄송합니다.", "Kechikkanim uchun uzr.", "Sorry I'm late.", "Извините за опоздание."],
      ["어제 너무 피곤해서 일찍 잤어요.", "Kecha juda charchaganimdan erta uxladim.", "I was very tired yesterday, so I went to bed early.", "Вчера я очень устал и рано лёг спать."],
      ["길이 막혀서 지각했어요.", "Yo'l tirband bo'lgani uchun kechikdim.", "The traffic was bad, so I was late.", "Были пробки, поэтому я опоздал."],
      ["오늘은 주말이라서 사람이 많아요.", "Bugun dam olish kuni, shuning uchun odam ko'p.", "It's the weekend, so it's crowded.", "Сегодня выходной, поэтому много людей."],
      ["만나서 반갑습니다.", "Tanishganimdan xursandman.", "Nice to meet you.", "Рад познакомиться."],
    ],
    mistakes: [
      ["어제 아팠어서 학교에 안 갔어요.", "어제 아파서 학교에 안 갔어요.", t("아서/어서 dan oldin o'tgan zamon qo'yilmaydi; zamon oxirgi fe'lda ko'rinadi.", "No past tense before 아서/어서; the last verb shows the tense.", "Перед 아서/어서 прошедшее не ставится; время показывает последний глагол.")],
      ["비가 와서 우산을 가져가세요.", "비가 오니까 우산을 가져가세요.", t("Iltimosdan oldin sabab (으)니까 bilan aytiladi.", "Before a request, give the reason with (으)니까.", "Перед просьбой причину выражают через (으)니까.")],
    ],
    drill: { kind: "aeoForm", rest: "서", any: true, label: "V/A-아서/어서" },
    quiz: [
      ["머리가 ___ 약을 먹었어요. (아프다)", ["아파서", "아팠어서"], 0],
      ["시간이 없___ 택시를 탔어요.", ["어서", "아서"], 0],
      ["날씨가 ___ 코트를 입으세요. (춥다)", ["추우니까", "추워서"], 0],
      ["오늘은 제 생일___ 친구들이 왔어요.", ["이라서", "라서"], 0],
    ],
  }),
  point("connectors", {
    id: "or-geona", pattern: "V/A + 거나",
    title: t("“…yoki …” (fe'llar) — 거나", "“or” between actions — 거나", "«или» между действиями — 거나"),
    explain: t(
      "Ikki harakat yoki holatdan birini bildiradi: 주말에 책을 읽거나 영화를 봐요 — dam olish kunlari kitob o'qiyman yoki kino ko'raman. O'zakka 거나 qo'shiladi. Otlar uchun esa (이)나.",
      "Links two actions or states with “or”: 주말에 책을 읽거나 영화를 봐요 (On weekends I read or watch films). Add 거나 to the stem. For nouns, use (이)나.",
      "Соединяет два действия или состояния союзом «или»: 주말에 책을 읽거나 영화를 봐요 — по выходным читаю или смотрю фильмы. К основе добавляется 거나. Для существительных — (이)나.",
    ),
    rules: [
      ["V/A-거나 V/A", "…yoki …", "… or …", "… или …"],
      ["N(이)나 N", "otlar uchun", "for nouns", "для существительных"],
    ],
    examples: [
      ["시간이 있으면 운동하거나 산책해요.", "Vaqtim bo'lsa sport qilaman yoki sayr qilaman.", "When I have time, I exercise or go for a walk.", "Когда есть время, я занимаюсь спортом или гуляю."],
      ["모르는 단어는 사전을 찾거나 선생님께 물어보세요.", "Notanish so'zni lug'atdan qarang yoki o'qituvchidan so'rang.", "Look unknown words up in a dictionary or ask the teacher.", "Незнакомые слова ищите в словаре или спрашивайте учителя."],
      ["피곤하거나 아프면 쉬세요.", "Charchasangiz yoki kasal bo'lsangiz, dam oling.", "If you're tired or sick, take a rest.", "Если устали или заболели, отдохните."],
      ["저녁에는 보통 음악을 듣거나 게임을 해요.", "Kechqurun odatda musiqa tinglayman yoki o'yin o'ynayman.", "In the evening I usually listen to music or play games.", "Вечером я обычно слушаю музыку или играю."],
    ],
    mistakes: [
      ["커피거나 차", "커피나 차", t("Otlar 거나 bilan emas, (이)나 bilan bog'lanadi.", "Nouns take (이)나, not 거나.", "Существительные соединяются через (이)나, а не 거나.")],
    ],
    quiz: [
      ["주말에는 청소를 하___ 빨래를 해요.", ["거나", "이나"], 0],
      ["밥___ 빵을 먹어요.", ["이나", "거나"], 0],
      ["전화하___ 문자를 보내세요.", ["거나", "고나"], 0],
      ["심심하면 친구를 ___ 영화를 봐요. (만나다)", ["만나거나", "만나나"], 0],
    ],
  }),
  point("connectors", {
    id: "while-myeonseo", pattern: "V + (으)면서",
    title: t("Bir vaqtda — (으)면서", "“while” — (으)면서", "Одновременно — (으)면서"),
    explain: t(
      "Bir kishi ikki ishni bir vaqtda qilishini bildiradi: 음악을 들으면서 공부해요 — musiqa tinglab dars qilaman. Unli va ㄹ bilan tugagan o'zakka 면서, undoshga 으면서. Ikkala harakatning egasi bitta bo'ladi.",
      "One person doing two things at the same time: 음악을 들으면서 공부해요 (I study while listening to music). Vowel and ㄹ stems take 면서, other consonant stems 으면서. Both actions have the same subject.",
      "Один человек делает два дела одновременно: 음악을 들으면서 공부해요 — занимаюсь, слушая музыку. К основе на гласную и ㄹ — 면서, на согласную — 으면서. Подлежащее у обоих действий одно.",
    ),
    rules: [
      ["받침 X, ㄹ + 면서", "Unli yoki ㄹ bilan tugasa", "Vowel or ㄹ stem", "Основа на гласную или ㄹ"],
      ["받침 O + 으면서", "Undosh bilan tugasa", "Consonant stem", "Основа на согласную"],
    ],
    examples: [
      ["저는 밥을 먹으면서 텔레비전을 봐요.", "Ovqatlanib turib televizor ko'raman.", "I watch TV while eating.", "Я смотрю телевизор во время еды."],
      ["운전하면서 전화하지 마세요.", "Mashina haydayotib telefonda gaplashmang.", "Don't talk on the phone while driving.", "Не разговаривайте по телефону за рулём."],
      ["동생은 노래를 부르면서 샤워해요.", "Ukam qo'shiq aytib cho'miladi.", "My younger brother sings while he showers.", "Младший брат поёт, принимая душ."],
      ["저는 일하면서 대학교에 다녀요.", "Ishlab yurib universitetda o'qiyman.", "I go to university while working.", "Я работаю и одновременно учусь в университете."],
    ],
    mistakes: [
      ["먹면서", "먹으면서", t("Undosh bilan tugagan o'zakka 으면서.", "Consonant stems take 으면서.", "К основе на согласную — 으면서.")],
      ["듣면서", "들으면서", t("듣다 — ㄷ noto'g'ri fe'l: 들으면서.", "듣다 is ㄷ-irregular: 들으면서.", "듣다 — неправильный на ㄷ: 들으면서.")],
    ],
    drill: { kind: "euForm", ending: "면서" },
    quiz: [
      ["커피를 ___ 이야기해요. (마시다)", ["마시면서", "마시으면서"], 0],
      ["책을 ___ 버스를 기다렸어요. (읽다)", ["읽으면서", "읽면서"], 0],
      ["라디오를 ___ 요리해요. (듣다)", ["들으면서", "듣으면서"], 0],
      ["웃___ 인사했어요.", ["으면서", "면서"], 0],
    ],
  }),
  point("connectors", {
    id: "during-dongan", pattern: "N 동안 / V + 는 동안",
    title: t("“…davomida” — 동안", "“for, during, while” — 동안", "«в течение, пока» — 동안"),
    explain: t(
      "Vaqt davomini bildiradi. Vaqt so'zi bilan: 3년 동안 (3 yil davomida), 방학 동안 (ta'til davomida). Fe'l bilan 는 동안 — “…ayotgan paytda”: 제가 요리하는 동안 청소해 주세요. Ikki qismning egasi har xil bo'lishi mumkin.",
      "Shows how long something lasts. With time words: 3년 동안 (for three years), 방학 동안 (during the holidays). With verbs, 는 동안 means “while …”: 제가 요리하는 동안 청소해 주세요 (please clean while I cook). The two parts may have different subjects.",
      "Показывает длительность. Со словами времени: 3년 동안 (в течение трёх лет), 방학 동안 (во время каникул). С глаголом 는 동안 — «пока …»: 제가 요리하는 동안 청소해 주세요 — пока я готовлю, уберитесь, пожалуйста. Подлежащие частей могут быть разными.",
    ),
    rules: [
      ["시간 + 동안", "… davomida", "for (a length of time)", "в течение"],
      ["N + 동안", "… paytida", "during N", "во время N"],
      ["V-는 동안", "…ayotganda", "while …", "пока …"],
    ],
    examples: [
      ["한국에서 2년 동안 살았어요.", "Koreyada 2 yil yashadim.", "I lived in Korea for two years.", "Я прожил в Корее два года."],
      ["방학 동안 아르바이트를 할 거예요.", "Ta'til davomida vaqtinchalik ishlayman.", "I'll do a part-time job during the holidays.", "На каникулах я буду подрабатывать."],
      ["아기가 자는 동안 책을 읽었어요.", "Chaqaloq uxlayotganda kitob o'qidim.", "I read a book while the baby was sleeping.", "Пока ребёнок спал, я читала книгу."],
      ["한 시간 동안 기다렸어요.", "Bir soat kutdim.", "I waited for an hour.", "Я ждал целый час."],
    ],
    mistakes: [
      ["자 동안", "자는 동안", t("Fe'lga 는 qo'shiladi: 자는 동안.", "Verbs take 는: 자는 동안.", "Глагол получает 는: 자는 동안.")],
      ["한국에 있은 동안", "한국에 있는 동안", t("O'tgan voqea bo'lsa ham 는 동안.", "Even about the past, it is 는 동안.", "Даже о прошлом — 는 동안.")],
    ],
    quiz: [
      ["일주일 ___ 여행했어요.", ["동안", "마다"], 0],
      ["제가 ___ 동안 기다려 주세요. (샤워하다)", ["샤워하는", "샤워한"], 0],
      ["한국에 ___ 동안 친구를 많이 사귀었어요. (있다)", ["있는", "있은"], 0],
      ["회의 ___ 휴대폰을 끄세요.", ["동안", "동안을"], 0],
    ],
  }),
  point("connectors", {
    id: "purpose-ryeogo", pattern: "V + (으)려고",
    title: t("Maqsad — (으)려고", "In order to — (으)려고", "Цель — (으)려고"),
    explain: t(
      "“…ish uchun” degan maqsadni bildiradi: 한국 회사에 취직하려고 한국어를 배워요. Unli va ㄹ bilan tugagan o'zakka 려고, undoshga 으려고. (으)러 faqat 가다/오다 bilan kelsa, (으)려고 har qanday fe'l bilan keladi; lekin undan keyin buyruq yoki taklif kelmaydi.",
      "Gives a purpose, “in order to”: 한국 회사에 취직하려고 한국어를 배워요 (I'm learning Korean to get a job at a Korean company). Vowel and ㄹ stems take 려고, consonant stems 으려고. Unlike (으)러, which only goes with 가다/오다, (으)려고 goes with any verb — but not with a command or suggestion.",
      "Выражает цель, «чтобы»: 한국 회사에 취직하려고 한국어를 배워요 — учу корейский, чтобы устроиться в корейскую компанию. К основе на гласную и ㄹ — 려고, на согласную — 으려고. В отличие от (으)러 (только с 가다/오다), (으)려고 сочетается с любым глаголом, но не с просьбой и не с предложением.",
    ),
    rules: [
      ["받침 X, ㄹ + 려고", "Unli yoki ㄹ bilan tugasa", "Vowel or ㄹ stem", "Основа на гласную или ㄹ"],
      ["받침 O + 으려고", "Undosh bilan tugasa", "Consonant stem", "Основа на согласную"],
      ["(으)러 + 가다/오다 · (으)려고 + V", "farqi", "the difference", "разница"],
    ],
    examples: [
      ["살을 빼려고 매일 운동해요.", "Ozish uchun har kuni sport qilaman.", "I exercise every day to lose weight.", "Я каждый день занимаюсь спортом, чтобы похудеть."],
      ["친구에게 주려고 선물을 샀어요.", "Do'stimga berish uchun sovg'a oldim.", "I bought a present to give to my friend.", "Я купил подарок, чтобы подарить другу."],
      ["사진을 찍으려고 카메라를 가져왔어요.", "Rasmga olish uchun kamera olib keldim.", "I brought a camera to take photos.", "Я взял камеру, чтобы фотографировать."],
      ["한국 문화를 알려고 한국 드라마를 봐요.", "Koreys madaniyatini bilish uchun koreys seriallarini ko'raman.", "I watch Korean dramas to learn about Korean culture.", "Смотрю корейские сериалы, чтобы узнать корейскую культуру."],
    ],
    mistakes: [
      ["책을 읽려고", "책을 읽으려고", t("Undosh bilan tugagan o'zakka 으려고.", "Consonant stems take 으려고.", "К основе на согласную — 으려고.")],
      ["사진을 찍으려고 같이 갑시다.", "사진을 찍으러 같이 갑시다.", t("Taklif bilan (으)려고 emas, (으)러.", "With a suggestion, use (으)러, not (으)려고.", "С предложением — (으)러, а не (으)려고.")],
    ],
    drill: { kind: "euForm", ending: "려고" },
    quiz: [
      ["한국 대학교에 ___ 공부하고 있어요. (들어가다)", ["들어가려고", "들어가으려고"], 0],
      ["점심을 ___ 식당에 왔어요. (먹다)", ["먹으려고", "먹려고"], 0],
      ["케이크를 ___ 밀가루를 샀어요. (만들다)", ["만들려고", "만들으려고"], 0],
      ["음악을 ___ 이어폰을 샀어요. (듣다)", ["들으려고", "듣으려고"], 0],
    ],
  }),
  point("connectors", {
    id: "after-goseo", pattern: "V + 고 나서",
    title: t("“…ib bo'lgach” — 고 나서", "“after finishing” — 고 나서", "«после того как» — 고 나서"),
    explain: t(
      "Bir ish tugagach ikkinchisi boshlanishini ta'kidlaydi: 숙제를 하고 나서 놀아요 — uy vazifasini qilib bo'lib, o'ynayman. O'zakka 고 나서 qo'shiladi, zamon oxirgi fe'lda ko'rinadi. Ma'nosi (으)ㄴ 후에 ga yaqin, lekin “tugatib” degan ohang kuchliroq.",
      "Stresses that one action is finished before the next starts: 숙제를 하고 나서 놀아요 (I play after I've done my homework). Add 고 나서 to the stem; the tense goes on the last verb. Close to (으)ㄴ 후에, with more focus on finishing.",
      "Подчёркивает, что одно действие закончено, прежде чем начинается другое: 숙제를 하고 나서 놀아요 — сделаю домашку, потом играю. К основе добавляется 고 나서; время — у последнего глагола. Близко к (으)ㄴ 후에, но с акцентом на завершении.",
    ),
    rules: [
      ["V-고 나서 V", "…ib bo'lgach", "after finishing …", "после того как …"],
      ["V-고 나서 ≈ V-(으)ㄴ 후에", "ma'nosi yaqin", "similar meaning", "близкое значение"],
    ],
    examples: [
      ["밥을 먹고 나서 이를 닦아요.", "Ovqatlanib bo'lgach tish yuvaman.", "I brush my teeth after eating.", "После еды я чищу зубы."],
      ["수업이 끝나고 나서 도서관에 갔어요.", "Dars tugagach kutubxonaga bordim.", "After class ended, I went to the library.", "После занятий я пошёл в библиотеку."],
      ["이 책을 다 읽고 나서 빌려줄게요.", "Bu kitobni o'qib bo'lgach, sizga beraman.", "I'll lend you this book once I've finished it.", "Дочитаю эту книгу и дам вам."],
      ["영화를 보고 나서 저녁을 먹을까요?", "Kinoni ko'rib bo'lib kechki ovqat yeymizmi?", "Shall we have dinner after the film?", "Поужинаем после фильма?"],
    ],
    mistakes: [
      ["숙제를 했고 나서 놀았어요.", "숙제를 하고 나서 놀았어요.", t("고 나서 dan oldin o'tgan zamon qo'yilmaydi.", "No past tense before 고 나서.", "Перед 고 나서 прошедшее не ставится.")],
    ],
    quiz: [
      ["샤워를 하___ 잤어요.", ["고 나서", "기 전에"], 0, t("Avval dush", "Shower first", "Сначала душ")],
      ["일을 다 ___ 나서 쉬세요. (끝내다)", ["끝내고", "끝냈고"], 0],
      ["손을 ___ 나서 드세요. (씻다)", ["씻고", "씻어"], 0],
      ["회의가 끝나___ 전화할게요.", ["고 나서", "고 있어서"], 0],
    ],
  }),
  point("connectors", {
    id: "for-wihae", pattern: "V + 기 위해(서) / N을/를 위해(서)",
    title: t("“…uchun” — 기 위해서", "“in order to, for” — 기 위해서", "«чтобы, ради» — 기 위해서"),
    explain: t(
      "Maqsadni bildiradi, (으)려고 dan rasmiyroq: 건강을 위해서 운동해요 — sog'lig'im uchun sport qilaman. Fe'lga 기 위해서, otga 을/를 위해서 qo'shiladi. (으)려고 dan farqli ravishda, undan keyin iltimos ham kelishi mumkin: 합격하기 위해서 매일 연습하세요.",
      "Gives a purpose, a little more formal than (으)려고: 건강을 위해서 운동해요 (I exercise for my health). Verbs take 기 위해서, nouns 을/를 위해서. Unlike (으)려고, a request can follow: 합격하기 위해서 매일 연습하세요.",
      "Выражает цель, чуть официальнее (으)려고: 건강을 위해서 운동해요 — занимаюсь спортом ради здоровья. К глаголу — 기 위해서, к существительному — 을/를 위해서. В отличие от (으)려고, после него возможна просьба: 합격하기 위해서 매일 연습하세요.",
    ),
    rules: [
      ["V-기 위해(서)", "…ish uchun", "in order to", "чтобы"],
      ["N을/를 위해(서)", "N uchun", "for N", "ради N"],
    ],
    examples: [
      ["건강을 위해서 담배를 끊었어요.", "Sog'lig'im uchun chekishni tashladim.", "I quit smoking for my health.", "Ради здоровья я бросил курить."],
      ["한국 대학교에 입학하기 위해서 토픽을 준비하고 있어요.", "Koreya universitetiga kirish uchun TOPIKka tayyorlanyapman.", "I'm preparing for TOPIK to get into a Korean university.", "Я готовлюсь к TOPIK, чтобы поступить в корейский университет."],
      ["가족을 위해 열심히 일해요.", "Oilam uchun tinmay ishlayman.", "I work hard for my family.", "Я усердно работаю ради семьи."],
      ["돈을 모으기 위해서 아르바이트를 해요.", "Pul yig'ish uchun vaqtinchalik ishlayman.", "I work part-time to save money.", "Я подрабатываю, чтобы накопить денег."],
    ],
    mistakes: [
      ["건강 위해서", "건강을 위해서", t("Ot bilan 을/를 위해서.", "Nouns take 을/를 before 위해서.", "Перед 위해서 существительное получает 을/를.")],
      ["살을 빼위해서", "살을 빼기 위해서", t("Fe'lga 기 qo'shiladi.", "Verbs need 기.", "К глаголу добавляется 기.")],
    ],
    quiz: [
      ["시험에 합격하___ 위해서 열심히 공부해요.", ["기", "고"], 0],
      ["아이들___ 위해서 책을 샀어요.", ["을", "이"], 0],
      ["환경___ 위해 일회용 컵을 쓰지 마세요.", ["을", "를"], 0],
      ["친구 생일을 축하하___ 케이크를 만들었어요.", ["기 위해서", "기 때문에"], 0],
    ],
  }),

  point("connectors", {
    id: "switch-daga", pattern: "V + 다가",
    title: t("“…ayotib” (to'xtab) — 다가", "“while …, then” — 다가", "«Делал … и вдруг» — 다가"),
    explain: t(
      "Bir harakat davom etayotganda to'xtab, boshqasiga o'tishni bildiradi: 공부하다가 잤어요 — dars qilib o'tirib uxlab qoldim. O'zakka 다가 qo'shiladi (으 qo'shilmaydi). Ikkala harakatning egasi bitta. 았/었다가 esa harakat tugab, keyin boshqasi bo'lganini bildiradi: 학교에 갔다가 왔어요 — maktabga borib keldim.",
      "One action is interrupted and switches to another: 공부하다가 잤어요 (I was studying and fell asleep). Add 다가 to any stem (no 으). Both actions share the subject. 았/었다가 means the first action was finished, then the second happened: 학교에 갔다가 왔어요 (I went to school and came back).",
      "Одно действие прерывается и сменяется другим: 공부하다가 잤어요 — занимался и уснул. 다가 присоединяется к любой основе (без 으). Подлежащее у обоих действий одно. 았/었다가 — первое действие завершилось, затем произошло второе: 학교에 갔다가 왔어요 — сходил в школу и вернулся.",
    ),
    rules: [
      ["V + 다가", "…ayotib (to'xtab, boshqasiga o'tib)", "while doing … (then switched)", "делал … и (переключился)"],
      ["V + 았/었다가", "…ib, keyin (tugagandan so'ng)", "did …, then", "сделал …, а потом"],
    ],
    examples: [
      ["텔레비전을 보다가 잠이 들었어요.", "Televizor ko'rib o'tirib uxlab qoldim.", "I fell asleep while watching TV.", "Я уснул, смотря телевизор."],
      ["집에 가다가 친구를 만났어요.", "Uyga ketayotib do'stimni uchratdim.", "I met a friend on my way home.", "По дороге домой я встретил друга."],
      ["밥을 먹다가 전화를 받았어요.", "Ovqatlanayotib telefonga javob berdim.", "I answered the phone in the middle of eating.", "Во время еды я ответил на звонок."],
      ["이 길로 쭉 가다가 왼쪽으로 가세요.", "Bu yo'ldan to'g'ri borib, keyin chapga buriling.", "Go straight along this road, then turn left.", "Идите прямо по этой дороге, потом налево."],
      ["창문을 열었다가 추워서 닫았어요.", "Derazani ochdim, lekin sovuq bo'lgani uchun yopdim.", "I opened the window but closed it because it was cold.", "Я открыл окно, но закрыл, потому что было холодно."],
    ],
    mistakes: [
      ["먹으다가", "먹다가", t("다가 oldidan 으 qo'shilmaydi.", "다가 never takes 으.", "Перед 다가 не добавляется 으.")],
    ],
    quiz: [
      ["숙제를 ___ 친구한테 전화했어요. (하다)", ["하다가", "해서"], 0],
      ["길을 ___ 넘어졌어요. (걷다)", ["걷다가", "걸으다가"], 0],
      ["백화점에 ___ 왔어요. (가다)", ["갔다가", "가다가"], 0, t("Borib, qaytib keldim", "Went and came back", "Сходил и вернулся")],
      ["책을 ___ 잠이 들었어요. (읽다)", ["읽다가", "읽으다가"], 0],
    ],
  }),
  point("connectors", {
    id: "even-if-ado", pattern: "V/A + 아/어도",
    title: t("“…sa ham” — 아/어도", "“Even if” — 아/어도", "«Даже если» — 아/어도"),
    explain: t(
      "Birinchi holat ikkinchisini o'zgartirmaydi: 비가 와도 가요 — yomg'ir yog'sa ham boraman. Fe'l va sifatga 아/어도, otga 이어도/여도 (학생이어도). 아무리 … 아/어도 — “qanchalik … bo'lsa ham”. Ruxsatdagi 아/어도 돼요 ham shu shakldan.",
      "The first fact doesn't change the second: 비가 와도 가요 (I'll go even if it rains). Verbs and adjectives take 아/어도, nouns 이어도/여도 (학생이어도). 아무리 … 아/어도 means “no matter how …”. The permission pattern 아/어도 돼요 is built on the same form.",
      "Первое не меняет второго: 비가 와도 가요 — пойду, даже если будет дождь. Глаголы и прилагательные — 아/어도, существительные — 이어도/여도 (학생이어도). 아무리 … 아/어도 — «как бы ни …». Разрешение 아/어도 돼요 построено на той же форме.",
    ),
    rules: [
      ["V/A + 아도", "o'zakda ㅏ yoki ㅗ", "stem vowel ㅏ or ㅗ", "в основе ㅏ или ㅗ"],
      ["V/A + 어도", "boshqa unlilar", "other vowels", "другие гласные"],
      ["하다 → 해도", "하다 fe'llari", "하다 verbs", "на 하다"],
      ["N + 이어도 / 여도", "ot", "noun", "существительное"],
    ],
    examples: [
      ["비가 와도 축구를 할 거예요.", "Yomg'ir yog'sa ham futbol o'ynaymiz.", "We'll play football even if it rains.", "Будем играть в футбол, даже если пойдёт дождь."],
      ["아무리 바빠도 아침은 꼭 먹어요.", "Qanchalik band bo'lsam ham nonushta albatta qilaman.", "However busy I am, I always eat breakfast.", "Как бы я ни был занят, обязательно завтракаю."],
      ["약을 먹어도 머리가 계속 아파요.", "Dori ichsam ham boshim og'riyapti.", "Even after taking medicine, my head still hurts.", "Даже после лекарства голова всё болит."],
      ["이 옷은 비싸도 사고 싶어요.", "Bu kiyim qimmat bo'lsa ham olgim keladi.", "These clothes are expensive, but I still want them.", "Хоть эта одежда и дорогая, хочу её купить."],
    ],
    mistakes: [
      ["바쁘어도", "바빠도", t("ㅡ tushadi: 바쁘다 → 바빠도.", "ㅡ drops: 바쁘다 → 바빠도.", "ㅡ выпадает: 바쁘다 → 바빠도.")],
    ],
    drill: { kind: "aeoForm", rest: "도", any: true, label: "V/A-아/어도" },
    quiz: [
      ["시간이 ___ 꼭 오세요. (없다)", ["없어도", "없아도"], 0],
      ["날씨가 ___ 산책해요. (춥다)", ["추워도", "춥어도"], 0],
      ["아무리 ___ 다 못 먹어요. (먹다)", ["먹어도", "먹으면"], 0],
      ["어린이___ 이 책은 읽을 수 있어요.", ["여도", "이어도"], 0],
    ],
  }),

  // --- Modifiers and adverbs -----------------------------------------------------
  point("modifiers", {
    id: "modifier-past-future", pattern: "V + (으)ㄴ N / V + (으)ㄹ N",
    title: t("O'tgan va kelasi sifatdosh — (으)ㄴ, (으)ㄹ", "Past and future modifiers — (으)ㄴ, (으)ㄹ", "Причастия прошедшего и будущего — (으)ㄴ, (으)ㄹ"),
    explain: t(
      "Fe'l otni aniqlaganda qo'shimcha zamonni ko'rsatadi: 는 — hozir (읽는 책 — o'qiyotgan kitobim), (으)ㄴ — o'tgan (읽은 책 — o'qigan kitobim), (으)ㄹ — kelasi yoki reja (읽을 책 — o'qiydigan kitobim). Unli bilan tugagan o'zakka ㄴ/ㄹ, undoshga 은/을. ㄹ bilan tugagan o'zak: 만들다 → 만든, 만들.",
      "When a verb describes a noun, the ending shows the time: 는 now (읽는 책 — the book I'm reading), (으)ㄴ past (읽은 책 — the book I read), (으)ㄹ future or plan (읽을 책 — the book I'll read). Vowel stems take ㄴ/ㄹ, consonant stems 은/을. ㄹ stems: 만들다 → 만든, 만들.",
      "Когда глагол определяет существительное, окончание показывает время: 는 — сейчас (읽는 책 — книга, которую читаю), (으)ㄴ — прошлое (읽은 책 — прочитанная книга), (으)ㄹ — будущее или план (읽을 책 — книга, которую прочитаю). К основе на гласную — ㄴ/ㄹ, на согласную — 은/을. Основы на ㄹ: 만들다 → 만든, 만들.",
    ),
    rules: [
      ["V-는 N", "hozirgi", "present", "настоящее"],
      ["V-(으)ㄴ N", "o'tgan", "past", "прошедшее"],
      ["V-(으)ㄹ N", "kelasi, reja", "future, plan", "будущее, план"],
    ],
    examples: [
      ["어제 본 영화가 정말 재미있었어요.", "Kecha ko'rgan filmim juda qiziq edi.", "The film I saw yesterday was really good.", "Фильм, который я посмотрел вчера, был очень интересный."],
      ["이건 제가 만든 음식이에요.", "Bu men tayyorlagan taom.", "This is food I made.", "Это блюдо приготовил я."],
      ["내일 할 일이 많아요.", "Ertaga qiladigan ishim ko'p.", "I have a lot to do tomorrow.", "Завтра у меня много дел."],
      ["주말에 만날 친구가 한국 사람이에요.", "Dam olish kuni uchrashadigan do'stim koreys.", "The friend I'm meeting this weekend is Korean.", "Друг, с которым я встречусь в выходные, — кореец."],
      ["지난주에 산 옷이 작아요.", "O'tgan hafta olgan kiyimim kichik.", "The clothes I bought last week are too small.", "Одежда, купленная на прошлой неделе, мне мала."],
    ],
    mistakes: [
      ["어제 먹는 음식", "어제 먹은 음식", t("O'tgan voqea — (으)ㄴ.", "A past event takes (으)ㄴ.", "Для прошлого — (으)ㄴ.")],
      ["만들은 케이크", "만든 케이크", t("ㄹ bilan tugagan o'zakda ㄹ tushib, ㄴ qo'shiladi.", "ㄹ stems drop ㄹ before ㄴ.", "У основ на ㄹ она выпадает перед ㄴ.")],
    ],
    drill: { kind: "form", form: "modPast", verbsOnly: true, label: t("o'tgan sifatdosh: V-(으)ㄴ", "past modifier: V-(으)ㄴ", "причастие прошедшего: V-(으)ㄴ") },
    quiz: [
      ["어제 ___ 책이 어디에 있어요? (사다)", ["산", "사는", "살"], 0],
      ["다음 달부터 ___ 집을 찾고 있어요. (살다)", ["살", "산", "사는"], 0],
      ["지난번에 ___ 식당에 또 가고 싶어요. (가다)", ["간", "갈"], 0],
      ["점심에 ___ 빵을 샀어요. (먹다)", ["먹을", "먹은"], 0, t("Hali yemadim", "Not eaten yet", "Ещё не съел")],
    ],
  }),
  point("modifiers", {
    id: "adverb-ge", pattern: "A + 게",
    title: t("Ravish yasash — 게", "Making adverbs — 게", "Образование наречий — 게"),
    explain: t(
      "Sifat o'zagiga 게 qo'shilsa, harakatni tasvirlaydigan ravish hosil bo'ladi: 맛있게 드세요 — yoqimli ishtaha, 예쁘게 입었어요 — chiroyli kiyindi, 늦게 일어났어요 — kech turdim. 게 undosh bilan boshlangani uchun noto'g'ri sifatlar ham o'zgarmaydi: 쉽게, 맵게.",
      "Add 게 to an adjective stem to make an adverb that describes the action: 맛있게 드세요 (enjoy your meal), 예쁘게 입었어요 (dressed nicely), 늦게 일어났어요 (got up late). Since 게 starts with a consonant, irregular adjectives don't change: 쉽게, 맵게.",
      "Если к основе прилагательного добавить 게, получится наречие: 맛있게 드세요 — приятного аппетита, 예쁘게 입었어요 — красиво оделась, 늦게 일어났어요 — поздно встал. 게 начинается с согласной, поэтому неправильные прилагательные не меняются: 쉽게, 맵게.",
    ),
    rules: [
      ["A-게 + V", "…cha, …lik bilan", "…ly", "наречие на -о"],
      ["쉽다 → 쉽게, 바쁘다 → 바쁘게", "o'zak o'zgarmaydi", "the stem doesn't change", "основа не меняется"],
    ],
    examples: [
      ["맛있게 드세요!", "Yoqimli ishtaha!", "Enjoy your meal!", "Приятного аппетита!"],
      ["어제 늦게 자서 피곤해요.", "Kecha kech yotganim uchun charchaganman.", "I went to bed late last night, so I'm tired.", "Вчера поздно лёг, поэтому устал."],
      ["방을 깨끗하게 청소했어요.", "Xonani tozalab yaltiratdim.", "I cleaned the room spotless.", "Я начисто убрал комнату."],
      ["좀 크게 말해 주세요.", "Biroz balandroq gapiring.", "Please speak a little louder.", "Говорите, пожалуйста, погромче."],
      ["주말을 즐겁게 보냈어요.", "Dam olish kunlarini maroqli o'tkazdim.", "I had a fun weekend.", "Я весело провёл выходные."],
    ],
    mistakes: [
      ["맛있어게 드세요", "맛있게 드세요", t("게 o'zakka to'g'ridan-to'g'ri qo'shiladi.", "게 goes straight onto the stem.", "게 присоединяется прямо к основе.")],
      ["쉬우게", "쉽게", t("게 undosh bilan boshlanadi, shuning uchun ㅂ o'zgarmaydi.", "게 starts with a consonant, so ㅂ doesn't change.", "게 начинается с согласной, поэтому ㅂ не меняется.")],
    ],
    quiz: [
      ["머리를 ___ 잘랐어요. (짧다)", ["짧게", "짧아게"], 0],
      ["음식을 너무 ___ 만들지 마세요. (맵다)", ["맵게", "매우게"], 0],
      ["글씨를 ___ 쓰세요. (크다)", ["크게", "커게"], 0],
      ["주말 ___ 보내세요! (즐겁다)", ["즐겁게", "즐거워게"], 0],
    ],
  }),

  // --- Expressions -------------------------------------------------------------
  point("expressions", {
    id: "seems-neun", pattern: "V + 는 것 같다 / A + (으)ㄴ 것 같다",
    title: t("“…ga o'xshaydi” (hozir, o'tgan) — 는/(으)ㄴ 것 같다", "“It seems” (now, past) — 는/(으)ㄴ 것 같다", "«Кажется» (сейчас, прошлое) — 는/(으)ㄴ 것 같다"),
    explain: t(
      "Ko'rgan-eshitganingizga asoslangan taxmin yoki yumshatilgan fikr. Hozirgi holat: fe'l + 는 것 같아요 (비가 오는 것 같아요 — yomg'ir yog'ayotganga o'xshaydi), sifat + (으)ㄴ 것 같아요 (바쁜 것 같아요). O'tgan voqea: fe'l + (으)ㄴ 것 같아요 (비가 온 것 같아요). Kelajak uchun (으)ㄹ 것 같아요.",
      "A guess based on what you see or hear, or a softened opinion. Now: verb + 는 것 같아요 (비가 오는 것 같아요 — it seems to be raining), adjective + (으)ㄴ 것 같아요 (바쁜 것 같아요). Past: verb + (으)ㄴ 것 같아요 (비가 온 것 같아요 — it seems it rained). For the future, (으)ㄹ 것 같아요.",
      "Предположение по тому, что видите или слышите, или смягчённое мнение. Сейчас: глагол + 는 것 같아요 (비가 오는 것 같아요 — кажется, идёт дождь), прилагательное + (으)ㄴ 것 같아요 (바쁜 것 같아요). Прошлое: глагол + (으)ㄴ 것 같아요 (비가 온 것 같아요 — кажется, был дождь). Будущее — (으)ㄹ 것 같아요.",
    ),
    rules: [
      ["V-는 것 같아요", "hozir (fe'l)", "now (verb)", "сейчас (глагол)"],
      ["A-(으)ㄴ 것 같아요", "hozir (sifat)", "now (adjective)", "сейчас (прилагательное)"],
      ["V-(으)ㄴ 것 같아요", "o'tgan (fe'l)", "past (verb)", "прошлое (глагол)"],
    ],
    examples: [
      ["밖에 비가 오는 것 같아요.", "Tashqarida yomg'ir yog'ayotganga o'xshaydi.", "It seems to be raining outside.", "Кажется, на улице дождь."],
      ["민수 씨가 요즘 바쁜 것 같아요.", "Minsu bu kunlarda band shekilli.", "Minsu seems busy these days.", "Минсу, похоже, сейчас занят."],
      ["이 옷은 저한테 좀 작은 것 같아요.", "Bu kiyim menga biroz kichikka o'xshaydi.", "I think these clothes are a bit small for me.", "Кажется, эта одежда мне маловата."],
      ["친구가 벌써 집에 간 것 같아요.", "Do'stim allaqachon uyga ketganga o'xshaydi.", "It seems my friend has already gone home.", "Похоже, друг уже ушёл домой."],
    ],
    mistakes: [
      ["바쁘는 것 같아요", "바쁜 것 같아요", t("Sifat hozirgi zamonda (으)ㄴ oladi.", "Adjectives take (으)ㄴ in the present.", "Прилагательные в настоящем — (으)ㄴ.")],
      ["맛있은 것 같아요", "맛있는 것 같아요", t("있다/없다 bilan tugaganlar 는 oladi.", "Words ending in 있다/없다 take 는.", "Слова на 있다/없다 берут 는.")],
    ],
    quiz: [
      ["아기가 지금 ___ 것 같아요. (자다)", ["자는", "잔"], 0],
      ["이 가방은 좀 ___ 것 같아요. (비싸다)", ["비싼", "비싸는"], 0],
      ["어젯밤에 눈이 많이 ___ 것 같아요. (오다)", ["온", "오는"], 0],
      ["그 식당 음식이 ___ 것 같아요. (맛있다)", ["맛있는", "맛있은"], 0],
    ],
  }),
  point("expressions", {
    id: "plan-ryeogo", pattern: "V + (으)려고 하다",
    title: t("Reja — (으)려고 해요", "Planning to — (으)려고 해요", "Собираться — (으)려고 해요"),
    explain: t(
      "Yaqin reja yoki niyatni bildiradi: 이번 주말에 등산하려고 해요 — bu dam olish kuni toqqa chiqmoqchiman. Unli va ㄹ bilan tugagan o'zakka 려고 해요, undoshga 으려고 해요. O'tgan zamonda (으)려고 했어요 ko'pincha “…moqchi edim (lekin bo'lmadi)” degan ma'no beradi.",
      "Talks about a plan or intention: 이번 주말에 등산하려고 해요 (I'm planning to go hiking this weekend). Vowel and ㄹ stems take 려고 해요, consonant stems 으려고 해요. In the past, (으)려고 했어요 often means “I was going to (but didn't)”.",
      "Говорит о планах и намерениях: 이번 주말에 등산하려고 해요 — в эти выходные собираюсь в горы. К основе на гласную и ㄹ — 려고 해요, на согласную — 으려고 해요. В прошедшем (으)려고 했어요 часто значит «собирался (но не получилось)».",
    ),
    rules: [
      ["받침 X, ㄹ + 려고 해요", "Unli yoki ㄹ bilan tugasa", "Vowel or ㄹ stem", "Основа на гласную или ㄹ"],
      ["받침 O + 으려고 해요", "Undosh bilan tugasa", "Consonant stem", "Основа на согласную"],
      ["V-(으)려고 했어요", "…moqchi edim", "I was going to", "собирался"],
    ],
    examples: [
      ["방학에 고향에 가려고 해요.", "Ta'tilda ona yurtimga bormoqchiman.", "I'm planning to go home for the holidays.", "На каникулах собираюсь съездить на родину."],
      ["오늘부터 일찍 일어나려고 해요.", "Bugundan boshlab erta turmoqchiman.", "From today I'm going to get up early.", "С сегодняшнего дня собираюсь вставать рано."],
      ["친구에게 전화하려고 했어요. 그런데 잊어버렸어요.", "Do'stimga qo'ng'iroq qilmoqchi edim. Lekin esimdan chiqibdi.", "I was going to call my friend, but I forgot.", "Я собирался позвонить другу, но забыл."],
      ["점심에 냉면을 먹으려고 해요.", "Tushlikda naengmyon yemoqchiman.", "I'm going to have naengmyeon for lunch.", "На обед собираюсь съесть нэнмён."],
    ],
    mistakes: [
      ["먹을려고 해요", "먹으려고 해요", t("Og'zaki nutqda 먹을려고 eshitiladi, lekin to'g'ri shakli — 먹으려고.", "You'll hear 먹을려고, but the correct form is 먹으려고.", "В речи слышно 먹을려고, но правильно — 먹으려고.")],
    ],
    drill: { kind: "euForm", ending: "려고 해요" },
    quiz: [
      ["내년에 한국 대학교에 ___ 해요. (입학하다)", ["입학하려고", "입학하으려고"], 0],
      ["오늘 저녁에 책을 ___ 해요. (읽다)", ["읽으려고", "읽을려고"], 0],
      ["주말에는 집에서 ___ 해요. (쉬다)", ["쉬려고", "쉬으려고"], 0],
      ["어제 운동하려고 ___. 그런데 비가 왔어요.", ["했어요", "해요"], 0],
    ],
  }),
  point("expressions", {
    id: "decide-giro", pattern: "V + 기로 하다",
    title: t("Qaror va kelishuv — 기로 하다", "Deciding, agreeing — 기로 하다", "Решить, договориться — 기로 하다"),
    explain: t(
      "Qaror yoki kelishuvni bildiradi: 내일부터 운동하기로 했어요 — ertadan sport qilishga qaror qildim. Odatda o'tgan zamonda (기로 했어요) ishlatiladi. Boshqa odam bilan kelishuv ham shunday aytiladi: 친구하고 3시에 만나기로 했어요.",
      "Says you decided or agreed to do something: 내일부터 운동하기로 했어요 (I've decided to start exercising tomorrow). It is usually in the past (기로 했어요). Agreements with others work the same way: 친구하고 3시에 만나기로 했어요 (I agreed to meet my friend at three).",
      "Говорит о решении или договорённости: 내일부터 운동하기로 했어요 — я решил с завтрашнего дня заниматься спортом. Обычно в прошедшем (기로 했어요). Так же говорят о договорённостях: 친구하고 3시에 만나기로 했어요 — договорился встретиться с другом в три.",
    ),
    rules: [
      ["V-기로 했어요", "…ishga qaror qildim / kelishdik", "decided / agreed to", "решил / договорились"],
      ["V-지 않기로 했어요", "…maslikka qaror qildim", "decided not to", "решил не …"],
    ],
    examples: [
      ["이번 여름에 제주도에 가기로 했어요.", "Bu yoz Chejuga borishga qaror qildik.", "We've decided to go to Jeju this summer.", "Этим летом мы решили поехать на Чеджу."],
      ["오늘부터 커피를 마시지 않기로 했어요.", "Bugundan qahva ichmaslikka qaror qildim.", "I've decided to stop drinking coffee from today.", "С сегодняшнего дня я решил не пить кофе."],
      ["친구하고 주말에 영화를 보기로 했어요.", "Do'stim bilan dam olish kuni kino ko'rishga kelishdik.", "My friend and I agreed to see a film this weekend.", "Мы с другом договорились посмотреть фильм в выходные."],
      ["우리 몇 시에 만나기로 했지요?", "Soat nechada uchrashishga kelishgandik?", "What time did we agree to meet?", "Во сколько мы договорились встретиться?"],
    ],
    mistakes: [
      ["운동하기를 했어요", "운동하기로 했어요", t("Qaror ma'nosida 기로.", "For a decision it is 기로.", "Для решения — 기로.")],
    ],
    quiz: [
      ["다음 달부터 한국어 학원에 다니___ 했어요.", ["기로", "기를"], 0],
      ["건강 때문에 담배를 ___ 했어요.", ["피우지 않기로", "피우지 않기를"], 0],
      ["친구와 2시에 학교 앞에서 ___ 했어요. (만나다)", ["만나기로", "만나려고"], 0, t("“kelishdik”", "“we agreed”", "«договорились»")],
      ["우리 내년에 결혼하기로 ___.", ["했어요", "됐어요"], 0],
    ],
  }),
  point("expressions", {
    id: "become-eojida", pattern: "A + 아/어지다",
    title: t("O'zgarish — 아/어지다", "Becoming — 아/어지다", "Изменение состояния — 아/어지다"),
    explain: t(
      "Sifatga qo'shilib holat o'zgarganini bildiradi: 날씨가 따뜻해졌어요 — havo isidi. 아요/어요 shaklidan 요 tushib, 지다 qo'shiladi: 예뻐요 → 예뻐지다. Ko'pincha o'tgan zamonda (졌어요) yoki 지고 있어요 (…bo'lib boryapti) shaklida ishlatiladi.",
      "Added to an adjective, it shows a change of state: 날씨가 따뜻해졌어요 (the weather has got warmer). Take the 아요/어요 form, drop 요 and add 지다: 예뻐요 → 예뻐지다. Usually in the past (졌어요) or as 지고 있어요 (is getting …).",
      "С прилагательным выражает изменение: 날씨가 따뜻해졌어요 — потеплело. Берётся форма 아요/어요 без 요 и добавляется 지다: 예뻐요 → 예뻐지다. Обычно в прошедшем (졌어요) или как 지고 있어요 (становится …).",
    ),
    rules: [
      ["A-아/어/해지다", "…bo'lib qolmoq", "to become …", "становиться …"],
      ["A-아/어졌어요", "…bo'lib qoldi", "has become", "стал(о)"],
      ["춥다 → 추워지다", "noto'g'ri sifatlar ham o'zgaradi", "irregulars change as usual", "неправильные меняются как обычно"],
    ],
    examples: [
      ["날씨가 많이 추워졌어요.", "Havo ancha soviydi.", "It has got much colder.", "Сильно похолодало."],
      ["한국어 공부가 점점 재미있어져요.", "Koreys tilini o'rganish borgan sari qiziqarli bo'lyapti.", "Studying Korean is getting more and more fun.", "Учить корейский становится всё интереснее."],
      ["운동을 해서 건강해졌어요.", "Sport bilan shug'ullanib sog'lomroq bo'ldim.", "I've got healthier by exercising.", "Благодаря спорту я стал здоровее."],
      ["방이 깨끗해졌어요.", "Xona toza bo'ldi.", "The room is clean now.", "В комнате стало чисто."],
      ["요즘 물가가 많이 비싸졌어요.", "Hozir narxlar ancha oshdi.", "Prices have gone up a lot lately.", "В последнее время всё сильно подорожало."],
    ],
    mistakes: [
      ["날씨가 덥어졌어요", "날씨가 더워졌어요", t("ㅂ noto'g'ri sifat: 더워 + 지다.", "ㅂ-irregular: 더워 + 지다.", "Неправильное на ㅂ: 더워 + 지다.")],
      ["예쁘지다", "예뻐지다", t("지다 o'zakka emas, 아/어 shakliga qo'shiladi.", "지다 joins the 아/어 form, not the bare stem.", "지다 присоединяется к форме на 아/어, а не к основе.")],
    ],
    drill: { kind: "aeoForm", rest: "졌어요", adjectives: true, label: "A-아/어졌어요" },
    quiz: [
      ["봄이 와서 날씨가 ___. (따뜻하다)", ["따뜻해졌어요", "따뜻하졌어요"], 0],
      ["동생이 키가 많이 ___. (크다)", ["커졌어요", "크졌어요"], 0],
      ["시험 문제가 점점 ___. (어렵다)", ["어려워져요", "어렵어져요"], 0],
      ["친구가 요즘 많이 ___. (예쁘다)", ["예뻐졌어요", "예쁘어졌어요"], 0],
    ],
  }),
  point("expressions", {
    id: "state-a-itda", pattern: "V + 아/어 있다",
    title: t("Natija holati — 아/어 있다", "Resulting state — 아/어 있다", "Состояние-результат — 아/어 있다"),
    explain: t(
      "Harakat tugagandan keyin qolgan holatni bildiradi: 문이 열려 있어요 — eshik ochiq turibdi. O'timsiz fe'llar bilan ishlatiladi: 앉다, 서다, 열리다, 닫히다, 켜지다, 붙다, 오다/가다. 고 있다 — harakat davom etyapti, 아/어 있다 — natija saqlanib turibdi.",
      "Shows a state that remains after an action is done: 문이 열려 있어요 (the door is open). It goes with intransitive verbs: 앉다, 서다, 열리다, 닫히다, 켜지다, 붙다, 오다/가다. 고 있다 is an action in progress; 아/어 있다 is the result that stays.",
      "Обозначает состояние, оставшееся после действия: 문이 열려 있어요 — дверь открыта. Употребляется с непереходными глаголами: 앉다, 서다, 열리다, 닫히다, 켜지다, 붙다, 오다/가다. 고 있다 — действие в процессе, 아/어 있다 — сохраняющийся результат.",
    ),
    rules: [
      ["V-아/어 있어요", "…ib turibdi (natija)", "is in a state", "находится в состоянии"],
      ["앉아 있다 · 서 있다 · 열려 있다", "o'tirgan, turgan, ochiq", "sitting, standing, open", "сидит, стоит, открыто"],
      ["입고 있다 (✗ 입어 있다)", "kiyim uchun 고 있다", "clothes take 고 있다", "одежда — 고 있다"],
    ],
    examples: [
      ["교실 문이 열려 있어요.", "Sinf eshigi ochiq.", "The classroom door is open.", "Дверь класса открыта."],
      ["할머니가 의자에 앉아 계세요.", "Buvim stulda o'tiribdilar.", "Grandma is sitting on a chair.", "Бабушка сидит на стуле."],
      ["벽에 사진이 붙어 있어요.", "Devorda rasm yopishtirilgan.", "There's a photo stuck on the wall.", "На стене висит фотография."],
      ["방에 불이 켜져 있어요.", "Xonada chiroq yoniq.", "The light is on in the room.", "В комнате горит свет."],
      ["정류장에 사람들이 서 있어요.", "Bekatda odamlar turibdi.", "People are standing at the bus stop.", "На остановке стоят люди."],
    ],
    mistakes: [
      ["문을 열어 있어요", "문이 열려 있어요", t("아/어 있다 o'timsiz fe'l bilan keladi: 열리다 → 열려 있다.", "아/어 있다 needs an intransitive verb: 열리다 → 열려 있다.", "아/어 있다 требует непереходного глагола: 열리다 → 열려 있다.")],
      ["코트를 입어 있어요", "코트를 입고 있어요", t("Kiyib turgan holat 고 있다 bilan aytiladi.", "Wearing something is said with 고 있다.", "Ношение одежды выражают через 고 있다.")],
    ],
    quiz: [
      ["창문이 ___ 있어요. (닫히다)", ["닫혀", "닫고"], 0],
      ["학생들이 의자에 ___ 있어요. (앉다)", ["앉아", "앉고"], 0, t("O'tirgan holatda", "In a sitting state", "В сидячем положении")],
      ["친구가 빨간 모자를 쓰___ 있어요.", ["고", "어"], 0],
      ["가방에 이름이 ___ 있어요. (쓰이다)", ["쓰여", "쓰고"], 0],
    ],
  }),
  point("expressions", {
    id: "know-how", pattern: "V + (으)ㄹ 줄 알다/모르다",
    title: t("“…ishni bilaman” — (으)ㄹ 줄 알다", "Knowing how to — (으)ㄹ 줄 알다/모르다", "Уметь — (으)ㄹ 줄 알다/모르다"),
    explain: t(
      "Biror ishni qilishni bilish-bilmaslikni bildiradi: 수영할 줄 알아요 — suzishni bilaman, 운전할 줄 몰라요 — mashina haydashni bilmayman. Unli va ㄹ bilan tugagan o'zakka ㄹ 줄, undoshga 을 줄. (으)ㄹ 수 있다 dan farqi: 줄 알다 o'rganilgan ko'nikma haqida.",
      "Says whether you know how to do something: 수영할 줄 알아요 (I can swim), 운전할 줄 몰라요 (I can't drive). Vowel and ㄹ stems take ㄹ 줄, consonant stems 을 줄. Compared with (으)ㄹ 수 있다, it is about a learned skill, not circumstances.",
      "Говорит, умеете ли вы что-то делать: 수영할 줄 알아요 — умею плавать, 운전할 줄 몰라요 — не умею водить. К основе на гласную и ㄹ — ㄹ 줄, на согласную — 을 줄. В отличие от (으)ㄹ 수 있다, речь именно о навыке, а не об обстоятельствах.",
    ),
    rules: [
      ["V-(으)ㄹ 줄 알아요", "…ishni bilaman", "know how to", "умею"],
      ["V-(으)ㄹ 줄 몰라요", "…ishni bilmayman", "don't know how to", "не умею"],
    ],
    examples: [
      ["저는 한국 음식을 만들 줄 알아요.", "Men koreys taomlarini tayyorlashni bilaman.", "I know how to cook Korean food.", "Я умею готовить корейскую еду."],
      ["자전거를 탈 줄 몰라요.", "Velosiped haydashni bilmayman.", "I don't know how to ride a bike.", "Я не умею кататься на велосипеде."],
      ["피아노를 칠 줄 알아요?", "Pianino chalishni bilasizmi?", "Can you play the piano?", "Вы умеете играть на пианино?"],
      ["젓가락을 사용할 줄 알아요.", "Cho'p tayoqchalardan foydalanishni bilaman.", "I know how to use chopsticks.", "Я умею пользоваться палочками."],
    ],
    mistakes: [
      ["읽 줄 알아요", "읽을 줄 알아요", t("Undosh bilan tugagan o'zakka 을 줄.", "Consonant stems take 을 줄.", "К основе на согласную — 을 줄.")],
    ],
    quiz: [
      ["한글을 ___ 줄 알아요? (읽다)", ["읽을", "읽는"], 0],
      ["저는 기타를 ___ 줄 몰라요. (치다)", ["칠", "치을"], 0],
      ["김치를 ___ 줄 알아요. (만들다)", ["만들", "만들을"], 0],
      ["운전할 줄 ___? — 아니요, 몰라요.", ["알아요", "있어요"], 0],
    ],
  }),
  point("expressions", {
    id: "since-eunji", pattern: "V + (으)ㄴ 지 + 시간 + 되다",
    title: t("“…ganiga … bo'ldi” — (으)ㄴ 지", "Time since — (으)ㄴ 지 … 되다", "«Прошло … с тех пор как» — (으)ㄴ 지"),
    explain: t(
      "Biror ish bo'lganidan beri qancha vaqt o'tganini aytadi: 한국에 온 지 1년 됐어요 — Koreyaga kelganimga bir yil bo'ldi. Unli va ㄹ bilan tugagan o'zakka ㄴ 지, undoshga 은 지; keyin vaqt va 됐어요, 넘었어요 yoki 지났어요 keladi.",
      "Says how much time has passed since something happened: 한국에 온 지 1년 됐어요 (It's been a year since I came to Korea). Vowel and ㄹ stems take ㄴ 지, consonant stems 은 지, followed by a length of time and 됐어요, 넘었어요 or 지났어요.",
      "Говорит, сколько времени прошло с какого-то события: 한국에 온 지 1년 됐어요 — прошёл год, как я приехал в Корею. К основе на гласную и ㄹ — ㄴ 지, на согласную — 은 지; затем срок и 됐어요, 넘었어요 или 지났어요.",
    ),
    rules: [
      ["받침 X, ㄹ + ㄴ 지", "Unli yoki ㄹ bilan tugasa (ㄹ tushadi)", "Vowel or ㄹ stem (ㄹ drops)", "Основа на гласную или ㄹ (ㄹ выпадает)"],
      ["받침 O + 은 지", "Undosh bilan tugasa", "Consonant stem", "Основа на согласную"],
      ["… 지 N이/가 됐어요", "…ganiga N bo'ldi", "it has been N", "прошло N"],
    ],
    examples: [
      ["한국어를 배운 지 6개월 됐어요.", "Koreys tilini o'rganayotganimga 6 oy bo'ldi.", "I've been learning Korean for six months.", "Я учу корейский уже полгода."],
      ["밥을 먹은 지 한 시간밖에 안 됐어요.", "Ovqatlanganimga bor-yo'g'i bir soat bo'ldi.", "It's only been an hour since I ate.", "Прошёл всего час, как я поел."],
      ["서울에서 산 지 3년이 넘었어요.", "Seulda yashayotganimga 3 yildan oshdi.", "I've lived in Seoul for over three years.", "Я живу в Сеуле больше трёх лет."],
      ["친구를 못 만난 지 오래됐어요.", "Do'stimni ko'rmaganimga ancha bo'ldi.", "It's been a long time since I saw my friend.", "Я давно не виделся с другом."],
    ],
    mistakes: [
      ["한국에 오는 지 1년 됐어요", "한국에 온 지 1년 됐어요", t("Bu yerda doim o'tgan shakl (으)ㄴ.", "Always the past form (으)ㄴ here.", "Здесь всегда форма прошедшего (으)ㄴ.")],
      ["산지 3년", "산 지 3년", t("지 alohida yoziladi.", "지 is written as a separate word.", "지 пишется отдельно.")],
    ],
    quiz: [
      ["회사에 다닌 ___ 2년 됐어요.", ["지", "적"], 0],
      ["이 집에 ___ 지 5년이 됐어요. (살다)", ["산", "살은"], 0],
      ["점심을 ___ 지 얼마 안 됐어요. (먹다)", ["먹은", "먹는"], 0],
      ["한국에 온 지 얼마나 ___?", ["됐어요", "했어요"], 0],
    ],
  }),
  point("expressions", {
    id: "feelings-hada", pattern: "A + 아/어하다 · V + 고 싶어 하다",
    title: t("Boshqaning his-tuyg'usi — 아/어하다", "Other people's feelings — 아/어하다", "Чувства других людей — 아/어하다"),
    explain: t(
      "His-tuyg'u sifatlari (좋다, 싫다, 슬프다, 무섭다) va 고 싶다 asosan o'zingiz haqida ishlatiladi. Boshqa odamning hissini aytish uchun ular 아/어하다 bilan fe'lga aylanadi: 동생이 강아지를 무서워해요 — ukam kuchukdan qo'rqadi, 친구가 한국에 가고 싶어 해요. Shunda ob'ekt 을/를 oladi.",
      "Feeling adjectives (좋다, 싫다, 슬프다, 무섭다) and 고 싶다 are mainly used about yourself. To describe someone else's feelings, turn them into verbs with 아/어하다: 동생이 강아지를 무서워해요 (my sibling is scared of dogs), 친구가 한국에 가고 싶어 해요. The object then takes 을/를.",
      "Прилагательные чувств (좋다, 싫다, 슬프다, 무섭다) и 고 싶다 обычно говорят о себе. Чтобы описать чувства другого человека, их превращают в глаголы с 아/어하다: 동생이 강아지를 무서워해요 — младший брат боится собак; 친구가 한국에 가고 싶어 해요. Объект тогда получает 을/를.",
    ),
    rules: [
      ["A-아/어하다", "(u) … his qiladi", "(he/she) feels …", "(он/она) чувствует …"],
      ["V-고 싶어 하다", "(u) …ni xohlaydi", "(he/she) wants to", "(он/она) хочет"],
      ["N이/가 무서워요 → N을/를 무서워해요", "qo'shimcha o'zgaradi", "the particle changes", "меняется частица"],
    ],
    examples: [
      ["동생은 고양이를 무서워해요.", "Ukam mushukdan qo'rqadi.", "My younger sibling is afraid of cats.", "Младший брат боится кошек."],
      ["아이들이 선물을 받고 기뻐했어요.", "Bolalar sovg'a olib xursand bo'lishdi.", "The children were happy to get presents.", "Дети обрадовались подаркам."],
      ["친구가 한국 음식을 먹고 싶어 해요.", "Do'stim koreys taomini yemoqchi.", "My friend wants to eat Korean food.", "Друг хочет поесть корейской еды."],
      ["어머니가 제 편지를 읽고 우셨어요.", "Onam xatimni o'qib yig'ladilar.", "My mother cried when she read my letter.", "Мама заплакала, прочитав моё письмо."],
      ["민수 씨는 운동을 싫어해요.", "Minsu sportni yoqtirmaydi.", "Minsu doesn't like exercise.", "Минсу не любит спорт."],
    ],
    mistakes: [
      ["친구가 영화를 보고 싶어요.", "친구가 영화를 보고 싶어 해요.", t("Boshqa odam haqida — 고 싶어 하다.", "About someone else, use 고 싶어 하다.", "О другом человеке — 고 싶어 하다.")],
      ["동생은 고양이가 무서워해요.", "동생은 고양이를 무서워해요.", t("아/어하다 fe'l, shuning uchun ob'ekt 을/를 oladi.", "아/어하다 is a verb, so the object takes 을/를.", "아/어하다 — глагол, поэтому объект получает 을/를.")],
    ],
    quiz: [
      ["민수 씨는 한국에 가고 ___.", ["싶어 해요", "싶어요"], 0],
      ["저는 매운 음식이 ___.", ["싫어요", "싫어해요"], 0],
      ["동생이 숙제 때문에 ___. (힘들다)", ["힘들어해요", "힘들어요"], 0],
      ["언니가 그 가수를 아주 ___.", ["좋아해요", "좋아요"], 0],
    ],
  }),
  point("expressions", {
    id: "give-deurida", pattern: "V + 아/어 드리다",
    title: t("Kattalar uchun qilish — 아/어 드리다", "Doing something for an elder — 아/어 드리다", "Сделать для старшего — 아/어 드리다"),
    explain: t(
      "아/어 주다 ning kamtarona shakli: biror ishni kattalar, o'qituvchi yoki mijoz uchun qilganda ishlatiladi: 할머니께 길을 가르쳐 드렸어요. Yordam taklif qilish: 도와 드릴까요? — yordam beraymi? Va'da: 제가 해 드릴게요.",
      "The humble form of 아/어 주다, used when you do something for an elder, a teacher or a customer: 할머니께 길을 가르쳐 드렸어요 (I showed an old lady the way). Offering help: 도와 드릴까요? (Shall I help you?). Promising: 제가 해 드릴게요.",
      "Скромная форма 아/어 주다: когда вы делаете что-то для старшего, учителя или клиента. 할머니께 길을 가르쳐 드렸어요 — я показал бабушке дорогу. Предложить помощь: 도와 드릴까요? — Вам помочь? Пообещать: 제가 해 드릴게요.",
    ),
    rules: [
      ["V-아/어 드렸어요", "(kattaga) …ib berdim", "(I) did it for an elder", "(я) сделал для старшего"],
      ["V-아/어 드릴까요?", "…ib beraymi?", "Shall I … for you?", "Вам …?"],
      ["V-아/어 주세요 ↔ V-아/어 드릴게요", "so'rash ↔ taklif", "asking ↔ offering", "просьба ↔ предложение"],
    ],
    examples: [
      ["가방이 무겁지요? 제가 들어 드릴게요.", "Sumka og'irmi? Men ko'tarib beraman.", "The bag is heavy, isn't it? I'll carry it for you.", "Сумка тяжёлая? Давайте я понесу."],
      ["어머니께 한국 음식을 만들어 드렸어요.", "Onamga koreys taomini tayyorlab berdim.", "I cooked Korean food for my mother.", "Я приготовил маме корейскую еду."],
      ["손님, 사진을 찍어 드릴까요?", "Mehmon, rasmga olib beraymi?", "Would you like me to take a photo for you?", "Вас сфотографировать?"],
      ["할아버지께 신문을 읽어 드렸어요.", "Bobomga gazeta o'qib berdim.", "I read the newspaper to my grandfather.", "Я почитал дедушке газету."],
    ],
    mistakes: [
      ["선생님, 제가 도와줄게요.", "선생님, 제가 도와 드릴게요.", t("Katta kishiga yordam taklif qilsangiz — 드리다.", "When offering help to an elder, use 드리다.", "Предлагая помощь старшему, используйте 드리다.")],
      ["저에게 설명해 드리세요.", "저에게 설명해 주세요.", t("O'zingiz uchun so'raganda 주세요; 드리다 faqat katta kishi uchun qilinganda.", "Asking for yourself is 주세요; 드리다 is only for doing things for elders.", "О себе просят через 주세요; 드리다 — только когда делают для старших.")],
    ],
    quiz: [
      ["할머니, 제가 문을 열어 ___?", ["드릴까요", "주실까요"], 0],
      ["아버지께 이메일 쓰는 방법을 ___ 드렸어요. (가르치다)", ["가르쳐", "가르치어"], 0],
      ["저 좀 도와 ___.", ["주세요", "드리세요"], 0],
      ["손님, 가방을 들어 ___.", ["드릴게요", "줄게요"], 0],
    ],
  }),
  point("expressions", {
    id: "about-daehae", pattern: "N + 에 대해(서) / 에 대한 N",
    title: t("“…haqida” — 에 대해서", "“about” — 에 대해서", "«о, про» — 에 대해서"),
    explain: t(
      "Gap, fikr, savol yoki ma'lumot nima haqida ekanini bildiradi: 한국 문화에 대해서 이야기해요 — Koreya madaniyati haqida gaplashamiz. Qisqa shakli 에 대해. Ot oldidan 에 대한 ishlatiladi: 한국에 대한 책 — Koreya haqidagi kitob.",
      "Marks the topic of talk, thought, questions or information: 한국 문화에 대해서 이야기해요 (We talk about Korean culture). It is often shortened to 에 대해. Before a noun, use 에 대한: 한국에 대한 책 (a book about Korea).",
      "Указывает тему разговора, мысли, вопроса: 한국 문화에 대해서 이야기해요 — говорим о корейской культуре. Часто сокращается до 에 대해. Перед существительным — 에 대한: 한국에 대한 책 — книга о Корее.",
    ),
    rules: [
      ["N에 대해(서) + V", "… haqida", "about N", "о N"],
      ["N에 대한 + N", "… haqidagi", "N about N", "N о N"],
    ],
    examples: [
      ["오늘은 우리 가족에 대해서 이야기하겠습니다.", "Bugun oilam haqida gapirib beraman.", "Today I'll talk about my family.", "Сегодня я расскажу о своей семье."],
      ["한국 역사에 대해 알고 싶어요.", "Koreya tarixi haqida bilishni xohlayman.", "I want to learn about Korean history.", "Хочу узнать об истории Кореи."],
      ["이 문제에 대해서 어떻게 생각해요?", "Bu masala haqida qanday fikrdasiz?", "What do you think about this issue?", "Что вы думаете об этой проблеме?"],
      ["서울에 대한 책을 읽었어요.", "Seul haqidagi kitobni o'qidim.", "I read a book about Seoul.", "Я прочитал книгу о Сеуле."],
    ],
    mistakes: [
      ["한국을 대해서", "한국에 대해서", t("대해서 dan oldin doim 에.", "Always 에 before 대해서.", "Перед 대해서 всегда 에.")],
      ["한국에 대해서 책", "한국에 대한 책", t("Ot oldidan 에 대한.", "Before a noun, use 에 대한.", "Перед существительным — 에 대한.")],
    ],
    quiz: [
      ["환경 문제___ 대해서 발표했어요.", ["에", "를"], 0],
      ["한국 음식에 ___ 책을 샀어요.", ["대한", "대해서"], 0],
      ["그 사람에 대해서 잘 ___.", ["몰라요", "아니에요"], 0],
      ["우즈베키스탄 문화에 ___ 소개해 주세요.", ["대해서", "대한"], 0],
    ],
  }),

  point("expressions", {
    id: "in-middle-jung", pattern: "V + 는 중이다 · N 중이다",
    title: t("Ayni paytda — 는 중이에요", "In the middle of — 는 중이에요", "В процессе — 는 중이에요"),
    explain: t(
      "Harakat ayni paytda davom etayotganini ta'kidlaydi: 지금 회의하는 중이에요 — hozir majlisdaman. 고 있다 ga yaqin, lekin rasmiyroq va “band” degan ma'no beradi. Ot bilan: 수업 중, 회의 중, 통화 중. O'tgan zamon: 는 중이었어요.",
      "Stresses that an action is in progress right now: 지금 회의하는 중이에요 (I'm in a meeting now). Close to 고 있다 but more formal, with a sense of “busy with it”. With nouns: 수업 중, 회의 중, 통화 중. Past: 는 중이었어요.",
      "Подчёркивает, что действие идёт прямо сейчас: 지금 회의하는 중이에요 — сейчас я на совещании. Близко к 고 있다, но официальнее, с оттенком «занят этим». С существительными: 수업 중, 회의 중, 통화 중. Прошедшее: 는 중이었어요.",
    ),
    rules: [
      ["V + 는 중이에요", "…yapman (ayni paytda)", "in the middle of …", "в процессе …"],
      ["N + 중이에요", "…da (band)", "in the middle of N", "идёт N"],
      ["V + 는 중이었어요", "…ayotgan edim", "was in the middle of …", "был в процессе …"],
    ],
    examples: [
      ["지금 밥을 먹는 중이에요. 이따가 전화할게요.", "Hozir ovqatlanyapman. Keyinroq qo'ng'iroq qilaman.", "I'm eating right now. I'll call you later.", "Я сейчас ем. Перезвоню позже."],
      ["사장님은 지금 회의 중이세요.", "Direktor hozir majlisdalar.", "The boss is in a meeting now.", "Директор сейчас на совещании."],
      ["새 집을 찾는 중이에요.", "Yangi uy qidiryapman.", "I'm looking for a new home.", "Я ищу новое жильё."],
      ["전화했을 때 운전하는 중이었어요.", "Siz qo'ng'iroq qilganingizda mashina haydayotgan edim.", "I was driving when you called.", "Когда вы звонили, я был за рулём."],
    ],
    mistakes: [
      ["만들는 중이에요", "만드는 중이에요", t("ㄹ tushadi: 만들다 → 만드는.", "ㄹ drops: 만들다 → 만드는.", "ㄹ выпадает: 만들다 → 만드는.")],
    ],
    quiz: [
      ["지금 숙제를 ___ 중이에요. (하다)", ["하는", "한"], 0],
      ["죄송합니다. 지금 수업 ___.", ["중이에요", "동안이에요"], 0],
      ["케이크를 ___ 중이에요. (만들다)", ["만드는", "만들는"], 0],
      ["친구가 왔을 때 저는 샤워___ 중이었어요.", ["하는", "할"], 0],
    ],
  }),
  point("expressions", {
    id: "start-gi", pattern: "V + 기 시작하다",
    title: t("“…a boshladi” — 기 시작하다", "“Start to” — 기 시작하다", "«Начать» — 기 시작하다"),
    explain: t(
      "Harakat boshlanganini bildiradi: 비가 오기 시작했어요 — yomg'ir yog'a boshladi. O'zakka 기 qo'shilib, keyin 시작하다 keladi. 기 fe'lni otga aylantiradi.",
      "Shows that an action begins: 비가 오기 시작했어요 (It started to rain). Add 기 to the stem, then 시작하다. 기 turns the verb into a noun.",
      "Показывает начало действия: 비가 오기 시작했어요 — пошёл дождь. К основе добавляется 기, затем 시작하다. 기 превращает глагол в существительное.",
    ),
    rules: [
      ["V + 기 시작하다", "…a boshlamoq", "to start …ing", "начать …"],
      ["V + 기 시작했어요", "…a boshladi", "started …ing", "начал …"],
    ],
    examples: [
      ["작년부터 한국어를 배우기 시작했어요.", "O'tgan yildan koreys tilini o'rgana boshladim.", "I started learning Korean last year.", "Я начал учить корейский в прошлом году."],
      ["갑자기 아기가 울기 시작했어요.", "Birdan chaqaloq yig'lay boshladi.", "Suddenly the baby started crying.", "Вдруг ребёнок начал плакать."],
      ["날씨가 따뜻해지기 시작했어요.", "Havo isiy boshladi.", "The weather has started to get warm.", "Начало теплеть."],
      ["다음 달부터 운동하기 시작할 거예요.", "Kelasi oydan sport bilan shug'ullana boshlayman.", "I'm going to start exercising next month.", "Со следующего месяца начну заниматься спортом."],
    ],
    mistakes: [
      ["배우를 시작했어요", "배우기 시작했어요", t("시작하다 oldidan fe'lga 기 qo'shiladi.", "Add 기 to the verb before 시작하다.", "Перед 시작하다 к глаголу добавляется 기.")],
    ],
    quiz: [
      ["눈이 ___ 시작했어요. (오다)", ["오기", "와서"], 0],
      ["작년부터 피아노를 ___ 시작했어요. (치다)", ["치기", "치고"], 0],
      ["사람들이 ___ 시작했어요. (모이다)", ["모이기", "모이는"], 0],
      ["봄이 돼서 꽃이 ___ 시작했어요. (피다)", ["피기", "핀"], 0],
    ],
  }),
  point("expressions", {
    id: "looks-boida", pattern: "A + 아/어 보이다",
    title: t("“…ko'rinadi” — 아/어 보이다", "“Looks …” — 아/어 보이다", "«Выглядит …» — 아/어 보이다"),
    explain: t(
      "Tashqi ko'rinishga qarab taxmin: 피곤해 보여요 — charchagan ko'rinasiz. Sifat o'zagiga 아/어 qo'shilib, bo'sh joydan keyin 보이다 keladi. Ot bilan esa N처럼 보이다.",
      "Judging by appearance: 피곤해 보여요 (You look tired). Add 아/어 to an adjective stem, then 보이다 after a space. With nouns use N처럼 보이다.",
      "Суждение по внешнему виду: 피곤해 보여요 — вы выглядите уставшим. К основе прилагательного добавляется 아/어, затем через пробел 보이다. С существительными — N처럼 보이다.",
    ),
    rules: [
      ["A + 아/어 보여요", "…ko'rinadi", "looks …", "выглядит …"],
      ["A + 아/어 보이는 N", "…ko'ringan N", "N that looks …", "N, который выглядит …"],
      ["N처럼 보여요", "N ga o'xshab ko'rinadi", "looks like N", "выглядит как N"],
    ],
    examples: [
      ["오늘 기분이 좋아 보여요.", "Bugun kayfiyatingiz yaxshi ko'rinadi.", "You look happy today.", "Сегодня у вас, похоже, хорошее настроение."],
      ["이 케이크 정말 맛있어 보여요.", "Bu tort juda mazali ko'rinyapti.", "This cake looks really delicious.", "Этот торт выглядит очень вкусным."],
      ["그 가방은 비싸 보여요.", "U sumka qimmat ko'rinadi.", "That bag looks expensive.", "Та сумка выглядит дорогой."],
      ["안경을 쓰니까 선생님처럼 보여요.", "Ko'zoynak taqsangiz, o'qituvchiga o'xshaysiz.", "With glasses on you look like a teacher.", "В очках вы похожи на учителя."],
    ],
    mistakes: [
      ["피곤하 보여요", "피곤해 보여요", t("하다 → 해 보여요.", "하다 becomes 해 보여요.", "하다 → 해 보여요.")],
      ["바쁘어 보여요", "바빠 보여요", t("ㅡ tushadi: 바빠 보여요.", "ㅡ drops: 바빠 보여요.", "ㅡ выпадает: 바빠 보여요.")],
    ],
    drill: { kind: "aeoForm", rest: " 보여요", adjectives: true, label: "A-아/어 보여요" },
    quiz: [
      ["얼굴이 안 ___ 보여요. (좋다)", ["좋아", "좋어"], 0],
      ["이 신발은 ___ 보여요. (편하다)", ["편해", "편하"], 0],
      ["동생이 ___ 보여요. (기쁘다)", ["기뻐", "기쁘어"], 0],
      ["오늘 정말 ___ 보이네요. (예쁘다)", ["예뻐", "예쁘어"], 0],
    ],
  }),
  point("expressions", {
    id: "finish-beorida", pattern: "V + 아/어 버리다",
    title: t("“…ib qo'ydi” — 아/어 버리다", "“Went and …” — 아/어 버리다", "«Взял да …» — 아/어 버리다"),
    explain: t(
      "Harakat butunlay tugaganini, ko'pincha afsus yoki yengillik bilan bildiradi: 기차가 떠나 버렸어요 — poyezd ketib qoldi. Ko'pincha o'tgan zamonda: 아/어 버렸어요. O'zbekchadagi “…ib qo'ydi, …ib qoldi” ga yaqin.",
      "The action is completely done, often with regret or relief: 기차가 떠나 버렸어요 (The train has already gone). Mostly in the past: 아/어 버렸어요. Close to English “went and …”, “ended up …”.",
      "Действие полностью завершено, часто с сожалением или облегчением: 기차가 떠나 버렸어요 — поезд уже ушёл. Обычно в прошедшем: 아/어 버렸어요. Похоже на русские «взял да …», «совсем …».",
    ),
    rules: [
      ["V + 아/어 버렸어요", "…ib qo'ydi / qoldi", "went and …, … completely", "взял да … / совсем …"],
      ["잊어버리다, 잃어버리다", "bitta so'z sifatida yoziladi", "written as one word", "пишутся слитно"],
    ],
    examples: [
      ["배가 고파서 케이크를 다 먹어 버렸어요.", "Qornim och edi, tortning hammasini yeb qo'ydim.", "I was hungry, so I ate the whole cake.", "Я был голоден и съел весь торт."],
      ["친구 생일을 잊어버렸어요.", "Do'stimning tug'ilgan kunini unutib qo'ydim.", "I forgot my friend's birthday.", "Я забыл про день рождения друга."],
      ["지하철에서 지갑을 잃어버렸어요.", "Metroda hamyonimni yo'qotib qo'ydim.", "I lost my wallet on the subway.", "Я потерял кошелёк в метро."],
      ["숙제를 빨리 끝내 버리고 놀러 가요.", "Uy vazifasini tezda tugatib, sayrga chiqamiz.", "Let's get the homework done and go out.", "Давай быстро закончим домашку и пойдём гулять."],
    ],
    mistakes: [
      ["잃어 버렸어요", "잃어버렸어요", t("잃어버리다, 잊어버리다 qo'shib yoziladi.", "잃어버리다 and 잊어버리다 are written as one word.", "잃어버리다 и 잊어버리다 пишутся слитно.")],
    ],
    drill: { kind: "aeoForm", rest: " 버렸어요", label: "V-아/어 버렸어요" },
    quiz: [
      ["버스가 벌써 ___ 버렸어요. (가다)", ["가", "가서"], 0],
      ["동생이 제 과자를 다 ___ 버렸어요. (먹다)", ["먹어", "먹고"], 0],
      ["비밀번호를 ___. (잊어버리다)", ["잊어버렸어요", "잊어 버리었요"], 0],
      ["화가 나서 편지를 ___ 버렸어요. (찢다)", ["찢어", "찢아"], 0],
    ],
  }),
  point("expressions", {
    id: "keep-nota", pattern: "V + 아/어 놓다 · 아/어 두다",
    title: t("Oldindan qilib qo'yish — 아/어 놓다", "Doing ahead — 아/어 놓다", "Сделать заранее — 아/어 놓다"),
    explain: t(
      "Harakatni oldindan bajarib, natijasini saqlab qo'yishni bildiradi: 표를 미리 사 놓았어요 — chiptani oldindan olib qo'ydim. 두다 deyarli bir xil, lekin uzoqroq saqlashni ta'kidlaydi. 놓았어요 og'zakida 놨어요 bo'lib qisqaradi.",
      "Doing something ahead of time and keeping the result: 표를 미리 사 놓았어요 (I bought the tickets in advance). 두다 is almost the same but stresses keeping it longer. 놓았어요 is often shortened to 놨어요 in speech.",
      "Сделать что-то заранее и сохранить результат: 표를 미리 사 놓았어요 — я заранее купил билеты. 두다 почти то же, но подчёркивает более долгое сохранение. 놓았어요 в разговоре сокращается до 놨어요.",
    ),
    rules: [
      ["V + 아/어 놓다", "…ib qo'ymoq", "do … in advance / and leave it", "сделать заранее / оставить"],
      ["V + 아/어 두다", "…ib qo'ymoq (saqlab)", "do … and keep it", "сделать и сохранить"],
      ["놓았어요 → 놨어요", "og'zaki qisqa shakl", "spoken short form", "разговорное сокращение"],
    ],
    examples: [
      ["손님이 오니까 음식을 많이 만들어 놓았어요.", "Mehmon keladi, shuning uchun ko'p ovqat tayyorlab qo'ydim.", "Guests are coming, so I've made lots of food.", "Придут гости, поэтому я заранее приготовил много еды."],
      ["더우니까 창문을 열어 놓으세요.", "Issiq, derazani ochib qo'ying.", "It's hot, so leave the window open.", "Жарко, оставьте окно открытым."],
      ["호텔을 미리 예약해 뒀어요.", "Mehmonxonani oldindan band qilib qo'ydim.", "I booked the hotel in advance.", "Я заранее забронировал отель."],
      ["중요한 단어는 공책에 써 두세요.", "Muhim so'zlarni daftarga yozib qo'ying.", "Write important words down in your notebook.", "Важные слова запишите в тетрадь."],
    ],
    mistakes: [
      ["열고 놓았어요", "열어 놓았어요", t("놓다/두다 oldidan 아/어 shakli keladi, 고 emas.", "놓다/두다 follow the 아/어 form, not 고.", "Перед 놓다/두다 — форма на 아/어, а не 고.")],
    ],
    quiz: [
      ["여행 가기 전에 표를 ___ 놓았어요. (사다)", ["사", "사고"], 0],
      ["불을 ___ 두세요. (켜다)", ["켜", "켜서"], 0],
      ["숙제를 미리 ___ 놨어요. (하다)", ["해", "하"], 0],
      ["친구가 오기 전에 방을 ___ 놓았어요. (청소하다)", ["청소해", "청소하고"], 0],
    ],
  }),
  point("expressions", {
    id: "easy-gi", pattern: "V + 기(가) 쉽다 · 어렵다 · 좋다 · 싫다",
    title: t("“…ish oson / qiyin” — 기 쉽다", "“Easy / hard to …” — 기 쉽다", "«Легко / трудно …» — 기 쉽다"),
    explain: t(
      "Harakatni otga aylantirib (기), unga baho beradi: 이 단어는 외우기 어려워요 — bu so'zni yodlash qiyin. 쉽다, 어렵다, 좋다, 싫다, 편하다, 불편하다 bilan keladi. 가 ko'pincha tushib qoladi.",
      "Turns the action into a noun (기) and judges it: 이 단어는 외우기 어려워요 (This word is hard to memorise). Used with 쉽다, 어렵다, 좋다, 싫다, 편하다, 불편하다. 가 is often dropped.",
      "Превращает действие в существительное (기) и оценивает его: 이 단어는 외우기 어려워요 — это слово трудно запомнить. Употребляется с 쉽다, 어렵다, 좋다, 싫다, 편하다, 불편하다. 가 часто опускается.",
    ),
    rules: [
      ["V + 기(가) 쉬워요 / 어려워요", "…ish oson / qiyin", "easy / hard to …", "легко / трудно …"],
      ["V + 기(가) 좋아요 / 싫어요", "…ish yaxshi / …gim yo'q", "nice / unpleasant to …", "хорошо / не хочется …"],
      ["V + 기(가) 편해요 / 불편해요", "…ish qulay / noqulay", "convenient / inconvenient to …", "удобно / неудобно …"],
    ],
    examples: [
      ["한글은 배우기 쉬워요.", "Hangulni o'rganish oson.", "Hangul is easy to learn.", "Хангыль легко выучить."],
      ["이 신발은 걷기 편해요.", "Bu poyabzalda yurish qulay.", "These shoes are comfortable to walk in.", "В этой обуви удобно ходить."],
      ["날씨가 추워서 밖에 나가기 싫어요.", "Havo sovuq, tashqariga chiqqim kelmayapti.", "It's cold, so I don't feel like going out.", "Холодно, не хочется выходить на улицу."],
      ["이 공원은 산책하기 좋아요.", "Bu bog' sayr qilish uchun yaxshi.", "This park is nice for a walk.", "Этот парк хорош для прогулок."],
    ],
    mistakes: [
      ["배우는 쉬워요", "배우기 쉬워요", t("쉽다/어렵다 oldidan fe'lga 기 qo'shiladi.", "Add 기 to the verb before 쉽다/어렵다.", "Перед 쉽다/어렵다 к глаголу добавляется 기.")],
    ],
    quiz: [
      ["이 문제는 ___ 어려워요. (풀다)", ["풀기", "풀고"], 0],
      ["학교가 가까워서 ___ 편해요. (다니다)", ["다니기", "다녀서"], 0],
      ["이 책은 글씨가 커서 ___ 쉬워요. (읽다)", ["읽기", "읽어"], 0],
      ["오늘은 피곤해서 아무것도 ___ 싫어요. (하다)", ["하기", "하는"], 0],
    ],
  }),
  point("expressions", {
    id: "thinking-of", pattern: "V + (으)ㄹ까 하다",
    title: t("“…sammi deyapman” — (으)ㄹ까 하다", "“I'm thinking of …” — (으)ㄹ까 하다", "«Думаю …» — (으)ㄹ까 하다"),
    explain: t(
      "Hali qat'iy bo'lmagan reja: 주말에 영화를 볼까 해요 — dam olish kuni kino ko'rsammi deyapman. (으)려고 하다 dan yumshoqroq, qaror hali aniq emas. Unli va ㄹ bilan tugagan o'zakka ㄹ까, undoshga 을까.",
      "A loose plan: 주말에 영화를 볼까 해요 (I'm thinking of watching a film at the weekend). Softer than (으)려고 하다; the decision isn't firm yet. Vowel and ㄹ stems take ㄹ까, consonant stems 을까.",
      "Неокончательный план: 주말에 영화를 볼까 해요 — думаю в выходные посмотреть фильм. Мягче, чем (으)려고 하다: решение ещё не твёрдое. Основы на гласную и ㄹ — ㄹ까, на согласную — 을까.",
    ),
    rules: [
      ["받침 X, ㄹ + ㄹ까 해요", "Unli yoki ㄹ bilan tugasa", "Vowel or ㄹ stem", "Основа на гласную или ㄹ"],
      ["받침 O + 을까 해요", "Undosh bilan tugasa", "Consonant stem", "Основа на согласную"],
      ["V + (으)ㄹ까 했어요", "…moqchi edim (lekin)", "I was thinking of … (but)", "Я думал … (но)"],
    ],
    examples: [
      ["이번 방학에 제주도에 갈까 해요.", "Bu ta'tilda Jejuga borsammi deyapman.", "I'm thinking of going to Jeju this vacation.", "Думаю съездить на Чеджу в эти каникулы."],
      ["오늘 저녁은 집에서 김치찌개를 만들까 해요.", "Bugun kechqurun uyda kimchi-jjigae pishirsammi deyapman.", "I'm thinking of making kimchi stew at home tonight.", "Думаю сегодня вечером приготовить дома кимчи-ччигэ."],
      ["머리를 짧게 자를까 해요.", "Sochimni qisqa qildirsammi deb turibman.", "I'm thinking of cutting my hair short.", "Думаю коротко подстричься."],
      ["택시를 탈까 했는데 버스를 탔어요.", "Taksiga o'tirsammi degandim, lekin avtobusga chiqdim.", "I thought about taking a taxi, but I took the bus.", "Хотел взять такси, но поехал на автобусе."],
    ],
    mistakes: [
      ["읽까 해요", "읽을까 해요", t("Undosh bilan tugagan o'zakka 을까.", "Consonant stems take 을까.", "К основе на согласную — 을까.")],
      ["만들을까 해요", "만들까 해요", t("ㄹ bilan tugagan o'zakka faqat 까.", "ㄹ stems take just 까.", "К основе на ㄹ — просто 까.")],
    ],
    drill: { kind: "euForm", ending: "ㄹ까 해요", label: "V-(으)ㄹ까 해요" },
    quiz: [
      ["주말에 친구를 ___ 해요. (만나다)", ["만날까", "만나을까"], 0],
      ["점심에 비빔밥을 ___ 해요. (먹다)", ["먹을까", "먹까"], 0],
      ["새 휴대폰을 ___ 해요. (사다)", ["살까", "사을까"], 0],
      ["오늘은 집에서 ___ 해요. (쉬다)", ["쉴까", "쉬을까"], 0],
    ],
  }),

  // --- Irregular verbs -----------------------------------------------------------
  point("irregular", {
    id: "eu-irregular", pattern: "ㅡ 탈락",
    title: t("ㅡ tushishi", "ㅡ dropping", "Выпадение ㅡ"),
    explain: t(
      "O'zagi ㅡ unli bilan tugagan fe'l va sifatlarda (쓰다, 크다, 바쁘다, 아프다) 아/어 oldidan ㅡ tushadi. Nima qo'shilishini oldingi bo'g'in hal qiladi: u ㅏ yoki ㅗ bo'lsa — 아 (바쁘다 → 바빠요), boshqa unli bo'lsa yoki o'zak bir bo'g'inli bo'lsa — 어 (쓰다 → 써요, 예쁘다 → 예뻐요).",
      "Verbs and adjectives whose stem ends in ㅡ (쓰다, 크다, 바쁘다, 아프다) drop ㅡ before 아/어. The syllable before decides: after ㅏ or ㅗ it is 아 (바쁘다 → 바빠요); otherwise, or with one-syllable stems, 어 (쓰다 → 써요, 예쁘다 → 예뻐요).",
      "У глаголов и прилагательных с основой на ㅡ (쓰다, 크다, 바쁘다, 아프다) перед 아/어 гласная ㅡ выпадает. Решает предыдущий слог: после ㅏ или ㅗ — 아 (바쁘다 → 바빠요); иначе или в односложной основе — 어 (쓰다 → 써요, 예쁘다 → 예뻐요).",
    ),
    rules: [
      ["쓰다 → 써요, 크다 → 커요", "bir bo'g'inli: 어", "one syllable: 어", "односложные: 어"],
      ["바쁘다 → 바빠요, 아프다 → 아파요", "oldingi bo'g'in ㅏ/ㅗ: 아", "ㅏ/ㅗ before it: 아", "перед ним ㅏ/ㅗ: 아"],
      ["예쁘다 → 예뻐요, 기쁘다 → 기뻐요", "boshqa unli: 어", "any other vowel: 어", "другая гласная: 어"],
    ],
    examples: [
      ["요즘 일이 많아서 너무 바빠요.", "Bu kunlarda ish ko'p, juda bandman.", "I'm really busy with lots of work these days.", "Сейчас много работы, я очень занят."],
      ["어제 친구에게 편지를 썼어요.", "Kecha do'stimga xat yozdim.", "I wrote a letter to my friend yesterday.", "Вчера я написал письмо другу."],
      ["배가 고파서 라면을 끓였어요.", "Qornim ochgani uchun ramyon qaynatdim.", "I was hungry, so I made ramyeon.", "Я проголодался и сварил рамён."],
      ["이 꽃이 정말 예뻐요.", "Bu gul juda chiroyli.", "This flower is really pretty.", "Этот цветок очень красивый."],
      ["머리가 아파서 일찍 잤어요.", "Boshim og'rigani uchun erta yotdim.", "I had a headache, so I went to bed early.", "У меня болела голова, и я рано лёг."],
    ],
    mistakes: [
      ["바뻐요", "바빠요", t("Oldingi bo'g'in 바 (ㅏ) — demak 아: 바빠요.", "The syllable before is 바 (ㅏ), so 아: 바빠요.", "Предыдущий слог 바 (ㅏ), значит 아: 바빠요.")],
      ["쓰었어요", "썼어요", t("ㅡ tushadi: 써 + ㅆ어요.", "ㅡ drops: 써 + ㅆ어요.", "ㅡ выпадает: 써 + ㅆ어요.")],
    ],
    drill: { kind: "form", form: "present", irregular: "ㅡ" },
    quiz: [
      ["가방이 너무 ___. (크다)", ["커요", "크어요"], 0],
      ["배가 ___. 밥 먹으러 가요. (고프다)", ["고파요", "고퍼요"], 0],
      ["어제 모자를 ___. (쓰다)", ["썼어요", "쓰었어요"], 0],
      ["그 영화는 너무 ___. (슬프다)", ["슬퍼요", "슬파요"], 0],
      ["불 좀 ___ 주세요. (끄다)", ["꺼", "끄어"], 0],
    ],
  }),
  point("irregular", {
    id: "l-irregular", pattern: "ㄹ 탈락",
    title: t("ㄹ tushishi", "ㄹ dropping", "Выпадение ㄹ"),
    explain: t(
      "O'zagi ㄹ bilan tugagan fe'l va sifatlarda (살다, 만들다, 알다, 놀다, 열다, 멀다) ㄴ, ㅂ, ㅅ bilan boshlanadigan qo'shimchalar oldidan ㄹ tushadi: 사세요, 압니다, 만드는, 만든. Bu o'zaklar ortiqcha 으 ham olmaydi: 살면, 놀러, 만들려고. 아/어 oldidan esa o'zgarmaydi: 살아요, 만들어요.",
      "Stems ending in ㄹ (살다, 만들다, 알다, 놀다, 열다, 멀다) drop ㄹ before endings that start with ㄴ, ㅂ or ㅅ: 사세요, 압니다, 만드는, 만든. They never take the extra 으: 살면, 놀러, 만들려고. Before 아/어 nothing changes: 살아요, 만들어요.",
      "Основы на ㄹ (살다, 만들다, 알다, 놀다, 열다, 멀다) теряют ㄹ перед окончаниями на ㄴ, ㅂ, ㅅ: 사세요, 압니다, 만드는, 만든. Вставное 으 они не берут: 살면, 놀러, 만들려고. Перед 아/어 ничего не меняется: 살아요, 만들어요.",
    ),
    rules: [
      ["ㄹ + ㄴ/ㅂ/ㅅ → 사는, 삽니다, 사세요", "ㄹ tushadi", "ㄹ drops", "ㄹ выпадает"],
      ["ㄹ + (으)면, (으)러 → 살면, 놀러", "으 qo'shilmaydi", "no extra 으", "без вставного 으"],
      ["ㄹ + 아/어요 → 살아요", "o'zgarmaydi", "no change", "без изменений"],
    ],
    examples: [
      ["어디에 사세요? — 서울에 살아요.", "Qayerda yashaysiz? — Seulda yashayman.", "Where do you live? — I live in Seoul.", "Где вы живёте? — В Сеуле."],
      ["이 노래를 아는 사람이 많아요.", "Bu qo'shiqni biladigan odamlar ko'p.", "Lots of people know this song.", "Эту песню знают многие."],
      ["어머니가 만든 케이크예요.", "Bu onam pishirgan tort.", "This is a cake my mother made.", "Это торт, который испекла мама."],
      ["주말에 친구 집에 놀러 가요.", "Dam olish kuni do'stimnikiga mehmonga boraman.", "I'm going over to my friend's place this weekend.", "В выходные иду в гости к другу."],
      ["창문 좀 열어 주세요.", "Derazani ochib yuboring.", "Please open the window.", "Откройте, пожалуйста, окно."],
    ],
    mistakes: [
      ["만들으세요", "만드세요", t("ㄹ o'zak 으 olmaydi, 세요 oldidan esa ㄹ tushadi.", "ㄹ stems take no 으, and ㄹ drops before 세요.", "Основы на ㄹ не берут 으, а перед 세요 ㄹ выпадает.")],
      ["알는 사람", "아는 사람", t("는 oldidan ㄹ tushadi.", "ㄹ drops before 는.", "Перед 는 ㄹ выпадает.")],
    ],
    drill: { kind: "form", form: "honorific", irregular: "ㄹ", verbsOnly: true },
    quiz: [
      ["선생님은 어디에 ___? (살다)", ["사세요", "살으세요", "살세요"], 0],
      ["저는 그 사람을 잘 ___. (알다)", ["압니다", "알습니다"], 0],
      ["김치를 ___ 방법을 배웠어요. (만들다)", ["만드는", "만들는"], 0],
      ["공원에 ___ 갈까요? (놀다)", ["놀러", "놀으러"], 0],
      ["집이 회사에서 ___. (멀다)", ["멀어요", "머어요"], 0],
    ],
  }),
  point("irregular", {
    id: "s-irregular", pattern: "ㅅ 불규칙",
    title: t("ㅅ noto'g'ri fe'llari", "ㅅ irregular", "Неправильные на ㅅ"),
    explain: t(
      "Ba'zi fe'llarda (낫다 — tuzalmoq, 짓다 — qurmoq, 붓다 — quymoq/shishmoq, 젓다 — aralashtirmoq, 잇다 — ulamoq) unli bilan boshlanadigan qo'shimcha oldidan ㅅ tushadi, lekin bo'g'inlar qo'shilib ketmaydi: 낫다 → 나아요, 짓다 → 지어요, 지으세요. 웃다, 씻다, 벗다 to'g'ri fe'llar: 웃어요, 씻어요.",
      "In some verbs (낫다 to get better, 짓다 to build, 붓다 to pour or swell, 젓다 to stir, 잇다 to join) ㅅ drops before an ending that starts with a vowel, but the syllables don't merge: 낫다 → 나아요, 짓다 → 지어요, 지으세요. 웃다, 씻다 and 벗다 are regular: 웃어요, 씻어요.",
      "В некоторых глаголах (낫다 — выздоравливать, 짓다 — строить, 붓다 — наливать/опухать, 젓다 — мешать, 잇다 — соединять) ㅅ выпадает перед окончанием на гласную, но слоги не сливаются: 낫다 → 나아요, 짓다 → 지어요, 지으세요. 웃다, 씻다, 벗다 — правильные: 웃어요, 씻어요.",
    ),
    rules: [
      ["낫다 → 나아요, 나으면", "ㅅ tushadi", "ㅅ drops", "ㅅ выпадает"],
      ["짓다 → 지어요, 지으세요", "bo'g'inlar qo'shilmaydi", "no contraction", "слоги не сливаются"],
      ["웃다, 씻다, 벗다 → 웃어요", "to'g'ri fe'llar", "regular verbs", "правильные глаголы"],
    ],
    examples: [
      ["감기가 다 나았어요.", "Shamollashim butunlay tuzaldi.", "My cold is completely better.", "Простуда полностью прошла."],
      ["약을 먹으면 빨리 나을 거예요.", "Dori ichsangiz tez tuzalasiz.", "If you take the medicine, you'll get better quickly.", "Если выпьете лекарство, быстро поправитесь."],
      ["할아버지가 이 집을 직접 지으셨어요.", "Bu uyni bobom o'zlari qurganlar.", "My grandfather built this house himself.", "Дедушка сам построил этот дом."],
      ["아기 이름을 지었어요.", "Chaqaloqqa ism qo'ydik.", "We named the baby.", "Мы дали ребёнку имя."],
      ["밥 먹기 전에 손을 씻으세요.", "Ovqatdan oldin qo'lingizni yuving.", "Wash your hands before eating.", "Мойте руки перед едой."],
    ],
    mistakes: [
      ["감기가 낫았어요", "감기가 나았어요", t("Unli oldidan ㅅ tushadi.", "ㅅ drops before a vowel.", "Перед гласной ㅅ выпадает.")],
      ["우어요", "웃어요", t("웃다 — to'g'ri fe'l, ㅅ saqlanadi.", "웃다 is regular; ㅅ stays.", "웃다 — правильный глагол, ㅅ сохраняется.")],
    ],
    drill: { kind: "form", form: "present", irregular: "ㅅ" },
    quiz: [
      ["감기가 빨리 ___ 좋겠어요. (낫다)", ["나으면", "낫으면", "나면"], 0],
      ["이 집은 아버지가 ___. (짓다)", ["지었어요", "짓었어요"], 0],
      ["친구가 크게 ___. (웃다)", ["웃었어요", "우었어요"], 0],
      ["커피에 설탕을 넣고 ___ 주세요. (젓다)", ["저어", "젓어"], 0],
    ],
  }),
  point("irregular", {
    id: "h-irregular", pattern: "ㅎ 불규칙",
    title: t("ㅎ noto'g'ri sifatlari", "ㅎ irregular", "Неправильные на ㅎ"),
    explain: t(
      "Rang va ko'rinish sifatlari (빨갛다, 노랗다, 파랗다, 하얗다, 까맣다) hamda 이렇다, 그렇다, 저렇다, 어떻다 da ㅎ tushadi. 아/어 oldidan unli ㅐ ga aylanadi: 빨갛다 → 빨개요, 어떻다 → 어때요 (하얗다 → 하얘요). 으 oldidan ㅎ ham, 으 ham tushadi: 빨간, 그러면. 좋다, 넣다, 놓다 to'g'ri: 좋아요.",
      "Colour and shape adjectives (빨갛다, 노랗다, 파랗다, 하얗다, 까맣다) and 이렇다, 그렇다, 저렇다, 어떻다 lose ㅎ. Before 아/어 the vowel becomes ㅐ: 빨갛다 → 빨개요, 어떻다 → 어때요 (하얗다 → 하얘요). Before 으, both ㅎ and 으 drop: 빨간, 그러면. 좋다, 넣다 and 놓다 are regular: 좋아요.",
      "Прилагательные цвета и вида (빨갛다, 노랗다, 파랗다, 하얗다, 까맣다), а также 이렇다, 그렇다, 저렇다, 어떻다 теряют ㅎ. Перед 아/어 гласная становится ㅐ: 빨갛다 → 빨개요, 어떻다 → 어때요 (하얗다 → 하얘요). Перед 으 выпадают и ㅎ, и 으: 빨간, 그러면. 좋다, 넣다, 놓다 — правильные: 좋아요.",
    ),
    rules: [
      ["빨갛다 → 빨개요, 어떻다 → 어때요", "아/어 oldidan ㅐ", "ㅐ before 아/어", "ㅐ перед 아/어"],
      ["빨갛다 → 빨간, 그렇다 → 그러면", "으 oldidan ㅎ tushadi", "ㅎ drops before 으", "ㅎ выпадает перед 으"],
      ["좋다, 넣다, 놓다 → 좋아요", "to'g'ri", "regular", "правильные"],
    ],
    examples: [
      ["가을에는 나뭇잎이 빨개요.", "Kuzda barglar qizarib ketadi.", "In autumn the leaves turn red.", "Осенью листья красные."],
      ["오늘 날씨가 어때요?", "Bugun havo qanday?", "How's the weather today?", "Какая сегодня погода?"],
      ["하얀 셔츠를 샀어요.", "Oq ko'ylak oldim.", "I bought a white shirt.", "Я купил белую рубашку."],
      ["그래요? 정말 몰랐어요.", "Shundaymi? Rostdan bilmagan ekanman.", "Really? I had no idea.", "Правда? Я и не знал."],
      ["하늘이 정말 파래요.", "Osmon juda moviy.", "The sky is really blue.", "Небо такое голубое."],
    ],
    mistakes: [
      ["빨갛아요", "빨개요", t("ㅎ tushib, unli ㅐ ga aylanadi.", "ㅎ drops and the vowel becomes ㅐ.", "ㅎ выпадает, гласная становится ㅐ.")],
      ["빨갛은 사과", "빨간 사과", t("으 oldidan ㅎ va 으 tushadi.", "Before 으, both ㅎ and 으 drop.", "Перед 으 выпадают и ㅎ, и 으.")],
    ],
    drill: { kind: "form", form: "present", irregular: "ㅎ" },
    quiz: [
      ["이 옷 ___? (어떻다)", ["어때요", "어떻어요"], 0],
      ["바나나가 ___. (노랗다)", ["노래요", "노랗아요"], 0],
      ["___ 구두를 신었어요. (까맣다)", ["까만", "까맣은"], 0],
      ["이 음식이 정말 ___. (좋다)", ["좋아요", "조애요"], 0],
      ["___ 내일 만나요. (그렇다)", ["그러면", "그렇으면"], 0],
    ],
  }),
];
