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
];
