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
      ["결과: 부정적 / 예상 밖", "Yomon yoki kutilmagan oqibat", "A bad or unplanned result", "Плохой или непредвиденный итог"],
      ["A + 는 바람에 (X)", "Sifat bilan 아/어서 ishlating", "With adjectives use 아/어서", "С прилагательными — 아/어서"],
    ],
    examples: [
      ["비가 갑자기 오는 바람에 소풍을 못 갔어요.", "Yomg'ir to'satdan yog'ib qolgani uchun piknikka bora olmadik.", "Because it suddenly rained, we couldn't go on the picnic.", "Из-за внезапного дождя мы не смогли поехать на пикник."],
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
      ["날씨가 좋은 덕분에 소풍이 즐거웠어요.", "Havo yaxshi bo'lgani tufayli piknik yoqimli o'tdi.", "Thanks to the nice weather, the picnic was fun.", "Благодаря хорошей погоде пикник удался."],
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
      "Bir ish bilan band bo'lgani uchun boshqa ishga ulgurmaganini bildiradi: 공부하느라고 잠을 못 잤어요 — dars qilaman deb uxlay olmadim. Ikkala qismda ega bir xil bo'ladi, 느라고 oldida zamon (았/었) kelmaydi, ikkinchi qismda buyruq yoki taklif ishlatilmaydi.",
      "Shows that time or effort spent on one action left no room for another: 공부하느라고 잠을 못 잤어요 (I couldn't sleep because I was studying). Both clauses share the same subject, there is no tense (았/었) before 느라고, and the second clause cannot be a command or suggestion.",
      "Показывает, что из-за занятости одним действием не удалось сделать другое: 공부하느라고 잠을 못 잤어요 — из-за учёбы я не смог поспать. Подлежащее в обеих частях одно и то же, перед 느라고 нет времени (았/었), во второй части нельзя ставить приказ или предложение.",
    ),
    rules: [
      ["V + 느라고 (하다 → 하느라고)", "Fe'l o'zagi + 느라고 (qisqa: 느라)", "Verb stem + 느라고 (short: 느라)", "Основа + 느라고 (кратко: 느라)"],
      ["주어가 같다", "Ikkala qismda bir kishi", "Same subject in both clauses", "Одно подлежащее в обеих частях"],
      ["았/었느라고 (X)", "았/었 qo'shilmaydi", "No 았/었 before it", "Без 았/었"],
    ],
    examples: [
      ["시험 준비를 하느라고 요즘 잠을 못 자요.", "Imtihonga tayyorlanib, bu kunlarda uxlay olmayapman.", "I've been busy preparing for the exam and can't sleep lately.", "Готовясь к экзамену, я в последнее время не высыпаюсь."],
      ["친구와 이야기하느라고 버스를 놓쳤어요.", "Do'st bilan gaplashib, avtobusni o'tkazib yubordim.", "I was chatting with a friend and missed the bus.", "Я разговорился с другом и пропустил автобус."],
      ["영화를 보느라 전화를 못 받았어요.", "Kino ko'rib, telefonga javob bera olmadim.", "I was watching a movie and couldn't answer the phone.", "Я смотрел фильм и не смог ответить на звонок."],
      ["일하느라 점심을 못 먹었어요.", "Ish bilan band bo'lib, tushlik qila olmadim.", "I was working and couldn't have lunch.", "Я работал и не успел пообедать."],
    ],
    mistakes: [
      ["공부했느라고 피곤해요", "공부하느라고 피곤해요", t("느라고 oldida 았/었 kelmaydi.", "No 았/었 before 느라고.", "Перед 느라고 нет 았/었.")],
      ["내가 게임을 하느라고 동생이 잠을 못 잤어요", "내가 게임을 하는 바람에 동생이 잠을 못 잤어요", t("Ega har xil bo'lsa 는 바람에.", "With different subjects use 는 바람에.", "При разных подлежащих — 는 바람에.")],
    ],
    quiz: [
      ["숙제를 ___ 못 놀았어요. (하다)", ["하느라고", "했느라고"], 0],
      ["아르바이트를 ___ 학교에 늦었어요.", ["하느라고", "하러"], 0],
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
      ["같은 방향", "Ikkala qism ham yaxshi yoki ikkalasi ham yomon", "Both parts good, or both bad", "Обе части хорошие или обе плохие"],
    ],
    examples: [
      ["비가 오는 데다가 바람도 불어요.", "Yomg'ir yog'ib, ustiga shamol ham esyapti.", "It's raining and, on top of that, windy.", "Идёт дождь, да ещё и дует ветер."],
      ["이 집은 넓은 데다가 깨끗해요.", "Bu uy keng, ustiga toza ham.", "This house is spacious and clean too.", "Этот дом просторный, к тому же чистый."],
      ["길이 막히는 데다가 비까지 와서 늦었어요.", "Yo'l tiqilib, ustiga yomg'ir ham yog'ib kechikdim.", "Traffic was bad and it rained too, so I was late.", "Были пробки, да ещё и дождь — я опоздал."],
      ["그 사람은 똑똑한 데다가 성격도 좋아요.", "U aqlli, ustiga xarakteri ham yaxshi.", "He's smart, and his personality is good too.", "Он умный, да и характер хороший."],
    ],
    mistakes: [
      ["넓는 데다가", "넓은 데다가", t("Sifatga (으)ㄴ qo'shiladi.", "Adjectives take (으)ㄴ.", "Прилагательные берут (으)ㄴ.")],
      ["싼 데다가 맛없어요", "싼 데다가 맛도 있어요", t("Ikkala qism bir yo'nalishda bo'lishi kerak.", "Both parts must go the same way.", "Обе части должны идти в одну сторону.")],
    ],
    quiz: [
      ["날씨가 ___ 데다가 바람도 불어요. (춥다)", ["추운", "춥는"], 0],
      ["숙제가 많은 ___ 시험도 있어요.", ["데다가", "뿐"], 0],
      ["이 옷은 ___ 데다가 예뻐요. (싸다)", ["싼", "싸는"], 0],
      ["그는 친절한 ___ 유머 감각도 있어요.", ["데다가", "바람에"], 0],
    ],
  }),
  point("connectors", {
    id: "eulsurok", pattern: "V/A + (으)ㄹ수록",
    title: t("“Qancha … shuncha” — (으)ㄹ수록", "“The more … the more” — (으)ㄹ수록", "«Чем больше …, тем …» — (으)ㄹ수록"),
    explain: t(
      "Biror ish yoki holat kuchaygan sari natija ham kuchayadi: 공부할수록 재미있어요 — o'qigan sari qiziqarliroq bo'ladi. Ko'pincha 더 yoki 점점 bilan keladi. Undosh bilan tugasa 을수록, unli bilan tugasa ㄹ수록, ㄹ bilan tugasa to'g'ridan-to'g'ri 수록.",
      "As an action or state grows, the result grows with it: 공부할수록 재미있어요 (the more I study, the more fun it is). Often used with 더 or 점점. After a consonant use 을수록, after a vowel ㄹ수록, after ㄹ just 수록.",
      "По мере усиления действия или состояния растёт и результат: 공부할수록 재미있어요 — чем больше учусь, тем интереснее. Часто с 더 или 점점. После согласной — 을수록, после гласной — ㄹ수록, после ㄹ — просто 수록.",
    ),
    rules: [
      ["받침 O: V/A + 을수록 (읽다 → 읽을수록)", "Undosh bilan tugasa", "After a consonant", "После согласной"],
      ["받침 X: V/A + ㄹ수록 (하다 → 할수록)", "Unli bilan tugasa", "After a vowel", "После гласной"],
      ["ㄹ 받침: 수록 (살다 → 살수록)", "ㄹ bilan tugasa", "After ㄹ", "После ㄹ"],
    ],
    examples: [
      ["한국어는 공부할수록 재미있어요.", "Koreys tilini o'qigan sari qiziqarliroq bo'ladi.", "The more I study Korean, the more fun it is.", "Чем больше я учу корейский, тем он интереснее."],
      ["먹을수록 더 먹고 싶어요.", "Yegan sari yana yegim keladi.", "The more I eat, the more I want to eat.", "Чем больше ем, тем больше хочется."],
      ["나이가 들수록 시간이 빨리 가요.", "Yosh o'tgan sari vaqt tez o'tadi.", "The older you get, the faster time goes.", "Чем старше становишься, тем быстрее идёт время."],
      ["알면 알수록 어려워요.", "Qancha ko'p bilsangiz, shuncha qiyin.", "The more you know, the harder it gets.", "Чем больше знаешь, тем сложнее."],
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
      ["열다 → 연 채, 들다 → 든 채", "ㄹ tushadi", "ㄹ drops", "ㄹ выпадает"],
      ["는 채 / 고 있는 채 (X)", "하는 채 deb bo'lmaydi", "Not 는 or 고 있는", "Не 는 и не 고 있는"],
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
      ["았/었도록 (X)", "았/었 qo'shilmaydi", "No 았/었", "Без 았/었"],
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
      ["잘 ___도록 앞에 앉으세요. (보이다)", ["보이", "보였"], 0],
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
      ["지금 막 전화하려던 참이에요.", "Hozirgina qo'ng'iroq qilmoqchi bo'lib turgan edim.", "I was just about to call you.", "Я как раз собирался вам позвонить."],
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
      ["왜 웃어요? 이 영화가 정말 ___. (웃기다)", ["웃기거든요", "웃기거든다"], 0],
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
      ["지금 가면 길이 막힐 텐데 지하철을 타세요.", "Hozir ketsangiz yo'l tiqilgan bo'lsa kerak, metroda boring.", "If you go now, the roads will probably be jammed, so take the subway.", "Если поедете сейчас, наверное, попадёте в пробку — езжайте на метро."],
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
      ["결과: 느낌 / 발견", "Tanada yoki atrofda sezilgan o'zgarish", "A change felt or discovered", "Ощущаемое или обнаруженное изменение"],
      ["주어: 나 (1인칭)", "Boshqa odam uchun emas", "Not for another person", "Не для другого лица"],
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
      "Qat'iy aytmasdan, ko'proq shu tomonga moyilligini bildiradi: 저는 키가 큰 편이에요 — bo'yim balandroq. Fe'lga 는, sifatga (으)ㄴ qo'shiladi.",
      "Says that something leans toward a side without being absolute: 저는 키가 큰 편이에요 (I'm on the tall side). Verbs take 는, adjectives take (으)ㄴ.",
      "Говорит, что что-то скорее склоняется в одну сторону, не утверждая категорично: 저는 키가 큰 편이에요 — я скорее высокий. Глаголы берут 는, прилагательные — (으)ㄴ.",
    ),
    rules: [
      ["V + 는 편이다 (먹다 → 먹는 편이다)", "Fe'l + 는 편이다", "Verb + 는 편이다", "Глагол + 는 편이다"],
      ["A + (으)ㄴ 편이다 (크다 → 큰 편이다)", "Sifat + (으)ㄴ 편이다", "Adjective + (으)ㄴ 편이다", "Прилагательное + (으)ㄴ 편이다"],
      ["N + 인 편이다", "Ot: 적극적인 편이다", "Noun: 적극적인 편이다", "Сущ.: 적극적인 편이다"],
    ],
    examples: [
      ["저는 키가 큰 편이에요.", "Bo'yim balandroq.", "I'm on the tall side.", "Я скорее высокого роста."],
      ["민수는 말이 많은 편이에요.", "Minsu gapdonroq.", "Minsu tends to talk a lot.", "Минсу скорее разговорчивый."],
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
      ["저는 일찍 ___ 편이에요. (일어나다)", ["일어나는", "일어날"], 0],
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
      ["바쁜 척했지만 사실은 한가했어요.", "Band bo'lgandek qildim, aslida bo'sh edim.", "I acted busy, but I was actually free.", "Я делал вид, что занят, хотя был свободен."],
    ],
    mistakes: [
      ["바쁘는 척했어요", "바쁜 척했어요", t("Sifatga (으)ㄴ 척.", "Adjectives take (으)ㄴ 척.", "Прилагательные — (으)ㄴ 척.")],
    ],
    quiz: [
      ["알면서 모르는 ___했어요.", ["척", "편"], 0],
      ["바쁘지 않은데 ___ 척했어요. (바쁘다)", ["바쁜", "바쁘는"], 0],
      ["그는 공부하는 ___하고 게임을 해요.", ["척", "때문에"], 0],
      ["일부러 못 들은 ___했어요.", ["척", "바람에"], 0],
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
      ["이 노래는 들을 ___해요.", ["만", "편"], 0],
      ["이 책은 ___ 만한 책이에요. (읽다)", ["읽을", "읽는"], 0],
    ],
  }),
  point("connectors", {
    id: "jamaja", pattern: "V + 자마자",
    title: t("“…ishi bilan” — 자마자", "“As soon as” — 자마자", "«Как только» — 자마자"),
    explain: t(
      "Bir ish tugashi bilan darhol keyingisi boshlanishini bildiradi: 집에 도착하자마자 샤워했어요 — uyga yetib kelishim bilan dush qabul qildim. Fe'lning o'zagiga qo'shiladi, 자마자 oldida zamon (았/었) kelmaydi; zamon faqat oxirgi fe'lda ko'rsatiladi.",
      "Says that one action is followed immediately by the next: 집에 도착하자마자 샤워했어요 (I showered as soon as I got home). It attaches to a verb stem with no tense (았/었) before it; the tense is shown only on the final verb.",
      "Показывает, что за одним действием сразу следует другое: 집에 도착하자마자 샤워했어요 — как только пришёл домой, принял душ. Присоединяется к основе глагола без времени (았/었); время выражается только в последнем глаголе.",
    ),
    rules: [
      ["V + 자마자 (도착하다 → 도착하자마자)", "Fe'l o'zagi + 자마자", "Verb stem + 자마자", "Основа + 자마자"],
      ["시제 없음", "았/었 qo'shilmaydi", "No 았/었", "Без 았/었"],
      ["시제는 뒤 동사에", "Zamon oxirgi fe'lda: 도착하자마자 샤워했어요", "Tense goes on the final verb: 도착하자마자 샤워했어요", "Время — в последнем глаголе: 도착하자마자 샤워했어요"],
    ],
    examples: [
      ["집에 도착하자마자 샤워했어요.", "Uyga yetib kelishim bilan dush qabul qildim.", "I showered as soon as I got home.", "Как только я пришёл домой, принял душ."],
      ["눈을 뜨자마자 휴대폰을 봤어요.", "Ko'zimni ochishim bilan telefonga qaradim.", "I looked at my phone the moment I opened my eyes.", "Едва открыв глаза, я посмотрел в телефон."],
      ["수업이 끝나자마자 달려갔어요.", "Dars tugashi bilan yugurib ketdim.", "I ran off as soon as class ended.", "Как только закончился урок, я убежал."],
      ["그 사람을 보자마자 알아봤어요.", "Uni ko'rishim bilan tanidim.", "I recognized him the moment I saw him.", "Я узнал его, как только увидел."],
    ],
    mistakes: [
      ["도착했자마자 샤워했어요", "도착하자마자 샤워했어요", t("자마자 oldida 았/었 kelmaydi.", "No 았/었 before 자마자.", "Перед 자마자 нет 았/었.")],
      ["도착자마자 샤워했어요", "도착하자마자 샤워했어요", t("하다 fe'lida 하 tushib qolmaydi: 도착하자마자.", "Keep 하 in 하다 verbs: 도착하자마자.", "В глаголах на 하다 하 не выпадает: 도착하자마자.")],
    ],
    quiz: [
      ["집에 ___ 잠들었어요. (도착하다)", ["도착하자마자", "도착했자마자"], 0],
      ["눈을 ___ 휴대폰을 봤어요. (뜨다)", ["뜨자마자", "떴자마자"], 0],
      ["선생님이 ___ 학생들이 조용해졌어요. (들어오다)", ["들어오자마자", "들어왔자마자"], 0],
      ["일어나자마자 ___ 마셨어요.", ["물을", "물이"], 0],
    ],
  }),
  point("expressions", {
    id: "neun-gime", pattern: "V + 는 김에 · V + (으)ㄴ 김에",
    title: t("“…ayotganda, ustiga” — 는 김에", "“While at it” — 는 김에", "«Заодно, раз уж» — 는 김에"),
    explain: t(
      "Bir ish qilayotgan paytda imkoniyatdan foydalanib boshqa ishni ham qilishni bildiradi: 시장에 가는 김에 과일도 사 왔어요 — bozorga borganda mevani ham olib keldim. Hozirgi / bajarilayotgan ish uchun 는 김에, bajarilgan ish uchun (으)ㄴ 김에.",
      "Says you used the chance of doing one thing to do another: 시장에 가는 김에 과일도 사 왔어요 (while going to the market I bought fruit too). Use 는 김에 for an action in progress or about to happen, (으)ㄴ 김에 for one already done.",
      "Говорит, что, делая одно, вы воспользовались случаем и сделали ещё и другое: 시장에 가는 김에 과일도 사 왔어요 — раз уж пошёл на рынок, купил заодно и фрукты. 는 김에 — действие в процессе, (으)ㄴ 김에 — уже совершённое.",
    ),
    rules: [
      ["V + 는 김에 (가다 → 가는 김에)", "Hozir / bajarilayotgan ish", "An action in progress", "Действие в процессе"],
      ["V + (으)ㄴ 김에 (오다 → 온 김에)", "Bajarilgan ish", "A finished action", "Завершённое действие"],
      ["동사만", "Faqat fe'lga, sifatga qo'shilmaydi", "Verbs only", "Только с глаголами"],
    ],
    examples: [
      ["시장에 가는 김에 과일도 사 왔어요.", "Bozorga borganda mevani ham olib keldim.", "While I was going to the market, I bought some fruit too.", "Раз уж пошёл на рынок, купил заодно и фрукты."],
      ["서울에 온 김에 친구를 만났어요.", "Seulga kelgan ekanman, do'stim bilan ham uchrashdim.", "Since I was in Seoul anyway, I met a friend.", "Раз уж я приехал в Сеул, встретился с другом."],
      ["청소하는 김에 창문도 닦았어요.", "Tozalayotib, derazani ham artdim.", "While cleaning, I wiped the windows too.", "Раз уж убирался, заодно помыл и окна."],
      ["나가는 김에 우편물 좀 부쳐 주세요.", "Chiqayotgan ekansiz, xatni jo'natib yuboring.", "Since you're going out anyway, please post this for me.", "Раз уж выходите, отправьте, пожалуйста, письмо."],
    ],
    mistakes: [
      ["밥을 먹을 김에 커피도 마셨어요", "밥을 먹는 김에 커피도 마셨어요", t("김에 oldida faqat 는 yoki (으)ㄴ.", "Only 는 or (으)ㄴ before 김에.", "Перед 김에 только 는 или (으)ㄴ.")],
    ],
    quiz: [
      ["마트에 ___ 김에 우유도 사 오세요. (가다)", ["가는", "갈"], 0],
      ["청소하는 ___ 창문도 닦았어요.", ["김에", "바람에"], 0],
      ["서울에 ___ 김에 친구를 만났어요. (오다)", ["온", "올"], 0],
      ["산책하는 ___ 커피도 마셨어요.", ["김에", "탓에"], 0],
    ],
  }),
  point("endings", {
    id: "eulkka-bwa", pattern: "V/A + (으)ㄹ까 봐",
    title: t("“…bo'lib qolmasin” — (으)ㄹ까 봐", "“Afraid that…” — (으)ㄹ까 봐", "«Боясь, что…» — (으)ㄹ까 봐"),
    explain: t(
      "Biror narsa bo'lib qolishidan xavotirlanib, oldindan chora ko'rganini bildiradi: 늦을까 봐 택시를 탔어요 — kechikib qolmay deb taksiga o'tirdim. Ikkinchi qismda xavotirga qarshi qilingan ish turadi. Allaqachon bo'lgan bo'lishi mumkin narsa uchun 았/었을까 봐.",
      "Says you did something because you were worried something might happen: 늦을까 봐 택시를 탔어요 (I took a taxi in case I'd be late). The second clause is what you did about the worry. For a worry about something that may already have happened, use 았/었을까 봐.",
      "Говорит, что вы сделали что-то, опасаясь, что может произойти нежелательное: 늦을까 봐 택시를 탔어요 — взял такси, боясь опоздать. Во второй части — то, что вы сделали из-за опасения. Если опасение о возможно уже случившемся — 았/었을까 봐.",
    ),
    rules: [
      ["V/A + (으)ㄹ까 봐 (늦다 → 늦을까 봐)", "Xavotir: …bo'lib qolmasin", "Worry: in case …", "Опасение: как бы не …"],
      ["V/A + 았/었을까 봐", "O'tgan ish haqida xavotir", "Worry about the past", "Опасение о прошлом"],
      ["N + 일까 봐", "Ot: 거짓말일까 봐", "Noun: 거짓말일까 봐", "Сущ.: 거짓말일까 봐"],
    ],
    examples: [
      ["늦을까 봐 택시를 탔어요.", "Kechikib qolmay deb taksiga o'tirdim.", "I took a taxi in case I'd be late.", "Я взял такси, боясь опоздать."],
      ["비가 올까 봐 우산을 가져왔어요.", "Yomg'ir yog'ib qolmasin deb soyabon olib keldim.", "I brought an umbrella in case it rained.", "Я взял зонт на случай дождя."],
      ["길이 막힐까 봐 일찍 출발했어요.", "Yo'l tiqilib qolmasin deb erta yo'lga chiqdim.", "I left early in case of traffic.", "Я выехал пораньше, боясь пробок."],
      ["친구가 화낼까 봐 말을 못 했어요.", "Do'stim jahli chiqmasin deb aytolmadim.", "I couldn't tell my friend for fear that he'd get angry.", "Я не смог сказать, боясь, что друг рассердится."],
    ],
    mistakes: [
      ["늦는까 봐 택시를 탔어요", "늦을까 봐 택시를 탔어요", t("까 봐 oldida (으)ㄹ: 늦을까 봐.", "(으)ㄹ before 까 봐: 늦을까 봐.", "Перед 까 봐 — (으)ㄹ: 늦을까 봐.")],
    ],
    quiz: [
      ["감기에 ___ 봐 따뜻하게 입었어요. (걸리다)", ["걸릴까", "걸린까"], 0],
      ["시험에 ___ 봐 걱정이에요. (떨어지다)", ["떨어질까", "떨어지을까"], 0],
      ["비가 올까 ___ 우산을 가져왔어요.", ["봐", "보고"], 0],
      ["친구가 ___ 봐 말을 못 했어요. (화내다)", ["화낼까", "화내는"], 0],
    ],
  }),
  point("expressions", {
    id: "eul-ppeon", pattern: "V + (으)ㄹ 뻔하다",
    title: t("“Oz qoldi …” — (으)ㄹ 뻔하다", "“Almost happened” — (으)ㄹ 뻔하다", "«Чуть не …» — (으)ㄹ 뻔하다"),
    explain: t(
      "Yomon narsa deyarli sodir bo'lishiga oz qolganini, lekin bo'lmaganini bildiradi: 넘어질 뻔했어요 — yiqilib ketishimga oz qoldi. Odatda 뻔했다 shaklida, ko'pincha 하마터면 (“sal bo'lmasa”) bilan.",
      "Says that something bad nearly happened but didn't: 넘어질 뻔했어요 (I almost fell). It is normally used as 뻔했다, often with 하마터면 (“by a hair”).",
      "Говорит, что чуть не случилось что-то плохое, но не случилось: 넘어질 뻔했어요 — я чуть не упал. Обычно в форме 뻔했다, часто с 하마터면 («едва не»).",
    ),
    rules: [
      ["V + (으)ㄹ 뻔했다 (넘어지다 → 넘어질 뻔했다)", "Oz qoldi, lekin bo'lmadi", "Nearly, but didn't", "Чуть не, но не случилось"],
      ["하마터면 + V + (으)ㄹ 뻔했다", "Kuchaytiradi", "Emphasises it", "Усиливает"],
      ["항상 뻔했다", "Hozirgi zamon (뻔해요) bo'lmaydi", "Not in the present (뻔해요)", "Не в настоящем (뻔해요)"],
    ],
    examples: [
      ["길에서 넘어질 뻔했어요.", "Ko'chada yiqilib ketishimga oz qoldi.", "I almost fell on the street.", "Я чуть не упал на улице."],
      ["하마터면 지각할 뻔했어요.", "Sal bo'lmasa kechikib qolardim.", "I was very nearly late.", "Я едва не опоздал."],
      ["버스를 놓칠 뻔했어요.", "Avtobusdan qolib ketayozdim.", "I almost missed the bus.", "Я чуть не опоздал на автобус."],
      ["지갑을 잃어버릴 뻔했어요.", "Hamyonimni yo'qotayozdim.", "I almost lost my wallet.", "Я чуть не потерял кошелёк."],
    ],
    mistakes: [
      ["넘어질 뻔해요", "넘어질 뻔했어요", t("Doim o'tgan zamonda: 뻔했어요.", "Always past: 뻔했어요.", "Всегда прошедшее: 뻔했어요.")],
      ["넘어지는 뻔했어요", "넘어질 뻔했어요", t("뻔하다 oldida (으)ㄹ.", "(으)ㄹ before 뻔하다.", "Перед 뻔하다 — (으)ㄹ.")],
    ],
    quiz: [
      ["하마터면 ___ 뻔했어요. (늦다)", ["늦을", "늦는"], 0],
      ["차에 치일 ___ 했어요.", ["뻔", "편"], 0],
      ["버스를 ___ 뻔했어요. (놓치다)", ["놓칠", "놓친"], 0],
      ["깜짝 놀라서 심장이 멈출 ___.", ["뻔했어요", "뻔해요"], 0],
    ],
  }),
  point("endings", {
    id: "eulgeol-geuraetda", pattern: "V + (으)ㄹ 걸 그랬다",
    title: t("“…ganimda yaxshi edi” — (으)ㄹ 걸 그랬다", "“I should have” — (으)ㄹ 걸 그랬다", "«Надо было бы» — (으)ㄹ 걸 그랬다"),
    explain: t(
      "Qilmagan ish uchun afsus: 우산을 가져올 걸 그랬어요 — soyabonni olib kelganimda yaxshi edi. Qilgan ishdan afsus uchun 지 말 걸 그랬다: 먹지 말 걸 그랬어요 — yemaganimda yaxshi edi.",
      "Regret about something you didn't do: 우산을 가져올 걸 그랬어요 (I should have brought an umbrella). For regret about something you did, use 지 말 걸 그랬다: 먹지 말 걸 그랬어요 (I shouldn't have eaten).",
      "Сожаление о несделанном: 우산을 가져올 걸 그랬어요 — надо было взять зонт. Для сожаления о сделанном — 지 말 걸 그랬다: 먹지 말 걸 그랬어요 — не надо было есть.",
    ),
    rules: [
      ["V + (으)ㄹ 걸 그랬다", "Qilmagan ishga afsus", "Regret for not doing", "Сожаление о несделанном"],
      ["V + 지 말 걸 그랬다", "Qilgan ishga afsus", "Regret for doing", "Сожаление о сделанном"],
      ["주로 1인칭", "Ko'pincha gapiruvchi o'zi haqida", "Usually about yourself", "Обычно о себе"],
    ],
    examples: [
      ["비가 오네요. 우산을 가져올 걸 그랬어요.", "Yomg'ir yog'yapti. Soyabonni olib kelganimda yaxshi edi.", "It's raining. I should have brought an umbrella.", "Идёт дождь. Надо было взять зонт."],
      ["일찍 잘 걸 그랬어요.", "Erta yotganimda yaxshi edi.", "I should have gone to bed early.", "Надо было лечь пораньше."],
      ["그 옷을 살 걸 그랬어요.", "O'sha kiyimni olganimda yaxshi edi.", "I should have bought that outfit.", "Надо было купить ту одежду."],
      ["너무 많이 먹었어요. 먹지 말 걸 그랬어요.", "Juda ko'p yedim. Yemaganimda yaxshi edi.", "I ate too much. I shouldn't have eaten.", "Я слишком много съел. Не надо было есть."],
    ],
    mistakes: [
      ["가져올 걸 그래요", "가져올 걸 그랬어요", t("Afsus o'tgan zamonda: 그랬어요.", "Regret is past: 그랬어요.", "Сожаление в прошедшем: 그랬어요.")],
      ["먹지 말을 걸 그랬어요", "먹지 말 걸 그랬어요", t("말다 + (으)ㄹ → 말: 지 말 걸 그랬다.", "말다 + (으)ㄹ → 말: 지 말 걸 그랬다.", "말다 + (으)ㄹ → 말: 지 말 걸 그랬다.")],
    ],
    quiz: [
      ["비가 오네요. 우산을 ___ 걸 그랬어요. (가져오다)", ["가져올", "가져온"], 0],
      ["너무 많이 먹었어요. 먹지 ___ 걸 그랬어요.", ["말", "말을"], 0],
      ["일찍 ___ 걸 그랬어요. (자다)", ["잘", "잔"], 0],
      ["후회할 때 이렇게 말해요: 할 걸 ___.", ["그랬어요", "그래요"], 0],
    ],
  }),
  point("endings", {
    id: "eul-riga-eopda", pattern: "V/A + (으)ㄹ 리가 없다",
    title: t("“…ishi mumkin emas” — (으)ㄹ 리가 없다", "“There's no way that…” — (으)ㄹ 리가 없다", "«Не может быть, чтобы…» — (으)ㄹ 리가 없다"),
    explain: t(
      "Gapiruvchi biror narsaning bo'lishi mumkin emasligiga ishonchini bildiradi: 그 사람이 거짓말을 할 리가 없어요 — u yolg'on gapirishi mumkin emas. 리가 있어요? — “qaydan bo'lsin?” degan ritorik savol.",
      "Expresses strong belief that something can't be true: 그 사람이 거짓말을 할 리가 없어요 (there's no way he'd lie). 리가 있어요? is a rhetorical “how could it be?”.",
      "Выражает уверенность, что что-то не может быть правдой: 그 사람이 거짓말을 할 리가 없어요 — не может быть, чтобы он лгал. 리가 있어요? — риторическое «разве так бывает?».",
    ),
    rules: [
      ["V/A + (으)ㄹ 리가 없다", "…ishi mumkin emas", "No way that …", "Не может быть, чтобы …"],
      ["V/A + 았/었을 리가 없다", "O'tgan ish: bo'lgan bo'lishi mumkin emas", "Past: can't have …", "Прошлое: не мог …"],
      ["V/A + (으)ㄹ 리가 있어요?", "Ritorik savol", "Rhetorical question", "Риторический вопрос"],
    ],
    examples: [
      ["민수가 그런 말을 했을 리가 없어요.", "Minsu bunday gapni aytgan bo'lishi mumkin emas.", "There's no way Minsu said something like that.", "Не может быть, чтобы Минсу такое сказал."],
      ["그렇게 쉬울 리가 없어요.", "Bu darajada oson bo'lishi mumkin emas.", "There's no way it's that easy.", "Не может быть, чтобы это было так просто."],
      ["지금 집에 있을 리가 없어요.", "U hozir uyda bo'lishi mumkin emas.", "There's no way he's home now.", "Он никак не может быть сейчас дома."],
      ["그 사람이 거짓말을 할 리가 없어요.", "U yolg'on gapirishi mumkin emas.", "There's no way he would lie.", "Не может быть, чтобы он лгал."],
    ],
    mistakes: [
      ["하는 리가 없어요", "할 리가 없어요", t("리가 oldida (으)ㄹ.", "(으)ㄹ before 리가.", "Перед 리가 — (으)ㄹ.")],
    ],
    quiz: [
      ["그 사람이 거짓말을 ___ 리가 없어요. (하다)", ["할", "하는"], 0],
      ["벌써 도착했을 ___ 없어요.", ["리가", "리를"], 0],
      ["이렇게 ___ 리가 없어요. (쉽다)", ["쉬울", "쉬운"], 0],
      ["그가 나를 ___ 리가 없어요. (모르다)", ["모를", "모르는"], 0],
    ],
  }),
  point("endings", {
    id: "deora-goyo", pattern: "V/A + 더라고요",
    title: t("“…ekan” (o'zim ko'rganim) — 더라고요", "“I saw that…” — 더라고요", "«Оказывается… (сам видел)» — 더라고요"),
    explain: t(
      "Gapiruvchi o'z ko'zi bilan ko'rgan, o'zi guvoh bo'lgan narsani yumshoq tarzda aytadi: 그 식당은 음식이 맛있더라고요 — o'sha restoranda ovqat mazali ekan. O'zingiz ataylab qilgan ish haqida emas, balki kuzatganingiz haqida. Norasmiy qisqa shakli 더라.",
      "Softly tells something the speaker saw or experienced firsthand: 그 식당은 음식이 맛있더라고요 (the food there was good, I found). It is about what you observed, not about your own deliberate action. The casual short form is 더라.",
      "Мягко сообщает о том, что говорящий сам увидел или испытал: 그 식당은 음식이 맛있더라고요 — там, оказывается, вкусно кормят. Это о том, что вы наблюдали, а не о своём намеренном действии. Короткая форма — 더라.",
    ),
    rules: [
      ["V/A + 더라고요", "O'zim ko'rgan / sezgan narsa", "Something I saw or felt", "То, что я видел или ощутил"],
      ["V/A + 았/었더라고요", "Ko'rganimda allaqachon bo'lib bo'lgan", "Already done when I saw it", "Уже свершилось к моменту, когда я увидел"],
      ["V/A + 더라 (반말)", "Norasmiy, do'stlar orasida", "Casual form", "Разговорная форма"],
    ],
    examples: [
      ["어제 그 식당에 가 봤는데 음식이 맛있더라고요.", "Kecha u restoranga borgan edim, ovqati mazali ekan.", "I went to that restaurant yesterday and the food was good.", "Вчера сходил в тот ресторан — оказалось, там вкусно."],
      ["민수 씨가 한국어를 정말 잘하더라고요.", "Minsu koreys tilini juda yaxshi bilar ekan.", "I found that Minsu speaks Korean really well.", "Оказывается, Минсу очень хорошо говорит по-корейски."],
      ["거기 사람이 정말 많더라고요.", "U yerda odam juda ko'p ekan.", "There were really a lot of people there.", "Там было очень много народу."],
      ["그 영화를 보니까 슬프더라고요.", "O'sha kinoni ko'rgan edim, juda g'amgin ekan.", "I watched that movie and found it sad.", "Я посмотрел тот фильм — он оказался грустным."],
    ],
    mistakes: [
      ["어제 제가 학교에 가더라고요", "어제 학교에 갔는데 사람이 없더라고요", t("더라고요 — kuzatilgan narsa; o'z ishingiz emas.", "더라고요 is for what you observed, not your own action.", "더라고요 — то, что вы наблюдали, а не своё действие.")],
    ],
    quiz: [
      ["그 식당에 가 봤는데 음식이 ___. (맛있다)", ["맛있더라고요", "맛있더거든요"], 0],
      ["민수 씨가 한국어를 정말 ___. (잘하다)", ["잘하더라고요", "잘하더러요"], 0],
      ["거기 사람이 정말 ___. (많다)", ["많더라고요", "많더가요"], 0],
      ["어제 백화점에 갔는데 사람이 ___. (없다)", ["없더라고요", "없는다고요"], 0],
    ],
  }),
  point("endings", {
    id: "eosseumyeon-hada", pattern: "V/A + 았/었으면 하다",
    title: t("“…bo'lsa edi” — 았/었으면 하다", "“I wish / I hope that…” — 았/었으면 하다", "«Хотелось бы, чтобы…» — 았/었으면 하다"),
    explain: t(
      "Biror narsa bo'lishini umid qilish yoki istashni yumshoq aytadi: 내년에 한국에 갔으면 해요 — kelasi yili Koreyaga borsam edi. 았/었으면 좋겠다 bilan deyarli bir xil, lekin biroz ehtiyotkorroq.",
      "Softly expresses a hope or wish: 내년에 한국에 갔으면 해요 (I hope I can go to Korea next year). It is close to 았/었으면 좋겠다 but a little more reserved.",
      "Мягко выражает надежду или желание: 내년에 한국에 갔으면 해요 — хотелось бы поехать в Корею в следующем году. Близко к 았/었으면 좋겠다, но сдержаннее.",
    ),
    rules: [
      ["V/A + 았/었으면 하다 (가다 → 갔으면 하다)", "Umid / istak", "Hope / wish", "Надежда / желание"],
      ["V/A + 았/었으면 좋겠다", "Xuddi shu ma'no", "Same meaning", "То же значение"],
      ["N + 이었/였으면 하다", "Ot: 학생이었으면", "Noun: 학생이었으면", "Сущ.: 학생이었으면"],
    ],
    examples: [
      ["내년에 한국에 갔으면 해요.", "Kelasi yili Koreyaga borsam edi.", "I hope to go to Korea next year.", "Хотелось бы поехать в Корею в следующем году."],
      ["비가 그쳤으면 해요.", "Yomg'ir to'xtasa edi.", "I hope the rain stops.", "Хорошо бы дождь перестал."],
      ["주말에 날씨가 좋았으면 해요.", "Dam olish kunlari havo yaxshi bo'lsa edi.", "I hope the weather is nice at the weekend.", "Хотелось бы, чтобы в выходные была хорошая погода."],
      ["더 넓은 집에서 살았으면 해요.", "Kengroq uyda yashasam edi.", "I wish I could live in a bigger house.", "Хотелось бы жить в доме побольше."],
    ],
    mistakes: [
      ["갔으면 하고 싶어요", "갔으면 해요", t("으면 하다 o'zi istak; 고 싶다 qo'shilmaydi.", "으면 하다 already means wish; don't add 고 싶다.", "으면 하다 уже значит желание; 고 싶다 не добавляется.")],
    ],
    quiz: [
      ["빨리 방학이 ___ 해요. (되다)", ["됐으면", "되으면"], 0],
      ["비가 ___ 해요. (그치다)", ["그쳤으면", "그치으면"], 0],
      ["내년에 한국에 ___ 해요. (가다)", ["갔으면", "가으면"], 0],
      ["친구가 빨리 ___ 해요. (오다)", ["왔으면", "오으면"], 0],
    ],
  }),
  point("expressions", {
    id: "eun-daero", pattern: "V + (으)ㄴ/는 대로 · N + 대로",
    title: t("“…gandek / …ishi bilan” — 대로", "“As / as soon as” — 대로", "«Как / сразу как» — 대로"),
    explain: t(
      "Biror narsaga mos ravishda: 제가 말씀드린 대로 하세요 — aytganimdek qiling. 는 대로 — “… ishi bilan”: 도착하는 대로 전화할게요. Otga 대로 yopishtirib yoziladi: 규칙대로.",
      "Means “just as”: 제가 말씀드린 대로 하세요 (do it as I told you). 는 대로 also means “as soon as”: 도착하는 대로 전화할게요. After a noun, 대로 is written without a space: 규칙대로.",
      "Значит «так, как»: 제가 말씀드린 대로 하세요 — делайте так, как я сказал. 는 대로 ещё значит «как только»: 도착하는 대로 전화할게요. После существительного 대로 пишется слитно: 규칙대로.",
    ),
    rules: [
      ["V + (으)ㄴ 대로 (말하다 → 말한 대로)", "…gandek (o'tgan)", "As (past)", "Так, как (прош.)"],
      ["V + 는 대로", "…ishi bilan / …gandek", "As soon as / as it is", "Как только / как есть"],
      ["N + 대로 (띄어쓰기 없음)", "Ot bilan birga yoziladi", "Written together with a noun", "С существительным — слитно"],
    ],
    examples: [
      ["제가 말씀드린 대로 하세요.", "Men aytganimdek qiling.", "Do it as I told you.", "Делайте так, как я вам сказал."],
      ["도착하는 대로 전화할게요.", "Yetib borishim bilan qo'ng'iroq qilaman.", "I'll call as soon as I arrive.", "Позвоню, как только приеду."],
      ["생각한 대로 잘 안 됐어요.", "O'ylaganimdek yaxshi bo'lmadi.", "It didn't go as I had thought.", "Получилось не так, как я думал."],
      ["규칙대로 하세요.", "Qoida bo'yicha qiling.", "Follow the rules.", "Действуйте по правилам."],
    ],
    mistakes: [
      ["규칙 대로 하세요", "규칙대로 하세요", t("Otdan keyin 대로 ajratilmaydi.", "Don't put a space before 대로 after a noun.", "После существительного 대로 слитно.")],
    ],
    quiz: [
      ["도착하는 ___ 연락드릴게요.", ["대로", "때문에"], 0],
      ["선생님이 말씀하신 ___ 하세요.", ["대로", "동안"], 0],
      ["___ 해야 해요. (규칙)", ["규칙대로", "규칙 대로"], 0],
      ["생각한 ___ 안 됐어요.", ["대로", "데로"], 0],
    ],
  }),
  point("connectors", {
    id: "gineun-keonyeong", pattern: "N + 은/는커녕 · V + 기는커녕",
    title: t("“…u yoqda tursin” — 은/는커녕", "“Let alone / far from” — 은/는커녕", "«Не то что …, даже» — 은/는커녕"),
    explain: t(
      "Birinchisi u yoqda tursin, undan ham kichigi ham bo'lmaganini bildiradi: 선물은커녕 인사도 안 했어요 — sovg'a u yoqda tursin, salom ham bermadi. Fe'lga 기는커녕: 살이 빠지기는커녕 더 쪘어요.",
      "Says not even the smaller thing happened, let alone the bigger: 선물은커녕 인사도 안 했어요 (no gift, he didn't even say hello). With verbs use 기는커녕: 살이 빠지기는커녕 더 쪘어요.",
      "Говорит, что не произошло даже меньшего, не говоря о большем: 선물은커녕 인사도 안 했어요 — не то что подарка, даже не поздоровался. С глаголами — 기는커녕: 살이 빠지기는커녕 더 쪘어요.",
    ),
    rules: [
      ["N + 은/는커녕 (선물 → 선물은커녕)", "Ot + 은/는커녕", "Noun + 은/는커녕", "Сущ. + 은/는커녕"],
      ["V + 기는커녕", "Fe'l + 기는커녕", "Verb + 기는커녕", "Глагол + 기는커녕"],
      ["뒤에 도 / 오히려", "Keyingi qismda ko'pincha 도 yoki 오히려", "Often with 도 or 오히려", "Часто с 도 или 오히려"],
    ],
    examples: [
      ["선물은커녕 인사도 안 했어요.", "Sovg'a u yoqda tursin, salom ham bermadi.", "He didn't even say hello, let alone give a gift.", "Не то что подарка — он даже не поздоровался."],
      ["칭찬은커녕 야단만 맞았어요.", "Maqtov u yoqda tursin, faqat koyish eshitdim.", "Far from being praised, I only got scolded.", "Вместо похвалы меня только отругали."],
      ["밥은커녕 물도 못 마셨어요.", "Ovqat u yoqda tursin, suv ham icha olmadim.", "I couldn't even drink water, let alone eat.", "Не то что поесть — даже воды не смог выпить."],
      ["살이 빠지기는커녕 더 쪘어요.", "Ozish u yoqda tursin, yana semirdim.", "Far from losing weight, I gained more.", "Не то что похудел — поправился ещё больше."],
    ],
    mistakes: [
      ["선물을커녕 인사도 안 했어요", "선물은커녕 인사도 안 했어요", t("은/는커녕 — 을/를커녕 bo'lmaydi.", "It's 은/는커녕, never 을/를커녕.", "Только 은/는커녕, не 을/를커녕.")],
    ],
    quiz: [
      ["선물___ 인사도 안 했어요.", ["은커녕", "을커녕"], 0],
      ["살이 빠지기___ 더 쪘어요.", ["는커녕", "는데"], 0],
      ["돈은커녕 밥도 ___.", ["못 먹었어요", "잘 먹었어요"], 0],
      ["위로는커녕 ___ 더 화를 냈어요.", ["오히려", "마침"], 0],
    ],
  }),
  point("connectors", {
    id: "eosseodaga", pattern: "V + 았/었다가",
    title: t("“…ib, keyin …” (teskari) — 았/었다가", "“Did …, then (reversed)” — 았/었다가", "«Сделав …, затем (наоборот)» — 았/었다가"),
    explain: t(
      "Bir ish tugagach, o'sha ishning aksi yoki boshqa ish bo'lganini bildiradi: 옷을 입었다가 벗었어요 — kiyimni kiyib, keyin yechdim. Ega ikkala qismda bir xil. 다가 (ish yarmida to'xtaydi) dan farqli, 았/었다가 da birinchi ish tugagan bo'ladi.",
      "Says one action was finished and then reversed or followed by another: 옷을 입었다가 벗었어요 (I put the clothes on, then took them off). The subject is the same in both clauses. Unlike 다가 (an action interrupted midway), the first action is completed.",
      "Говорит, что одно действие было завершено, а затем отменено или сменилось другим: 옷을 입었다가 벗었어요 — надел одежду, потом снял. Подлежащее в обеих частях одно. В отличие от 다가 (прерванное действие), первое действие завершено.",
    ),
    rules: [
      ["V + 았/었다가 (입다 → 입었다가)", "Tugagan ish + keyingi ish", "Finished action + next", "Завершённое + следующее"],
      ["주어 동일", "Ikkala qismda ega bir xil", "Same subject", "Одно подлежащее"],
      ["가다가 ≠ 갔다가", "가다가 — yo'lda; 갔다가 — borib qaytdi", "가다가 = on the way; 갔다가 = went and came back", "가다가 — по дороге; 갔다가 — сходил и вернулся"],
    ],
    examples: [
      ["옷을 입었다가 벗었어요.", "Kiyimni kiyib, keyin yechdim.", "I put the clothes on, then took them off.", "Я надел одежду, а потом снял."],
      ["학교에 갔다가 집에 왔어요.", "Maktabga borib, keyin uyga keldim.", "I went to school and then came home.", "Я сходил в школу и вернулся домой."],
      ["창문을 열었다가 닫았어요.", "Derazani ochib, keyin yopdim.", "I opened the window and then closed it.", "Я открыл окно, а потом закрыл."],
      ["침대에 누웠다가 일어났어요.", "Karavotga yotib, keyin turdim.", "I lay on the bed and then got up.", "Я прилёг на кровать, а потом встал."],
    ],
    mistakes: [
      ["제가 창문을 열었다가 동생이 닫았어요", "제가 창문을 열었다가 다시 닫았어요", t("았/었다가 — ikkala qismda ega bir xil.", "With 았/었다가 both clauses share one subject.", "При 았/었다가 подлежащее в обеих частях одно.")],
    ],
    quiz: [
      ["옷을 ___ 벗었어요. (입다)", ["입었다가", "입였다가"], 0],
      ["학교에 ___ 집에 왔어요. (가다)", ["갔다가", "가었다가"], 0],
      ["침대에 ___ 일어났어요. (눕다)", ["누웠다가", "눕었다가"], 0],
      ["친구를 ___ 헤어졌어요. (만나다)", ["만났다가", "만나었다가"], 0],
    ],
  }),
  point("expressions", {
    id: "neun-de-georida", pattern: "V + 는 데 + 시간/돈이 걸리다·들다",
    title: t("“…ishga … ketadi” — 는 데 걸리다", "“It takes … to do” — 는 데 걸리다", "«На … уходит …» — 는 데 걸리다"),
    explain: t(
      "Biror ishni qilish uchun qancha vaqt yoki pul ketishini aytadi: 학교에 가는 데 30분 걸려요 — maktabga borishga 30 daqiqa ketadi. Vaqt uchun 걸리다, pul va kuch uchun 들다. 는 데 yana 도움이 되다 (yordam beradi), 좋다 bilan ham keladi.",
      "Tells how much time or money it takes to do something: 학교에 가는 데 30분 걸려요 (it takes 30 minutes to get to school). 걸리다 is for time, 들다 for money or effort. 는 데 also pairs with 도움이 되다 (helps) and 좋다.",
      "Говорит, сколько времени или денег уходит на действие: 학교에 가는 데 30분 걸려요 — дорога до школы занимает 30 минут. 걸리다 — для времени, 들다 — для денег и усилий. 는 데 также сочетается с 도움이 되다 (помогает) и 좋다.",
    ),
    rules: [
      ["V + 는 데 + 시간이 걸리다", "Vaqt ketadi", "It takes time", "Уходит время"],
      ["V + 는 데 + 돈이 들다", "Pul ketadi", "It costs money", "Уходят деньги"],
      ["V + 는 데 + 도움이 되다 / 좋다", "Foydali / yordam beradi", "Helps / is good for", "Помогает / полезно для"],
    ],
    examples: [
      ["학교에 가는 데 30분 걸려요.", "Maktabga borishga 30 daqiqa ketadi.", "It takes 30 minutes to get to school.", "Дорога до школы занимает 30 минут."],
      ["이 책을 읽는 데 일주일이 걸렸어요.", "Bu kitobni o'qishga bir hafta ketdi.", "It took me a week to read this book.", "Чтобы прочитать эту книгу, мне понадобилась неделя."],
      ["한국어를 배우는 데 돈이 많이 들어요.", "Koreys tilini o'rganishga ko'p pul ketadi.", "Learning Korean costs a lot of money.", "Изучение корейского требует много денег."],
      ["이 사전은 한국어를 공부하는 데 도움이 돼요.", "Bu lug'at koreys tilini o'rganishda yordam beradi.", "This dictionary helps in studying Korean.", "Этот словарь помогает в изучении корейского."],
    ],
    mistakes: [
      ["학교에 가는 것 30분 걸려요", "학교에 가는 데 30분 걸려요", t("Sarflanadigan vaqt uchun 는 데.", "For the time spent use 는 데.", "Для затрат времени — 는 데.")],
    ],
    quiz: [
      ["서울에서 부산까지 가는 ___ 세 시간 걸려요.", ["데", "때"], 0],
      ["책을 ___ 데 일주일 걸렸어요. (읽다)", ["읽는", "읽은"], 0],
      ["이 사전은 한국어를 ___ 데 도움이 돼요. (공부하다)", ["공부하는", "공부한"], 0],
      ["요리하는 데 시간이 많이 ___.", ["걸려요", "해요"], 0],
    ],
  }),
  point("expressions", {
    id: "neun-sem", pattern: "V/A + (으)ㄴ/는 셈이다",
    title: t("“…desa ham bo'ladi” — (으)ㄴ/는 셈이다", "“Practically / as good as” — (으)ㄴ/는 셈이다", "«Считай, что…» — (으)ㄴ/는 셈이다"),
    explain: t(
      "Aynan unday bo'lmasa-da, hisoblab qaraganda amalda shunga teng ekanini bildiradi: 숙제를 거의 다 했으니까 끝난 셈이에요 — vazifani deyarli qilib bo'ldim, tugadi desa ham bo'ladi. Hozirgi ishga 는 셈이다, bajarilgan ish va sifatga (으)ㄴ 셈이다, otga 인 셈이다.",
      "Says that, all things considered, something practically amounts to something else: 숙제를 거의 다 했으니까 끝난 셈이에요 (I've done almost all my homework, so it's practically finished). Present actions take 는 셈이다, finished actions and adjectives (으)ㄴ 셈이다, nouns 인 셈이다.",
      "Говорит, что по сути, если подумать, одно равносильно другому: 숙제를 거의 다 했으니까 끝난 셈이에요 — я сделал почти всё задание, считай, закончил. Для текущего действия — 는 셈이다, для завершённого и прилагательных — (으)ㄴ 셈이다, для существительных — 인 셈이다.",
    ),
    rules: [
      ["V + 는 셈이다 (가다 → 가는 셈이다)", "Hozirgi / odatiy ish", "Present or habitual action", "Текущее или обычное действие"],
      ["V + (으)ㄴ 셈이다 · A + (으)ㄴ 셈이다", "Bajarilgan ish / sifat", "Finished action / adjective", "Завершённое действие / прилагательное"],
      ["N + 인 셈이다", "Ot: 공짜인 셈이다", "Noun: 공짜인 셈이다", "Сущ.: 공짜인 셈이다"],
    ],
    examples: [
      ["숙제를 거의 다 했으니까 끝난 셈이에요.", "Vazifani deyarli qilib bo'ldim, tugadi desa ham bo'ladi.", "I've done almost all my homework, so it's practically finished.", "Я сделал почти всё домашнее задание, так что, считай, закончил."],
      ["일주일에 여섯 번 운동하니까 거의 매일 하는 셈이에요.", "Haftada olti marta sport qilaman, demak deyarli har kuni qilaman.", "I work out six times a week, so it's practically every day.", "Я тренируюсь шесть раз в неделю — то есть почти каждый день."],
      ["이 가격이면 공짜인 셈이에요.", "Bu narxda tekin desa ham bo'ladi.", "At this price, it's as good as free.", "За такую цену это, считай, бесплатно."],
      ["서울에서 십 년을 살았으니 서울이 고향인 셈이에요.", "Seulda o'n yil yashadim, Seul ona shahrim desa ham bo'ladi.", "I've lived in Seoul for ten years, so it's practically my hometown.", "Я прожил в Сеуле десять лет, так что Сеул мне, считай, родной город."],
    ],
    mistakes: [
      ["공짜 셈이에요", "공짜인 셈이에요", t("Otdan keyin 인 셈이다.", "After a noun use 인 셈이다.", "После существительного — 인 셈이다.")],
      ["싸는 셈이에요", "싼 셈이에요", t("Sifatga (으)ㄴ 셈이다.", "Adjectives take (으)ㄴ 셈이다.", "Прилагательные — (으)ㄴ 셈이다.")],
    ],
    quiz: [
      ["이 가격이면 공짜___ 셈이에요.", ["인", "는"], 0],
      ["일주일에 여섯 번 가니까 거의 매일 ___ 셈이에요. (가다)", ["가는", "가을"], 0],
      ["숙제를 거의 다 했으니까 ___ 셈이에요. (끝나다)", ["끝난", "끝나은"], 0],
      ["반값이니까 ___ 셈이에요. (싸다)", ["싼", "싸는"], 0],
    ],
  }),
  point("connectors", {
    id: "ndamyeon", pattern: "V/A + (ㄴ/는)다면 · N + (이)라면",
    title: t("“Agar … bo'lsa (faraz)” — (ㄴ/는)다면", "“If (hypothetically)” — (ㄴ/는)다면", "«Если бы» — (ㄴ/는)다면"),
    explain: t(
      "(으)면 dan farqli, kamroq ehtimolli yoki xayoliy shartni bildiradi: 복권에 당첨된다면 집을 사고 싶어요 — lotereya yutsam, uy olmoqchiman. Fe'lga ㄴ/는다면, sifatga 다면, otga (이)라면. Bo'lmay qolgan o'tmish uchun 았/었다면: 일찍 출발했다면 늦지 않았을 거예요.",
      "Unlike (으)면, it sets up an unlikely or imagined condition: 복권에 당첨된다면 집을 사고 싶어요 (if I won the lottery, I'd want to buy a house). Verbs take ㄴ/는다면, adjectives 다면, nouns (이)라면. For an unreal past use 았/었다면: 일찍 출발했다면 늦지 않았을 거예요.",
      "В отличие от (으)면, задаёт маловероятное или воображаемое условие: 복권에 당첨된다면 집을 사고 싶어요 — если бы я выиграл в лотерею, купил бы дом. Глаголы — ㄴ/는다면, прилагательные — 다면, существительные — (이)라면. Для нереального прошлого — 았/었다면: 일찍 출발했다면 늦지 않았을 거예요.",
    ),
    rules: [
      ["V + ㄴ/는다면 (가다 → 간다면, 먹다 → 먹는다면)", "Fe'l", "Verb", "Глагол"],
      ["A + 다면 · N + (이)라면", "Sifat / ot", "Adjective / noun", "Прилагательное / сущ."],
      ["V/A + 았/었다면", "O'tmishda bo'lmagan faraz", "Unreal past", "Нереальное прошлое"],
    ],
    examples: [
      ["복권에 당첨된다면 집을 사고 싶어요.", "Lotereya yutsam, uy sotib olmoqchiman.", "If I won the lottery, I'd want to buy a house.", "Если бы я выиграл в лотерею, я бы купил дом."],
      ["시간이 있다면 세계 여행을 하고 싶어요.", "Vaqtim bo'lsa edi, dunyo bo'ylab sayohat qilardim.", "If I had time, I'd like to travel the world.", "Если бы у меня было время, я бы поехал путешествовать по миру."],
      ["내가 너라면 그렇게 안 할 거야.", "Sening o'rningda bo'lsam, unday qilmasdim.", "If I were you, I wouldn't do that.", "На твоём месте я бы так не поступил."],
      ["조금 일찍 출발했다면 늦지 않았을 거예요.", "Sal ertaroq yo'lga chiqqanimizda, kechikmagan bo'lardik.", "If we had left a little earlier, we wouldn't have been late.", "Если бы мы выехали чуть раньше, мы бы не опоздали."],
    ],
    mistakes: [
      ["복권에 당첨되다면", "복권에 당첨된다면", t("Fe'lga ㄴ/는다면: 된다면.", "Verbs take ㄴ/는다면: 된다면.", "Глаголы — ㄴ/는다면: 된다면.")],
      ["내가 너다면", "내가 너라면", t("Otga (이)라면.", "Nouns take (이)라면.", "Существительные — (이)라면.")],
    ],
    quiz: [
      ["복권에 ___ 집을 살 거예요. (당첨되다)", ["당첨된다면", "당첨되다면"], 0],
      ["내가 ___ 그렇게 안 할 거예요. (너)", ["너라면", "너다면"], 0],
      ["한국어를 ___ 한국 회사에서 일하고 싶어요. (잘하다)", ["잘한다면", "잘하다면"], 0],
      ["일찍 ___ 늦지 않았을 거예요. (출발하다)", ["출발했다면", "출발한다면"], 0],
    ],
  }),
  point("connectors", {
    id: "deoni", pattern: "V/A + 더니",
    title: t("“…edi, keyin …” (kuzatilgan) — 더니", "“Was …, and then …” (observed) — 더니", "«Было …, а потом …» (наблюдение) — 더니"),
    explain: t(
      "Gapiruvchi boshqa kishi yoki narsada ko'rgan holatni, so'ng undan keyingi natija yoki o'zgarishni aytadi: 민수가 열심히 공부하더니 합격했어요 — Minsu tirishib o'qidi, oxiri imtihondan o'tdi. Qarama-qarshilik ham bildiradi: 아침에는 춥더니 오후에는 따뜻해요. O'z ishingiz uchun 았/었더니 ishlatiladi.",
      "Tells what the speaker saw in someone or something else, then the result or change that followed: 민수가 열심히 공부하더니 합격했어요 (Minsu studied hard and ended up passing). It can also show contrast: 아침에는 춥더니 오후에는 따뜻해요. For your own action use 았/었더니.",
      "Сообщает о том, что говорящий наблюдал у другого человека или предмета, и о последовавшем результате или перемене: 민수가 열심히 공부하더니 합격했어요 — Минсу усердно занимался и сдал экзамен. Может выражать и контраст: 아침에는 춥더니 오후에는 따뜻해요. Для своего действия — 았/었더니.",
    ),
    rules: [
      ["V/A + 더니", "Kuzatilgan holat + natija / o'zgarish", "Observed state + result / change", "Наблюдаемое + результат / перемена"],
      ["주어: 3인칭", "Birinchi qismda ega — boshqa kishi yoki narsa", "First clause: someone or something else", "В первой части — другое лицо или предмет"],
      ["나 → 았/었더니", "O'z ishingiz uchun 았/었더니", "For your own action: 았/었더니", "Для своего действия — 았/었더니"],
    ],
    examples: [
      ["민수가 열심히 공부하더니 시험에 합격했어요.", "Minsu tirishib o'qidi, oxiri imtihondan o'tdi.", "Minsu studied hard and ended up passing the exam.", "Минсу усердно занимался — и сдал экзамен."],
      ["아침에는 춥더니 오후에는 따뜻해요.", "Ertalab sovuq edi, tushdan keyin esa iliq.", "It was cold this morning, but it's warm this afternoon.", "Утром было холодно, а днём тепло."],
      ["동생이 계속 기침을 하더니 결국 감기에 걸렸어요.", "Ukam tinmay yo'talardi, oxiri shamollab qoldi.", "My younger brother kept coughing and finally came down with a cold.", "Младший брат всё кашлял и в итоге простудился."],
      ["하늘이 흐리더니 비가 오기 시작했어요.", "Osmon bulut edi, keyin yomg'ir yog'a boshladi.", "The sky was cloudy, and then it started to rain.", "Небо хмурилось, а потом пошёл дождь."],
    ],
    mistakes: [
      ["제가 열심히 공부하더니 합격했어요", "제가 열심히 공부했더니 합격했어요", t("O'z ishingiz uchun 았/었더니.", "For your own action use 았/었더니.", "Для своего действия — 았/었더니.")],
    ],
    quiz: [
      ["민수가 열심히 ___ 합격했어요. (공부하다)", ["공부하더니", "공부하더라고"], 0],
      ["아침에는 ___ 오후에는 따뜻해요. (춥다)", ["춥더니", "춥더러"], 0],
      ["하늘이 ___ 비가 오기 시작했어요. (흐리다)", ["흐리더니", "흐리더냐"], 0],
      ["제가 많이 ___ 배가 불러요. (먹다)", ["먹었더니", "먹더니"], 0],
    ],
  }),
  point("modifiers", {
    id: "eotdeon", pattern: "V/A + 았/었던 + N · V + 던 + N",
    title: t("Eslanayotgan o'tmish — 았/었던", "A remembered past — 았/었던", "Вспоминаемое прошлое — 았/었던"),
    explain: t(
      "Otdan oldin kelib, tugagan va eslanayotgan o'tmishni bildiradi: 어릴 때 살았던 집 — bolaligimda yashagan uyim. Endi unday emasligi ham sezilib turadi: 날씬했던 친구 — ilgari ozg'in bo'lgan do'st. 던 (았/었 siz) — takrorlangan yoki tugamay qolgan o'tmish: 자주 가던 카페.",
      "Comes before a noun to describe a finished, remembered past: 어릴 때 살았던 집 (the house I lived in as a child). It often implies things are different now: 날씬했던 친구 (a friend who used to be slim). 던 without 았/었 marks a repeated or unfinished past: 자주 가던 카페.",
      "Ставится перед существительным и описывает завершённое, вспоминаемое прошлое: 어릴 때 살았던 집 — дом, где я жил в детстве. Часто подразумевает, что сейчас всё иначе: 날씬했던 친구 — друг, который раньше был худым. 던 без 았/었 — повторявшееся или незавершённое прошлое: 자주 가던 카페.",
    ),
    rules: [
      ["V/A + 았/었던 N (살다 → 살았던 집)", "Tugagan, eslanayotgan o'tmish", "A finished, remembered past", "Завершённое, вспоминаемое прошлое"],
      ["V + 던 N (가다 → 가던 카페)", "Takrorlangan yoki tugamagan o'tmish", "Repeated or unfinished past", "Повторявшееся или незавершённое прошлое"],
      ["N + 이었던/였던 N", "Ot: 학생이었던 때", "Noun: 학생이었던 때", "Сущ.: 학생이었던 때"],
    ],
    examples: [
      ["어릴 때 살았던 집에 다시 가 봤어요.", "Bolaligimda yashagan uyga yana borib ko'rdim.", "I went back to the house I lived in as a child.", "Я снова побывал в доме, где жил в детстве."],
      ["작년에 같이 갔던 식당 기억나요?", "O'tgan yili birga borgan restoranimiz esingizdami?", "Do you remember the restaurant we went to together last year?", "Помните ресторан, куда мы ходили вместе в прошлом году?"],
      ["학생 때 자주 가던 카페가 없어졌어요.", "Talabalik paytimda tez-tez boradigan kafem yopilib ketibdi.", "The café I used to go to often as a student is gone.", "Кафе, куда я часто ходил студентом, закрылось."],
      ["날씬했던 친구가 살이 많이 쪘어요.", "Ilgari ozg'in bo'lgan do'stim ancha semiribdi.", "My friend who used to be slim has put on a lot of weight.", "Мой друг, который раньше был худым, сильно поправился."],
    ],
    mistakes: [
      ["어릴 때 살었던 집", "어릴 때 살았던 집", t("살다 — ㅏ unli: 았던.", "살다 has ㅏ, so 았던.", "살다 — гласная ㅏ: 았던.")],
      ["학생였던 때", "학생이었던 때", t("Undosh bilan tugagan otga 이었던.", "After a consonant use 이었던.", "После согласной — 이었던.")],
    ],
    quiz: [
      ["어릴 때 ___ 집에 가 봤어요. (살다)", ["살았던", "살었던"], 0],
      ["작년에 같이 ___ 식당 기억나요? (가다)", ["갔던", "가었던"], 0],
      ["학생___ 때가 그리워요.", ["이었던", "였던"], 0],
      ["___ 친구가 살이 많이 쪘어요. (날씬하다)", ["날씬했던", "날씬하었던"], 0],
    ],
  }),
  point("expressions", {
    id: "eul-jeongdoro", pattern: "V/A + (으)ㄹ 정도로 · N + 정도로",
    title: t("“…darajada” — (으)ㄹ 정도로", "“So … that …” — (으)ㄹ 정도로", "«Настолько, что…» — (으)ㄹ 정도로"),
    explain: t(
      "Holat yoki ishning darajasini misol bilan ko'rsatadi: 눈물이 날 정도로 웃었어요 — ko'zimdan yosh chiqquncha kuldim. Gap oxirida (으)ㄹ 정도이다 / 정도예요 shaklida ham keladi.",
      "Shows how strong something is by giving an example of its effect: 눈물이 날 정도로 웃었어요 (I laughed so hard I cried). At the end of a sentence it appears as (으)ㄹ 정도이다 / 정도예요.",
      "Показывает степень чего-либо через пример последствия: 눈물이 날 정도로 웃었어요 — я смеялся до слёз. В конце предложения — (으)ㄹ 정도이다 / 정도예요.",
    ),
    rules: [
      ["V/A + (으)ㄹ 정도로 + V/A", "Darajani ko'rsatadi", "Shows the degree", "Показывает степень"],
      ["V/A + (으)ㄹ 정도이다", "Gap oxirida", "At the end of a sentence", "В конце предложения"],
      ["N + 정도로", "Ot: 전문가 정도로", "Noun: 전문가 정도로", "Сущ.: 전문가 정도로"],
    ],
    examples: [
      ["눈물이 날 정도로 웃었어요.", "Ko'zimdan yosh chiqquncha kuldim.", "I laughed so hard I cried.", "Я смеялся до слёз."],
      ["걸을 수 없을 정도로 다리가 아팠어요.", "Oyog'im yura olmaydigan darajada og'rib qoldi.", "My legs hurt so much I couldn't walk.", "Ноги болели так, что я не мог идти."],
      ["그 사람은 한국 사람처럼 들릴 정도로 한국어를 잘해요.", "U koreysdek eshitiladigan darajada koreyscha yaxshi gapiradi.", "He speaks Korean so well that he sounds like a Korean.", "Он говорит по-корейски так хорошо, что его можно принять за корейца."],
      ["배가 터질 정도로 많이 먹었어요.", "Qornim yorilib ketgudek ko'p yedim.", "I ate so much I thought I'd burst.", "Я так наелся, что чуть не лопнул."],
    ],
    mistakes: [
      ["배가 터질 정도를 먹었어요", "배가 터질 정도로 먹었어요", t("Daraja uchun 정도로.", "Use 정도로 for degree.", "Для степени — 정도로.")],
    ],
    quiz: [
      ["눈물이 ___ 정도로 웃었어요. (나다)", ["날", "나을"], 0],
      ["걸을 수 ___ 정도로 피곤해요. (없다)", ["없을", "없는을"], 0],
      ["배가 터질 ___ 먹었어요.", ["정도로", "정도를"], 0],
      ["그 영화는 다시 보고 싶을 ___ 재미있어요.", ["정도로", "때문에"], 0],
    ],
  }),
  point("connectors", {
    id: "aeo-gajigo", pattern: "V/A + 아/어 가지고",
    title: t("Og'zaki sabab va ketma-ketlik — 아/어 가지고", "Spoken reason and sequence — 아/어 가지고", "Разговорная причина и последовательность — 아/어 가지고"),
    explain: t(
      "Og'zaki nutqda 아/어서 o'rnida keladi. 1) Sabab: 너무 피곤해 가지고 일찍 잤어요 — juda charchaganimdan erta yotdim. 2) Bir ishni qilib, uning natijasi bilan keyingisini qilish: 돈을 모아 가지고 차를 샀어요. Yozma nutqda 아/어서 ishlating.",
      "Used in speech in place of 아/어서. 1) Reason: 너무 피곤해 가지고 일찍 잤어요 (I was so tired I went to bed early). 2) Doing something and then using its result: 돈을 모아 가지고 차를 샀어요. In writing, use 아/어서.",
      "В разговорной речи заменяет 아/어서. 1) Причина: 너무 피곤해 가지고 일찍 잤어요 — я так устал, что рано лёг. 2) Сделать что-то и затем использовать результат: 돈을 모아 가지고 차를 샀어요. На письме используйте 아/어서.",
    ),
    rules: [
      ["V/A + 아/어 가지고 (피곤하다 → 피곤해 가지고)", "Sabab (og'zaki 아/어서)", "Reason (spoken 아/어서)", "Причина (разг. 아/어서)"],
      ["V + 아/어 가지고 + V", "Qilib, natijasidan foydalanib", "Do, then use the result", "Сделав, использовать результат"],
      ["구어 · 시제 없음", "Faqat og'zaki; oldida 았/었 yo'q", "Spoken only; no 았/었 before it", "Только в речи; без 았/었"],
    ],
    examples: [
      ["너무 피곤해 가지고 일찍 잤어요.", "Juda charchaganimdan erta yotdim.", "I was so tired that I went to bed early.", "Я так устал, что рано лёг спать."],
      ["돈을 모아 가지고 차를 샀어요.", "Pul yig'ib, mashina sotib oldim.", "I saved up money and bought a car.", "Я накопил денег и купил машину."],
      ["길을 몰라 가지고 한참 헤맸어요.", "Yo'lni bilmaganim uchun ancha adashib yurdim.", "I didn't know the way, so I wandered around for a long time.", "Я не знал дороги и долго плутал."],
      ["김밥을 만들어 가지고 소풍을 갔어요.", "Kimbap tayyorlab, piknikka bordik.", "We made gimbap and went on a picnic.", "Мы приготовили кимпаб и поехали на пикник."],
    ],
    mistakes: [
      ["피곤하 가지고", "피곤해 가지고", t("아/어 qo'shiladi: 피곤해 가지고.", "Add 아/어: 피곤해 가지고.", "Добавляется 아/어: 피곤해 가지고.")],
      ["피곤했어 가지고", "피곤해 가지고", t("가지고 oldida zamon yo'q.", "No tense before 가지고.", "Перед 가지고 нет времени.")],
    ],
    quiz: [
      ["너무 ___ 가지고 일찍 잤어요. (피곤하다)", ["피곤해", "피곤하"], 0],
      ["돈을 ___ 가지고 차를 샀어요. (모으다)", ["모아", "모으어"], 0],
      ["길을 ___ 가지고 헤맸어요. (모르다)", ["몰라", "모르어"], 0],
      ["김밥을 ___ 가지고 소풍을 갔어요. (만들다)", ["만들어", "만들었어"], 0],
    ],
  }),
  point("connectors", {
    id: "gillae", pattern: "V/A + 길래",
    title: t("Ko'rgan sababim tufayli — 길래", "Because I saw / heard that — 길래", "Раз уж (увидел) — 길래"),
    explain: t(
      "Gapiruvchi ko'rgan yoki eshitgan holat sabab bo'lib, o'zi biror ish qilganini aytadi: 날씨가 좋길래 산책했어요 — havo yaxshi ekan, sayr qildim. Og'zaki shakl; yozuvda 기에. Ikkinchi qismda gapiruvchining o'z ishi turadi, buyruq yoki taklif bo'lmaydi.",
      "Gives something the speaker saw or heard as the reason for what the speaker then did: 날씨가 좋길래 산책했어요 (the weather was nice, so I took a walk). It is spoken; the written form is 기에. The second clause is the speaker's own action, never a command or suggestion.",
      "Указывает на увиденное или услышанное как на причину собственного действия говорящего: 날씨가 좋길래 산책했어요 — погода была хорошая, и я прогулялся. Разговорная форма; на письме — 기에. Во второй части — действие самого говорящего, без приказа и предложения.",
    ),
    rules: [
      ["V/A + 길래 (좋다 → 좋길래)", "Kuzatilgan sabab", "An observed reason", "Наблюдаемая причина"],
      ["뒤: 말하는 사람의 행동", "Ikkinchi qismda o'zim nima qildim", "Second clause: what I did", "Вторая часть — что сделал я"],
      ["V/A + 기에 (문어)", "Yozma uslubda", "Written style", "Письменный стиль"],
    ],
    examples: [
      ["날씨가 좋길래 공원에서 산책했어요.", "Havo yaxshi ekan, bog'da sayr qildim.", "The weather was nice, so I took a walk in the park.", "Погода была хорошая, и я прогулялся по парку."],
      ["친구가 아프다고 하길래 약을 사다 줬어요.", "Do'stim betobman degani uchun dori olib berdim.", "My friend said they were sick, so I bought them some medicine.", "Друг сказал, что заболел, и я купил ему лекарство."],
      ["가게에서 사과가 싸길래 많이 샀어요.", "Do'konda olma arzon ekan, ko'p oldim.", "Apples were cheap at the shop, so I bought a lot.", "В магазине яблоки были дешёвые, и я купил много."],
      ["아이가 울길래 안아 줬어요.", "Bola yig'layotgan ekan, quchog'imga oldim.", "The child was crying, so I picked them up.", "Ребёнок плакал, и я взял его на руки."],
    ],
    mistakes: [
      ["날씨가 좋길래 산책하세요", "날씨가 좋으니까 산책하세요", t("길래 dan keyin buyruq bo'lmaydi; (으)니까.", "No command after 길래; use (으)니까.", "После 길래 нет приказа; используйте (으)니까.")],
    ],
    quiz: [
      ["날씨가 ___ 산책했어요. (좋다)", ["좋길래", "좋을래"], 0],
      ["사과가 ___ 많이 샀어요. (싸다)", ["싸길래", "싸을래"], 0],
      ["아이가 ___ 안아 줬어요. (울다)", ["울길래", "운길래"], 0],
      ["친구가 아프다고 ___ 약을 사다 줬어요.", ["하길래", "할길래"], 0],
    ],
  }),
  point("connectors", {
    id: "neun-banmyeon", pattern: "V + 는 반면(에) · A + (으)ㄴ 반면(에)",
    title: t("“…, aksincha …” — 는 반면에", "“Whereas” — 는 반면에", "«В то время как» — 는 반면에"),
    explain: t(
      "Bir narsaning ikki qarama-qarshi tomonini yoki ikki narsani solishtiradi: 이 집은 넓은 반면에 교통이 불편해요 — bu uy keng, biroq transport noqulay. Ko'proq yozma va rasmiy nutqda, TOPIK 쓰기 da tez-tez kerak bo'ladi.",
      "Contrasts two opposite sides of one thing, or two things: 이 집은 넓은 반면에 교통이 불편해요 (this house is spacious, whereas transport is inconvenient). It is mostly written and formal, and very useful in TOPIK 쓰기.",
      "Противопоставляет две стороны одного явления или два явления: 이 집은 넓은 반면에 교통이 불편해요 — этот дом просторный, но с транспортом неудобно. Чаще в письменной и официальной речи, очень полезно в TOPIK 쓰기.",
    ),
    rules: [
      ["V + 는 반면(에) (좋아하다 → 좋아하는 반면)", "Fe'l (hozirgi)", "Verb (present)", "Глагол (настоящее)"],
      ["A + (으)ㄴ 반면(에) · N + 인 반면(에)", "Sifat / ot", "Adjective / noun", "Прилагательное / сущ."],
      ["V + (으)ㄴ 반면(에) (늘어나다 → 늘어난 반면)", "Bajarilgan ish", "Finished action", "Завершённое действие"],
    ],
    examples: [
      ["이 집은 넓은 반면에 교통이 불편해요.", "Bu uy keng, biroq transport noqulay.", "This house is spacious, whereas transport is inconvenient.", "Этот дом просторный, но с транспортом неудобно."],
      ["형은 운동을 좋아하는 반면에 동생은 책을 좋아해요.", "Akam sportni yaxshi ko'radi, ukam esa kitobni.", "My older brother likes sports, whereas my younger brother likes books.", "Старший брат любит спорт, а младший — книги."],
      ["도시는 편리한 반면 공기가 나빠요.", "Shahar qulay, biroq havosi yomon.", "The city is convenient, but the air is bad.", "В городе удобно, но воздух плохой."],
      ["수입은 늘어난 반면에 지출은 줄었어요.", "Daromad oshdi, xarajat esa kamaydi.", "Income rose, whereas spending fell.", "Доходы выросли, а расходы сократились."],
    ],
    mistakes: [
      ["넓는 반면에", "넓은 반면에", t("Sifatga (으)ㄴ 반면.", "Adjectives take (으)ㄴ 반면.", "Прилагательные — (으)ㄴ 반면.")],
    ],
    quiz: [
      ["이 방은 ___ 반면에 비싸요. (넓다)", ["넓은", "넓는"], 0],
      ["형은 운동을 ___ 반면에 동생은 싫어해요. (좋아하다)", ["좋아하는", "좋아할"], 0],
      ["도시는 편리한 ___ 공기가 나빠요.", ["반면", "반대"], 0],
      ["수입은 ___ 반면에 지출은 줄었어요. (늘어나다)", ["늘어난", "늘어날"], 0],
    ],
  }),
  point("expressions", {
    id: "eul-gyeom", pattern: "V + (으)ㄹ 겸 · N 겸 N",
    title: t("“Ham …, ham … uchun” — (으)ㄹ 겸", "“Both to … and to …” — (으)ㄹ 겸", "«И чтобы …, и чтобы …» — (으)ㄹ 겸"),
    explain: t(
      "Bitta ishni ikki maqsadda qilishni bildiradi: 운동도 할 겸 바람도 쐴 겸 공원에 갔어요 — ham sport qilay, ham havo olay deb bog'ga bordim. Ot bilan: 아침 겸 점심 — nonushta ham, tushlik ham; 거실 겸 서재 — ham mehmonxona, ham ish xonasi.",
      "Says one action serves two purposes: 운동도 할 겸 바람도 쐴 겸 공원에 갔어요 (I went to the park both to exercise and to get some air). With nouns: 아침 겸 점심 (brunch), 거실 겸 서재 (a living room that is also a study).",
      "Говорит, что одно действие служит двум целям: 운동도 할 겸 바람도 쐴 겸 공원에 갔어요 — пошёл в парк, чтобы и размяться, и подышать воздухом. С существительными: 아침 겸 점심 — поздний завтрак, 거실 겸 서재 — гостиная и кабинет одновременно.",
    ),
    rules: [
      ["V + (으)ㄹ 겸 V + (으)ㄹ 겸", "Ikki maqsad", "Two purposes", "Две цели"],
      ["V + (으)ㄹ 겸 (해서)", "…ni ham ko'zlab", "Partly to …", "Заодно чтобы …"],
      ["N 겸 N", "Ikki vazifali narsa: 아침 겸 점심", "One thing, two roles: 아침 겸 점심", "Одно в двух ролях: 아침 겸 점심"],
    ],
    examples: [
      ["운동도 할 겸 바람도 쐴 겸 공원에 갔어요.", "Ham sport qilay, ham havo olay deb bog'ga bordim.", "I went to the park both to exercise and to get some fresh air.", "Я пошёл в парк, чтобы и размяться, и подышать свежим воздухом."],
      ["한국어 연습도 할 겸 한국 친구를 만났어요.", "Koreys tilini ham mashq qilay deb koreys do'stim bilan uchrashdim.", "I met a Korean friend, partly to practise my Korean.", "Я встретился с корейским другом — заодно попрактиковать корейский."],
      ["아침 겸 점심으로 빵을 먹었어요.", "Nonushta-tushlik o'rniga non yedim.", "I had bread for brunch.", "На поздний завтрак я съел хлеб."],
      ["이 방은 거실 겸 서재예요.", "Bu xona ham mehmonxona, ham ish xonasi.", "This room is both a living room and a study.", "Эта комната — и гостиная, и кабинет."],
    ],
    mistakes: [
      ["운동할 겸에 공원에 갔어요", "운동할 겸 공원에 갔어요", t("겸 dan keyin 에 qo'shilmaydi.", "Don't add 에 after 겸.", "После 겸 не добавляется 에.")],
    ],
    quiz: [
      ["운동도 ___ 겸 공원에 갔어요. (하다)", ["할", "하는"], 0],
      ["아침 ___ 점심으로 빵을 먹었어요.", ["겸", "김에"], 0],
      ["친구도 ___ 겸 서울에 갔어요. (만나다)", ["만날", "만난"], 0],
      ["바람도 쐴 ___ 산책했어요.", ["겸", "김"], 0],
    ],
  }),
  point("connectors", {
    id: "neun-daesin", pattern: "N + 대신(에) · V + 는 대신(에)",
    title: t("“…ning o'rniga / evaziga” — 대신에", "“Instead of / in return” — 대신에", "«Вместо / зато» — 대신에"),
    explain: t(
      "1) Birining o'rniga boshqasi: 커피 대신에 차를 마셔요 — qahva o'rniga choy ichaman; 영화를 보는 대신에 책을 읽었어요. 2) Bir narsaning evaziga boshqasi: 월급이 많은 대신에 일이 힘들어요 — maosh ko'p, evaziga ish og'ir. Sifatga (으)ㄴ 대신에.",
      "1) One thing in place of another: 커피 대신에 차를 마셔요 (I drink tea instead of coffee); 영화를 보는 대신에 책을 읽었어요. 2) One thing in exchange for another: 월급이 많은 대신에 일이 힘들어요 (the pay is good, but in return the work is hard). Adjectives take (으)ㄴ 대신에.",
      "1) Одно вместо другого: 커피 대신에 차를 마셔요 — пью чай вместо кофе; 영화를 보는 대신에 책을 읽었어요. 2) Одно взамен другого: 월급이 많은 대신에 일이 힘들어요 — платят много, зато работа тяжёлая. Прилагательные — (으)ㄴ 대신에.",
    ),
    rules: [
      ["N + 대신(에)", "…ning o'rniga", "Instead of N", "Вместо N"],
      ["V + 는 대신(에)", "…ish o'rniga / evaziga", "Instead of doing / in return", "Вместо того чтобы / взамен"],
      ["A + (으)ㄴ 대신(에)", "Bir tomoni …, evaziga …", "… but in exchange …", "…, зато …"],
    ],
    examples: [
      ["커피 대신에 차를 마셔요.", "Qahva o'rniga choy ichaman.", "I drink tea instead of coffee.", "Я пью чай вместо кофе."],
      ["주말에 영화를 보는 대신에 책을 읽었어요.", "Dam olish kuni kino ko'rish o'rniga kitob o'qidim.", "At the weekend I read a book instead of watching a movie.", "В выходные вместо кино я читал книгу."],
      ["이 일은 월급이 많은 대신에 일이 힘들어요.", "Bu ishda maosh ko'p, evaziga ish og'ir.", "This job pays well, but in return the work is hard.", "На этой работе хорошо платят, зато работа тяжёлая."],
      ["제가 요리하는 대신에 설거지는 당신이 하세요.", "Men ovqat qilaman, evaziga idishni siz yuving.", "I'll cook, and in return you do the dishes.", "Я готовлю, а вы взамен помойте посуду."],
    ],
    mistakes: [
      ["커피 대신을 차를 마셔요", "커피 대신에 차를 마셔요", t("대신 yoki 대신에 deyiladi.", "Use 대신 or 대신에.", "Используйте 대신 или 대신에.")],
      ["월급이 많는 대신에", "월급이 많은 대신에", t("Sifatga (으)ㄴ 대신에.", "Adjectives take (으)ㄴ 대신에.", "Прилагательные — (으)ㄴ 대신에.")],
    ],
    quiz: [
      ["커피 ___ 차를 마셔요.", ["대신에", "대신을"], 0],
      ["영화를 ___ 대신에 책을 읽었어요. (보다)", ["보는", "볼"], 0],
      ["월급이 ___ 대신에 일이 힘들어요. (많다)", ["많은", "많는"], 0],
      ["제가 요리하는 ___ 설거지는 당신이 하세요.", ["대신에", "바람에"], 0],
    ],
  }),
  point("connectors", {
    id: "da-boni", pattern: "V + 다 보니(까)",
    title: t("“…averib, …ib qoldi” — 다 보니까", "“From doing … (I found)” — 다 보니까", "«Делая …, (оказалось)» — 다 보니까"),
    explain: t(
      "Biror ishni takror yoki uzoq qilib yurib, yangi natija yoki xulosaga kelganini bildiradi: 한국 드라마를 계속 보다 보니까 한국어를 조금 알아듣게 됐어요 — koreys seriallarini ko'raverib, koreyschani biroz tushunadigan bo'ldim. Natija odatda o'tgan zamonda, ko'pincha 게 되다 bilan. 다 보니 oldida 았/었 kelmaydi.",
      "Says that by doing something repeatedly or for a long time you reached a new result or realisation: 한국 드라마를 계속 보다 보니까 한국어를 조금 알아듣게 됐어요 (from watching Korean dramas all the time, I came to understand some Korean). The result is usually past, often with 게 되다. No 았/었 before 다 보니.",
      "Говорит, что, долго или постоянно что-то делая, вы пришли к новому результату или выводу: 한국 드라마를 계속 보다 보니까 한국어를 조금 알아듣게 됐어요 — постоянно смотря дорамы, я стал немного понимать корейский. Результат обычно в прошедшем, часто с 게 되다. Перед 다 보니 нет 았/었.",
    ),
    rules: [
      ["V + 다 보니(까)", "Takroriy ish + yangi natija", "Repeated action + new result", "Повторяемое действие + новый итог"],
      ["… 게 됐다 / 았/었다", "Natija odatda o'tgan zamonda", "The result is usually past", "Результат обычно в прошедшем"],
      ["시제 없음", "다 보니 oldida 았/었 yo'q", "No 았/었 before 다 보니", "Перед 다 보니 нет 았/었"],
    ],
    examples: [
      ["한국 드라마를 계속 보다 보니까 한국어를 조금 알아듣게 됐어요.", "Koreys seriallarini ko'raverib, koreyschani biroz tushunadigan bo'ldim.", "From watching Korean dramas all the time, I came to understand some Korean.", "Постоянно смотря корейские дорамы, я стал немного понимать корейский."],
      ["친구와 이야기하다 보니 시간이 이렇게 늦었네요.", "Do'st bilan gaplashib o'tirib, vaqt shunchalik kech bo'lib qolibdi.", "Chatting with my friend, I didn't notice how late it had got.", "Заговорились с другом — и вот уже так поздно."],
      ["자주 만나다 보니까 친해졌어요.", "Tez-tez uchrashaverib, yaqin bo'lib qoldik.", "From meeting often, we became close.", "Мы часто встречались и в итоге сблизились."],
      ["매일 운동하다 보니 건강해졌어요.", "Har kuni sport qilaverib, sog'lom bo'lib qoldim.", "From working out every day, I've become healthier.", "Занимаясь спортом каждый день, я стал здоровее."],
    ],
    mistakes: [
      ["드라마를 봤다 보니까", "드라마를 보다 보니까", t("다 보니 oldida 았/었 kelmaydi.", "No 았/었 before 다 보니.", "Перед 다 보니 нет 았/었.")],
    ],
    quiz: [
      ["드라마를 계속 ___ 한국어를 알아듣게 됐어요. (보다)", ["보다 보니까", "봤다 보니까"], 0],
      ["자주 ___ 친해졌어요. (만나다)", ["만나다 보니까", "만나다 보면"], 0],
      ["이야기하다 ___ 시간이 늦었어요.", ["보니", "보면"], 0],
      ["매일 운동하다 보니 ___.", ["건강해졌어요", "건강해지세요"], 0],
    ],
  }),
  point("connectors", {
    id: "da-bomyeon", pattern: "V + 다 보면",
    title: t("“…aversangiz, …” — 다 보면", "“If you keep doing …” — 다 보면", "«Если продолжать …» — 다 보면"),
    explain: t(
      "Biror ishni davom ettiraversangiz, kelajakda qanday natija bo'lishini aytadi: 매일 연습하다 보면 잘하게 될 거예요 — har kuni mashq qilaversangiz, yaxshi bo'lib ketasiz. Ikkinchi qism kelajak yoki umumiy haqiqat: (으)ㄹ 거예요, 게 되다, (으)ㄹ 수 있다. O'tgan natija uchun 다 보니까.",
      "Says what will happen if you keep doing something: 매일 연습하다 보면 잘하게 될 거예요 (if you keep practising every day, you'll get good). The second clause is future or a general truth: (으)ㄹ 거예요, 게 되다, (으)ㄹ 수 있다. For a past result use 다 보니까.",
      "Говорит, что произойдёт, если продолжать что-то делать: 매일 연습하다 보면 잘하게 될 거예요 — если заниматься каждый день, всё получится. Во второй части — будущее или общая истина: (으)ㄹ 거예요, 게 되다, (으)ㄹ 수 있다. Для прошлого результата — 다 보니까.",
    ),
    rules: [
      ["V + 다 보면", "…averib tursangiz", "If you keep doing", "Если продолжать"],
      ["… (으)ㄹ 거예요 / 게 되다", "Natija kelajakda", "The result is in the future", "Результат в будущем"],
      ["과거 결과 → 다 보니까", "O'tgan natija uchun 다 보니까", "For a past result: 다 보니까", "Для прошлого результата — 다 보니까"],
    ],
    examples: [
      ["매일 연습하다 보면 잘하게 될 거예요.", "Har kuni mashq qilaversangiz, yaxshi bo'lib ketasiz.", "If you keep practising every day, you'll get good at it.", "Если заниматься каждый день, всё получится."],
      ["한국에서 살다 보면 김치를 좋아하게 될 거예요.", "Koreyada yashayversangiz, kimchini yaxshi ko'rib qolasiz.", "If you live in Korea for a while, you'll come to like kimchi.", "Поживёте в Корее — полюбите кимчи."],
      ["열심히 살다 보면 좋은 날이 올 거예요.", "Tirishib yashayversangiz, yaxshi kunlar keladi.", "If you keep working hard at life, good days will come.", "Если упорно трудиться, придут и хорошие дни."],
      ["계속 이야기하다 보면 서로 이해할 수 있을 거예요.", "Gaplashaversangiz, bir-biringizni tushunasiz.", "If you keep talking, you'll be able to understand each other.", "Если продолжать разговаривать, вы сможете понять друг друга."],
    ],
    mistakes: [
      ["매일 연습하다 보면 잘하게 됐어요", "매일 연습하다 보니까 잘하게 됐어요", t("O'tgan natija uchun 다 보니까.", "For a past result use 다 보니까.", "Для прошлого результата — 다 보니까.")],
    ],
    quiz: [
      ["매일 ___ 잘하게 될 거예요. (연습하다)", ["연습하다 보면", "연습하다 보니까"], 0],
      ["한국에서 살다 ___ 익숙해질 거예요.", ["보면", "보니까"], 0],
      ["열심히 하다 보면 ___.", ["좋은 결과가 있을 거예요", "좋은 결과가 있었어요"], 0],
      ["계속 ___ 보면 이해할 수 있을 거예요. (듣다)", ["듣다", "들었다"], 0],
    ],
  }),
  point("endings", {
    id: "handache", pattern: "V + ㄴ/는다 · A + 다 · N + (이)다 (한다체)",
    title: t("Yozma uslub — 한다체", "Written plain style — 한다체", "Письменный стиль — 한다체"),
    explain: t(
      "Gazeta, kundalik, insho va kitoblarning uslubi. TOPIK 쓰기 javoblari (ayniqsa 53–54-savollar) shu uslubda yoziladi. Fe'lga ㄴ/는다 (간다, 먹는다), sifatga 다 (좋다), otga (이)다 (학생이다). O'tgan zamon 았/었다, kelajak (으)ㄹ 것이다.",
      "The style of newspapers, diaries, essays and books. TOPIK writing answers (especially questions 53–54) are written in it. Verbs take ㄴ/는다 (간다, 먹는다), adjectives 다 (좋다), nouns (이)다 (학생이다). Past is 았/었다, future (으)ㄹ 것이다.",
      "Стиль газет, дневников, сочинений и книг. Ответы TOPIK 쓰기 (особенно задания 53–54) пишутся именно так. Глаголы — ㄴ/는다 (간다, 먹는다), прилагательные — 다 (좋다), существительные — (이)다 (학생이다). Прошедшее — 았/었다, будущее — (으)ㄹ 것이다.",
    ),
    rules: [
      ["V + ㄴ다 / 는다 (가다 → 간다, 먹다 → 먹는다)", "Fe'l: unli → ㄴ다, undosh → 는다", "Verb: vowel → ㄴ다, consonant → 는다", "Глагол: гласная → ㄴ다, согласная → 는다"],
      ["A + 다 · N + (이)다", "Sifat va ot o'zgarmaydi: 좋다, 학생이다", "Adjectives and nouns stay as they are: 좋다, 학생이다", "Прилагательные и сущ. не меняются: 좋다, 학생이다"],
      ["V/A + 았/었다 · (으)ㄹ 것이다", "O'tgan · kelajak", "Past · future", "Прошедшее · будущее"],
    ],
    examples: [
      ["나는 매일 아침 일곱 시에 일어난다.", "Men har kuni ertalab soat yettida turaman.", "I get up at seven every morning.", "Я встаю каждое утро в семь часов."],
      ["요즘 혼자 사는 사람이 늘고 있다.", "Hozir yolg'iz yashaydigan odamlar ko'paymoqda.", "The number of people living alone is growing these days.", "В последнее время растёт число людей, живущих в одиночку."],
      ["어제는 하루 종일 비가 왔다.", "Kecha kun bo'yi yomg'ir yog'di.", "It rained all day yesterday.", "Вчера весь день шёл дождь."],
      ["건강을 위해서는 규칙적인 운동이 필요하다.", "Sog'liq uchun muntazam sport zarur.", "Regular exercise is necessary for good health.", "Для здоровья необходимы регулярные физические нагрузки."],
    ],
    mistakes: [
      ["나는 밥을 먹다.", "나는 밥을 먹는다.", t("Hozirgi zamon fe'liga 는다; 먹다 — lug'at shakli.", "Present-tense verbs take 는다; 먹다 is the dictionary form.", "Глагол в настоящем — 는다; 먹다 — словарная форма.")],
      ["날씨가 좋는다.", "날씨가 좋다.", t("Sifatga ㄴ/는다 qo'shilmaydi.", "Adjectives don't take ㄴ/는다.", "К прилагательным ㄴ/는다 не добавляется.")],
      ["그는 서울에 살는다.", "그는 서울에 산다.", t("ㄹ tushadi: 살다 → 산다.", "ㄹ drops: 살다 → 산다.", "ㄹ выпадает: 살다 → 산다.")],
    ],
    quiz: [
      ["나는 매일 신문을 ___. (읽다)", ["읽는다", "읽다"], 0],
      ["요즘 날씨가 ___. (춥다)", ["춥다", "춥는다"], 0],
      ["그는 서울에 ___. (살다)", ["산다", "살는다"], 0],
      ["어제 친구를 ___. (만나다)", ["만났다", "만났는다"], 0],
    ],
  }),
  point("expressions", {
    id: "pidong", pattern: "V + 이/히/리/기 (피동)",
    title: t("Majhul nisbat — 이/히/리/기", "The passive — 이/히/리/기", "Страдательный залог — 이/히/리/기"),
    explain: t(
      "Ega harakatni bajarmaydi, balki unga duch keladi: 바람 때문에 문이 열렸어요 — shamol tufayli eshik ochildi. Fe'lga 이, 히, 리 yoki 기 qo'shiladi; qaysi biri — fe'lga bog'liq, yodlash kerak. Bajaruvchi 에게/한테 bilan. 하다 fe'llarida 되다: 사용하다 → 사용되다.",
      "The subject doesn't perform the action but undergoes it: 바람 때문에 문이 열렸어요 (the door opened because of the wind). The verb takes 이, 히, 리 or 기; which one depends on the verb and has to be learned. The doer takes 에게/한테. 하다 verbs use 되다: 사용하다 → 사용되다.",
      "Подлежащее не совершает действие, а испытывает его: 바람 때문에 문이 열렸어요 — из-за ветра дверь открылась. К глаголу добавляется 이, 히, 리 или 기; какой именно — зависит от глагола, это нужно запомнить. Деятель — с 에게/한테. У глаголов на 하다 — 되다: 사용하다 → 사용되다.",
    ),
    rules: [
      ["이: 보다 → 보이다, 쓰다 → 쓰이다, 놓다 → 놓이다", "-이- qo'shimchasi", "The -이- suffix", "Суффикс -이-"],
      ["히: 닫다 → 닫히다, 막다 → 막히다, 잡다 → 잡히다", "-히- qo'shimchasi", "The -히- suffix", "Суффикс -히-"],
      ["리: 열다 → 열리다, 팔다 → 팔리다, 듣다 → 들리다", "-리- qo'shimchasi", "The -리- suffix", "Суффикс -리-"],
      ["기: 끊다 → 끊기다, 안다 → 안기다, 쫓다 → 쫓기다", "-기- qo'shimchasi", "The -기- suffix", "Суффикс -기-"],
      ["하다 → 되다 (사용하다 → 사용되다)", "하다 fe'llari", "하다 verbs", "Глаголы на 하다"],
    ],
    examples: [
      ["바람 때문에 문이 열렸어요.", "Shamol tufayli eshik ochilib ketdi.", "The door opened because of the wind.", "Из-за ветра дверь открылась."],
      ["여기에서 바다가 보여요.", "Bu yerdan dengiz ko'rinadi.", "You can see the sea from here.", "Отсюда видно море."],
      ["출근 시간에는 길이 많이 막혀요.", "Ishga boriladigan paytda yo'l qattiq tiqiladi.", "The roads get very jammed during the morning rush.", "В час пик на дорогах сильные пробки."],
      ["도둑이 경찰에게 잡혔어요.", "O'g'ri politsiya tomonidan qo'lga olindi.", "The thief was caught by the police.", "Вора поймала полиция."],
    ],
    mistakes: [
      ["바람 때문에 문이 열었어요", "바람 때문에 문이 열렸어요", t("Ega harakatga duch kelsa, majhul shakl: 열리다.", "When the subject undergoes the action, use the passive: 열리다.", "Если подлежащее испытывает действие — пассив: 열리다.")],
      ["도둑이 경찰을 잡혔어요", "도둑이 경찰에게 잡혔어요", t("Bajaruvchi 에게/한테 bilan.", "The doer takes 에게/한테.", "Деятель — с 에게/한테.")],
    ],
    quiz: [
      ["바람 때문에 문이 ___. (열다)", ["열렸어요", "열었어요"], 0],
      ["여기에서 산이 잘 ___. (보다)", ["보여요", "봐요"], 0],
      ["출근 시간에는 길이 ___. (막다)", ["막혀요", "막아요"], 0],
      ["도둑이 경찰___ 잡혔어요.", ["에게", "을"], 0],
    ],
  }),
  point("expressions", {
    id: "sadong", pattern: "V/A + 이/히/리/기/우/추 (사동)",
    title: t("Orttirma nisbat — 이/히/리/기/우", "The causative — 이/히/리/기/우", "Понудительный залог — 이/히/리/기/우"),
    explain: t(
      "Ega boshqa kishiga biror ishni qildiradi yoki holatni o'zgartiradi: 엄마가 아이에게 밥을 먹여요 — onasi bolaga ovqat yediryapti. Fe'lga 이, 히, 리, 기, 우 yoki 추 qo'shiladi; har bir fe'lning shaklini yodlash kerak. Har qanday fe'l bilan ishlaydigan umumiy shakl — 게 하다.",
      "The subject makes someone do something or changes a state: 엄마가 아이에게 밥을 먹여요 (the mother is feeding the child). The verb takes 이, 히, 리, 기, 우 or 추, and each verb's form has to be learned. The general form that works with any verb is 게 하다.",
      "Подлежащее заставляет кого-то что-то сделать или меняет состояние: 엄마가 아이에게 밥을 먹여요 — мама кормит ребёнка. К глаголу добавляется 이, 히, 리, 기, 우 или 추; форму каждого глагола нужно запомнить. Общая форма для любого глагола — 게 하다.",
    ),
    rules: [
      ["이: 먹다 → 먹이다, 보다 → 보이다, 죽다 → 죽이다", "-이- qo'shimchasi", "The -이- suffix", "Суффикс -이-"],
      ["히: 입다 → 입히다, 앉다 → 앉히다, 읽다 → 읽히다", "-히- qo'shimchasi", "The -히- suffix", "Суффикс -히-"],
      ["리: 울다 → 울리다, 알다 → 알리다, 살다 → 살리다", "-리- qo'shimchasi", "The -리- suffix", "Суффикс -리-"],
      ["기: 웃다 → 웃기다, 신다 → 신기다, 맡다 → 맡기다", "-기- qo'shimchasi", "The -기- suffix", "Суффикс -기-"],
      ["우·추: 자다 → 재우다, 타다 → 태우다, 늦다 → 늦추다", "-우-, -추- qo'shimchalari", "The -우-, -추- suffixes", "Суффиксы -우-, -추-"],
    ],
    examples: [
      ["엄마가 아이에게 밥을 먹여요.", "Onasi bolaga ovqat yediryapti.", "The mother is feeding the child.", "Мама кормит ребёнка."],
      ["아이를 재우고 나서 영화를 봤어요.", "Bolani uxlatib bo'lib, kino ko'rdim.", "After putting the child to sleep, I watched a movie.", "Уложив ребёнка спать, я посмотрел фильм."],
      ["친구에게 사진을 보여 줬어요.", "Do'stimga rasmni ko'rsatdim.", "I showed my friend the photo.", "Я показал другу фотографию."],
      ["그 코미디언은 사람들을 정말 웃겨요.", "O'sha komik odamlarni rosa kuldiradi.", "That comedian really makes people laugh.", "Этот комик очень смешит людей."],
    ],
    mistakes: [
      ["엄마가 아이에게 밥을 먹어요", "엄마가 아이에게 밥을 먹여요", t("Boshqaga ovqat yedirish — 먹이다.", "Making someone eat is 먹이다.", "Кормить кого-то — 먹이다.")],
      ["아이를 자고 영화를 봤어요", "아이를 재우고 영화를 봤어요", t("Uxlatmoq — 재우다.", "To put to sleep is 재우다.", "Укладывать спать — 재우다.")],
    ],
    quiz: [
      ["엄마가 아기에게 우유를 ___. (먹다)", ["먹여요", "먹어요"], 0],
      ["아이를 ___ 나서 쉬었어요. (자다)", ["재우고", "자고"], 0],
      ["아이에게 옷을 ___. (입다)", ["입혔어요", "입었어요"], 0],
      ["그 코미디언은 사람들을 정말 ___. (웃다)", ["웃겨요", "웃어요"], 0],
    ],
  }),
  point("expressions", {
    id: "ge-hada", pattern: "V + 게 하다",
    title: t("“…tirmoq, …ga majbur qilmoq” — 게 하다", "“Make / let someone do” — 게 하다", "«Заставить / позволить» — 게 하다"),
    explain: t(
      "Boshqa kishiga biror ishni qildirish yoki ruxsat berishni bildiradi: 선생님이 학생들에게 책을 읽게 했어요 — o'qituvchi o'quvchilarga kitob o'qitdi. Har qanday fe'l bilan ishlaydi. 게 oldida zamon kelmaydi, zamon 하다 ga qo'shiladi. Taqiqlash: 못 V게 하다.",
      "Means making or letting someone do something: 선생님이 학생들에게 책을 읽게 했어요 (the teacher had the students read the book). It works with any verb. No tense before 게; tense goes on 하다. To forbid: 못 V게 하다.",
      "Значит заставить или позволить кому-то что-то сделать: 선생님이 학생들에게 책을 읽게 했어요 — учитель велел ученикам прочитать книгу. Работает с любым глаголом. Перед 게 нет времени, время ставится на 하다. Запрет: 못 V게 하다.",
    ),
    rules: [
      ["V + 게 하다 (읽다 → 읽게 하다)", "Qildirmoq / ruxsat bermoq", "Make / let someone do", "Заставлять / позволять"],
      ["N에게/한테 · N을/를 + V게 하다", "Bajaruvchi 에게/한테 yoki 을/를 bilan", "The doer takes 에게/한테 or 을/를", "Исполнитель — с 에게/한테 или 을/를"],
      ["못 V게 하다", "Taqiqlamoq", "Not let someone do", "Не позволять"],
    ],
    examples: [
      ["선생님이 학생들에게 책을 읽게 했어요.", "O'qituvchi o'quvchilarga kitob o'qitdi.", "The teacher had the students read the book.", "Учитель велел ученикам прочитать книгу."],
      ["엄마가 동생을 일찍 자게 했어요.", "Onam ukamni erta yotishga majbur qildi.", "Mom made my younger brother go to bed early.", "Мама заставила младшего брата лечь пораньше."],
      ["의사가 저에게 술을 못 마시게 했어요.", "Shifokor menga ichkilik ichishni taqiqladi.", "The doctor didn't let me drink alcohol.", "Врач запретил мне пить алкоголь."],
      ["그 소식이 저를 기쁘게 했어요.", "O'sha xabar meni xursand qildi.", "That news made me happy.", "Эта новость меня обрадовала."],
    ],
    mistakes: [
      ["학생들에게 책을 읽었게 했어요", "학생들에게 책을 읽게 했어요", t("게 oldida zamon yo'q; zamon 하다 da.", "No tense before 게; put it on 하다.", "Перед 게 нет времени — оно на 하다.")],
    ],
    quiz: [
      ["선생님이 학생들에게 책을 ___ 했어요. (읽다)", ["읽게", "읽었게"], 0],
      ["엄마가 동생을 일찍 ___ 했어요. (자다)", ["자게", "잤게"], 0],
      ["의사가 술을 못 ___ 했어요. (마시다)", ["마시게", "마셔게"], 0],
      ["그 소식이 저를 ___ 했어요. (기쁘다)", ["기쁘게", "기뻐게"], 0],
    ],
  }),
  point("connectors", {
    id: "aeoya", pattern: "V/A + 아/어야",
    title: t("“…sagina” — 아/어야", "“Only if” — 아/어야", "«Только если» — 아/어야"),
    explain: t(
      "Keyingi natija uchun zarur shartni bildiradi: 열심히 공부해야 합격할 수 있어요 — tirishib o'qisangizgina imtihondan o'tasiz. Ko'pincha (으)ㄹ 수 있다 yoki 되다 bilan tugaydi. 아/어야 하다 (“kerak”) bilan adashtirmang.",
      "Gives the condition that must be met for what follows: 열심히 공부해야 합격할 수 있어요 (only if you study hard can you pass). It often ends with (으)ㄹ 수 있다 or 되다. Don't confuse it with 아/어야 하다 (“must”).",
      "Указывает необходимое условие для последующего: 열심히 공부해야 합격할 수 있어요 — только если усердно заниматься, можно сдать экзамен. Часто заканчивается на (으)ㄹ 수 있다 или 되다. Не путайте с 아/어야 하다 («нужно»).",
    ),
    rules: [
      ["V/A + 아/어야 (하다 → 해야, 먹다 → 먹어야)", "Zarur shart", "Necessary condition", "Необходимое условие"],
      ["아/어야 + (으)ㄹ 수 있다 / 되다", "Ko'pincha shunday tugaydi", "Often ends like this", "Часто заканчивается так"],
      ["N + 이어야 / 여야", "Ot: 성인이어야, 학생이어야", "Noun: 성인이어야, 학생이어야", "Сущ.: 성인이어야, 학생이어야"],
    ],
    examples: [
      ["열심히 공부해야 시험에 합격할 수 있어요.", "Tirishib o'qisangizgina imtihondan o'ta olasiz.", "Only if you study hard can you pass the exam.", "Только если усердно заниматься, можно сдать экзамен."],
      ["표가 있어야 들어갈 수 있어요.", "Chiptangiz bo'lsagina kira olasiz.", "You can only get in if you have a ticket.", "Войти можно только с билетом."],
      ["밥을 먹어야 힘이 나요.", "Ovqat yesamgina kuchga kiraman.", "I only get my energy back once I've eaten.", "Силы появляются, только когда поешь."],
      ["성인이어야 이 영화를 볼 수 있어요.", "Bu kinoni faqat voyaga yetganlar ko'ra oladi.", "Only adults can watch this film.", "Этот фильм могут смотреть только взрослые."],
    ],
    mistakes: [
      ["공부하야 합격할 수 있어요", "공부해야 합격할 수 있어요", t("하다 → 해야.", "하다 → 해야.", "하다 → 해야.")],
    ],
    quiz: [
      ["열심히 ___ 합격할 수 있어요. (공부하다)", ["공부해야", "공부하야"], 0],
      ["표가 ___ 들어갈 수 있어요. (있다)", ["있어야", "있아야"], 0],
      ["밥을 ___ 힘이 나요. (먹다)", ["먹어야", "먹아야"], 0],
      ["성인___ 볼 수 있어요.", ["이어야", "여야"], 0],
    ],
  }),
  point("connectors", {
    id: "go-boni", pattern: "V + 고 보니(까)",
    title: t("“…ib bilsam, …ekan” — 고 보니까", "“Having done …, I found” — 고 보니까", "«Сделав …, обнаружил» — 고 보니까"),
    explain: t(
      "Bir ishni qilib bo'lgach, oldin bilmagan narsani anglaganini bildiradi: 이야기를 듣고 보니 제가 오해했네요 — gapni eshitib bilsam, noto'g'ri tushungan ekanman. 다 보니 dan farqi: 다 보니 — takroriy ish, 고 보니 — bir marta tugagan ish. 고 보니 oldida 았/었 kelmaydi.",
      "Says that after finishing an action you realised something you hadn't known: 이야기를 듣고 보니 제가 오해했네요 (now that I've heard the story, I see I misunderstood). Unlike 다 보니 (a repeated action), 고 보니 follows one completed action. No 았/었 before 고 보니.",
      "Говорит, что, закончив действие, вы поняли то, чего раньше не знали: 이야기를 듣고 보니 제가 오해했네요 — выслушав, я понял, что ошибся. В отличие от 다 보니 (повторяющееся действие), 고 보니 — после однократного завершённого действия. Перед 고 보니 нет 았/었.",
    ),
    rules: [
      ["V + 고 보니(까)", "Ishni qilib bo'lgach, angladim", "After doing it, I realised", "Сделав, я понял"],
      ["다 보니 ≠ 고 보니", "다 보니 — takror; 고 보니 — bir marta, tugagach", "다 보니: repeated; 고 보니: once, after finishing", "다 보니 — повторение; 고 보니 — однократно, после"],
      ["시제 없음", "고 보니 oldida 았/었 yo'q", "No 았/었 before 고 보니", "Перед 고 보니 нет 았/었"],
    ],
    examples: [
      ["이야기를 듣고 보니 제가 오해했네요.", "Gapni eshitib bilsam, men noto'g'ri tushungan ekanman.", "Now that I've heard the story, I see I misunderstood.", "Выслушав, я понял, что всё неправильно понял."],
      ["집에 오고 보니 지갑이 없었어요.", "Uyga kelib qarasam, hamyonim yo'q ekan.", "When I got home, I found my wallet was gone.", "Придя домой, я обнаружил, что кошелька нет."],
      ["결혼하고 보니 부모님 마음을 알겠어요.", "Oila qurgach, ota-onamning holini tushunyapman.", "Now that I'm married, I understand how my parents felt.", "Теперь, когда я женат, я понимаю родителей."],
      ["다 마시고 보니 유통기한이 지난 우유였어요.", "Hammasini ichib bo'lsam, muddati o'tgan sut ekan.", "After drinking it all, I found the milk was past its expiry date.", "Выпив всё, я заметил, что молоко было просрочено."],
    ],
    mistakes: [
      ["이야기를 들었고 보니", "이야기를 듣고 보니", t("고 보니 oldida 았/었 kelmaydi.", "No 았/었 before 고 보니.", "Перед 고 보니 нет 았/었.")],
    ],
    quiz: [
      ["이야기를 ___ 제가 오해했네요. (듣다)", ["듣고 보니", "들었고 보니"], 0],
      ["집에 오고 ___ 지갑이 없었어요.", ["보니", "보면"], 0],
      ["다 ___ 보니 유통기한이 지난 우유였어요. (마시다)", ["마시고", "마셨고"], 0],
      ["결혼___ 보니 부모님 마음을 알겠어요.", ["하고", "했고"], 0],
    ],
  }),
  point("connectors", {
    id: "neundedo", pattern: "V + 는데도 · A + (으)ㄴ데도 · N + 인데도",
    title: t("“…ga qaramay” — 는데도", "“Even though” — 는데도", "«Несмотря на то что» — 는데도"),
    explain: t(
      "Biror holat bo'lsa ham kutilgan natija chiqmaganini bildiradi: 약을 먹었는데도 감기가 낫지 않아요 — dori ichganimga qaramay, shamollash o'tmayapti. 지만 dan kuchliroq ajablanish bor. Fe'lga 는데도, sifatga (으)ㄴ데도, otga 인데도, o'tgan zamonga 았/었는데도.",
      "Says the expected result didn't happen despite a situation: 약을 먹었는데도 감기가 낫지 않아요 (even though I took medicine, my cold isn't getting better). It carries more surprise than 지만. Verbs take 는데도, adjectives (으)ㄴ데도, nouns 인데도, the past 았/었는데도.",
      "Говорит, что ожидаемого результата не последовало, несмотря на обстоятельство: 약을 먹었는데도 감기가 낫지 않아요 — хоть я и принял лекарство, простуда не проходит. Удивления больше, чем у 지만. Глаголы — 는데도, прилагательные — (으)ㄴ데도, существительные — 인데도, прошедшее — 았/었는데도.",
    ),
    rules: [
      ["V + 는데도 · A + (으)ㄴ데도", "…ga qaramay", "Even though", "Несмотря на то что"],
      ["V/A + 았/었는데도", "O'tgan zamon", "Past", "Прошедшее"],
      ["N + 인데도", "Ot: 주말인데도", "Noun: 주말인데도", "Сущ.: 주말인데도"],
    ],
    examples: [
      ["약을 먹었는데도 감기가 낫지 않아요.", "Dori ichganimga qaramay, shamollash o'tmayapti.", "Even though I took medicine, my cold isn't getting better.", "Хоть я и принял лекарство, простуда не проходит."],
      ["열심히 공부하는데도 성적이 안 올라요.", "Tirishib o'qiyotganimga qaramay, baholarim oshmayapti.", "Even though I study hard, my grades don't go up.", "Хотя я усердно учусь, оценки не растут."],
      ["주말인데도 회사에 가야 해요.", "Dam olish kuni bo'lishiga qaramay, ishga borishim kerak.", "Even though it's the weekend, I have to go to work.", "Хоть и выходной, мне надо идти на работу."],
      ["날씨가 추운데도 반팔을 입었어요.", "Havo sovuq bo'lishiga qaramay, kalta yengli kiyim kiydim.", "Even though it was cold, I wore short sleeves.", "Несмотря на холод, я надел футболку."],
    ],
    mistakes: [
      ["날씨가 춥는데도", "날씨가 추운데도", t("Sifatga (으)ㄴ데도; 춥다 → 추운데도.", "Adjectives take (으)ㄴ데도; 춥다 → 추운데도.", "Прилагательные — (으)ㄴ데도; 춥다 → 추운데도.")],
      ["주말는데도", "주말인데도", t("Otga 인데도.", "Nouns take 인데도.", "Существительные — 인데도.")],
    ],
    quiz: [
      ["약을 ___ 감기가 낫지 않아요. (먹다)", ["먹었는데도", "먹었은데도"], 0],
      ["날씨가 ___ 반팔을 입었어요. (춥다)", ["추운데도", "춥는데도"], 0],
      ["주말___ 회사에 가야 해요.", ["인데도", "는데도"], 0],
      ["열심히 ___ 성적이 안 올라요. (공부하다)", ["공부하는데도", "공부한데도"], 0],
    ],
  }),
  point("expressions", {
    id: "eulji-do-moreuda", pattern: "V/A + (으)ㄹ지도 모르다",
    title: t("“…ishi ham mumkin” — (으)ㄹ지도 모르다", "“Might” — (으)ㄹ지도 모르다", "«Может быть, …» — (으)ㄹ지도 모르다"),
    explain: t(
      "Biror narsa bo'lishi ehtimoli borligini aytadi: 내일 비가 올지도 몰라요 — ertaga yomg'ir yog'ishi ham mumkin. (으)ㄹ 거예요 dan kamroq ishonch bor. O'tgan ish uchun 았/었을지도, otga 일지도.",
      "Says something is possible: 내일 비가 올지도 몰라요 (it might rain tomorrow). It sounds less certain than (으)ㄹ 거예요. For the past use 았/었을지도, for nouns 일지도.",
      "Говорит о возможности: 내일 비가 올지도 몰라요 — завтра может пойти дождь. Уверенности меньше, чем в (으)ㄹ 거예요. Для прошлого — 았/었을지도, для существительных — 일지도.",
    ),
    rules: [
      ["V/A + (으)ㄹ지도 모르다 (오다 → 올지도)", "Ehtimol", "Possibility", "Возможность"],
      ["V/A + 았/었을지도 모르다", "O'tgan ishning ehtimoli", "Possibility about the past", "Возможность в прошлом"],
      ["N + 일지도 모르다", "Ot: 범인일지도", "Noun: 범인일지도", "Сущ.: 범인일지도"],
    ],
    examples: [
      ["내일 비가 올지도 몰라요.", "Ertaga yomg'ir yog'ishi ham mumkin.", "It might rain tomorrow.", "Завтра может пойти дождь."],
      ["길이 막힐지도 모르니까 일찍 출발하세요.", "Yo'l tiqilib qolishi mumkin, erta yo'lga chiqing.", "The roads might be jammed, so leave early.", "Могут быть пробки, так что выезжайте пораньше."],
      ["민수 씨는 벌써 집에 갔을지도 몰라요.", "Minsu allaqachon uyiga ketgan bo'lishi mumkin.", "Minsu may have already gone home.", "Минсу, возможно, уже ушёл домой."],
      ["그 사람이 범인일지도 몰라요.", "O'sha odam jinoyatchi bo'lishi mumkin.", "That person might be the culprit.", "Возможно, он и есть преступник."],
    ],
    mistakes: [
      ["내일 비가 올지도 알아요", "내일 비가 올지도 몰라요", t("Doim 모르다 bilan.", "Always with 모르다.", "Всегда с 모르다.")],
    ],
    quiz: [
      ["내일 비가 ___ 몰라요. (오다)", ["올지도", "오을지도"], 0],
      ["벌써 집에 ___ 몰라요. (가다)", ["갔을지도", "갔지도"], 0],
      ["그 사람이 범인___ 몰라요.", ["일지도", "을지도"], 0],
      ["길이 막힐지도 ___ 일찍 출발하세요.", ["모르니까", "아니까"], 0],
    ],
  }),
  point("expressions", {
    id: "neunji", pattern: "V + 는지 · A + (으)ㄴ지 · N + 인지",
    title: t("Ichki savol — 는지", "Embedded questions — 는지", "Косвенный вопрос — 는지"),
    explain: t(
      "Savolni gap ichiga joylaydi, keyin 알다, 모르다, 궁금하다, 물어보다 keladi: 민수 씨가 어디에 사는지 알아요? — Minsu qayerda yashashini bilasizmi? Fe'lga 는지, sifatga (으)ㄴ지, otga 인지, o'tgan zamonga 았/었는지, kelajakka (으)ㄹ지.",
      "Puts a question inside a sentence, followed by 알다, 모르다, 궁금하다 or 물어보다: 민수 씨가 어디에 사는지 알아요? (do you know where Minsu lives?). Verbs take 는지, adjectives (으)ㄴ지, nouns 인지, the past 았/었는지, the future (으)ㄹ지.",
      "Встраивает вопрос в предложение, после чего идут 알다, 모르다, 궁금하다, 물어보다: 민수 씨가 어디에 사는지 알아요? — Вы знаете, где живёт Минсу? Глаголы — 는지, прилагательные — (으)ㄴ지, существительные — 인지, прошедшее — 았/었는지, будущее — (으)ㄹ지.",
    ),
    rules: [
      ["V + 는지 (살다 → 사는지)", "Fe'l (ㄹ tushadi)", "Verb (ㄹ drops)", "Глагол (ㄹ выпадает)"],
      ["A + (으)ㄴ지 · N + 인지", "Sifat / ot", "Adjective / noun", "Прилагательное / сущ."],
      ["V/A + 았/었는지 · (으)ㄹ지", "O'tgan · kelajak", "Past · future", "Прошедшее · будущее"],
    ],
    examples: [
      ["민수 씨가 어디에 사는지 알아요?", "Minsu qayerda yashashini bilasizmi?", "Do you know where Minsu lives?", "Вы знаете, где живёт Минсу?"],
      ["이 음식이 얼마나 매운지 모르겠어요.", "Bu ovqat qanchalik achchiq ekanini bilmayman.", "I don't know how spicy this food is.", "Не знаю, насколько острое это блюдо."],
      ["그 사람이 누구인지 궁금해요.", "U kim ekani qiziq.", "I wonder who that person is.", "Интересно, кто этот человек."],
      ["회의가 몇 시에 끝났는지 물어봤어요.", "Yig'ilish soat nechada tugaganini so'radim.", "I asked what time the meeting ended.", "Я спросил, во сколько закончилось совещание."],
    ],
    mistakes: [
      ["어디에 살는지 알아요?", "어디에 사는지 알아요?", t("ㄹ tushadi: 사는지.", "ㄹ drops: 사는지.", "ㄹ выпадает: 사는지.")],
      ["얼마나 맵는지 몰라요", "얼마나 매운지 몰라요", t("Sifatga (으)ㄴ지; 맵다 → 매운지.", "Adjectives take (으)ㄴ지; 맵다 → 매운지.", "Прилагательные — (으)ㄴ지; 맵다 → 매운지.")],
    ],
    quiz: [
      ["민수 씨가 어디에 ___ 알아요? (살다)", ["사는지", "살는지"], 0],
      ["이 음식이 얼마나 ___ 모르겠어요. (맵다)", ["매운지", "맵는지"], 0],
      ["그 사람이 누구___ 궁금해요.", ["인지", "는지"], 0],
      ["회의가 몇 시에 ___ 물어봤어요. (끝나다)", ["끝났는지", "끝났은지"], 0],
    ],
  }),
  point("endings", {
    id: "eosseoya-haenneunde", pattern: "V + 았/었어야 했는데",
    title: t("“…ishim kerak edi” — 았/었어야 했는데", "“I should have” — 았/었어야 했는데", "«Надо было» — 았/었어야 했는데"),
    explain: t(
      "Qilinishi kerak bo'lgan, lekin qilinmagan ish uchun afsus: 미리 예약했어야 했는데 — oldindan bron qilishim kerak edi. Qilmaslik kerak bo'lgan ish uchun 지 말았어야 했는데. (으)ㄹ 걸 그랬다 dan kuchliroq, jiddiyroq afsus.",
      "Regret about something that should have been done but wasn't: 미리 예약했어야 했는데 (I should have booked in advance). For something you shouldn't have done, use 지 말았어야 했는데. It expresses stronger, more serious regret than (으)ㄹ 걸 그랬다.",
      "Сожаление о том, что следовало сделать, но не было сделано: 미리 예약했어야 했는데 — надо было забронировать заранее. О том, чего не следовало делать, — 지 말았어야 했는데. Сожаление сильнее и серьёзнее, чем в (으)ㄹ 걸 그랬다.",
    ),
    rules: [
      ["V + 았/었어야 했는데", "Qilishim kerak edi (afsus)", "Should have (regret)", "Надо было (сожаление)"],
      ["V + 지 말았어야 했는데", "Qilmasligim kerak edi", "Shouldn't have", "Не надо было"],
      ["(으)ㄹ 걸 그랬다 < 았/었어야 했는데", "Bu shakl kuchliroq", "This form is stronger", "Эта форма сильнее"],
    ],
    examples: [
      ["미리 예약했어야 했는데 자리가 없네요.", "Oldindan bron qilishim kerak edi, joy qolmabdi.", "I should have booked in advance; there are no seats.", "Надо было забронировать заранее — мест нет."],
      ["더 일찍 출발했어야 했는데.", "Ertaroq yo'lga chiqishim kerak edi.", "I should have left earlier.", "Надо было выехать раньше."],
      ["그 말을 하지 말았어야 했는데 후회돼요.", "U gapni aytmasligim kerak edi, afsusdaman.", "I shouldn't have said that; I regret it.", "Не надо было этого говорить, жалею."],
      ["시험 전에 복습했어야 했는데 못 했어요.", "Imtihondan oldin takrorlashim kerak edi, lekin qila olmadim.", "I should have reviewed before the exam, but I couldn't.", "Надо было повторить перед экзаменом, но я не успел."],
    ],
    mistakes: [
      ["미리 예약했야 했는데", "미리 예약했어야 했는데", t("았/었 + 어야: 했어야.", "았/었 + 어야 gives 했어야.", "았/었 + 어야 даёт 했어야.")],
    ],
    quiz: [
      ["미리 ___ 했는데 자리가 없네요. (예약하다)", ["예약했어야", "예약했야"], 0],
      ["그 말을 하지 ___ 했는데.", ["말았어야", "말어야"], 0],
      ["더 일찍 ___ 했는데. (출발하다)", ["출발했어야", "출발할어야"], 0],
      ["복습했어야 ___ 못 했어요.", ["했는데", "하는데"], 0],
    ],
  }),
  point("connectors", {
    id: "eul-tenikka", pattern: "V/A + (으)ㄹ 테니까",
    title: t("“…aman, shuning uchun …” — (으)ㄹ 테니까", "“Since I will / since it will …” — (으)ㄹ 테니까", "«Раз я …, то …» — (으)ㄹ 테니까"),
    explain: t(
      "1) Gapiruvchining niyati keyingi so'rovga sabab bo'ladi: 제가 청소할 테니까 당신은 요리하세요 — men tozalayman, siz ovqat qiling. 2) Kuchli taxmin sabab bo'ladi: 길이 막힐 테니까 지하철을 타세요. Ikkinchi qismda ko'pincha buyruq yoki taklif keladi.",
      "1) The speaker's intention is the reason for a request: 제가 청소할 테니까 당신은 요리하세요 (I'll clean, so you cook). 2) A strong guess is the reason: 길이 막힐 테니까 지하철을 타세요. The second clause is often a command or suggestion.",
      "1) Намерение говорящего — причина для просьбы: 제가 청소할 테니까 당신은 요리하세요 — я уберусь, а вы приготовьте. 2) Уверенное предположение — причина: 길이 막힐 테니까 지하철을 타세요. Во второй части часто приказ или предложение.",
    ),
    rules: [
      ["제가 + V + (으)ㄹ 테니까", "Mening niyatim → so'rov", "My intention → a request", "Моё намерение → просьба"],
      ["V/A + (으)ㄹ 테니까", "Taxmin → maslahat", "A guess → advice", "Предположение → совет"],
      ["V/A + 았/었을 테니까", "O'tgan ish haqida taxmin", "A guess about the past", "Предположение о прошлом"],
    ],
    examples: [
      ["제가 청소할 테니까 당신은 요리하세요.", "Men tozalayman, siz ovqat qiling.", "I'll clean, so you cook.", "Я уберусь, а вы приготовьте еду."],
      ["길이 막힐 테니까 지하철을 타세요.", "Yo'l tiqilgan bo'ladi, metroda boring.", "The roads will be jammed, so take the subway.", "Наверняка будут пробки, поезжайте на метро."],
      ["곧 도착할 테니까 조금만 기다려 주세요.", "Hozir yetib boraman, biroz kutib turing.", "I'll be there soon, so please wait a little.", "Я скоро буду, подождите немного."],
      ["많이 피곤했을 테니까 푹 쉬세요.", "Juda charchagan bo'lsangiz kerak, yaxshilab dam oling.", "You must have been very tired, so get a good rest.", "Вы, наверное, очень устали — хорошенько отдохните."],
    ],
    mistakes: [
      ["제가 청소하는 테니까", "제가 청소할 테니까", t("테니까 oldida (으)ㄹ.", "(으)ㄹ before 테니까.", "Перед 테니까 — (으)ㄹ.")],
    ],
    quiz: [
      ["제가 ___ 테니까 당신은 요리하세요. (청소하다)", ["청소할", "청소하는"], 0],
      ["길이 ___ 테니까 지하철을 타세요. (막히다)", ["막힐", "막힌"], 0],
      ["곧 도착할 ___ 조금만 기다려 주세요.", ["테니까", "텐데도"], 0],
      ["많이 ___ 테니까 푹 쉬세요. (피곤하다)", ["피곤했을", "피곤했는"], 0],
    ],
  }),
  point("expressions", {
    id: "gi-maryeon", pattern: "V/A + 기 마련이다",
    title: t("“…ishi tabiiy” — 기 마련이다", "“Bound to” — 기 마련이다", "«Естественно, что…» — 기 마련이다"),
    explain: t(
      "Biror narsa tabiiy ravishda, muqarrar sodir bo'lishini bildiradi: 누구나 실수하기 마련이에요 — har kim xato qilishi tabiiy. Bitta voqea uchun emas, umumiy haqiqat uchun ishlatiladi. 게 마련이다 ham xuddi shu ma'noda.",
      "Says something happens naturally and inevitably: 누구나 실수하기 마련이에요 (everyone is bound to make mistakes). It's used for general truths, not single events. 게 마련이다 means the same.",
      "Говорит, что что-то происходит естественно и неизбежно: 누구나 실수하기 마련이에요 — каждый может ошибиться, это естественно. Используется для общих истин, а не единичных событий. 게 마련이다 значит то же самое.",
    ),
    rules: [
      ["V/A + 기 마련이다", "Tabiiy, muqarrar", "Natural, inevitable", "Естественно, неизбежно"],
      ["V/A + 게 마련이다", "Xuddi shu ma'no", "The same meaning", "То же значение"],
      ["일반적인 사실", "Umumiy haqiqat, bitta voqea emas", "A general truth, not one event", "Общая истина, а не единичный случай"],
    ],
    examples: [
      ["누구나 실수하기 마련이에요.", "Har kim xato qilishi tabiiy.", "Everyone is bound to make mistakes.", "Ошибаться свойственно каждому."],
      ["시간이 지나면 다 잊기 마련이에요.", "Vaqt o'tib, hammasi unutiladi.", "With time, you're bound to forget everything.", "Со временем всё забывается."],
      ["처음에는 누구나 어렵기 마련이에요.", "Boshida har kimga qiyin bo'lishi tabiiy.", "Everything is hard for anyone at first.", "Поначалу всем трудно — это естественно."],
      ["열심히 노력하면 좋은 결과가 있기 마련이에요.", "Tirishib harakat qilsangiz, albatta yaxshi natija bo'ladi.", "If you work hard, good results are bound to follow.", "Если стараться, хороший результат обязательно будет."],
    ],
    mistakes: [
      ["어제 실수하기 마련이었어요", "누구나 실수하기 마련이에요", t("Bitta voqea uchun emas, umumiy haqiqat uchun.", "For general truths, not a single event.", "Для общих истин, а не единичного события.")],
      ["실수하는 마련이에요", "실수하기 마련이에요", t("To'g'ri shakli 기 마련이다.", "The form is 기 마련이다.", "Правильная форма — 기 마련이다.")],
    ],
    quiz: [
      ["누구나 ___ 마련이에요. (실수하다)", ["실수하기", "실수하는"], 0],
      ["처음에는 누구나 ___ 마련이에요. (어렵다)", ["어렵기", "어려운"], 0],
      ["노력하면 좋은 결과가 있___ 마련이에요.", ["기", "는"], 0],
      ["시간이 지나면 잊___ 마련이에요.", ["게", "고"], 0],
    ],
  }),
  point("expressions", {
    id: "moyang", pattern: "V + 는 모양이다 · A + (으)ㄴ 모양이다",
    title: t("“…shekilli” (ko'rganimga qarab) — 는 모양이다", "“It seems / must be” — 는 모양이다", "«Видимо, …» — 는 모양이다"),
    explain: t(
      "Ko'rgan yoki eshitgan belgilarga qarab xulosa chiqaradi: 우산을 쓴 사람이 많네요. 비가 오는 모양이에요 — soyabonli odam ko'p, yomg'ir yog'yapti shekilli. Boshqalar yoki atrofdagi holat haqida aytiladi, o'zingiz haqingizda emas. Fe'lga 는, bo'lgan ish va sifatga (으)ㄴ, otga 인 모양이다.",
      "Draws a conclusion from signs you have seen or heard: 우산을 쓴 사람이 많네요. 비가 오는 모양이에요 (lots of people have umbrellas; it must be raining). It's about others or the situation, not about yourself. Verbs take 는, finished actions and adjectives (으)ㄴ, nouns 인 모양이다.",
      "Делает вывод по увиденным или услышанным признакам: 우산을 쓴 사람이 많네요. 비가 오는 모양이에요 — много людей с зонтами, видимо, идёт дождь. Говорится о других или об обстановке, а не о себе. Глаголы — 는, завершённое действие и прилагательные — (으)ㄴ, существительные — 인 모양이다.",
    ),
    rules: [
      ["V + 는 모양이다 (오다 → 오는 모양이다)", "Hozirgi holat (fe'l, 있다/없다)", "Present (verb, 있다/없다)", "Настоящее (глагол, 있다/없다)"],
      ["V + (으)ㄴ 모양이다 · A + (으)ㄴ 모양이다", "Bo'lgan ish / sifat", "Finished action / adjective", "Завершённое действие / прилагательное"],
      ["N + 인 모양이다", "Ot: 선생님인 모양이다", "Noun: 선생님인 모양이다", "Сущ.: 선생님인 모양이다"],
    ],
    examples: [
      ["사람들이 우산을 쓰고 있네요. 비가 오는 모양이에요.", "Odamlar soyabon ushlab yuribdi. Yomg'ir yog'yapti shekilli.", "People are holding umbrellas. It must be raining.", "Люди идут с зонтами. Похоже, идёт дождь."],
      ["민수 씨 얼굴이 밝네요. 좋은 일이 있는 모양이에요.", "Minsuning chehrasi ochiq. Biror yaxshi gap bor shekilli.", "Minsu looks cheerful. Something good must have happened.", "Минсу сияет. Видимо, у него что-то хорошее."],
      ["불이 다 꺼져 있어요. 다들 퇴근한 모양이에요.", "Chiroqlar o'chiq. Hamma ishdan ketgan shekilli.", "All the lights are off. Everyone must have gone home.", "Свет везде выключен. Видимо, все ушли домой."],
      ["저 가게는 항상 줄이 길어요. 맛있는 모양이에요.", "U do'kon oldida doim navbat uzun. Mazali shekilli.", "There's always a long line at that place. It must be good.", "У того заведения всегда длинная очередь. Наверное, там вкусно."],
    ],
    mistakes: [
      ["저는 배가 고픈 모양이에요", "저는 배가 고파요", t("O'zingiz haqida 모양이다 ishlatilmaydi.", "Don't use 모양이다 about yourself.", "О себе 모양이다 не говорят.")],
      ["좋은 일이 있은 모양이에요", "좋은 일이 있는 모양이에요", t("있다/없다 — 는 모양이다.", "있다/없다 take 는 모양이다.", "있다/없다 — 는 모양이다.")],
    ],
    quiz: [
      ["우산을 쓴 사람이 많네요. 비가 ___ 모양이에요. (오다)", ["오는", "오을"], 0],
      ["불이 꺼져 있어요. 다들 ___ 모양이에요. (퇴근하다)", ["퇴근한", "퇴근했는"], 0],
      ["줄이 기네요. ___ 모양이에요. (맛있다)", ["맛있는", "맛있은"], 0],
      ["저 사람이 선생님___ 모양이에요.", ["인", "는"], 0],
    ],
  }),
  point("endings", {
    id: "na-boda", pattern: "V + 나 보다 · A + (으)ㄴ가 보다",
    title: t("“…shekilli” (so'zlashuv) — 나 보다", "“I guess / must be” — 나 보다", "«Наверное, …» — 나 보다"),
    explain: t(
      "Ko'rgan belgilarga qarab taxmin qiladi, 모양이다 dan ko'ra so'zlashuvga xos: 전화를 안 받아요. 바쁜가 봐요 — telefonni olmayapti, band shekilli. Fe'l va 있다/없다 ga 나 보다, sifatga (으)ㄴ가 보다, otga 인가 보다, o'tgan zamonga 았/었나 보다.",
      "Makes a guess from what you see, more conversational than 모양이다: 전화를 안 받아요. 바쁜가 봐요 (he's not answering; he must be busy). Verbs and 있다/없다 take 나 보다, adjectives (으)ㄴ가 보다, nouns 인가 보다, the past 았/었나 보다.",
      "Предположение по увиденному, более разговорное, чем 모양이다: 전화를 안 받아요. 바쁜가 봐요 — не берёт трубку, наверное, занят. Глаголы и 있다/없다 — 나 보다, прилагательные — (으)ㄴ가 보다, существительные — 인가 보다, прошедшее — 았/었나 보다.",
    ),
    rules: [
      ["V · 있다/없다 + 나 보다", "Fe'l", "Verb", "Глагол"],
      ["A + (으)ㄴ가 보다 · N + 인가 보다", "Sifat / ot", "Adjective / noun", "Прилагательное / сущ."],
      ["V/A + 았/었나 보다", "O'tgan zamon", "Past", "Прошедшее"],
    ],
    examples: [
      ["민수 씨가 전화를 안 받아요. 바쁜가 봐요.", "Minsu telefonni olmayapti. Band shekilli.", "Minsu isn't answering. He must be busy.", "Минсу не берёт трубку. Наверное, занят."],
      ["밖이 시끄럽네요. 무슨 일이 있나 봐요.", "Tashqari shovqin. Nimadir bo'lyapti shekilli.", "It's noisy outside. Something must be going on.", "На улице шумно. Видимо, что-то случилось."],
      ["길이 젖었어요. 밤에 비가 왔나 봐요.", "Yo'l ho'l. Kechasi yomg'ir yoqqan shekilli.", "The road is wet. It must have rained in the night.", "Дорога мокрая. Видимо, ночью шёл дождь."],
      ["아기가 계속 울어요. 배가 고픈가 봐요.", "Chaqaloq tinmay yig'layapti. Qorni och shekilli.", "The baby keeps crying. It must be hungry.", "Малыш всё плачет. Наверное, голодный."],
    ],
    mistakes: [
      ["바쁘나 봐요", "바쁜가 봐요", t("Sifatga (으)ㄴ가 보다.", "Adjectives take (으)ㄴ가 보다.", "Прилагательные — (으)ㄴ가 보다.")],
    ],
    quiz: [
      ["전화를 안 받아요. ___ 봐요. (바쁘다)", ["바쁜가", "바쁘는가"], 0],
      ["밖이 시끄럽네요. 무슨 일이 ___ 봐요. (있다)", ["있나", "있은가"], 0],
      ["길이 젖었어요. 비가 ___ 봐요. (오다)", ["왔나", "왔은가"], 0],
      ["저 사람이 민수 씨 동생___ 봐요.", ["인가", "인나"], 0],
    ],
  }),
  point("particles", {
    id: "mankeum", pattern: "N + 만큼 · V + (으)ㄹ/(으)ㄴ 만큼",
    title: t("“…chalik” — 만큼", "“As … as / as much as” — 만큼", "«Столько же, как» — 만큼"),
    explain: t(
      "Ikki narsaning darajasi teng ekanini bildiradi: 동생도 형만큼 키가 커요 — ukasi ham akasichalik bo'yli. Otga qo'shib yoziladi. Fe'l bilan: 먹을 만큼 — yeya oladigan miqdorda; 노력한 만큼 — qancha harakat qilgan bo'lsa, shuncha.",
      "Says two things are equal in degree: 동생도 형만큼 키가 커요 (the younger brother is as tall as the older one). It's written together with a noun. With verbs: 먹을 만큼 (as much as you can eat), 노력한 만큼 (in proportion to the effort made).",
      "Показывает равную степень: 동생도 형만큼 키가 커요 — младший брат такой же высокий, как старший. С существительным пишется слитно. С глаголами: 먹을 만큼 — столько, сколько съешь; 노력한 만큼 — сколько вложено усилий, столько и …",
    ),
    rules: [
      ["N + 만큼 (형만큼)", "…chalik (teng)", "As … as", "Такой же, как"],
      ["V + (으)ㄹ 만큼", "…ga yetadigan miqdorda", "As much as needed to", "Столько, сколько нужно"],
      ["V + (으)ㄴ/는 만큼", "…gan darajada, shuncha", "To the degree that", "Насколько …, настолько"],
    ],
    examples: [
      ["동생도 형만큼 키가 커요.", "Ukasi ham akasichalik bo'yli.", "The younger brother is as tall as the older one.", "Младший брат такой же высокий, как старший."],
      ["먹을 만큼만 가져가세요.", "Yeya oladigan miqdordagina oling.", "Take only as much as you can eat.", "Берите столько, сколько съедите."],
      ["노력한 만큼 결과가 나와요.", "Qancha harakat qilsangiz, shuncha natija bo'ladi.", "You get results in proportion to your effort.", "Сколько усилий вложишь, такой и будет результат."],
      ["한국어를 한국 사람만큼 잘하고 싶어요.", "Koreys tilini koreyslarchalik yaxshi bilgim keladi.", "I want to speak Korean as well as a Korean.", "Хочу говорить по-корейски так же хорошо, как корейцы."],
    ],
    mistakes: [
      ["형 만큼 키가 커요", "형만큼 키가 커요", t("Otdan keyin 만큼 qo'shib yoziladi.", "After a noun, 만큼 is written without a space.", "После существительного 만큼 пишется слитно.")],
    ],
    quiz: [
      ["동생도 형___ 키가 커요.", ["만큼", "만큼을"], 0],
      ["먹을 ___만 가져가세요.", ["만큼", "만"], 0],
      ["___ 만큼 결과가 나와요. (노력하다)", ["노력한", "노력하은"], 0],
      ["한국 사람___ 잘하고 싶어요.", ["만큼", "만큰"], 0],
    ],
  }),
  point("expressions", {
    id: "deut-hada", pattern: "V/A + (으)ㄴ/는/(으)ㄹ 듯하다 · V + 듯이",
    title: t("“…dek tuyuladi” (yozma) — 듯하다", "“It seems” (written) — 듯하다", "«Кажется» (письм.) — 듯하다"),
    explain: t(
      "것 같다 ning yozma, rasmiyroq varianti: 비가 올 듯해요 — yomg'ir yog'adiganga o'xshaydi. TOPIK o'qish va yozish matnlarida ko'p uchraydi. 듯이 — “…gandek”: 물 쓰듯이 돈을 쓴다 — pulni suvdek sovuradi.",
      "A written, more formal version of 것 같다: 비가 올 듯해요 (it looks like it will rain). Common in TOPIK reading and writing. 듯이 means “as if / like”: 물 쓰듯이 돈을 쓴다 (he spends money like water).",
      "Письменный, более официальный вариант 것 같다: 비가 올 듯해요 — похоже, будет дождь. Часто встречается в текстах TOPIK для чтения и письма. 듯이 — «словно, как»: 물 쓰듯이 돈을 쓴다 — тратит деньги, как воду.",
    ),
    rules: [
      ["V + 는 듯하다 · A + (으)ㄴ 듯하다", "Hozirgi: …dek tuyuladi", "Present: seems", "Настоящее: кажется"],
      ["V + (으)ㄴ 듯하다 · V/A + (으)ㄹ 듯하다", "O'tgan · kelajak", "Past · future", "Прошедшее · будущее"],
      ["V + 듯이", "…gandek (o'xshatish)", "As if, like", "Словно, как"],
    ],
    examples: [
      ["하늘을 보니 비가 올 듯해요.", "Osmonga qarasam, yomg'ir yog'adiganga o'xshaydi.", "Looking at the sky, it looks like it will rain.", "Судя по небу, будет дождь."],
      ["그는 무엇인가 알고 있는 듯했다.", "U nimanidir bilayotgandek edi.", "He seemed to know something.", "Казалось, он что-то знал."],
      ["이 문제는 생각보다 어려운 듯하다.", "Bu masala o'ylagandan qiyinroqqa o'xshaydi.", "This problem seems harder than I thought.", "Эта задача, похоже, сложнее, чем я думал."],
      ["그는 물 쓰듯이 돈을 쓴다.", "U pulni suvdek sovuradi.", "He spends money like water.", "Он тратит деньги, как воду."],
    ],
    mistakes: [
      ["어렵는 듯하다", "어려운 듯하다", t("Sifatga (으)ㄴ 듯하다; 어렵다 → 어려운.", "Adjectives take (으)ㄴ 듯하다; 어렵다 → 어려운.", "Прилагательные — (으)ㄴ 듯하다; 어렵다 → 어려운.")],
    ],
    quiz: [
      ["하늘을 보니 비가 ___ 듯해요. (오다)", ["올", "오을"], 0],
      ["이 문제는 생각보다 ___ 듯하다. (어렵다)", ["어려운", "어렵는"], 0],
      ["그는 무엇인가 알고 ___ 듯했다. (있다)", ["있는", "있은"], 0],
      ["물 쓰___ 돈을 쓴다.", ["듯이", "듯한"], 0],
    ],
  }),
  point("connectors", {
    id: "abwatja", pattern: "V/A + 아/어 봤자",
    title: t("“…sangiz ham foydasi yo'q” — 아/어 봤자", "“Even if you do, it's no use” — 아/어 봤자", "«Хоть и …, толку нет» — 아/어 봤자"),
    explain: t(
      "Biror ishni qilsangiz ham natija bo'lmasligini yoki arzimasligini bildiradi: 지금 가 봤자 이미 끝났을 거예요 — hozir borsangiz ham, allaqachon tugagan bo'ladi. Ikkinchi qism salbiy: 소용없다, 마찬가지다, 안/못. Sifat bilan “ko'pi bilan”: 비싸 봤자 만 원 정도일 거예요.",
      "Says that doing something won't help or won't amount to much: 지금 가 봤자 이미 끝났을 거예요 (even if you go now, it'll be over). The second clause is negative: 소용없다, 마찬가지다, 안/못. With adjectives it means “at most”: 비싸 봤자 만 원 정도일 거예요.",
      "Говорит, что действие ничего не даст или итог будет незначительным: 지금 가 봤자 이미 끝났을 거예요 — даже если пойдёшь сейчас, всё уже закончится. Вторая часть отрицательная: 소용없다, 마찬가지다, 안/못. С прилагательными — «самое большее»: 비싸 봤자 만 원 정도일 거예요.",
    ),
    rules: [
      ["V/A + 아/어 봤자 (가다 → 가 봤자)", "…sangiz ham foydasi yo'q", "Even if you do, it's no use", "Хоть и сделаешь — толку нет"],
      ["뒤: 소용없다 / 마찬가지다 / 안·못", "Ikkinchi qism salbiy", "The second clause is negative", "Вторая часть отрицательная"],
      ["시제 없음", "봤자 oldida 았/었 yo'q", "No 았/었 before 봤자", "Перед 봤자 нет 았/었"],
    ],
    examples: [
      ["지금 가 봤자 이미 끝났을 거예요.", "Hozir borsangiz ham, allaqachon tugagan bo'ladi.", "Even if you go now, it'll already be over.", "Даже если пойдёшь сейчас, всё уже закончится."],
      ["아무리 말해 봤자 소용없어요.", "Qancha gapirsangiz ham, foydasi yo'q.", "No matter how much you say, it's no use.", "Сколько ни говори — бесполезно."],
      ["비싸 봤자 만 원 정도일 거예요.", "Qimmat bo'lsa ham, ko'pi bilan o'n ming von atrofida bo'ladi.", "Even if it's expensive, it'll be about 10,000 won at most.", "Даже если дорого, это будет от силы тысяч десять вон."],
      ["후회해 봤자 이미 늦었어요.", "Afsuslansangiz ham, endi kech.", "There's no use regretting it; it's too late.", "Жалеть бесполезно — уже поздно."],
    ],
    mistakes: [
      ["지금 가 봤자 꼭 만날 수 있어요", "지금 가 봤자 못 만날 거예요", t("봤자 dan keyin natija salbiy bo'ladi.", "After 봤자 the result is negative.", "После 봤자 результат отрицательный.")],
      ["갔어 봤자", "가 봤자", t("봤자 oldida zamon yo'q.", "No tense before 봤자.", "Перед 봤자 нет времени.")],
    ],
    quiz: [
      ["지금 ___ 봤자 늦었어요. (가다)", ["가", "갔어"], 0],
      ["아무리 말해 봤자 ___.", ["소용없어요", "소용있어요"], 0],
      ["___ 봤자 이미 늦었어요. (후회하다)", ["후회해", "후회하"], 0],
      ["비싸 ___ 만 원 정도일 거예요.", ["봤자", "보면"], 0],
    ],
  }),
  point("connectors", {
    id: "deorado", pattern: "V/A + 더라도",
    title: t("“…bo'lsa ham” (faraz) — 더라도", "“Even if” — 더라도", "«Даже если» — 더라도"),
    explain: t(
      "Faraz qilingan holat bo'lsa ham keyingi ish o'zgarmasligini bildiradi: 힘들더라도 포기하지 마세요 — qiyin bo'lsa ham taslim bo'lmang. 아/어도 dan kuchliroq va ko'proq farazga asoslangan. Otga (이)더라도, o'tgan zamonga 았/었더라도.",
      "Says what follows holds even in an imagined situation: 힘들더라도 포기하지 마세요 (even if it's hard, don't give up). It's stronger and more hypothetical than 아/어도. Nouns take (이)더라도, the past 았/었더라도.",
      "Говорит, что последующее неизменно даже в предполагаемой ситуации: 힘들더라도 포기하지 마세요 — даже если будет трудно, не сдавайтесь. Сильнее и гипотетичнее, чем 아/어도. Существительные — (이)더라도, прошедшее — 았/었더라도.",
    ),
    rules: [
      ["V/A + 더라도 (힘들다 → 힘들더라도)", "…bo'lsa ham (faraz)", "Even if (hypothetical)", "Даже если (гипотетически)"],
      ["N + (이)더라도", "Ot: 학생이더라도", "Noun: 학생이더라도", "Сущ.: 학생이더라도"],
      ["아/어도 < 더라도", "아/어도 dan kuchliroq", "Stronger than 아/어도", "Сильнее, чем 아/어도"],
    ],
    examples: [
      ["힘들더라도 포기하지 마세요.", "Qiyin bo'lsa ham, taslim bo'lmang.", "Even if it's hard, don't give up.", "Даже если будет трудно, не сдавайтесь."],
      ["비가 오더라도 경기는 계속됩니다.", "Yomg'ir yog'sa ham, o'yin davom etadi.", "Even if it rains, the match will go on.", "Даже если пойдёт дождь, матч продолжится."],
      ["늦더라도 꼭 연락해 주세요.", "Kech bo'lsa ham, albatta xabar bering.", "Even if it's late, be sure to get in touch.", "Даже если будет поздно, обязательно свяжитесь со мной."],
      ["아무리 바쁘더라도 아침은 먹어야 해요.", "Qanchalik band bo'lsangiz ham, nonushta qilish kerak.", "However busy you are, you should eat breakfast.", "Как бы вы ни были заняты, завтракать нужно."],
    ],
    mistakes: [
      ["힘든더라도", "힘들더라도", t("더라도 o'zakka to'g'ridan-to'g'ri qo'shiladi.", "Attach 더라도 directly to the stem.", "더라도 присоединяется прямо к основе.")],
    ],
    quiz: [
      ["___ 포기하지 마세요. (힘들다)", ["힘들더라도", "힘든더라도"], 0],
      ["비가 ___ 경기는 계속됩니다. (오다)", ["오더라도", "온더라도"], 0],
      ["아무리 ___ 아침은 먹어야 해요. (바쁘다)", ["바쁘더라도", "바쁜더라도"], 0],
      ["학생___ 규칙은 지켜야 해요.", ["이더라도", "더라도"], 0],
    ],
  }),
  point("expressions", {
    id: "gi-man-hada", pattern: "V/A + 기만 하다",
    title: t("“Faqat …” — 기만 하다", "“Only / nothing but” — 기만 하다", "«Только и …» — 기만 하다"),
    explain: t(
      "Faqat bitta ish qilinayotganini, boshqasi qilinmayotganini bildiradi: 아이가 울기만 해요 — bola faqat yig'layapti. Sifat bilan: 비싸기만 하고 예쁘지 않아요 — faqat qimmat, chiroyli emas. Otga oddiy 만 qo'shiladi.",
      "Says only one thing is being done and nothing else: 아이가 울기만 해요 (the child just keeps crying). With adjectives: 비싸기만 하고 예쁘지 않아요 (it's just expensive, not pretty). With nouns, plain 만 is used.",
      "Говорит, что делается только одно и ничего больше: 아이가 울기만 해요 — ребёнок только плачет. С прилагательными: 비싸기만 하고 예쁘지 않아요 — только дорогое, а некрасивое. С существительными — просто 만.",
    ),
    rules: [
      ["V + 기만 하다", "Faqat shu ishni qiladi", "Does nothing but", "Только и делает, что"],
      ["A + 기만 하다", "Faqat shunday", "Is just / only", "Просто / только"],
      ["N + 만", "Otga oddiy 만", "Nouns take plain 만", "С сущ. — просто 만"],
    ],
    examples: [
      ["아이가 아무 말 없이 울기만 해요.", "Bola hech narsa demay, faqat yig'layapti.", "The child just cries without saying anything.", "Ребёнок только плачет, ничего не говоря."],
      ["주말에는 집에서 쉬기만 했어요.", "Dam olish kunlari uyda faqat dam oldim.", "At the weekend I did nothing but rest at home.", "В выходные я только отдыхал дома."],
      ["그 사람은 듣기만 하고 아무 말도 안 했어요.", "U faqat tingladi, hech narsa demadi.", "He only listened and said nothing.", "Он только слушал и ничего не сказал."],
      ["이 옷은 비싸기만 하고 예쁘지 않아요.", "Bu kiyim faqat qimmat, chiroyli emas.", "These clothes are just expensive, not pretty.", "Эта одежда только дорогая, а некрасивая."],
    ],
    mistakes: [
      ["아이가 울만 해요", "아이가 울기만 해요", t("Fe'lga 기만 하다.", "Verbs take 기만 하다.", "Глаголы — 기만 하다.")],
    ],
    quiz: [
      ["아이가 ___ 해요. (울다)", ["울기만", "울만"], 0],
      ["그 사람은 듣기___ 하고 말을 안 했어요.", ["만", "는커녕"], 0],
      ["주말에는 집에서 ___ 했어요. (쉬다)", ["쉬기만", "쉬만"], 0],
      ["이 옷은 ___ 하고 예쁘지 않아요. (비싸다)", ["비싸기만", "비싼만"], 0],
    ],
  }),
  point("connectors", {
    id: "daganeun", pattern: "V + 다가는",
    title: t("“…aversangiz, (yomon bo'ladi)” — 다가는", "“If you keep … (warning)” — 다가는", "«Если будешь …, то (плохо)» — 다가는"),
    explain: t(
      "Biror ishni shunday davom ettiraversangiz, yomon natija bo'lishini ogohlantiradi: 그렇게 놀다가는 시험에 떨어질 거예요 — shunday o'ynayversangiz, imtihondan yiqilasiz. Ikkinchi qismda yomon natija, ko'pincha (으)ㄹ 거예요 yoki 겠어요. Ko'pincha 그렇게/이렇게 bilan keladi.",
      "Warns that carrying on like this will lead to a bad result: 그렇게 놀다가는 시험에 떨어질 거예요 (if you keep playing like that, you'll fail the exam). The second clause is a bad outcome, often with (으)ㄹ 거예요 or 겠어요. It often comes with 그렇게/이렇게.",
      "Предупреждает, что продолжение действия приведёт к плохому результату: 그렇게 놀다가는 시험에 떨어질 거예요 — если будешь так гулять, провалишь экзамен. Во второй части — плохой итог, часто с (으)ㄹ 거예요 или 겠어요. Часто с 그렇게/이렇게.",
    ),
    rules: [
      ["V + 다가는 (놀다 → 놀다가는)", "…aversangiz (ogohlantirish)", "If you keep … (warning)", "Если будешь … (предупреждение)"],
      ["뒤: (으)ㄹ 거예요 / 겠어요", "Ikkinchi qismda yomon natija", "A bad result follows", "Далее — плохой результат"],
      ["그렇게 / 이렇게 + V다가는", "Ko'pincha 그렇게 bilan", "Often with 그렇게", "Часто с 그렇게"],
    ],
    examples: [
      ["그렇게 놀다가는 시험에 떨어질 거예요.", "Shunday o'ynayversangiz, imtihondan yiqilasiz.", "If you keep playing like that, you'll fail the exam.", "Если будешь так гулять, провалишь экзамен."],
      ["이렇게 매일 늦게 자다가는 건강이 나빠지겠어요.", "Har kuni shunday kech yotaversangiz, sog'lig'ingiz yomonlashadi.", "If you keep going to bed this late every day, your health will suffer.", "Если каждый день так поздно ложиться, здоровье испортится."],
      ["돈을 그렇게 쓰다가는 곧 다 없어질 거예요.", "Pulni shunday sarflayversangiz, tez orada tugaydi.", "If you keep spending money like that, it'll soon be gone.", "Если так тратить деньги, они скоро закончатся."],
      ["과속하다가는 사고가 날 수 있어요.", "Tezlikni oshiraversangiz, avariya bo'lishi mumkin.", "If you keep speeding, you could have an accident.", "Если превышать скорость, можно попасть в аварию."],
    ],
    mistakes: [
      ["그렇게 놀다가는 합격할 거예요", "그렇게 놀다가는 떨어질 거예요", t("다가는 dan keyin yomon natija keladi.", "A bad result follows 다가는.", "После 다가는 — плохой результат.")],
    ],
    quiz: [
      ["그렇게 ___ 시험에 떨어질 거예요. (놀다)", ["놀다가는", "논다가는"], 0],
      ["매일 늦게 자다가는 건강이 ___.", ["나빠질 거예요", "좋아질 거예요"], 0],
      ["돈을 그렇게 쓰다___ 곧 없어질 거예요.", ["가는", "가면서"], 0],
      ["과속___ 사고가 날 수 있어요.", ["하다가는", "한다가는"], 0],
    ],
  }),
  point("expressions", {
    id: "go-malda", pattern: "V + 고 말다",
    title: t("“Oxiri …ib qo'ydi” — 고 말다", "“Ended up / will definitely” — 고 말다", "«В итоге … / обязательно» — 고 말다"),
    explain: t(
      "1) Istamagan holda oxiri bir ish bo'lib qolganini bildiradi: 결국 울고 말았어요 — oxiri yig'lab yubordim. 2) 고 말겠다 — qat'iy niyat: 이번에는 꼭 합격하고 말겠어요 — bu safar albatta o'taman. 고 oldida 았/었 kelmaydi.",
      "1) Says something happened in the end, usually against your wishes: 결국 울고 말았어요 (I ended up crying). 2) 고 말겠다 shows firm determination: 이번에는 꼭 합격하고 말겠어요 (this time I'll pass, no matter what). No 았/었 before 고.",
      "1) Говорит, что в итоге что-то произошло, обычно вопреки желанию: 결국 울고 말았어요 — в итоге я расплакался. 2) 고 말겠다 — твёрдая решимость: 이번에는 꼭 합격하고 말겠어요 — на этот раз я обязательно сдам. Перед 고 нет 았/었.",
    ),
    rules: [
      ["V + 고 말았다", "Oxiri …ib qo'ydi (afsus)", "Ended up (regrettably)", "В итоге (к сожалению)"],
      ["V + 고 말겠다", "Albatta …aman (qat'iy niyat)", "Will definitely (determination)", "Обязательно (решимость)"],
      ["결국 / 끝내 + V고 말았다", "Ko'pincha 결국 bilan", "Often with 결국", "Часто с 결국"],
    ],
    examples: [
      ["참으려고 했지만 결국 울고 말았어요.", "O'zimni tutmoqchi edim, lekin oxiri yig'lab yubordim.", "I tried to hold it in, but I ended up crying.", "Я пытался сдержаться, но в итоге расплакался."],
      ["서두르다가 지갑을 잃어버리고 말았어요.", "Shoshib yurib, hamyonimni yo'qotib qo'ydim.", "Rushing around, I ended up losing my wallet.", "Спеша, я в итоге потерял кошелёк."],
      ["이번에는 꼭 합격하고 말겠어요.", "Bu safar albatta o'taman.", "This time I'm going to pass, no matter what.", "На этот раз я обязательно сдам."],
      ["다이어트 중이었지만 또 케이크를 먹고 말았어요.", "Parhezda edim, lekin yana tort yeb qo'ydim.", "I was on a diet, but I ended up eating cake again.", "Я сидел на диете, но опять не удержался и съел торт."],
    ],
    mistakes: [
      ["결국 울었고 말았어요", "결국 울고 말았어요", t("고 말다 oldida 았/었 kelmaydi.", "No 았/었 before 고 말다.", "Перед 고 말다 нет 았/었.")],
    ],
    quiz: [
      ["결국 ___ 말았어요. (울다)", ["울고", "울었고"], 0],
      ["이번에는 꼭 합격하고 ___.", ["말겠어요", "말겠었어요"], 0],
      ["서두르다가 지갑을 잃어버리고 ___.", ["말았어요", "말아요"], 0],
      ["또 케이크를 ___ 말았어요. (먹다)", ["먹고", "먹어"], 0],
    ],
  }),
  point("expressions", {
    id: "jul-aratda", pattern: "V/A + (으)ㄴ/는 줄 알았다 · 몰랐다",
    title: t("“…deb o'ylagan edim” — 줄 알았다", "“I thought (wrongly) that” — 줄 알았다", "«Я думал, что…» — 줄 알았다"),
    explain: t(
      "줄 알았다 — noto'g'ri o'ylagan narsa: 학생인 줄 알았어요 — talaba deb o'ylagan edim (aslida emas). 줄 몰랐다 — bilmagan narsa: 이렇게 어려운 줄 몰랐어요 — bunchalik qiyinligini bilmagan ekanman. Fe'lga 는/(으)ㄴ/(으)ㄹ, sifatga (으)ㄴ, otga 인 줄. Qobiliyatni bildiruvchi (으)ㄹ 줄 알다 (“…ni biladi”) bilan adashtirmang.",
      "줄 알았다 is something you wrongly believed: 학생인 줄 알았어요 (I thought you were a student, but you're not). 줄 몰랐다 is something you didn't know: 이렇게 어려운 줄 몰랐어요 (I didn't know it was this hard). Verbs take 는/(으)ㄴ/(으)ㄹ, adjectives (으)ㄴ, nouns 인 줄. Don't confuse it with (으)ㄹ 줄 알다 (“know how to”).",
      "줄 알았다 — то, что вы ошибочно думали: 학생인 줄 알았어요 — я думал, вы студент (а это не так). 줄 몰랐다 — то, чего вы не знали: 이렇게 어려운 줄 몰랐어요 — не знал, что так трудно. Глаголы — 는/(으)ㄴ/(으)ㄹ, прилагательные — (으)ㄴ, существительные — 인 줄. Не путайте с (으)ㄹ 줄 알다 («уметь»).",
    ),
    rules: [
      ["V + 는 줄 · A + (으)ㄴ 줄 · N + 인 줄 알았다", "…deb o'ylagan edim (noto'g'ri)", "I thought (wrongly) that", "Я думал (ошибочно), что"],
      ["V/A + (으)ㄴ/는 줄 몰랐다", "…ligini bilmagan edim", "I didn't know that", "Я не знал, что"],
      ["V + (으)ㄴ 줄 · (으)ㄹ 줄", "O'tgan · kelajak", "Past · future", "Прошедшее · будущее"],
    ],
    examples: [
      ["학생인 줄 알았는데 선생님이셨네요.", "Talaba deb o'ylagan edim, o'qituvchi ekansiz.", "I thought you were a student, but you're a teacher.", "Я думал, вы студент, а вы, оказывается, учитель."],
      ["오늘이 수요일인 줄 알았어요.", "Bugun chorshanba deb o'ylabman.", "I thought today was Wednesday.", "Я думал, сегодня среда."],
      ["한국어가 이렇게 어려운 줄 몰랐어요.", "Koreys tili bunchalik qiyinligini bilmagan ekanman.", "I didn't know Korean was this hard.", "Я не знал, что корейский такой трудный."],
      ["비가 올 줄 알았으면 우산을 가져왔을 거예요.", "Yomg'ir yog'ishini bilganimda, soyabon olib kelardim.", "If I'd known it would rain, I'd have brought an umbrella.", "Если бы я знал, что пойдёт дождь, взял бы зонт."],
    ],
    mistakes: [
      ["학생는 줄 알았어요", "학생인 줄 알았어요", t("Otga 인 줄.", "Nouns take 인 줄.", "Существительные — 인 줄.")],
      ["어렵는 줄 몰랐어요", "어려운 줄 몰랐어요", t("Sifatga (으)ㄴ 줄; 어렵다 → 어려운.", "Adjectives take (으)ㄴ 줄; 어렵다 → 어려운.", "Прилагательные — (으)ㄴ 줄; 어렵다 → 어려운.")],
    ],
    quiz: [
      ["학생___ 줄 알았어요.", ["인", "는"], 0],
      ["한국어가 이렇게 ___ 줄 몰랐어요. (어렵다)", ["어려운", "어렵는"], 0],
      ["비가 ___ 줄 알았으면 우산을 가져왔을 거예요. (오다)", ["올", "오을"], 0],
      ["벌써 집에 ___ 줄 알았어요. (가다)", ["간", "가은"], 0],
    ],
  }),
  point("connectors", {
    id: "eumeuro", pattern: "V/A + (으)므로 · N + 이므로",
    title: t("“…gani sababli” (yozma) — (으)므로", "“Because / since” (written) — (으)므로", "«Поскольку» (письм.) — (으)므로"),
    explain: t(
      "Rasmiy yozma nutqda sababni bildiradi: e'lonlar, maqolalar, insholar va TOPIK 쓰기 javoblari uchun: 비가 많이 오므로 행사를 취소합니다 — kuchli yomg'ir sababli tadbir bekor qilinadi. Ikkinchi qismda buyruq yoki taklif bo'lmaydi. Otga 이므로, o'tgan zamonga 았/었으므로.",
      "Gives a reason in formal writing — notices, articles, essays and TOPIK writing answers: 비가 많이 오므로 행사를 취소합니다 (due to heavy rain, the event is cancelled). The second clause cannot be a command or suggestion. Nouns take 이므로, the past 았/었으므로.",
      "Выражает причину в официальной письменной речи — объявления, статьи, сочинения, ответы TOPIK 쓰기: 비가 많이 오므로 행사를 취소합니다 — в связи с сильным дождём мероприятие отменяется. Во второй части нет приказа или предложения. Существительные — 이므로, прошедшее — 았/었으므로.",
    ),
    rules: [
      ["V/A + (으)므로 (있다 → 있으므로, 하다 → 하므로)", "Sabab (yozma)", "Reason (written)", "Причина (письменная)"],
      ["N + 이므로", "Ot: 학생이므로", "Noun: 학생이므로", "Сущ.: 학생이므로"],
      ["뒤에 명령·청유 X", "Keyin buyruq/taklif yo'q", "No command or suggestion after it", "Без приказа и предложения после"],
    ],
    examples: [
      ["비가 많이 오므로 행사를 취소합니다.", "Kuchli yomg'ir yog'ayotgani sababli tadbir bekor qilinadi.", "Due to heavy rain, the event is cancelled.", "В связи с сильным дождём мероприятие отменяется."],
      ["운동은 건강에 좋으므로 꾸준히 하는 것이 좋다.", "Sport sog'liqqa foydali bo'lgani sababli, muntazam shug'ullangan ma'qul.", "Since exercise is good for health, it's best to do it regularly.", "Поскольку спорт полезен для здоровья, лучше заниматься регулярно."],
      ["이 지역은 위험하므로 출입을 금지한다.", "Bu hudud xavfli bo'lgani sababli kirish taqiqlanadi.", "Entry is prohibited because this area is dangerous.", "Вход запрещён, так как этот район опасен."],
      ["그는 성실한 학생이므로 장학금을 받을 자격이 있다.", "U mas'uliyatli talaba bo'lgani sababli stipendiya olishga haqli.", "As a diligent student, he deserves the scholarship.", "Он добросовестный студент, поэтому заслуживает стипендии."],
    ],
    mistakes: [
      ["비가 오므로 우산을 가져가세요", "비가 오니까 우산을 가져가세요", t("(으)므로 dan keyin buyruq bo'lmaydi; (으)니까.", "No command after (으)므로; use (으)니까.", "После (으)므로 нет приказа; используйте (으)니까.")],
      ["건강에 좋음으로", "건강에 좋으므로", t("Yozilishi (으)므로, 음으로 emas.", "It's spelled (으)므로, not 음으로.", "Пишется (으)므로, а не 음으로.")],
    ],
    quiz: [
      ["비가 많이 ___ 행사를 취소합니다. (오다)", ["오므로", "오으므로"], 0],
      ["운동은 건강에 ___ 꾸준히 해야 한다. (좋다)", ["좋으므로", "좋음으로"], 0],
      ["이 지역은 ___ 출입을 금지한다. (위험하다)", ["위험하므로", "위험하으므로"], 0],
      ["그는 학생___ 할인을 받을 수 있다.", ["이므로", "므로"], 0],
    ],
  }),
  point("particles", {
    id: "e-ttareumyeon", pattern: "N + 에 따르면 · N + 에 따라(서)",
    title: t("“…ga ko'ra” — 에 따르면", "“According to” — 에 따르면", "«Согласно» — 에 따르면"),
    explain: t(
      "Ma'lumot manbasini ko'rsatadi: 일기예보에 따르면 내일 비가 온대요 — ob-havo ma'lumotiga ko'ra, ertaga yomg'ir yog'arkan. Gap oxiri odatda ko'chirma gap (-대요, 다고 하다) bilan tugaydi. 에 따라(서) esa “…ga qarab” degani: 사람에 따라 생각이 달라요.",
      "Names the source of information: 일기예보에 따르면 내일 비가 온대요 (according to the forecast, it will rain tomorrow). The sentence usually ends in reported speech (-대요, 다고 하다). 에 따라(서) means “depending on”: 사람에 따라 생각이 달라요.",
      "Указывает источник информации: 일기예보에 따르면 내일 비가 온대요 — согласно прогнозу, завтра будет дождь. Предложение обычно заканчивается косвенной речью (-대요, 다고 하다). 에 따라(서) значит «в зависимости от»: 사람에 따라 생각이 달라요.",
    ),
    rules: [
      ["N + 에 따르면 … (ㄴ/는)다고 하다", "Manba: …ga ko'ra", "Source: according to", "Источник: согласно"],
      ["N + 에 따라(서)", "…ga qarab (har xil)", "Depending on", "В зависимости от"],
      ["뒤: -대요 / 다고 해요", "Oxiri ko'chirma gap bilan", "Ends in reported speech", "Заканчивается косвенной речью"],
    ],
    examples: [
      ["일기예보에 따르면 내일 비가 온대요.", "Ob-havo ma'lumotiga ko'ra, ertaga yomg'ir yog'arkan.", "According to the forecast, it will rain tomorrow.", "Согласно прогнозу, завтра будет дождь."],
      ["뉴스에 따르면 물가가 계속 오르고 있다고 합니다.", "Yangiliklarga ko'ra, narxlar o'sishda davom etyapti.", "According to the news, prices keep rising.", "По сообщениям новостей, цены продолжают расти."],
      ["조사에 따르면 혼자 사는 사람이 늘었다고 한다.", "So'rovnomaga ko'ra, yolg'iz yashovchilar ko'paygan.", "According to a survey, more people now live alone.", "Согласно опросу, людей, живущих в одиночку, стало больше."],
      ["사람에 따라 생각이 달라요.", "Odamga qarab fikr har xil.", "Opinions differ from person to person.", "У разных людей разные мнения."],
    ],
    mistakes: [
      ["뉴스에 따라서 물가가 오른대요", "뉴스에 따르면 물가가 오른대요", t("Manba uchun 에 따르면; 에 따라서 — “…ga qarab”.", "For a source use 에 따르면; 에 따라서 means “depending on”.", "Для источника — 에 따르면; 에 따라서 — «в зависимости от».")],
    ],
    quiz: [
      ["일기예보___ 내일 비가 온대요.", ["에 따르면", "에 따라서"], 0],
      ["뉴스에 따르면 물가가 ___.", ["오른대요", "오르대요"], 0],
      ["사람___ 생각이 달라요.", ["에 따라", "에 따르면"], 0],
      ["조사에 따르면 혼자 사는 사람이 ___ 한다.", ["늘었다고", "늘었고"], 0],
    ],
  }),
  point("particles", {
    id: "jocha-majeo", pattern: "N + 조차 · N + 마저",
    title: t("“Hatto … ham” — 조차 / 마저", "“Even” — 조차 / 마저", "«Даже» — 조차 / 마저"),
    explain: t(
      "Kutilgan eng oddiy narsa ham bo'lmaganini yoki ustiga u ham qo'shilganini ta'kidlaydi, asosan salbiy holatda: 너무 바빠서 밥조차 못 먹었어요 — shunchalik band edimki, hatto ovqat ham yeya olmadim. 마저 — “oxirgi qolgani ham”: 친구마저 떠났어요 — hatto do'stim ham ketdi. Ikkalasi 도 dan kuchliroq va odatda yomon vaziyatda ishlatiladi; ijobiy “hatto” uchun 까지 tabiiyroq.",
      "Stresses that even the most basic thing didn't happen, or that even this was added on, mostly in negative situations: 너무 바빠서 밥조차 못 먹었어요 (I was so busy I couldn't even eat). 마저 means “even the last one left”: 친구마저 떠났어요 (even my friend left). Both are stronger than 도 and usually describe bad situations; for a positive “even” 까지 is more natural.",
      "Подчёркивает, что не случилось даже самого простого или что добавилось даже это, обычно в негативной ситуации: 너무 바빠서 밥조차 못 먹었어요 — был так занят, что даже не поел. 마저 — «даже последнее, что оставалось»: 친구마저 떠났어요 — даже друг ушёл. Оба сильнее, чем 도, и обычно описывают плохую ситуацию; для положительного «даже» естественнее 까지.",
    ),
    rules: [
      ["N + 조차 → 이름조차", "Hatto eng oddiy narsa ham (ko'pincha inkor bilan)", "Even the most basic thing (often with a negative)", "Даже самое простое (часто с отрицанием)"],
      ["N + 마저 → 친구마저", "Oxirgi qolgani ham (yomon holat)", "Even the last one left (bad situation)", "Даже последнее (плохая ситуация)"],
      ["N + 까지 → 선물까지", "Ijobiy yoki neytral “hatto”", "Positive or neutral “even”", "Положительное или нейтральное «даже»"],
    ],
    examples: [
      ["너무 피곤해서 씻을 힘조차 없어요.", "Shunchalik charchadimki, yuvinishga ham kuchim yo'q.", "I'm so tired I don't even have the energy to wash.", "Я так устал, что нет сил даже умыться."],
      ["그 사람 이름조차 기억이 안 나요.", "Uning ismi ham esimga kelmayapti.", "I can't even remember his name.", "Не могу вспомнить даже его имени."],
      ["비가 오는데 바람마저 불기 시작했어요.", "Yomg'ir yog'ayotgan edi, ustiga shamol ham esa boshladi.", "It was raining, and then even the wind started blowing.", "Шёл дождь, а тут ещё и ветер поднялся."],
      ["마지막 희망마저 사라졌어요.", "Oxirgi umid ham so'ndi.", "Even the last hope disappeared.", "Исчезла даже последняя надежда."],
    ],
    mistakes: [
      ["선물조차 받아서 기뻤어요", "선물까지 받아서 기뻤어요", t("Quvonchli holatda 조차/마저 emas, 까지.", "For a happy situation use 까지, not 조차/마저.", "Для радостной ситуации — 까지, а не 조차/마저.")],
      ["물을조차 못 마셨어요", "물조차 못 마셨어요", t("조차 을/를 o'rnini egallaydi.", "조차 replaces 을/를.", "조차 заменяет 을/를.")],
    ],
    quiz: [
      ["너무 바빠서 점심___ 못 먹었어요.", ["조차", "처럼"], 0],
      ["친구들이 다 떠나고 가족___ 멀리 이사 갔어요.", ["마저", "보다"], 0],
      ["합격하고 장학금___ 받았어요! (quvonchli)", ["까지", "조차"], 0],
      ["그는 인사___ 하지 않고 나갔어요.", ["조차", "에게"], 0],
    ],
  }),
  point("particles", {
    id: "iyamallo", pattern: "N + (이)야말로",
    title: t("“Aynan …” (kuchli urg'u) — (이)야말로", "“Truly / precisely” — (이)야말로", "«Именно, вот кто» — (이)야말로"),
    explain: t(
      "Otni kuchli ta'kidlab, “aynan shu, boshqasi emas” ma'nosini beradi: 건강이야말로 가장 중요한 재산이에요 — eng muhim boylik aynan salomatlik. Undosh bilan tugasa 이야말로, unli bilan 야말로. Javobda ham ishlatiladi: 고맙습니다. — 저야말로요 — “Rahmat.” — “Men sizdan minnatdorman.”",
      "Strongly emphasises a noun as “this one and nothing else”: 건강이야말로 가장 중요한 재산이에요 (health is truly the greatest wealth). After a consonant use 이야말로, after a vowel 야말로. Also common in replies: 고맙습니다. — 저야말로요 (Thank you. — No, thank *you*).",
      "Сильно выделяет существительное — «именно это, а не другое»: 건강이야말로 가장 중요한 재산이에요 — именно здоровье — главное богатство. После согласной 이야말로, после гласной 야말로. Употребляется и в ответе: 고맙습니다. — 저야말로요 — «Спасибо». — «Это вам спасибо».",
    ),
    rules: [
      ["N (undosh) + 이야말로 → 건강이야말로", "Undosh bilan tugagan ot", "Noun ending in a consonant", "Сущ. на согласную"],
      ["N (unli) + 야말로 → 저야말로", "Unli bilan tugagan ot", "Noun ending in a vowel", "Сущ. на гласную"],
      ["저야말로요 · 저야말로 감사합니다", "Javob: “men sizdan minnatdorman”", "Reply: “I should be thanking you”", "Ответ: «Это я вам благодарен»"],
    ],
    examples: [
      ["건강이야말로 가장 큰 재산이에요.", "Eng katta boylik aynan salomatlik.", "Health is truly the greatest wealth.", "Именно здоровье — самое большое богатство."],
      ["이 식당이야말로 진짜 한국 맛이에요.", "Haqiqiy koreyscha ta'm aynan shu oshxonada.", "This restaurant is the real taste of Korea.", "Вот где настоящий корейский вкус — в этом ресторане."],
      ["도와주셔서 감사합니다. — 아니에요, 저야말로 감사합니다.", "Yordamingiz uchun rahmat. — Yo'g'-e, men sizdan minnatdorman.", "Thanks for your help. — Not at all, I'm the one who should thank you.", "Спасибо за помощь. — Что вы, это я вам благодарен."],
      ["꾸준한 노력이야말로 성공의 비결입니다.", "Muvaffaqiyat siri aynan tinimsiz mehnatda.", "Steady effort is precisely the secret of success.", "Именно упорный труд — секрет успеха."],
    ],
    mistakes: [
      ["저이야말로 감사합니다", "저야말로 감사합니다", t("Unlidan keyin 야말로.", "After a vowel use 야말로.", "После гласной — 야말로.")],
      ["건강야말로 중요해요", "건강이야말로 중요해요", t("Undoshdan keyin 이야말로.", "After a consonant use 이야말로.", "После согласной — 이야말로.")],
    ],
    quiz: [
      ["사랑___ 가장 중요한 것이에요.", ["이야말로", "야말로"], 0],
      ["감사합니다. — 아니에요, 저___ 감사하죠.", ["야말로", "이야말로"], 0],
      ["독서___ 최고의 공부 방법이에요.", ["야말로", "이야말로"], 0],
      ["이번 시험___ 꼭 합격하고 싶어요.", ["이야말로", "야말로"], 0],
    ],
  }),
  point("particles", {
    id: "e-bihae", pattern: "N + 에 비해(서) · V/A + (으)ㄴ/는 것에 비해",
    title: t("“… ga nisbatan” — 에 비해(서)", "“Compared to” — 에 비해(서)", "«По сравнению с» — 에 비해(서)"),
    explain: t(
      "Ikki narsani solishtirib, biri ikkinchisiga nisbatan qanday ekanini aytadi. 보다 dan rasmiyroq, yozma matn va grafik tavsifida (TOPIK 쓰기 53) ko'p uchraydi: 작년에 비해 관광객이 30% 늘었다 — o'tgan yilga nisbatan sayyohlar 30% ko'paydi. 에 비하면 — “… bilan solishtirsa”.",
      "Compares two things and says how one stands relative to the other. More formal than 보다 and common in written texts and graph descriptions (TOPIK writing Q53): 작년에 비해 관광객이 30% 늘었다 (compared to last year, tourists rose by 30%). 에 비하면 means “if you compare it with …”.",
      "Сравнивает два предмета и говорит, каков один относительно другого. Официальнее, чем 보다, часто в письменных текстах и описании графиков (TOPIK, письмо, задание 53): 작년에 비해 관광객이 30% 늘었다 — по сравнению с прошлым годом туристов стало на 30% больше. 에 비하면 — «если сравнить с …».",
    ),
    rules: [
      ["N + 에 비해(서) → 작년에 비해", "… ga nisbatan", "Compared to N", "По сравнению с N"],
      ["V/A + (으)ㄴ/는 것에 비해 → 노력한 것에 비해", "Harakat yoki holatga nisbatan", "Relative to an action or state", "Относительно действия или состояния"],
      ["N + 에 비하면 → 서울에 비하면", "“… bilan solishtirsa”", "“If compared with N”", "«Если сравнить с N»"],
    ],
    examples: [
      ["작년에 비해 관광객 수가 30% 증가했다.", "O'tgan yilga nisbatan sayyohlar soni 30% oshdi.", "Compared to last year, the number of tourists increased by 30%.", "По сравнению с прошлым годом число туристов выросло на 30%."],
      ["이 휴대폰은 가격에 비해 성능이 좋아요.", "Bu telefon narxiga nisbatan yaxshi ishlaydi.", "This phone performs well for its price.", "Этот телефон хорошо работает для своей цены."],
      ["열심히 공부한 것에 비해 점수가 낮게 나왔어요.", "Qattiq o'qiganimga nisbatan ball past chiqdi.", "My score was low considering how hard I studied.", "Для того, сколько я занимался, балл получился низким."],
      ["서울에 비하면 우리 동네는 아주 조용해요.", "Seul bilan solishtirsa, bizning mahalla juda tinch.", "Compared with Seoul, my neighbourhood is very quiet.", "По сравнению с Сеулом наш район очень тихий."],
    ],
    mistakes: [
      ["작년을 비해 늘었다", "작년에 비해 늘었다", t("에 bilan: 에 비해.", "It takes 에: 에 비해.", "С 에: 에 비해.")],
      ["노력한에 비해 결과가 나빠요", "노력한 것에 비해 결과가 나빠요", t("Fe'ldan keyin 것 kerak.", "After a verb add 것.", "После глагола нужно 것.")],
    ],
    quiz: [
      ["작년___ 물가가 많이 올랐다.", ["에 비해", "에 따라"], 0],
      ["이 가방은 품질___ 가격이 너무 비싸요.", ["에 비해", "을 비해"], 0],
      ["많이 먹은 것___ 살이 안 쪄요.", ["에 비해", "에게 비해"], 0],
      ["도시___ 시골은 공기가 깨끗해요.", ["에 비하면", "에 따르면"], 0],
    ],
  }),
  point("particles", {
    id: "euro-inhae", pattern: "N + (으)로 인해(서) · N + (으)로 인한 N",
    title: t("“… sababli” (rasmiy) — (으)로 인해(서)", "“Due to” (formal) — (으)로 인해(서)", "«Из-за, вследствие» — (으)로 인해(서)"),
    explain: t(
      "Sababni rasmiy uslubda bildiradi; yangiliklar, hisobotlar, TOPIK 쓰기 va 읽기 matnlarida keng uchraydi: 폭우로 인해 도로가 통제되었다 — kuchli yomg'ir sababli yo'l yopildi. Ot oldidan aniqlovchi sifatida (으)로 인한 N: 스트레스로 인한 질병 — stress sababli kelib chiqqan kasallik. Kundalik gapda 때문에 tabiiyroq.",
      "Gives a cause in a formal style, common in news, reports, and TOPIK reading and writing texts: 폭우로 인해 도로가 통제되었다 (the road was closed due to heavy rain). Before a noun use (으)로 인한 N: 스트레스로 인한 질병 (illness caused by stress). In everyday speech 때문에 is more natural.",
      "Причина в официальном стиле: новости, отчёты, тексты TOPIK по чтению и письму: 폭우로 인해 도로가 통제되었다 — из-за ливня дорогу перекрыли. Перед существительным — (으)로 인한 N: 스트레스로 인한 질병 — болезнь, вызванная стрессом. В разговоре естественнее 때문에.",
    ),
    rules: [
      ["N (unli / ㄹ) + 로 인해(서) → 폭우로 인해", "Unli yoki ㄹ bilan tugagan ot", "Noun ending in a vowel or ㄹ", "Сущ. на гласную или ㄹ"],
      ["N (undosh) + 으로 인해(서) → 지진으로 인해", "Undosh bilan tugagan ot", "Noun ending in a consonant", "Сущ. на согласную"],
      ["N + (으)로 인한 + N → 스트레스로 인한 병", "Ot oldidan aniqlovchi", "Before a noun", "Перед существительным"],
    ],
    examples: [
      ["폭우로 인해 일부 도로가 통제되었습니다.", "Kuchli yomg'ir sababli ba'zi yo'llar yopildi.", "Some roads were closed due to heavy rain.", "Из-за ливня некоторые дороги перекрыты."],
      ["지진으로 인해 많은 건물이 무너졌다.", "Zilzila sababli ko'plab binolar qulab tushdi.", "Many buildings collapsed due to the earthquake.", "Из-за землетрясения рухнуло много зданий."],
      ["스트레스로 인한 질병이 늘고 있다.", "Stress sababli kelib chiqadigan kasalliklar ko'paymoqda.", "Stress-related illnesses are increasing.", "Болезней, вызванных стрессом, становится больше."],
      ["교통사고로 인해 출근이 늦어졌습니다.", "Yo'l-transport hodisasi sababli ishga kech qoldim.", "I was late for work because of a traffic accident.", "Из-за аварии я опоздал на работу."],
    ],
    mistakes: [
      ["지진로 인해", "지진으로 인해", t("Undoshdan keyin 으로.", "After a consonant use 으로.", "После согласной — 으로.")],
      ["스트레스로 인해 질병", "스트레스로 인한 질병", t("Ot oldidan 인한.", "Before a noun use 인한.", "Перед существительным — 인한.")],
    ],
    quiz: [
      ["태풍___ 비행기가 결항되었다.", ["으로 인해", "로 인해"], 0],
      ["화재___ 피해가 컸다.", ["로 인한", "으로 인한"], 0],
      ["지진___ 건물이 무너졌다.", ["으로 인해", "에 비해"], 0],
      ["이것은 환경 오염___ 문제입니다.", ["으로 인한", "으로 인해"], 0],
    ],
  }),
  point("endings", {
    id: "janayo", pattern: "V/A + 잖아요 · N + (이)잖아요",
    title: t("“… -ku, axir” — 잖아요", "“You know …” — 잖아요", "«Ведь …, же» — 잖아요"),
    explain: t(
      "Suhbatdosh ham biladigan narsani eslatadi yoki uni sabab sifatida ko'rsatadi: 오늘 일요일이잖아요 — axir bugun yakshanba-ku. Ba'zan yengil e'tiroz yoki ta'na ohangi bor: 제가 말했잖아요 — aytgandim-ku. Faqat og'zaki nutqda; kattalarga ehtiyot bo'lib ishlating. O'tgan zamon: 았/었잖아요.",
      "Reminds the listener of something they already know, or offers it as a reason: 오늘 일요일이잖아요 (it's Sunday today, you know). It can sound mildly reproachful: 제가 말했잖아요 (I told you!). Spoken only; use it carefully with elders. Past: 았/었잖아요.",
      "Напоминает собеседнику то, что он и так знает, или приводит это как причину: 오늘 일요일이잖아요 — сегодня же воскресенье. Может звучать с лёгким упрёком: 제가 말했잖아요 — я же говорил! Только в устной речи; со старшими осторожно. Прошедшее: 았/었잖아요.",
    ),
    rules: [
      ["V/A + 잖아요 → 비싸잖아요", "Hozirgi holat", "Present", "Настоящее"],
      ["V/A + 았/었잖아요 → 말했잖아요", "O'tgan zamon", "Past", "Прошедшее"],
      ["N + (이)잖아요 → 일요일이잖아요 · 친구잖아요", "Ot (undosh → 이잖아요)", "Noun (consonant → 이잖아요)", "Сущ. (на согласную → 이잖아요)"],
    ],
    examples: [
      ["왜 이렇게 길이 막혀요? — 퇴근 시간이잖아요.", "Nega yo'l bunchalik tirband? — Axir ishdan qaytish vaqti-ku.", "Why is traffic so bad? — It's rush hour, you know.", "Почему такие пробки? — Так ведь час пик."],
      ["제가 아까 말했잖아요.", "Hozirgina aytdim-ku.", "I told you a moment ago!", "Я же только что говорил."],
      ["우리는 친구잖아요. 걱정하지 마세요.", "Axir biz do'stmiz-ku. Xavotir olmang.", "We're friends, aren't we? Don't worry.", "Мы ведь друзья. Не переживайте."],
      ["그 가게는 안 가요. 너무 비싸잖아요.", "U do'konga bormayman. Juda qimmat-ku.", "I don't go to that shop. It's way too expensive, you know.", "Я в тот магазин не хожу. Там ведь слишком дорого."],
    ],
    mistakes: [
      ["(birinchi uchrashuvda) 저는 의사잖아요", "저는 의사예요", t("Suhbatdosh bilmagan yangi ma'lumotga 잖아요 ishlatilmaydi.", "Don't use 잖아요 for new information the listener doesn't know.", "Для новой информации, которую собеседник не знает, 잖아요 не используют.")],
      ["일요일잖아요", "일요일이잖아요", t("Undosh bilan tugagan otga 이잖아요.", "Nouns ending in a consonant take 이잖아요.", "После согласной — 이잖아요.")],
    ],
    quiz: [
      ["왜 우산을 가져가요? — 비가 ___. (오다)", ["오잖아요", "와잖아요"], 0],
      ["어제 제가 ___. 기억 안 나요? (말하다)", ["말했잖아요", "말하잖아요"], 0],
      ["오늘은 쉬어요. 일요일___.", ["이잖아요", "잖아요"], 0],
      ["걱정 마세요. 우리는 친구___.", ["잖아요", "이잖아요"], 0],
    ],
  }),
  point("connectors", {
    id: "geodeun", pattern: "V/A + 거든 (+ buyruq / taklif)",
    title: t("“Agar … bo'lsa, (unda) …” — 거든", "“If / once …, (then do)” — 거든", "«Если …, то (сделай)» — 거든"),
    explain: t(
      "Shart bildiradi, lekin ikkinchi qism buyruq, taklif, niyat yoki va'da bo'lishi shart: 도착하거든 전화하세요 — yetib borsangiz, qo'ng'iroq qiling. Natija oddiy fakt bo'lsa, (으)면 ishlatiladi. Gap oxiridagi 거든요 (sabab tushuntirish) bilan adashtirmang.",
      "Expresses a condition, but the second clause must be a command, suggestion, intention or promise: 도착하거든 전화하세요 (call me once you arrive). When the result is a plain fact, use (으)면 instead. Don't confuse it with sentence-final 거든요 (giving a reason).",
      "Условие, но вторая часть обязательно приказ, предложение, намерение или обещание: 도착하거든 전화하세요 — как доберётесь, позвоните. Если результат — простой факт, используют (으)면. Не путайте с 거든요 в конце предложения (объяснение причины).",
    ),
    rules: [
      ["V/A + 거든 … (으)세요", "Buyruq / iltimos", "Command / request", "Приказ / просьба"],
      ["V/A + 거든 … (으)ㅂ시다 · (으)ㄹ까요?", "Taklif", "Suggestion", "Предложение"],
      ["V/A + 거든 … (으)ㄹ게요 · (으)려고 해요", "Va'da / niyat", "Promise / intention", "Обещание / намерение"],
    ],
    examples: [
      ["집에 도착하거든 전화하세요.", "Uyga yetib borsangiz, qo'ng'iroq qiling.", "Call me when you get home.", "Как доберётесь домой, позвоните."],
      ["시간이 있거든 같이 영화 볼까요?", "Vaqtingiz bo'lsa, birga kino ko'ramizmi?", "If you have time, shall we watch a movie together?", "Если будет время, сходим вместе в кино?"],
      ["모르는 게 있거든 언제든지 물어보세요.", "Tushunmagan narsangiz bo'lsa, istalgan vaqt so'rang.", "If there's anything you don't understand, ask any time.", "Если что-то непонятно, спрашивайте в любое время."],
      ["월급을 받거든 맛있는 거 사 줄게요.", "Maosh olsam, mazali narsa olib beraman.", "When I get paid, I'll treat you to something tasty.", "Как получу зарплату, угощу тебя чем-нибудь вкусным."],
    ],
    mistakes: [
      ["봄이 오거든 꽃이 핍니다", "봄이 오면 꽃이 핍니다", t("Natija oddiy fakt bo'lsa, 거든 emas, (으)면.", "When the result is a plain fact, use (으)면, not 거든.", "Если результат — простой факт, нужно (으)면, а не 거든.")],
      ["배가 고프거든 밥을 먹었어요", "배가 고프거든 밥을 드세요", t("거든 dan keyin o'tgan zamon fakti kelmaydi; buyruq yoki taklif kerak.", "거든 can't be followed by a past fact; it needs a command or suggestion.", "После 거든 не бывает факта в прошедшем; нужен приказ или предложение.")],
    ],
    quiz: [
      ["회의가 끝나___ 저에게 알려 주세요.", ["거든", "거든요"], 0],
      ["날씨가 ___ 같이 산책합시다. (좋다)", ["좋거든", "좋았거든요"], 0],
      ["겨울이 ___ 날씨가 추워져요. (오다)", ["오면", "오거든"], 0],
      ["도움이 ___ 언제든지 말씀하세요. (필요하다)", ["필요하거든", "필요해서"], 0],
    ],
  }),
  point("expressions", {
    id: "gon-hada", pattern: "V + 곤 하다",
    title: t("“… qilib turardim / turaman” — 곤 하다", "“Used to / tend to” — 곤 하다", "«Бывало, …; обычно …» — 곤 하다"),
    explain: t(
      "Takrorlanib turadigan odatni bildiradi, ko'pincha o'tmishda: 어렸을 때 할머니 댁에 가곤 했어요 — bolaligimda buvimnikiga borib turardim. Hozirgi odat uchun ham ishlatiladi: 피곤하면 산책을 하곤 해요. Faqat fe'l bilan; bir martalik ishga ishlatilmaydi.",
      "Expresses a repeated habit, often in the past: 어렸을 때 할머니 댁에 가곤 했어요 (as a child I used to visit my grandmother). It also works for present habits: 피곤하면 산책을 하곤 해요. Verbs only, and never for a one-time event.",
      "Повторяющаяся привычка, чаще в прошлом: 어렸을 때 할머니 댁에 가곤 했어요 — в детстве я, бывало, ездил к бабушке. Можно и о нынешней привычке: 피곤하면 산책을 하곤 해요. Только с глаголами, не для однократных событий.",
    ),
    rules: [
      ["V + 곤 했다 → 가곤 했어요", "O'tmishdagi odat", "Past habit", "Привычка в прошлом"],
      ["V + 곤 하다 → 하곤 해요", "Hozirgi odat", "Present habit", "Нынешняя привычка"],
      ["V + 고는 하다 = 곤 하다", "To'liq shakli (yozuvda)", "Full form (in writing)", "Полная форма (на письме)"],
    ],
    examples: [
      ["어렸을 때 여름마다 바다에 가곤 했어요.", "Bolaligimda har yozda dengizga borib turardik.", "As a child, I used to go to the sea every summer.", "В детстве мы каждое лето ездили на море."],
      ["스트레스를 받으면 노래방에 가곤 해요.", "Stress bo'lsam, odatda karaokega boraman.", "When I'm stressed, I tend to go to karaoke.", "Когда у меня стресс, я обычно хожу в караоке."],
      ["대학생 때 친구들과 밤새 이야기하곤 했다.", "Talabalik paytimda do'stlarim bilan tun bo'yi suhbatlashib turardik.", "In college I would often talk all night with friends.", "В студенчестве мы, бывало, болтали с друзьями всю ночь."],
      ["요즘도 가끔 옛날 사진을 보곤 해요.", "Hozir ham ba'zan eski suratlarni ko'rib turaman.", "Even these days I sometimes look at old photos.", "Я и сейчас иногда пересматриваю старые фото."],
    ],
    mistakes: [
      ["어제 영화를 보곤 했어요", "어제 영화를 봤어요", t("Bir martalik ishga 곤 하다 ishlatilmaydi.", "Don't use 곤 하다 for a one-time event.", "Для однократного события 곤 하다 не используют.")],
      ["어렸을 때 키가 작곤 했어요", "어렸을 때 키가 작았어요", t("Sifat bilan emas, faqat fe'l bilan.", "Verbs only, not adjectives.", "Только с глаголами, не с прилагательными.")],
    ],
    quiz: [
      ["어렸을 때 자주 할머니 댁에 ___ 했어요. (가다)", ["가곤", "가고"], 0],
      ["피곤할 때는 음악을 ___ 해요. (듣다)", ["듣곤", "들곤"], 0],
      ["학생 때 도서관에서 밤늦게까지 ___. (공부하다)", ["공부하곤 했어요", "공부하곤 있어요"], 0],
      ["작년 여름에 딱 한 번 제주도에 ___.", ["갔어요", "가곤 했어요"], 0],
    ],
  }),
  point("expressions", {
    id: "eul-subakke", pattern: "V/A + (으)ㄹ 수밖에 없다",
    title: t("“…dan boshqa iloj yo'q” — (으)ㄹ 수밖에 없다", "“Have no choice but to” — (으)ㄹ 수밖에 없다", "«Ничего не остаётся, кроме как» — (으)ㄹ 수밖에 없다"),
    explain: t(
      "Boshqa yo'l qolmaganini yoki natija muqarrar ekanini bildiradi: 버스가 끊겨서 택시를 탈 수밖에 없었어요 — avtobus qatnovi tugagani uchun taksiga o'tirishdan boshqa ilojim yo'q edi. Sifat yoki natija bilan — “tabiiyki shunday”: 매일 연습하니까 잘할 수밖에 없죠 — har kuni mashq qilsa, yaxshi bo'lishi tabiiy.",
      "Says there is no other option, or that a result is inevitable: 버스가 끊겨서 택시를 탈 수밖에 없었어요 (the buses had stopped, so I had no choice but to take a taxi). With adjectives or results it means “naturally”: 매일 연습하니까 잘할 수밖에 없죠 (she practises every day, so of course she's good).",
      "Других вариантов нет или результат неизбежен: 버스가 끊겨서 택시를 탈 수밖에 없었어요 — автобусы уже не ходили, пришлось ехать на такси. С прилагательным или результатом — «естественно, что»: 매일 연습하니까 잘할 수밖에 없죠 — каждый день тренируется, конечно, у неё получается.",
    ),
    rules: [
      ["V + (으)ㄹ 수밖에 없다 → 탈 수밖에 없었어요", "Majburiyat: boshqa yo'l yo'q", "Forced: no other way", "Вынужденно: другого пути нет"],
      ["V/A + (으)ㄹ 수밖에 없다 → 비쌀 수밖에 없어요", "Muqarrar natija: tabiiyki", "Inevitable: naturally", "Неизбежно: естественно"],
      ["만들다 → 만들 수밖에", "ㄹ bilan tugagan o'zakka to'g'ridan-to'g'ri 수밖에", "ㄹ-stems add 수밖에 directly", "Основы на ㄹ: сразу 수밖에"],
    ],
    examples: [
      ["막차를 놓쳐서 택시를 탈 수밖에 없었어요.", "Oxirgi avtobusdan qolib, taksiga o'tirishdan boshqa ilojim qolmadi.", "I missed the last bus, so I had no choice but to take a taxi.", "Я опоздал на последний автобус, пришлось ехать на такси."],
      ["재료가 좋으니까 맛있을 수밖에 없어요.", "Masalliqlar yaxshi, mazali bo'lishi tabiiy.", "The ingredients are good, so of course it's delicious.", "Продукты хорошие, так что вкусно — само собой."],
      ["아무도 도와주지 않아서 혼자 할 수밖에 없었다.", "Hech kim yordam bermagani uchun yolg'iz qilishga majbur bo'ldim.", "Nobody helped, so I had to do it alone.", "Никто не помог, пришлось делать одному."],
      ["시내 중심이라서 집값이 비쌀 수밖에 없죠.", "Shahar markazi bo'lgani uchun uy narxi qimmat bo'lishi tabiiy.", "It's in the city centre, so housing is bound to be expensive.", "Это центр города, так что жильё, конечно, дорогое."],
    ],
    mistakes: [
      ["택시를 타는 수밖에 없었어요", "택시를 탈 수밖에 없었어요", t("Har doim (으)ㄹ: 탈 수밖에.", "Always (으)ㄹ: 탈 수밖에.", "Всегда (으)ㄹ: 탈 수밖에.")],
      ["기다릴 수밖에 있었어요", "기다릴 수밖에 없었어요", t("수밖에 dan keyin doim 없다.", "수밖에 is always followed by 없다.", "После 수밖에 всегда 없다.")],
    ],
    quiz: [
      ["돈이 없어서 걸어서 ___ 없었어요. (가다)", ["갈 수밖에", "가는 수밖에"], 0],
      ["매일 연습하니까 ___ 수밖에 없어요. (잘하다)", ["잘할", "잘한"], 0],
      ["다른 방법이 없으니까 ___ 수밖에 없어요. (기다리다)", ["기다릴", "기다려"], 0],
      ["엘리베이터가 고장 나서 계단으로 올라갈 수밖에 ___.", ["없었어요", "있었어요"], 0],
    ],
  }),
  point("expressions", {
    id: "aeo-gada-oda", pattern: "V + 아/어 가다 · V + 아/어 오다",
    title: t("Davomiylik: “… kelmoqda / borayapti” — 아/어 오다/가다", "Continuing over time — 아/어 오다/가다", "Продолжение во времени — 아/어 오다/가다"),
    explain: t(
      "Harakatning vaqt bo'yicha davom etishini bildiradi. 아/어 오다 — o'tmishdan hozirgacha: 10년 동안 한국어를 가르쳐 왔어요 — 10 yildan beri koreys tilini o'qitib kelaman. 아/어 가다 — hozirdan kelajakka yoki tugashga yaqinlashish: 일이 거의 끝나 가요 — ish deyarli tugab qoldi. 가져가다 kabi oddiy harakat fe'llari bilan adashtirmang.",
      "Shows an action continuing over time. 아/어 오다 runs from the past up to now: 10년 동안 한국어를 가르쳐 왔어요 (I have been teaching Korean for 10 years). 아/어 가다 runs from now on, or towards completion: 일이 거의 끝나 가요 (the work is almost done). Don't confuse it with plain motion verbs like 가져가다.",
      "Действие продолжается во времени. 아/어 오다 — из прошлого до сих пор: 10년 동안 한국어를 가르쳐 왔어요 — я 10 лет преподаю корейский. 아/어 가다 — с этого момента дальше или к завершению: 일이 거의 끝나 가요 — работа почти закончена. Не путайте с обычными глаголами движения вроде 가져가다.",
    ),
    rules: [
      ["V + 아/어 왔다 → 가르쳐 왔어요", "O'tmishdan hozirgacha", "From the past up to now", "Из прошлого до сих пор"],
      ["V + 아/어 가다 → 끝나 가요", "Tugashga yaqin", "Nearing an end", "Приближение к концу"],
      ["V + 아/어 갈 것이다 → 해 갈 거예요", "Kelajakda davom ettirish", "Will keep on doing", "Будет продолжать"],
    ],
    examples: [
      ["지금까지 열심히 살아왔어요.", "Shu paytgacha tinmay mehnat qilib yashab keldim.", "I have lived diligently up to now.", "До сих пор я жил, усердно трудясь."],
      ["숙제를 거의 다 해 가요.", "Uy vazifasini deyarli tugatib qoldim.", "I'm almost done with my homework.", "Домашнее задание почти доделал."],
      ["이 회사는 30년 동안 좋은 제품을 만들어 왔습니다.", "Bu kompaniya 30 yildan beri sifatli mahsulot ishlab chiqarib kelmoqda.", "This company has been making good products for 30 years.", "Эта компания 30 лет выпускает качественную продукцию."],
      ["앞으로도 서로 도우면서 살아가요.", "Bundan keyin ham bir-birimizga yordam berib yashaylik.", "Let's keep living by helping each other from now on.", "Давайте и дальше жить, помогая друг другу."],
    ],
    mistakes: [
      ["10년 동안 일해 가요", "10년 동안 일해 왔어요", t("O'tmishdan hozirgacha — 아/어 오다.", "From the past to now use 아/어 오다.", "Из прошлого до сих пор — 아/어 오다.")],
      ["앞으로도 열심히 공부해 왔을 거예요", "앞으로도 열심히 공부해 갈 거예요", t("Kelajak uchun — 아/어 가다.", "For the future use 아/어 가다.", "Для будущего — 아/어 가다.")],
    ],
    quiz: [
      ["5년 동안 이 일을 ___ 왔어요. (하다)", ["해", "하고"], 0],
      ["영화가 거의 끝나 ___. (oxiriga yaqin)", ["가요", "왔어요"], 0],
      ["어릴 때부터 지금까지 그림을 ___. (그리다)", ["그려 왔어요", "그려 가요"], 0],
      ["앞으로도 한국어 공부를 계속해 ___ 거예요.", ["갈", "왔을"], 0],
    ],
  }),
  point("connectors", {
    id: "aseo-geureonji", pattern: "V/A + 아/어서 그런지 · N + (이)라서 그런지",
    title: t("“… bo'lgani uchunmi, …” — 아/어서 그런지", "“Maybe because …” — 아/어서 그런지", "«Может, потому что …» — 아/어서 그런지"),
    explain: t(
      "Sababni aniq emas, taxmin sifatida aytadi: 어제 잠을 못 자서 그런지 머리가 아파요 — kecha uxlay olmaganim uchunmi, boshim og'riyapti. Ot bilan (이)라서 그런지: 주말이라서 그런지 사람이 많아요. 그래서 dan farqi — so'zlovchi sababga to'liq ishonmaydi. Ikkinchi qismda buyruq yoki taklif kelmaydi.",
      "Gives a cause as a guess rather than a certainty: 어제 잠을 못 자서 그런지 머리가 아파요 (maybe because I didn't sleep last night, I have a headache). With nouns use (이)라서 그런지: 주말이라서 그런지 사람이 많아요. Unlike 그래서, the speaker isn't sure about the cause. The second clause can't be a command or suggestion.",
      "Причина в виде предположения: 어제 잠을 못 자서 그런지 머리가 아파요 — может, оттого что не выспался, болит голова. С существительными — (이)라서 그런지: 주말이라서 그런지 사람이 많아요. В отличие от 그래서, говорящий не уверен в причине. Во второй части не бывает приказа или предложения.",
    ),
    rules: [
      ["V/A + 아/어서 그런지 → 못 자서 그런지", "Fe'l / sifat", "Verb / adjective", "Глагол / прилагательное"],
      ["N + (이)라서 그런지 → 주말이라서 그런지", "Ot", "Noun", "Существительное"],
      ["그래서 그런지 …", "Gap boshida: “shuning uchunmi …”", "At the start: “maybe that's why …”", "В начале: «может, поэтому …»"],
    ],
    examples: [
      ["어제 늦게 자서 그런지 피곤해요.", "Kecha kech yotganim uchunmi, charchoqman.", "Maybe because I went to bed late, I'm tired.", "Наверное, оттого что поздно лёг, я устал."],
      ["주말이라서 그런지 공원에 사람이 많네요.", "Dam olish kuni bo'lgani uchunmi, bog'da odam ko'p ekan.", "Maybe because it's the weekend, the park is crowded.", "Может, потому что выходные, в парке много народу."],
      ["날씨가 추워서 그런지 감기에 걸린 사람이 많아요.", "Havo sovuq bo'lgani uchunmi, shamollaganlar ko'p.", "Perhaps because of the cold, many people have colds.", "Наверное, из-за холода многие простудились."],
      ["운동을 시작했어요. 그래서 그런지 요즘 잠을 잘 자요.", "Sportni boshladim. Shuning uchunmi, keyingi paytda yaxshi uxlayapman.", "I started exercising. Maybe that's why I sleep well lately.", "Я начал заниматься спортом. Может, поэтому в последнее время хорошо сплю."],
    ],
    mistakes: [
      ["주말서 그런지 사람이 많아요", "주말이라서 그런지 사람이 많아요", t("Ot bilan (이)라서 그런지.", "Nouns take (이)라서 그런지.", "С существительными — (이)라서 그런지.")],
      ["피곤해서 그런지 일찍 주무세요", "피곤하면 일찍 주무세요", t("그런지 dan keyin buyruq kelmaydi.", "그런지 can't be followed by a command.", "После 그런지 не бывает повелительного наклонения.")],
    ],
    quiz: [
      ["커피를 많이 ___ 그런지 잠이 안 와요. (마시다)", ["마셔서", "마시고"], 0],
      ["방학___ 그런지 학교가 조용해요.", ["이라서", "라서"], 0],
      ["비가 와서 ___ 길이 많이 막혀요.", ["그런지", "그러면"], 0],
      ["휴가___ 그런지 기분이 좋아 보여요.", ["라서", "이라서"], 0],
    ],
  }),
  point("connectors", {
    id: "goja", pattern: "V + 고자 (하다)",
    title: t("“… maqsadida” (rasmiy) — 고자", "“In order to” (formal) — 고자", "«С целью» (офиц.) — 고자"),
    explain: t(
      "Maqsad yoki niyatni rasmiy uslubda bildiradi; nutq, e'lon, maqola va TOPIK 쓰기 54 inshosi uchun qulay: 이 글에서는 환경 문제의 원인을 살펴보고자 한다 — ushbu maqolada ekologik muammolar sabablarini ko'rib chiqmoqchiman. (으)려고 ning rasmiy varianti. Faqat fe'l bilan, ikkala qismda ega bir xil.",
      "Expresses purpose or intention in a formal style, ideal for speeches, notices, articles and the TOPIK Q54 essay: 이 글에서는 환경 문제의 원인을 살펴보고자 한다 (this essay aims to examine the causes of environmental problems). It's the formal counterpart of (으)려고. Verbs only, and both clauses share the same subject.",
      "Цель или намерение в официальном стиле; удобно для речей, объявлений, статей и эссе TOPIK (задание 54): 이 글에서는 환경 문제의 원인을 살펴보고자 한다 — в этой статье я хочу рассмотреть причины экологических проблем. Официальный вариант (으)려고. Только с глаголами, подлежащее в обеих частях одно.",
    ),
    rules: [
      ["V + 고자 → 알리고자 회의를 열었다", "Maqsad: “… maqsadida”", "Purpose: “in order to”", "Цель: «чтобы»"],
      ["V + 고자 하다 → 살펴보고자 한다", "Niyat: “… moqchiman” (rasmiy)", "Intention: “I intend to” (formal)", "Намерение: «намерен» (офиц.)"],
      ["(으)려고 ≈ 고자", "So'zlashuv ↔ rasmiy", "Spoken ↔ formal", "Разговорное ↔ официальное"],
    ],
    examples: [
      ["이 글에서는 저출산 문제의 원인을 살펴보고자 한다.", "Ushbu maqolada tug'ilish kamayishining sabablarini ko'rib chiqmoqchiman.", "This essay aims to examine the causes of the low birth rate.", "В этой статье рассматриваются причины низкой рождаемости."],
      ["새로운 정책을 알리고자 회의를 열었습니다.", "Yangi siyosatni e'lon qilish maqsadida yig'ilish o'tkazdik.", "We held a meeting in order to announce the new policy.", "Мы провели собрание, чтобы сообщить о новой политике."],
      ["한국 문화를 더 깊이 이해하고자 유학을 왔습니다.", "Koreys madaniyatini chuqurroq tushunish maqsadida o'qishga keldim.", "I came to study abroad to understand Korean culture more deeply.", "Я приехал учиться, чтобы глубже понять корейскую культуру."],
      ["고객의 의견을 듣고자 설문 조사를 실시합니다.", "Mijozlar fikrini bilish maqsadida so'rovnoma o'tkazamiz.", "We are conducting a survey to hear customers' opinions.", "Мы проводим опрос, чтобы узнать мнение клиентов."],
    ],
    mistakes: [
      ["날씨가 좋고자 기도했다", "날씨가 좋기를 기도했다", t("Sifat bilan 고자 ishlatilmaydi.", "고자 doesn't attach to adjectives.", "고자 не присоединяется к прилагательным.")],
      ["(do'stga) 밥 먹고자 식당에 가", "밥 먹으려고 식당에 가", t("Kundalik gapda (으)려고 tabiiyroq.", "In casual speech (으)려고 is natural.", "В разговоре естественнее (으)려고.")],
    ],
    quiz: [
      ["이 글에서는 문제의 해결 방안을 ___ 한다. (제시하다)", ["제시하고자", "제시하고서"], 0],
      ["정확한 정보를 ___ 자료를 조사했다. (얻다)", ["얻고자", "얻자마자"], 0],
      ["건강을 ___ 운동을 시작했습니다. (지키다)", ["지키고자", "지키더니"], 0],
      ["여러분께 감사의 말씀을 ___ 합니다. (드리다)", ["드리고자", "드리고서"], 0],
    ],
  }),
  point("connectors", {
    id: "dasipi", pattern: "V + 다시피 · (으)시다시피",
    title: t("“… ganingizdek” — 다시피", "“As you know / see” — 다시피", "«Как вы знаете / видите» — 다시피"),
    explain: t(
      "Suhbatdosh allaqachon bilgan yoki ko'rib turgan narsaga tayanadi: 아시다시피 요즘 경제가 어렵습니다 — bilganingizdek, hozir iqtisod og'ir. Asosan 알다, 보다, 듣다, 느끼다 kabi fe'llar bilan (hurmat: 아시다시피, 보시다시피). 다시피 하다 esa “deyarli … dek” degani: 도서관에서 살다시피 해요 — kutubxonada deyarli yashayapman.",
      "Refers to something the listener already knows or can see: 아시다시피 요즘 경제가 어렵습니다 (as you know, the economy is tough these days). Mostly with 알다, 보다, 듣다, 느끼다 (honorific 아시다시피, 보시다시피). 다시피 하다 means “practically”: 도서관에서 살다시피 해요 (I practically live in the library).",
      "Опирается на то, что собеседник уже знает или видит: 아시다시피 요즘 경제가 어렵습니다 — как вы знаете, сейчас экономике тяжело. Обычно с 알다, 보다, 듣다, 느끼다 (вежливо: 아시다시피, 보시다시피). 다시피 하다 значит «практически»: 도서관에서 살다시피 해요 — я практически живу в библиотеке.",
    ),
    rules: [
      ["알다 → 아시다시피 · 알다시피", "Bilganingizdek (hurmat shaklida ㄹ tushadi)", "As you know (ㄹ drops before 시)", "Как вы знаете (ㄹ выпадает перед 시)"],
      ["보다 → 보시다시피 · 보다시피", "Ko'rib turganingizdek", "As you can see", "Как видите"],
      ["V + 다시피 하다 → 살다시피 하다", "“Deyarli … dek”", "“Practically / almost”", "«Практически, почти»"],
    ],
    examples: [
      ["아시다시피 다음 주부터 시험 기간입니다.", "Bilganingizdek, keyingi haftadan imtihon davri boshlanadi.", "As you know, exam period starts next week.", "Как вы знаете, со следующей недели начинаются экзамены."],
      ["보시다시피 이 방은 햇빛이 잘 들어요.", "Ko'rib turganingizdek, bu xonaga quyosh yaxshi tushadi.", "As you can see, this room gets a lot of sunlight.", "Как видите, в этой комнате много солнца."],
      ["앞에서 말씀드렸다시피 이 문제는 간단하지 않습니다.", "Avval aytganimdek, bu masala oddiy emas.", "As I mentioned earlier, this problem isn't simple.", "Как я уже говорил, эта проблема непростая."],
      ["시험 때문에 일주일 동안 밤을 새우다시피 했어요.", "Imtihon tufayli bir hafta deyarli uxlamadim.", "Because of exams I practically stayed up all week.", "Из-за экзаменов я почти всю неделю не спал."],
    ],
    mistakes: [
      ["알으시다시피", "아시다시피", t("알다 + 시 → 아시 (ㄹ tushadi).", "알다 + 시 → 아시 (ㄹ drops).", "알다 + 시 → 아시 (ㄹ выпадает).")],
      ["좋다시피 이 식당은 유명해요", "아시다시피 이 식당은 유명해요", t("다시피 asosan 알다/보다/듣다 kabi idrok fe'llari bilan, sifat bilan emas.", "다시피 goes with perception verbs like 알다/보다/듣다, not adjectives.", "다시피 — с глаголами восприятия (알다/보다/듣다), не с прилагательными.")],
    ],
    quiz: [
      ["___ 요즘 물가가 많이 올랐어요. (알다, hurmat)", ["아시다시피", "알으시다시피"], 0],
      ["___ 이 제품은 아주 가벼워요. (보다, hurmat)", ["보시다시피", "보시면서"], 0],
      ["뉴스에서 ___ 내일 태풍이 온대요. (듣다, hurmat)", ["들으셨다시피", "듣으셨다시피"], 0],
      ["요즘 회사에서 ___ 해요. (살다, deyarli)", ["살다시피", "살면서"], 0],
    ],
  }),
];
