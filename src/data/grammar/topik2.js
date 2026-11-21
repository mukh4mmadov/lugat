// Intermediate grammar (TOPIK II, levels 3–4: NIKL 중급). Same shapes as
// topik1.js, with `level: "topik2"`; groups are the TOPIK I groups. A `drill`
// is only set where grammarDrills can build a correct one from the topic words.

const t = (uz, en, ru) => ({ uz, en, ru });

export const TOPIK2_TEXT = {
  title: t("TOPIK II grammatikasi", "TOPIK II grammar", "Грамматика TOPIK II"),
  intro: t(
    "O'rta daraja (3–4) grammatikasi: sabab, shart, o'zgarish, nutqni ko'chirish va rasmiy yozuv shakllari. Avval TOPIK I mavzularini o'zlashtiring.",
    "Intermediate grammar (levels 3–4): reasons, conditions, change, reported speech and formal written forms. Master the TOPIK I points first.",
    "Грамматика среднего уровня (3–4): причина, условие, изменение, косвенная речь и формы письменной речи. Сначала освойте темы TOPIK I.",
  ),
};

const point = (group, data) => ({ lesson: null, level: "topik2", group, ...data });

export default [
  point("connectors", {
    id: "baram-e", pattern: "V + 는 바람에",
    title: t("Kutilmagan sabab — 는 바람에", "An unexpected cause — 는 바람에", "Неожиданная причина — 는 바람에"),
    explain: t(
      "Kutilmagan hodisa tufayli yomon natija chiqqanini bildiradi: 비가 오는 바람에 못 갔어요 — yomg'ir yog'ib qolgani uchun bora olmadim. Faqat fe'lga qo'shiladi, natija odatda salbiy bo'ladi. Ikkinchi qismda buyruq (-(으)세요) yoki taklif (-(으)ㅂ시다) ishlatilmaydi.",
      "Shows that an unexpected event led to a bad result: 비가 오는 바람에 못 갔어요 (I couldn't go because it rained). It attaches to verbs only and the result is usually negative. The second clause cannot be a command (-(으)세요) or a suggestion (-(으)ㅂ시다).",
      "Показывает, что неожиданное событие привело к плохому результату: 비가 오는 바람에 못 갔어요 — из-за дождя я не смог пойти. Только с глаголами, результат обычно отрицательный. Во второй части нельзя ставить приказ (-(으)세요) или предложение (-(으)ㅂ시다).",
    ),
    rules: [
      ["V + 는 바람에 (오다 → 오는 바람에)", "Fe'l + 는 바람에", "Verb + 는 바람에", "Глагол + 는 바람에"],
      ["Natija: salbiy / kutilmagan", "Yomon yoki kutilmagan oqibat", "A bad or unplanned result", "Плохой или непредвиденный итог"],
      ["Sifatga qo'shilmaydi", "Sifat bilan 아/어서 ishlating", "With adjectives use 아/어서", "С прилагательными — 아/어서"],
    ],
    examples: [
      ["비가 갑자기 오는 바람에 소풍을 못 갔어요.", "Yomg'ir to'satdan yog'ib qolgani uchun sayohatga bora olmadik.", "Because it suddenly rained, we couldn't go on the picnic.", "Из-за внезапного дождя мы не смогли поехать на пикник."],
      ["늦잠을 자는 바람에 지각했어요.", "Uxlab qolganim uchun kechikdim.", "I overslept and was late.", "Я проспал и опоздал."],
      ["길이 막히는 바람에 약속에 늦었어요.", "Yo'l tiqilib qolgani uchun uchrashuvga kechikdim.", "Traffic jammed up, so I was late for the appointment.", "Из-за пробки я опоздал на встречу."],
      ["휴대폰이 꺼지는 바람에 연락을 못 했어요.", "Telefon o'chib qolgani uchun aloqa qila olmadim.", "My phone died, so I couldn't get in touch.", "Телефон отключился, поэтому я не смог связаться."],
    ],
    mistakes: [
      ["일찍 일어나는 바람에 기분이 좋았어요", "일찍 일어난 덕분에 기분이 좋았어요", t("Yaxshi natija uchun 덕분에 ishlatiladi.", "For good results use 덕분에.", "Для хорошего результата — 덕분에.")],
      ["바쁜 바람에 못 갔어요", "바빠서 못 갔어요", t("바람에 faqat fe'lga qo'shiladi.", "바람에 only attaches to verbs.", "바람에 присоединяется только к глаголам.")],
    ],
    quiz: [
      ["비가 오는 ___ 경기가 취소됐어요.", ["바람에", "덕분에"], 0],
      ["선생님이 도와주신 ___ 시험에 합격했어요.", ["덕분에", "바람에"], 0],
      ["버스를 놓치는 ___ 늦었어요.", ["바람에", "덕분에"], 0],
      ["길이 ___ 바람에 늦었어요. (막히다)", ["막히는", "막힌다"], 0],
    ],
  }),
  point("connectors", {
    id: "deokbune", pattern: "N + 덕분에 · V/A + (으)ㄴ 덕분에",
    title: t("Yaxshi sabab — 덕분에", "Thanks to — 덕분에", "Благодаря — 덕분에"),
    explain: t(
      "Biror kishi yoki narsa tufayli yaxshi natijaga erishilganini bildiradi: 선생님 덕분에 합격했어요 — ustozim tufayli o'tdim. Minnatdorlik bor. Salbiy sabab uchun (N) 탓에 ishlatiladi.",
      "Shows a good result thanks to someone or something, with a sense of gratitude: 선생님 덕분에 합격했어요 (I passed thanks to my teacher). For a negative cause use (N) 탓에.",
      "Показывает хороший результат благодаря кому-то или чему-то, с оттенком благодарности: 선생님 덕분에 합격했어요 — я сдал благодаря учителю. Для отрицательной причины — (N) 탓에.",
    ),
    rules: [
      ["N + 덕분에", "Ot + 덕분에: 친구 덕분에", "Noun + 덕분에: 친구 덕분에", "Сущ. + 덕분에: 친구 덕분에"],
      ["V + (으)ㄴ 덕분에 · A + (으)ㄴ 덕분에", "Fe'l / sifat + 덕분에", "Verb / adjective + 덕분에", "Глагол / прилагательное + 덕분에"],
      ["탓에", "Salbiy sabab: 늦잠을 잔 탓에", "Negative cause: 늦잠을 잔 탓에", "Отрицательная причина: 늦잠을 잔 탓에"],
    ],
    examples: [
      ["선생님 덕분에 한국어를 잘하게 됐어요.", "Ustozim tufayli koreyschani yaxshi bilib oldim.", "Thanks to my teacher, I got good at Korean.", "Благодаря учителю я хорошо выучил корейский."],
      ["친구가 도와준 덕분에 일이 빨리 끝났어요.", "Do'stim yordam bergani tufayli ish tez tugadi.", "Thanks to my friend's help, the work finished quickly.", "Благодаря помощи друга работа быстро закончилась."],
      ["날씨가 좋은 덕분에 소풍이 즐거웠어요.", "Havo yaxshi bo'lgani tufayli sayohat yoqimli o'tdi.", "Thanks to the nice weather, the picnic was fun.", "Благодаря хорошей погоде пикник удался."],
      ["부모님 덕분에 대학교를 졸업했어요.", "Ota-onam tufayli universitetni bitirdim.", "Thanks to my parents, I graduated from university.", "Благодаря родителям я окончил университет."],
    ],
    mistakes: [
      ["늦잠을 잔 덕분에 지각했어요", "늦잠을 잔 탓에 지각했어요", t("Yomon natija uchun 탓에.", "For a bad result use 탓에.", "Для плохого результата — 탓에.")],
      ["친구 덕분에서 시험에 붙었어요", "친구 덕분에 시험에 붙었어요", t("덕분에 dan keyin 서 qo'shilmaydi.", "Don't add 서 after 덕분에.", "После 덕분에 не добавляется 서.")],
    ],
    quiz: [
      ["선생님이 가르쳐 주신 ___ 합격했어요.", ["덕분에", "바람에"], 0],
      ["친구 ___ 한국 생활이 즐거워요.", ["덕분에", "덕분이"], 0],
      ["비가 많이 온 ___ 길이 막혔어요.", ["탓에", "덕분에"], 0],
      ["약을 먹은 ___ 감기가 나았어요.", ["덕분에", "탓에"], 0],
    ],
  }),
  point("connectors", {
    id: "neurago", pattern: "V + 느라고",
    title: t("“…ish bilan band bo'lib” — 느라고", "“Being busy doing…” — 느라고", "«Занимаясь…» — 느라고"),
    explain: t(
      "Bir ish bilan band bo'lgani uchun boshqa ishga ulgurmaganini bildiradi: 공부하느라고 잠을 못 잤어요 — dars qilib uxlay olmadim. Ikkala qismda ega bir xil bo'ladi, 느라고 oldida zamon (았/었) kelmaydi, ikkinchi qismda buyruq yoki taklif ishlatilmaydi.",
      "Shows that time or effort spent on one action left no room for another: 공부하느라고 잠을 못 잤어요 (I couldn't sleep because I was studying). Both clauses share the same subject, there is no tense (았/었) before 느라고, and the second clause cannot be a command or suggestion.",
      "Показывает, что из-за занятости одним действием не удалось сделать другое: 공부하느라고 잠을 못 잤어요 — я учился и не спал. Подлежащее в обеих частях одно и то же, перед 느라고 нет времени (았/었), во второй части нельзя ставить приказ или предложение.",
    ),
    rules: [
      ["V + 느라고 (하다 → 하느라고)", "Fe'l o'zagi + 느라고 (qisqa: 느라)", "Verb stem + 느라고 (short: 느라)", "Основа + 느라고 (кратко: 느라)"],
      ["Ega bir xil", "Ikkala qismda bir kishi", "Same subject in both clauses", "Одно подлежащее в обеих частях"],
      ["Zamon yo'q", "았/었 qo'shilmaydi", "No 았/었 before it", "Без 았/었"],
    ],
    examples: [
      ["시험 준비를 하느라고 요즘 잠을 못 자요.", "Imtihonga tayyorlanib, bu kunlarda uxlay olmayapman.", "I've been busy preparing for the exam and can't sleep lately.", "Готовясь к экзамену, я в последнее время не высыпаюсь."],
      ["친구와 이야기하느라고 버스를 놓쳤어요.", "Do'st bilan gaplashib, avtobusni o'tkazib yubordim.", "I was chatting with a friend and missed the bus.", "Я разговорился с другом и пропустил автобус."],
      ["영화를 보느라 전화를 못 받았어요.", "Kino ko'rib, telefonga javob bera olmadim.", "I was watching a movie and couldn't answer the phone.", "Я смотрел фильм и не смог ответить на звонок."],
      ["일하느라 점심을 못 먹었어요.", "Ishlab, tushlik qila olmadim.", "I was working and couldn't have lunch.", "Я работал и не успел пообедать."],
    ],
    mistakes: [
      ["공부했느라고 피곤해요", "공부하느라고 피곤해요", t("느라고 oldida 았/었 kelmaydi.", "No 았/었 before 느라고.", "Перед 느라고 нет 았/었.")],
      ["내가 게임을 하느라고 동생이 잠을 못 잤어요", "내가 게임을 하는 바람에 동생이 잠을 못 잤어요", t("Ega har xil bo'lsa 는 바람에.", "With different subjects use 는 바람에.", "При разных подлежащих — 는 바람에.")],
    ],
    quiz: [
      ["숙제를 ___ 못 놀았어요. (하다)", ["하느라고", "했느라고"], 0],
      ["아르바이트를 ___ 학교에 늦었어요.", ["하느라고", "하니까"], 0],
      ["친구와 ___ 시간 가는 줄 몰랐어요. (이야기하다)", ["이야기하느라고", "이야기했느라고"], 0],
      ["동생이 떠드는 ___ 공부를 못 했어요.", ["바람에", "느라고"], 0],
    ],
  }),
  point("connectors", {
    id: "ppunmanianira", pattern: "V/A + (으)ㄹ 뿐만 아니라 · N + 뿐만 아니라",
    title: t("“Faqat … emas, balki …” — 뿐만 아니라", "“Not only … but also …” — 뿐만 아니라", "«Не только …, но и …» — 뿐만 아니라"),
    explain: t(
      "Birinchi narsaga ikkinchisini qo'shib aytadi: 맛있을 뿐만 아니라 값도 싸요 — mazali bo'lgani bilan birga arzon ham. Ikkinchi qismda odatda 도 keladi. Otga to'g'ridan-to'g'ri 뿐만 아니라 qo'shiladi.",
      "Adds a second point to the first: 맛있을 뿐만 아니라 값도 싸요 (it's not only tasty, it's cheap too). The second clause usually has 도. With a noun, attach 뿐만 아니라 directly.",
      "Добавляет к первому второе: 맛있을 뿐만 아니라 값도 싸요 — не только вкусно, но и дёшево. Во второй части обычно стоит 도. С существительным 뿐만 아니라 присоединяется напрямую.",
    ),
    rules: [
      ["V/A + (으)ㄹ 뿐만 아니라 (먹다 → 먹을, 예쁘다 → 예쁠)", "Fe'l / sifat + (으)ㄹ", "Verb / adjective + (으)ㄹ", "Глагол / прилагательное + (으)ㄹ"],
      ["N + 뿐만 아니라 N도", "Ot + 뿐만 아니라 … 도", "Noun + 뿐만 아니라 … 도", "Сущ. + 뿐만 아니라 … 도"],
      ["N + 일 뿐만 아니라", "Ot + 이다: 의사일 뿐만 아니라", "Noun + 이다: 의사일 뿐만 아니라", "Сущ. + 이다: 의사일 뿐만 아니라"],
    ],
    examples: [
      ["이 식당은 맛있을 뿐만 아니라 값도 싸요.", "Bu restoran mazali bo'lgani bilan birga arzon ham.", "This restaurant is not only tasty but also cheap.", "В этом ресторане не только вкусно, но и недорого."],
      ["민수 씨는 노래를 잘할 뿐만 아니라 춤도 잘 춰요.", "Minsu qo'shiq aytishni ham, raqsga tushishni ham yaxshi biladi.", "Minsu not only sings well but also dances well.", "Минсу не только хорошо поёт, но и хорошо танцует."],
      ["한국어뿐만 아니라 영어도 할 수 있어요.", "Koreys tilini ham, ingliz tilini ham bilaman.", "I can speak not only Korean but also English.", "Я знаю не только корейский, но и английский."],
      ["비가 올 뿐만 아니라 바람도 많이 불어요.", "Yomg'ir yog'ibgina qolmay, shamol ham kuchli.", "It's not only raining; it's also very windy.", "Идёт не только дождь, но и сильный ветер."],
    ],
    mistakes: [
      ["맛있는 뿐만 아니라", "맛있을 뿐만 아니라", t("Fe'l va sifatga (으)ㄹ qo'shiladi.", "Verbs and adjectives take (으)ㄹ.", "Глаголы и прилагательные берут (으)ㄹ.")],
      ["영어뿐만 아니라 중국어 할 수 있어요", "영어뿐만 아니라 중국어도 할 수 있어요", t("Ikkinchi qismda 도 kerak.", "The second part needs 도.", "Во второй части нужно 도.")],
    ],
    quiz: [
      ["이 가방은 예쁠 ___ 아니라 튼튼해요.", ["뿐만", "밖에"], 0],
      ["이 영화는 재미있___ 뿐만 아니라 감동적이에요.", ["을", "는"], 0],
      ["한국어뿐만 아니라 일본어___ 해요.", ["도", "만"], 0],
      ["그는 의사일 ___ 아니라 작가이기도 해요.", ["뿐만", "만큼"], 0],
    ],
  }),
  point("connectors", {
    id: "neunde-daga", pattern: "V + 는 데다가 · A + (으)ㄴ 데다가",
    title: t("“Ustiga …” — 는 데다가", "“On top of that…” — 는 데다가", "«К тому же…» — 는 데다가"),
    explain: t(
      "Bir holatga yana bir holat qo'shiladi: 비가 오는 데다가 바람도 불어요 — yomg'ir yog'ibgina qolmay, shamol ham esyapti. Ikkala qism bir yo'nalishda bo'ladi (ikkalasi yaxshi yoki ikkalasi yomon). Fe'lga 는, sifatga (으)ㄴ qo'shiladi.",
      "Piles one situation on top of another: 비가 오는 데다가 바람도 불어요 (it's raining, and on top of that it's windy). Both parts point the same way (both good or both bad). Verbs take 는, adjectives take (으)ㄴ.",
      "Добавляет к одной ситуации другую: 비가 오는 데다가 바람도 불어요 — идёт дождь, да ещё и ветрено. Обе части идут в одну сторону (обе хорошие или обе плохие). Глаголы берут 는, прилагательные — (으)ㄴ.",
    ),
    rules: [
      ["V + 는 데다가", "Fe'l: 오다 → 오는 데다가", "Verb: 오다 → 오는 데다가", "Глагол: 오다 → 오는 데다가"],
      ["A + (으)ㄴ 데다가", "Sifat: 넓다 → 넓은 데다가", "Adjective: 넓다 → 넓은 데다가", "Прилагательное: 넓다 → 넓은 데다가"],
      ["Bir yo'nalish", "Ikkala qism ham yaxshi yoki ikkalasi ham yomon", "Both parts good, or both bad", "Обе части хорошие или обе плохие"],
    ],
    examples: [
      ["비가 오는 데다가 바람도 불어요.", "Yomg'ir yog'ib, ustiga shamol ham esyapti.", "It's raining and, on top of that, windy.", "Идёт дождь, да ещё и дует ветер."],
      ["이 집은 넓은 데다가 깨끗해요.", "Bu uy keng, ustiga toza ham.", "This house is spacious and clean too.", "Этот дом просторный, к тому же чистый."],
      ["길이 막히는 데다가 비까지 와서 늦었어요.", "Yo'l tiqilib, ustiga yomg'ir ham yog'ib kechikdim.", "Traffic was bad and it rained too, so I was late.", "Были пробки, да ещё и дождь — я опоздал."],
      ["그 사람은 똑똑한 데다가 성격도 좋아요.", "U aqlli, ustiga xarakteri ham yaxshi.", "He's smart, and his personality is good too.", "Он умный, да и характер хороший."],
    ],
    mistakes: [
      ["넓는 데다가", "넓은 데다가", t("Sifatga (으)ㄴ qo'shiladi.", "Adjectives take (으)ㄴ.", "Прилагательные берут (으)ㄴ.")],
      ["싼 데다가 맛없어요", "싼 데다가 맛있어요", t("Ikkala qism bir yo'nalishda bo'lishi kerak.", "Both parts must go the same way.", "Обе части должны идти в одну сторону.")],
    ],
    quiz: [
      ["날씨가 ___ 데다가 바람도 불어요. (춥다)", ["추운", "춥는"], 0],
      ["숙제가 많은 ___ 시험도 있어요.", ["데다가", "뿐"], 0],
      ["이 옷은 ___ 데다가 예뻐요. (싸다)", ["싼", "싸는"], 0],
      ["그는 친절한 ___ 유머도 있어요.", ["데다가", "바람에"], 0],
    ],
  }),
  point("connectors", {
    id: "eulsurok", pattern: "V/A + (으)ㄹ수록",
    title: t("“Qancha … shuncha” — (으)ㄹ수록", "“The more … the more” — (으)ㄹ수록", "«Чем больше …, тем …» — (으)ㄹ수록"),
    explain: t(
      "Biror ish yoki holat kuchaygan sari natija ham kuchayadi: 공부할수록 재미있어요 — o'qigan sari qiziqarli. Ko'pincha 더 yoki 점점 bilan keladi. Undosh bilan tugasa 을수록, unli bilan tugasa ㄹ수록, ㄹ bilan tugasa to'g'ridan-to'g'ri 수록.",
      "As an action or state grows, the result grows with it: 공부할수록 재미있어요 (the more I study, the more fun it is). Often used with 더 or 점점. After a consonant use 을수록, after a vowel ㄹ수록, after ㄹ just 수록.",
      "По мере усиления действия или состояния растёт и результат: 공부할수록 재미있어요 — чем больше учусь, тем интереснее. Часто с 더 или 점점. После согласной — 을수록, после гласной — ㄹ수록, после ㄹ — просто 수록.",
    ),
    rules: [
      ["받침 O: V/A + 을수록 (읽다 → 읽을수록)", "Undosh bilan tugasa", "After a consonant", "После согласной"],
      ["받침 X: V/A + ㄹ수록 (하다 → 할수록)", "Unli bilan tugasa", "After a vowel", "После гласной"],
      ["ㄹ 받침: 수록 (살다 → 살수록)", "ㄹ bilan tugasa", "After ㄹ", "После ㄹ"],
    ],
    examples: [
      ["한국어는 공부할수록 재미있어요.", "Koreys tili o'qigan sari qiziqarli.", "The more I study Korean, the more fun it is.", "Чем больше я учу корейский, тем он интереснее."],
      ["먹을수록 더 먹고 싶어요.", "Yegan sari yana yegim keladi.", "The more I eat, the more I want to eat.", "Чем больше ем, тем больше хочется."],
      ["나이가 들수록 시간이 빨리 가요.", "Yosh o'tgan sari vaqt tez o'tadi.", "The older you get, the faster time goes.", "Чем старше становишься, тем быстрее идёт время."],
      ["알면 알수록 어려워요.", "Bilsangiz bilgan sari qiyin.", "The more you know, the harder it gets.", "Чем больше знаешь, тем сложнее."],
    ],
    mistakes: [
      ["읽수록", "읽을수록", t("Undosh bilan tugasa 을수록.", "After a consonant use 을수록.", "После согласной — 을수록.")],
      ["살을수록", "살수록", t("ㄹ bilan tugasa to'g'ridan-to'g'ri 수록.", "After ㄹ, use 수록 directly.", "После ㄹ сразу 수록.")],
    ],
    quiz: [
      ["운동을 ___ 건강해져요. (하다)", ["할수록", "하을수록"], 0],
      ["책을 ___ 더 읽고 싶어요. (읽다)", ["읽을수록", "읽수록"], 0],
      ["이 도시는 ___ 좋아져요. (살다)", ["살수록", "살을수록"], 0],
      ["가격이 ___ 품질이 좋아요. (비싸다)", ["비쌀수록", "비싸는수록"], 0],
    ],
  }),
  point("endings", {
    id: "eun-chae", pattern: "V + (으)ㄴ 채(로)",
    title: t("“…gan holda” — (으)ㄴ 채로", "“Leaving it as it is” — (으)ㄴ 채로", "«В таком состоянии» — (으)ㄴ 채로"),
    explain: t(
      "Bir holat o'zgarmay turgan paytda boshqa ish qilinganini bildiradi: 불을 켠 채로 잤어요 — chiroqni yoqiq holda uxladim. Fe'lning o'tgan zamon shakli (으)ㄴ bilan keladi, 로 ko'pincha tushib qoladi (켠 채).",
      "Says that something was done while another state stayed unchanged: 불을 켠 채로 잤어요 (I slept with the light on). It takes the past form (으)ㄴ of a verb, and 로 is often dropped (켠 채).",
      "Говорит, что действие совершено, пока другое состояние оставалось неизменным: 불을 켠 채로 잤어요 — я спал при включённом свете. Присоединяется к прошедшей форме (으)ㄴ, 로 часто опускается (켠 채).",
    ),
    rules: [
      ["V + (으)ㄴ 채(로) (켜다 → 켠 채)", "Fe'lning o'tgan shakli", "Past form of the verb", "Прошедшая форма глагола"],
      ["열다 → 연 채, 서다 → 선 채", "ㄹ tushadi", "ㄹ drops", "ㄹ выпадает"],
      ["는 / 고 있는 emas", "하는 채 deb bo'lmaydi", "Not 는 or 고 있는", "Не 는 и не 고 있는"],
    ],
    examples: [
      ["불을 켠 채로 잤어요.", "Chiroqni yoqiq holda uxlabman.", "I fell asleep with the light on.", "Я заснул при включённом свете."],
      ["안경을 쓴 채로 샤워했어요.", "Ko'zoynak taqqan holda dush qabul qildim.", "I took a shower with my glasses on.", "Я принял душ в очках."],
      ["신발을 신은 채로 들어오지 마세요.", "Oyoq kiyim bilan kirmang.", "Don't come in with your shoes on.", "Не заходите в обуви."],
      ["창문을 연 채 외출했어요.", "Derazani ochiq qoldirib chiqib ketibman.", "I went out leaving the window open.", "Я ушёл, оставив окно открытым."],
    ],
    mistakes: [
      ["켜는 채로 잤어요", "켠 채로 잤어요", t("채 oldidan o'tgan shakl (으)ㄴ.", "Use the past form (으)ㄴ before 채.", "Перед 채 — прошедшая форма (으)ㄴ.")],
      ["서 있은 채로 이야기했어요", "선 채로 이야기했어요", t("서다 → 선 채.", "서다 → 선 채.", "서다 → 선 채.")],
    ],
    quiz: [
      ["창문을 ___ 채로 잠들었어요. (열다)", ["연", "여는"], 0],
      ["불을 ___ 채로 나갔어요. (켜다)", ["켠", "켜는"], 0],
      ["옷을 입은 ___ 수영장에 들어갔어요.", ["채로", "때문에"], 0],
      ["앉은 ___ 졸았어요.", ["채로", "동안"], 0],
    ],
  }),
  point("connectors", {
    id: "dorok", pattern: "V + 도록",
    title: t("“…ishi uchun / …guncha” — 도록", "“So that / until” — 도록", "«Чтобы / до того, как» — 도록"),
    explain: t(
      "Ikkinchi ishning maqsadi yoki darajasini bildiradi: 잘 들리도록 크게 말해 주세요 — yaxshi eshitilishi uchun baland gapiring. 지 않도록 — “… bo'lmasligi uchun”. 도록 oldida zamon kelmaydi.",
      "Gives the purpose or extent of the second clause: 잘 들리도록 크게 말해 주세요 (please speak loudly so it can be heard well). 지 않도록 means “so that … doesn't happen”. No tense before 도록.",
      "Указывает цель или степень действия во второй части: 잘 들리도록 크게 말해 주세요 — говорите громко, чтобы было хорошо слышно. 지 않도록 — «чтобы не…». Перед 도록 нет времени.",
    ),
    rules: [
      ["V + 도록 (보이다 → 보이도록)", "Maqsad: …ishi uchun", "Purpose: so that", "Цель: чтобы"],
      ["V + 지 않도록", "…masligi uchun", "So that … doesn't", "Чтобы не …"],
      ["Zamon yo'q", "았/었 qo'shilmaydi", "No 았/었", "Без 았/었"],
    ],
    examples: [
      ["잘 들리도록 크게 말해 주세요.", "Yaxshi eshitilishi uchun baland gapiring.", "Please speak loudly so it can be heard.", "Говорите громче, чтобы было слышно."],
      ["아이가 깨지 않도록 조용히 하세요.", "Bola uyg'onib ketmasligi uchun jim bo'ling.", "Be quiet so the child doesn't wake up.", "Тише, чтобы ребёнок не проснулся."],
      ["늦지 않도록 일찍 출발합시다.", "Kechikmaslik uchun erta yo'lga chiqaylik.", "Let's leave early so we won't be late.", "Давайте выедем пораньше, чтобы не опоздать."],
      ["감기에 걸리지 않도록 따뜻하게 입으세요.", "Shamollamaslik uchun issiq kiyining.", "Dress warmly so you don't catch a cold.", "Одевайтесь тепло, чтобы не простудиться."],
    ],
    mistakes: [
      ["감기에 걸렸도록 따뜻하게 입으세요", "감기에 걸리지 않도록 따뜻하게 입으세요", t("도록 oldida zamon yo'q; “bo'lmasligi” uchun 지 않도록.", "No tense before 도록; use 지 않도록 for “so that … not”.", "Перед 도록 нет времени; «чтобы не» — 지 않도록.")],
    ],
    quiz: [
      ["아이가 깨지 ___ 조용히 하세요.", ["않도록", "못도록"], 0],
      ["잘 ___ 도록 앞에 앉으세요. (보이다)", ["보이", "보였"], 0],
      ["늦지 ___ 일찍 일어났어요.", ["않도록", "않으도록"], 0],
      ["여러분이 이해하기 쉽___ 설명하겠습니다.", ["도록", "는데"], 0],
    ],
  }),
  point("expressions", {
    id: "ryeodeon-cham", pattern: "V + (으)려던 참이다",
    title: t("“Endi … qilmoqchi edim” — (으)려던 참이다", "“Was just about to” — (으)려던 참이다", "«Как раз собирался» — (으)려던 참이다"),
    explain: t(
      "Aynan shu paytda biror ish qilmoqchi bo'lib turganini bildiradi: 지금 막 전화하려던 참이에요 — hozir qo'ng'iroq qilmoqchi edim. 참에 shakli “… qilmoqchi bo'lgan paytda” degan ma'noda.",
      "Says you were right on the point of doing something: 지금 막 전화하려던 참이에요 (I was just about to call). The form 참에 means “just when I was about to…”.",
      "Говорит, что вы как раз собирались что-то сделать: 지금 막 전화하려던 참이에요 — я как раз собирался позвонить. Форма 참에 — «в тот момент, когда собирался…».",
    ),
    rules: [
      ["V + (으)려던 참이다 (가다 → 가려던, 먹다 → 먹으려던)", "Fe'l + (으)려던 참이다", "Verb + (으)려던 참이다", "Глагол + (으)려던 참이다"],
      ["V + (으)려던 참에", "…moqchi bo'lganda (shu payt)", "Just when about to …", "Как раз когда собирался …"],
      ["지금 막 / 마침", "Ko'pincha 막, 마침 bilan", "Often with 막 or 마침", "Часто с 막 или 마침"],
    ],
    examples: [
      ["지금 막 전화하려던 참이에요.", "Hozir aynan qo'ng'iroq qilmoqchi edim.", "I was just about to call you.", "Я как раз собирался вам позвонить."],
      ["마침 나가려던 참인데 잘 오셨어요.", "Aynan chiqmoqchi edim, yaxshi keldingiz.", "I was just about to leave, so you came at the right time.", "Я как раз собирался уходить, вы вовремя."],
      ["밥을 먹으려던 참에 친구가 왔어요.", "Ovqat yemoqchi bo'lganimda do'stim keldi.", "Just as I was about to eat, my friend came.", "Только я собрался поесть, как пришёл друг."],
      ["연락드리려던 참이었어요.", "Sizga aloqa qilmoqchi edim.", "I was just about to contact you.", "Я как раз собирался с вами связаться."],
    ],
    mistakes: [
      ["가렸던 참이에요", "가려던 참이에요", t("(으)려던 — 았/었 qo'shilmaydi.", "(으)려던 takes no 았/었.", "(으)려던 без 았/었.")],
    ],
    quiz: [
      ["마침 전화를 ___ 참이었어요. (하다)", ["하려던", "했던"], 0],
      ["막 나가려던 ___ 비가 왔어요.", ["참에", "참이"], 0],
      ["저도 지금 ___ 참이에요. (가다)", ["가려던", "가는데"], 0],
      ["밥을 ___ 참에 전화가 왔어요. (먹다)", ["먹으려던", "먹려던"], 0],
    ],
  }),
  point("endings", {
    id: "geodeunyo", pattern: "V/A + 거든요",
    title: t("Sababni tushuntirish — 거든요", "Explaining the reason — 거든요", "Объяснение причины — 거든요"),
    explain: t(
      "Suhbatda avval aytilgan gapning sababini yoki fonini yumshoq tarzda tushuntiradi: 못 가요. 약속이 있거든요 — borolmayman, uchrashuvim bor-da. Sabab avval bo'lgan bo'lsa 았/었거든요. Otga (이)거든요.",
      "In conversation, softly explains the reason or background for what was just said: 못 가요. 약속이 있거든요 (I can't go; I have plans, you see). If the reason happened earlier use 았/었거든요. With a noun, (이)거든요.",
      "В разговоре мягко объясняет причину или фон сказанного: 못 가요. 약속이 있거든요 — не могу пойти, у меня встреча. Если причина была раньше — 았/었거든요. С существительным — (이)거든요.",
    ),
    rules: [
      ["V/A + 거든요", "Hozirgi sabab", "A present reason", "Причина в настоящем"],
      ["V/A + 았/었거든요", "Avval bo'lgan sabab", "A reason that happened earlier", "Причина, бывшая раньше"],
      ["N + (이)거든요", "Ot: 학생이거든요", "Noun: 학생이거든요", "Сущ.: 학생이거든요"],
    ],
    examples: [
      ["오늘은 못 만나요. 내일 시험이 있거든요.", "Bugun uchrasha olmayman. Ertaga imtihonim bor-da.", "I can't meet today. I have an exam tomorrow, you see.", "Сегодня не смогу встретиться. У меня завтра экзамен."],
      ["이 식당에 자주 와요. 음식이 맛있거든요.", "Bu restoranga tez-tez kelaman. Ovqati mazali-da.", "I come here often. The food is good, you see.", "Я часто сюда хожу. Тут вкусно кормят."],
      ["어제 늦었어요. 길이 막혔거든요.", "Kecha kechikdim. Yo'l tiqilib qolgan edi-da.", "I was late yesterday. There was a traffic jam, you see.", "Вчера я опоздал. Были пробки."],
      ["저는 한국 드라마를 자주 봐요. 한국어를 배우거든요.", "Men koreys seriallarini tez-tez ko'raman. Koreys tilini o'rganyapman-da.", "I watch Korean dramas often. I'm learning Korean, you see.", "Я часто смотрю корейские дорамы. Я же учу корейский."],
    ],
    mistakes: [
      ["늦었어요. 길이 막히거든요", "늦었어요. 길이 막혔거든요", t("Avval bo'lgan sabab uchun 았/었거든요.", "Use 았/었거든요 for an earlier reason.", "Для прошлой причины — 았/었거든요.")],
    ],
    quiz: [
      ["어제 늦었어요. 길이 ___. (막히다)", ["막혔거든요", "막히거든요"], 0],
      ["왜 웃어요? 이 영화가 정말 ___. (웃기다)", ["웃기거든요", "웃기거든"], 0],
      ["저는 한국 음식을 자주 먹어요. 한국 음식을 ___. (좋아하다)", ["좋아하거든요", "좋아하거든다"], 0],
      ["오늘 못 만나요. 내일 시험이 ___.", ["있거든요", "있거든다"], 0],
    ],
  }),
  point("endings", {
    id: "eul-tende", pattern: "V/A + (으)ㄹ 텐데",
    title: t("“…bo'lsa kerak, shuning uchun…” — (으)ㄹ 텐데", "“Probably …, so …” — (으)ㄹ 텐데", "«Наверное …, поэтому …» — (으)ㄹ 텐데"),
    explain: t(
      "Taxmin qiladi va shu taxminga tayanib maslahat, so'rov yoki fikr aytadi: 피곤할 텐데 좀 쉬세요 — charchagan bo'lsangiz kerak, biroz dam oling. 았/었을 텐데 — o'tgan holatga taxmin yoki afsus.",
      "Makes a guess and builds advice, a request or a comment on it: 피곤할 텐데 좀 쉬세요 (you must be tired, so please rest). 았/었을 텐데 guesses about the past or expresses regret.",
      "Делает предположение и на его основе советует, просит или комментирует: 피곤할 텐데 좀 쉬세요 — вы, наверное, устали, отдохните. 았/었을 텐데 — предположение о прошлом или сожаление.",
    ),
    rules: [
      ["V/A + (으)ㄹ 텐데 (피곤하다 → 피곤할 텐데)", "Taxmin + fon", "Guess + background", "Предположение + фон"],
      ["N + 일 텐데", "Ot: 학생일 텐데", "Noun: 학생일 텐데", "Сущ.: 학생일 텐데"],
      ["V/A + 았/었을 텐데", "O'tgan taxmin / afsus", "Past guess / regret", "Прошлое предположение / сожаление"],
    ],
    examples: [
      ["지금 가면 길이 막힐 텐데 지하철을 타세요.", "Hozir ketsangiz yo'l tiqilgan bo'ladi, metroda boring.", "The roads will probably be jammed, so take the subway.", "Сейчас на дорогах, наверное, пробки — езжайте на метро."],
      ["피곤할 텐데 좀 쉬세요.", "Charchagan bo'lsangiz kerak, biroz dam oling.", "You must be tired, so take a rest.", "Вы, наверное, устали — отдохните."],
      ["내일은 추울 텐데 따뜻하게 입으세요.", "Ertaga sovuq bo'lsa kerak, issiq kiyining.", "It will probably be cold tomorrow, so dress warmly.", "Завтра, наверное, будет холодно — одевайтесь тепло."],
      ["민수 씨는 지금 집에 있을 텐데 전화해 볼까요?", "Minsu hozir uyda bo'lsa kerak, qo'ng'iroq qilib ko'raymi?", "Minsu is probably home. Shall I call him?", "Минсу, наверное, сейчас дома. Позвонить ему?"],
    ],
    mistakes: [
      ["피곤한 텐데", "피곤할 텐데", t("텐데 oldida har doim (으)ㄹ.", "Always (으)ㄹ before 텐데.", "Перед 텐데 всегда (으)ㄹ.")],
    ],
    quiz: [
      ["내일은 비가 ___ 텐데 우산을 가져가세요. (오다)", ["올", "오는"], 0],
      ["배가 ___ 텐데 이것 좀 드세요. (고프다)", ["고플", "고픈"], 0],
      ["지금 가면 ___ 텐데 지하철을 타세요. (막히다)", ["막힐", "막히는"], 0],
      ["그 사람은 지금 ___ 텐데요. (바쁘다)", ["바쁠", "바쁜"], 0],
    ],
  }),
  point("endings", {
    id: "eosseotdeoni", pattern: "V + 았/었더니",
    title: t("“…ganimda …ligini bildim” — 았/었더니", "“I did …, and then …” — 았/었더니", "«Сделал …, и оказалось …» — 았/었더니"),
    explain: t(
      "Gapiruvchining o'z ishi natijasida nima bo'lganini yoki nimani topganini bildiradi: 어제 많이 걸었더니 다리가 아파요 — kecha ko'p yurganim uchun oyoqlarim og'riyapti. Birinchi qismda ega — o'zim (men).",
      "Says what resulted from, or was found after, the speaker's own action: 어제 많이 걸었더니 다리가 아파요 (I walked a lot yesterday, so my legs hurt). The subject of the first clause is “I”.",
      "Показывает, что получилось или обнаружилось после собственного действия говорящего: 어제 많이 걸었더니 다리가 아파요 — вчера я много ходил, и теперь болят ноги. Подлежащее первой части — «я».",
    ),
    rules: [
      ["V + 았/었더니 (걷다 → 걸었더니)", "O'z ishim + natija", "My own action + result", "Моё действие + результат"],
      ["Natija: his-tuyg'u yoki kashfiyot", "Tanada yoki atrofda sezilgan o'zgarish", "A change felt or discovered", "Ощущаемое или обнаруженное изменение"],
      ["1-qism ega: men", "Boshqa odam uchun emas", "Not for another person", "Не для другого лица"],
    ],
    examples: [
      ["어제 많이 걸었더니 다리가 아파요.", "Kecha ko'p yurganim uchun oyoqlarim og'riyapti.", "I walked a lot yesterday, so my legs hurt.", "Вчера я много ходил, и теперь болят ноги."],
      ["약을 먹었더니 열이 내렸어요.", "Dori ichgach isitmam tushdi.", "I took the medicine and my fever went down.", "Я выпил лекарство, и температура спала."],
      ["집에 갔더니 친구가 와 있었어요.", "Uyga borsam, do'stim kelib turgan ekan.", "When I got home, my friend was already there.", "Когда я пришёл домой, там уже был друг."],
      ["아침에 일찍 일어났더니 피곤해요.", "Ertalab erta turganim uchun charchadim.", "I got up early this morning, so I'm tired.", "Я рано встал и теперь устал."],
    ],
    mistakes: [
      ["민수가 많이 먹었더니 배가 아팠어요", "민수가 많이 먹어서 배가 아팠어요", t("Birinchi qism egasi men bo'lishi kerak; boshqa kishi uchun 아/어서.", "The first-clause subject must be “I”; for someone else use 아/어서.", "Подлежащее первой части — «я»; для другого — 아/어서.")],
    ],
    quiz: [
      ["운동을 ___ 몸이 가벼워졌어요. (하다)", ["했더니", "했거든요"], 0],
      ["밤새 게임을 ___ 눈이 아파요. (하다)", ["했더니", "하겠더니"], 0],
      ["저는 집에 ___ 아무도 없었어요. (가다)", ["갔더니", "가더니"], 0],
      ["약을 ___ 열이 내렸어요. (먹다)", ["먹었더니", "먹었거든"], 0],
    ],
  }),
  point("expressions", {
    id: "neun-pyeon", pattern: "V + 는 편이다 · A + (으)ㄴ 편이다",
    title: t("“…ga moyil” — 는 편이다", "“Tend to be” — 는 편이다", "«Скорее …» — 는 편이다"),
    explain: t(
      "Qat'iy aytmasdan, ko'proq shu tomonga moyilligini bildiradi: 저는 키가 큰 편이에요 — men uzunroq tomonman. Fe'lga 는, sifatga (으)ㄴ qo'shiladi.",
      "Says that something leans toward a side without being absolute: 저는 키가 큰 편이에요 (I'm on the tall side). Verbs take 는, adjectives take (으)ㄴ.",
      "Говорит, что что-то скорее склоняется в одну сторону, не утверждая категорично: 저는 키가 큰 편이에요 — я скорее высокий. Глаголы берут 는, прилагательные — (으)ㄴ.",
    ),
    rules: [
      ["V + 는 편이다 (먹다 → 먹는 편이다)", "Fe'l + 는 편이다", "Verb + 는 편이다", "Глагол + 는 편이다"],
      ["A + (으)ㄴ 편이다 (크다 → 큰 편이다)", "Sifat + (으)ㄴ 편이다", "Adjective + (으)ㄴ 편이다", "Прилагательное + (으)ㄴ 편이다"],
      ["N + 인 편이다", "Ot: 학생인 편이다", "Noun: 학생인 편이다", "Сущ.: 학생인 편이다"],
    ],
    examples: [
      ["저는 키가 큰 편이에요.", "Men uzun bo'yli tomonman.", "I'm on the tall side.", "Я скорее высокого роста."],
      ["민수는 말이 많은 편이에요.", "Minsu ko'p gapiradigan tomonda.", "Minsu tends to talk a lot.", "Минсу скорее разговорчивый."],
      ["저는 아침을 먹는 편이에요.", "Men odatda nonushta qilaman.", "I usually eat breakfast.", "Я обычно завтракаю."],
      ["이 식당은 값이 비싼 편이에요.", "Bu restoranda narxlar qimmatroq.", "The prices at this restaurant are on the high side.", "В этом ресторане цены скорее высокие."],
    ],
    mistakes: [
      ["키가 크는 편이에요", "키가 큰 편이에요", t("Sifatga (으)ㄴ 편이다.", "Adjectives take (으)ㄴ 편이다.", "Прилагательные — (으)ㄴ 편이다.")],
    ],
    quiz: [
      ["저는 책을 자주 ___ 편이에요. (읽다)", ["읽는", "읽은"], 0],
      ["이 방은 ___ 편이에요. (좁다)", ["좁은", "좁는"], 0],
      ["제 동생은 ___ 편이에요. (조용하다)", ["조용한", "조용하는"], 0],
      ["저는 일찍 ___ 편이에요. (일어나다)", ["일어나는", "일어난"], 0],
    ],
  }),
  point("expressions", {
    id: "neun-cheok", pattern: "V + 는 척하다 · A + (으)ㄴ 척하다",
    title: t("“…gandek qilmoq” — 는 척하다", "“Pretend to” — 는 척하다", "«Делать вид» — 는 척하다"),
    explain: t(
      "Aslida unday emas, lekin shunday ko'rinishga harakat qilishni bildiradi: 알면서도 모르는 척했어요 — bilib turib bilmagandek qildi. Fe'lga 는 척, sifatga (으)ㄴ 척, o'tgan ish uchun (으)ㄴ 척.",
      "Means acting as if something were true when it isn't: 알면서도 모르는 척했어요 (he knew but pretended not to). Verbs take 는 척, adjectives (으)ㄴ 척, and a finished action (으)ㄴ 척.",
      "Значит вести себя так, будто что-то верно, хотя это не так: 알면서도 모르는 척했어요 — знал, но сделал вид, что не знает. Глаголы — 는 척, прилагательные — (으)ㄴ 척, завершённое действие — (으)ㄴ 척.",
    ),
    rules: [
      ["V + 는 척하다 (자다 → 자는 척하다)", "Fe'l + 는 척", "Verb + 는 척", "Глагол + 는 척"],
      ["A + (으)ㄴ 척하다 (바쁘다 → 바쁜 척)", "Sifat + (으)ㄴ 척", "Adjective + (으)ㄴ 척", "Прилагательное + (으)ㄴ 척"],
      ["V + (으)ㄴ 척하다 (본 척)", "Bo'lib o'tgan ish", "A finished action", "Завершённое действие"],
    ],
    examples: [
      ["그는 알면서도 모르는 척했어요.", "U bilib turib bilmagandek qildi.", "He knew but pretended not to.", "Он знал, но сделал вид, что не знает."],
      ["졸리지 않은 척하려고 커피를 마셨어요.", "Uyqum kelmagandek ko'rinish uchun kofe ichdim.", "I drank coffee to look like I wasn't sleepy.", "Я выпил кофе, чтобы не показать, что хочу спать."],
      ["자는 척하고 있었어요.", "Uxlayotgandek qilib yotgan edim.", "I was pretending to sleep.", "Я притворялся спящим."],
      ["바쁜 척했지만 사실은 한가했어요.", "Band bo'lgandek qildim, aslida bo'shman.", "I acted busy, but I was actually free.", "Я делал вид, что занят, хотя был свободен."],
    ],
    mistakes: [
      ["바쁘는 척했어요", "바쁜 척했어요", t("Sifatga (으)ㄴ 척.", "Adjectives take (으)ㄴ 척.", "Прилагательные — (으)ㄴ 척.")],
    ],
    quiz: [
      ["알면서 모르는 ___ 했어요.", ["척", "편"], 0],
      ["바쁘지 않은데 ___ 척했어요. (바쁘다)", ["바쁜", "바쁘는"], 0],
      ["그는 공부하는 ___ 하고 게임을 해요.", ["척", "때문에"], 0],
      ["일부러 못 들은 ___ 했어요.", ["척", "바람에"], 0],
    ],
  }),
  point("expressions", {
    id: "eul-manhada", pattern: "V + (으)ㄹ 만하다",
    title: t("“…ga arziydi” — (으)ㄹ 만하다", "“Worth doing” — (으)ㄹ 만하다", "«Стоит …» — (으)ㄹ 만하다"),
    explain: t(
      "Biror ishga arziydi yoki yomon emasligini bildiradi: 이 영화는 볼 만해요 — bu kino ko'rishga arziydi. 한번 가 볼 만한 곳 — bir borib ko'rishga arziydigan joy. Ba'zan “yomon emas, ish beradi” ma'nosida ham keladi.",
      "Says that something is worth doing or is decent enough: 이 영화는 볼 만해요 (this movie is worth watching). 한번 가 볼 만한 곳 means “a place worth visiting”. It can also mean “not bad, passable”.",
      "Говорит, что чего-то стоит сделать, или что вполне приемлемо: 이 영화는 볼 만해요 — этот фильм стоит посмотреть. 한번 가 볼 만한 곳 — место, куда стоит съездить. Бывает и значение «неплохо, сойдёт».",
    ),
    rules: [
      ["V + (으)ㄹ 만하다 (보다 → 볼 만하다)", "Fe'l + (으)ㄹ 만하다", "Verb + (으)ㄹ 만하다", "Глагол + (으)ㄹ 만하다"],
      ["V + (으)ㄹ 만한 N", "Arziydigan …", "A … worth …", "…, которое стоит …"],
      ["아/어 볼 만하다", "Sinab ko'rishga arziydi", "Worth trying", "Стоит попробовать"],
    ],
    examples: [
      ["이 영화는 한번 볼 만해요.", "Bu kinoni bir ko'rishga arziydi.", "This movie is worth watching once.", "Этот фильм стоит посмотреть."],
      ["제주도는 한 번 가 볼 만한 곳이에요.", "Jeju oroli bir borib ko'rishga arziydigan joy.", "Jeju Island is a place worth visiting once.", "На Чеджудо стоит съездить хотя бы раз."],
      ["이 책은 읽을 만해요.", "Bu kitob o'qishga arziydi.", "This book is worth reading.", "Эту книгу стоит прочитать."],
      ["그 식당 음식은 먹을 만해요.", "U restoranning ovqati yomon emas.", "The food at that restaurant is decent.", "Еда в том ресторане вполне сносная."],
    ],
    mistakes: [
      ["볼 만이에요", "볼 만해요", t("만하다 — 하다 fe'li.", "만하다 is a 하다 verb.", "만하다 — глагол на 하다.")],
    ],
    quiz: [
      ["이 영화는 한번 ___ 만해요. (보다)", ["볼", "보는"], 0],
      ["서울에서 가 ___ 만한 곳을 추천해 주세요.", ["볼", "본"], 0],
      ["이 노래는 들을 ___ 해요.", ["만", "편"], 0],
      ["이 책은 ___ 만한 책이에요. (읽다)", ["읽을", "읽는"], 0],
    ],
  }),
];
