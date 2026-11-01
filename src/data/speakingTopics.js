// Conversation topics for speaking practice. The topic wheel shows them and
// the AI partner (api/speaking-ai.js) talks about the chosen one. Questions
// get harder with the level; `words` are Korean words worth using, linked to
// the lesson vocabulary when they appear there.

export const SPEAKING_LEVELS = ["beginner", "intermediate", "advanced"];
export const LEVEL_ICONS = { beginner: "🌱", intermediate: "📘", advanced: "🎓" };

const q = (ko, uz, en, ru) => ({ ko, uz, en, ru });

export const SPEAKING_TOPICS = [
  // Beginner: short answers, present tense, everyday words.
  {
    id: "intro", level: "beginner", emoji: "👋", ko: "자기소개", uz: "O'zingiz haqingizda", en: "About yourself", ru: "О себе",
    questions: [
      q("이름이 뭐예요?", "Ismingiz nima?", "What is your name?", "Как вас зовут?"),
      q("어느 나라 사람이에요?", "Qaysi davlatdansiz?", "Where are you from?", "Из какой вы страны?"),
      q("무슨 일을 해요?", "Nima ish qilasiz?", "What do you do?", "Чем вы занимаетесь?"),
    ],
    words: ["이름", "나라", "학생", "회사원", "우즈베키스탄"],
  },
  {
    id: "family", level: "beginner", emoji: "👨‍👩‍👧", ko: "가족", uz: "Oila", en: "Family", ru: "Семья",
    questions: [
      q("가족이 몇 명이에요?", "Oilangiz necha kishi?", "How many people are in your family?", "Сколько человек в вашей семье?"),
      q("형제가 있어요?", "Aka-uka yoki opa-singlingiz bormi?", "Do you have brothers or sisters?", "У вас есть братья или сёстры?"),
      q("가족하고 주말에 뭐 해요?", "Dam olish kunlari oilangiz bilan nima qilasiz?", "What do you do with your family on weekends?", "Что вы делаете с семьёй по выходным?"),
    ],
    words: ["가족", "아버지", "어머니", "형", "누나", "동생"],
  },
  {
    id: "food", level: "beginner", emoji: "🍜", ko: "음식", uz: "Ovqat", en: "Food", ru: "Еда",
    questions: [
      q("무슨 음식을 좋아해요?", "Qaysi ovqatni yaxshi ko'rasiz?", "What food do you like?", "Какую еду вы любите?"),
      q("아침에 뭐 먹어요?", "Ertalab nima yeysiz?", "What do you eat in the morning?", "Что вы едите утром?"),
      q("요리를 잘해요?", "Ovqatni yaxshi pishirasizmi?", "Are you good at cooking?", "Вы хорошо готовите?"),
    ],
    words: ["음식", "밥", "빵", "맛있다", "먹다", "요리"],
  },
  {
    id: "weekend", level: "beginner", emoji: "🌤️", ko: "주말", uz: "Dam olish kunlari", en: "Weekend", ru: "Выходные",
    questions: [
      q("주말에 보통 뭐 해요?", "Dam olish kunlari odatda nima qilasiz?", "What do you usually do on weekends?", "Что вы обычно делаете на выходных?"),
      q("어제 뭐 했어요?", "Kecha nima qildingiz?", "What did you do yesterday?", "Что вы делали вчера?"),
      q("이번 주말에 어디에 가요?", "Shu dam olish kunlari qayerga borasiz?", "Where are you going this weekend?", "Куда вы пойдёте в эти выходные?"),
    ],
    words: ["주말", "쉬다", "친구", "영화", "공원"],
  },
  {
    id: "hobby", level: "beginner", emoji: "🎨", ko: "취미", uz: "Qiziqishlar", en: "Hobbies", ru: "Хобби",
    questions: [
      q("취미가 뭐예요?", "Qiziqishingiz nima?", "What is your hobby?", "Какое у вас хобби?"),
      q("운동을 좋아해요?", "Sportni yaxshi ko'rasizmi?", "Do you like sports?", "Вы любите спорт?"),
      q("시간이 있을 때 뭐 해요?", "Bo'sh vaqtingizda nima qilasiz?", "What do you do in your free time?", "Что вы делаете в свободное время?"),
    ],
    words: ["취미", "운동", "노래", "책", "그림"],
  },
  {
    id: "weather", level: "beginner", emoji: "☀️", ko: "날씨", uz: "Ob-havo", en: "Weather", ru: "Погода",
    questions: [
      q("오늘 날씨가 어때요?", "Bugun ob-havo qanday?", "How is the weather today?", "Какая сегодня погода?"),
      q("더운 날씨를 좋아해요, 추운 날씨를 좋아해요?", "Issiq havoni yaxshi ko'rasizmi yoki sovuqni?", "Do you like hot or cold weather?", "Вы любите жару или холод?"),
      q("비가 오면 뭐 해요?", "Yomg'ir yog'sa nima qilasiz?", "What do you do when it rains?", "Что вы делаете, когда идёт дождь?"),
    ],
    words: ["날씨", "덥다", "춥다", "비", "눈"],
  },
  {
    id: "school", level: "beginner", emoji: "🏫", ko: "학교", uz: "Maktab va o'qish", en: "School", ru: "Учёба",
    questions: [
      q("학교에 다녀요?", "O'qiysizmi?", "Do you go to school?", "Вы учитесь?"),
      q("무슨 과목을 좋아해요?", "Qaysi fanni yaxshi ko'rasiz?", "Which subject do you like?", "Какой предмет вам нравится?"),
      q("한국어 수업이 재미있어요?", "Koreys tili darsi qiziqmi?", "Is your Korean class fun?", "Вам интересно на уроках корейского?"),
    ],
    words: ["학교", "선생님", "공부하다", "수업", "숙제"],
  },
  {
    id: "routine", level: "beginner", emoji: "⏰", ko: "하루 일과", uz: "Kun tartibi", en: "Daily routine", ru: "Распорядок дня",
    questions: [
      q("보통 몇 시에 일어나요?", "Odatda soat nechada turasiz?", "What time do you usually get up?", "Во сколько вы обычно встаёте?"),
      q("오후에 뭐 해요?", "Tushdan keyin nima qilasiz?", "What do you do in the afternoon?", "Что вы делаете днём?"),
      q("몇 시에 자요?", "Soat nechada uxlaysiz?", "What time do you go to bed?", "Во сколько вы ложитесь спать?"),
    ],
    words: ["일어나다", "자다", "아침", "저녁", "시"],
  },
  {
    id: "shopping", level: "beginner", emoji: "🛍️", ko: "쇼핑", uz: "Xarid", en: "Shopping", ru: "Покупки",
    questions: [
      q("어디에서 쇼핑해요?", "Qayerda xarid qilasiz?", "Where do you go shopping?", "Где вы делаете покупки?"),
      q("오늘 뭘 사고 싶어요?", "Bugun nima sotib olmoqchisiz?", "What do you want to buy today?", "Что вы хотите купить сегодня?"),
      q("이 옷은 얼마예요?", "Bu kiyim qancha turadi?", "How much are these clothes?", "Сколько стоит эта одежда?"),
    ],
    words: ["사다", "시장", "옷", "얼마", "비싸다", "싸다"],
  },
  {
    id: "home", level: "beginner", emoji: "🏠", ko: "우리 집", uz: "Uyim", en: "My home", ru: "Мой дом",
    questions: [
      q("집이 어디에 있어요?", "Uyingiz qayerda?", "Where is your home?", "Где ваш дом?"),
      q("집에 방이 몇 개 있어요?", "Uyingizda nechta xona bor?", "How many rooms does your home have?", "Сколько комнат в вашем доме?"),
      q("집에서 어디를 제일 좋아해요?", "Uyda qaysi joyni eng yaxshi ko'rasiz?", "Which place at home do you like most?", "Какое место дома вы любите больше всего?"),
    ],
    words: ["집", "방", "부엌", "창문", "가깝다"],
  },
  {
    id: "friends", level: "beginner", emoji: "🤝", ko: "친구", uz: "Do'stlar", en: "Friends", ru: "Друзья",
    questions: [
      q("친한 친구가 있어요?", "Yaqin do'stingiz bormi?", "Do you have a close friend?", "У вас есть близкий друг?"),
      q("친구하고 같이 뭐 해요?", "Do'stingiz bilan nima qilasiz?", "What do you do with your friends?", "Что вы делаете с друзьями?"),
      q("친구는 어떤 사람이에요?", "Do'stingiz qanday odam?", "What kind of person is your friend?", "Какой человек ваш друг?"),
    ],
    words: ["친구", "같이", "만나다", "재미있다", "착하다"],
  },
  {
    id: "birthday", level: "beginner", emoji: "🎂", ko: "생일", uz: "Tug'ilgan kun", en: "Birthdays", ru: "День рождения",
    questions: [
      q("생일이 언제예요?", "Tug'ilgan kuningiz qachon?", "When is your birthday?", "Когда у вас день рождения?"),
      q("생일에 보통 뭐 해요?", "Tug'ilgan kuningizda odatda nima qilasiz?", "What do you usually do on your birthday?", "Что вы обычно делаете в день рождения?"),
      q("무슨 선물을 받고 싶어요?", "Qanday sovg'a olishni xohlaysiz?", "What present would you like?", "Какой подарок вы хотите получить?"),
    ],
    words: ["생일", "선물", "케이크", "축하하다", "월"],
  },
  {
    id: "transport", level: "beginner", emoji: "🚌", ko: "교통", uz: "Transport", en: "Getting around", ru: "Транспорт",
    questions: [
      q("학교나 회사에 어떻게 가요?", "O'qishga yoki ishga qanday borasiz?", "How do you get to school or work?", "Как вы добираетесь до учёбы или работы?"),
      q("시간이 얼마나 걸려요?", "Qancha vaqt ketadi?", "How long does it take?", "Сколько времени это занимает?"),
      q("버스를 좋아해요, 지하철을 좋아해요?", "Avtobusni yaxshi ko'rasizmi yoki metroni?", "Do you prefer the bus or the subway?", "Вы предпочитаете автобус или метро?"),
    ],
    words: ["버스", "지하철", "택시", "걸리다", "타다"],
  },
  {
    id: "seasons", level: "beginner", emoji: "🍂", ko: "계절", uz: "Fasllar", en: "Seasons", ru: "Времена года",
    questions: [
      q("무슨 계절을 좋아해요?", "Qaysi faslni yaxshi ko'rasiz?", "Which season do you like?", "Какое время года вам нравится?"),
      q("우즈베키스탄의 여름은 어때요?", "O'zbekistonda yoz qanday?", "What is summer like in Uzbekistan?", "Какое лето в Узбекистане?"),
      q("겨울에 뭐 해요?", "Qishda nima qilasiz?", "What do you do in winter?", "Что вы делаете зимой?"),
    ],
    words: ["봄", "여름", "가을", "겨울", "계절"],
  },
  {
    id: "clothes", level: "beginner", emoji: "👕", ko: "옷", uz: "Kiyim", en: "Clothes", ru: "Одежда",
    questions: [
      q("오늘 무슨 옷을 입었어요?", "Bugun qanday kiyim kiydingiz?", "What are you wearing today?", "Что вы сегодня надели?"),
      q("무슨 색을 좋아해요?", "Qaysi rangni yaxshi ko'rasiz?", "What colour do you like?", "Какой цвет вам нравится?"),
      q("편한 옷을 좋아해요?", "Qulay kiyimni yaxshi ko'rasizmi?", "Do you like comfortable clothes?", "Вы любите удобную одежду?"),
    ],
    words: ["옷", "입다", "색", "바지", "신발"],
  },

  // Intermediate: past and future, reasons, opinions.
  {
    id: "travel", level: "intermediate", emoji: "✈️", ko: "여행", uz: "Sayohat", en: "Travel", ru: "Путешествия",
    questions: [
      q("가장 가고 싶은 나라가 어디예요?", "Eng ko'p qaysi davlatga borishni xohlaysiz?", "Which country do you most want to visit?", "В какую страну вы больше всего хотите поехать?"),
      q("기억에 남는 여행이 있어요?", "Esda qolgan sayohatingiz bormi?", "Do you have a memorable trip?", "У вас есть запомнившаяся поездка?"),
      q("여행할 때 누구하고 같이 가요?", "Sayohatga kim bilan borasiz?", "Who do you travel with?", "С кем вы путешествуете?"),
    ],
    words: ["여행", "비행기", "호텔", "구경하다", "사진"],
  },
  {
    id: "korean-food", level: "intermediate", emoji: "🥘", ko: "한국 음식", uz: "Koreys taomlari", en: "Korean food", ru: "Корейская еда",
    questions: [
      q("한국 음식을 먹어 봤어요?", "Koreys taomini tatib ko'rganmisiz?", "Have you tried Korean food?", "Вы пробовали корейскую еду?"),
      q("김치는 어때요? 매워요?", "Kimchi qanday? Achchiqmi?", "How is kimchi? Is it spicy?", "Как вам кимчи? Острое?"),
      q("우즈베키스탄 음식 중에서 한국 사람에게 뭘 추천하고 싶어요?", "O'zbek taomlaridan koreyslarga qaysi birini tavsiya qilardingiz?", "Which Uzbek dish would you recommend to Koreans?", "Какое узбекское блюдо вы бы посоветовали корейцам?"),
    ],
    words: ["김치", "비빔밥", "맵다", "추천하다", "맛"],
  },
  {
    id: "drama", level: "intermediate", emoji: "🎬", ko: "드라마와 영화", uz: "Doramalar va kino", en: "Dramas and films", ru: "Дорамы и кино",
    questions: [
      q("한국 드라마를 자주 봐요?", "Koreys doramalarini tez-tez ko'rasizmi?", "Do you often watch Korean dramas?", "Вы часто смотрите корейские дорамы?"),
      q("제일 좋아하는 드라마는 뭐예요? 왜요?", "Eng sevimli doramangiz qaysi? Nega?", "What is your favourite drama? Why?", "Какая ваша любимая дорама? Почему?"),
      q("드라마로 한국어를 공부할 수 있어요?", "Doramalar orqali koreys tilini o'rgansa bo'ladimi?", "Can you learn Korean from dramas?", "Можно ли учить корейский по дорамам?"),
    ],
    words: ["드라마", "영화", "배우", "재미있다", "자막"],
  },
  {
    id: "music", level: "intermediate", emoji: "🎵", ko: "음악", uz: "Musiqa", en: "Music", ru: "Музыка",
    questions: [
      q("어떤 음악을 자주 들어요?", "Qanday musiqani tez-tez tinglaysiz?", "What music do you often listen to?", "Какую музыку вы часто слушаете?"),
      q("좋아하는 가수가 있어요?", "Sevimli qo'shiqchingiz bormi?", "Do you have a favourite singer?", "У вас есть любимый певец?"),
      q("노래방에 가 본 적이 있어요?", "Karaoke'ga borganmisiz?", "Have you ever been to karaoke?", "Вы когда-нибудь были в караоке?"),
    ],
    words: ["음악", "가수", "노래", "듣다", "노래방"],
  },
  {
    id: "work", level: "intermediate", emoji: "💼", ko: "일과 직장", uz: "Ish", en: "Work", ru: "Работа",
    questions: [
      q("지금 무슨 일을 하고 있어요?", "Hozir qanday ish qilyapsiz?", "What work are you doing now?", "Чем вы сейчас занимаетесь?"),
      q("일이 힘들어요, 재미있어요?", "Ishingiz og'irmi yoki qiziqmi?", "Is your work hard or interesting?", "Ваша работа трудная или интересная?"),
      q("어떤 회사에서 일하고 싶어요?", "Qanday kompaniyada ishlashni xohlaysiz?", "What kind of company would you like to work for?", "В какой компании вы хотели бы работать?"),
    ],
    words: ["일", "회사", "직장", "월급", "힘들다"],
  },
  {
    id: "learning-korean", level: "intermediate", emoji: "📚", ko: "한국어 공부", uz: "Koreys tilini o'rganish", en: "Learning Korean", ru: "Изучение корейского",
    questions: [
      q("언제부터 한국어를 공부했어요?", "Koreys tilini qachondan beri o'rganyapsiz?", "Since when have you studied Korean?", "С какого времени вы учите корейский?"),
      q("한국어를 왜 배우고 있어요?", "Koreys tilini nima uchun o'rganyapsiz?", "Why are you learning Korean?", "Почему вы учите корейский?"),
      q("한국어에서 뭐가 제일 어려워요?", "Koreys tilida eng qiyini nima?", "What is the hardest part of Korean?", "Что самое трудное в корейском?"),
    ],
    words: ["한국어", "배우다", "어렵다", "문법", "발음"],
  },
  {
    id: "health", level: "intermediate", emoji: "💪", ko: "건강", uz: "Sog'liq", en: "Health", ru: "Здоровье",
    questions: [
      q("건강을 위해서 뭘 해요?", "Sog'lig'ingiz uchun nima qilasiz?", "What do you do for your health?", "Что вы делаете для здоровья?"),
      q("아플 때 보통 어떻게 해요?", "Kasal bo'lganda odatda nima qilasiz?", "What do you usually do when you are sick?", "Что вы обычно делаете, когда болеете?"),
      q("잠을 충분히 자요?", "Yetarlicha uxlaysizmi?", "Do you get enough sleep?", "Вы достаточно спите?"),
    ],
    words: ["건강", "병원", "약", "아프다", "운동하다"],
  },
  {
    id: "city-village", level: "intermediate", emoji: "🏙️", ko: "도시와 시골", uz: "Shahar va qishloq", en: "City and countryside", ru: "Город и деревня",
    questions: [
      q("도시에 살아요, 시골에 살아요?", "Shaharda yashaysizmi yoki qishloqda?", "Do you live in a city or the countryside?", "Вы живёте в городе или в деревне?"),
      q("도시 생활의 좋은 점은 뭐예요?", "Shahar hayotining yaxshi tomoni nima?", "What is good about city life?", "Чем хороша городская жизнь?"),
      q("나중에 어디에서 살고 싶어요?", "Kelajakda qayerda yashashni xohlaysiz?", "Where would you like to live later?", "Где вы хотели бы жить в будущем?"),
    ],
    words: ["도시", "시골", "조용하다", "복잡하다", "살다"],
  },
  {
    id: "holidays", level: "intermediate", emoji: "🎉", ko: "명절", uz: "Bayramlar", en: "Holidays", ru: "Праздники",
    questions: [
      q("우즈베키스탄에서 제일 큰 명절은 뭐예요?", "O'zbekistonda eng katta bayram qaysi?", "What is the biggest holiday in Uzbekistan?", "Какой самый большой праздник в Узбекистане?"),
      q("나브루즈에 보통 뭐 해요?", "Navro'zda odatda nima qilasiz?", "What do you usually do for Navruz?", "Что вы обычно делаете на Навруз?"),
      q("한국의 추석에 대해 알아요?", "Koreyadagi Chuseok haqida bilasizmi?", "Do you know about Chuseok in Korea?", "Вы знаете о корейском Чхусоке?"),
    ],
    words: ["명절", "추석", "설날", "음식", "가족"],
  },
  {
    id: "restaurant", level: "intermediate", emoji: "🍽️", ko: "식당에서", uz: "Restoranda", en: "At a restaurant", ru: "В ресторане",
    questions: [
      q("식당에서 어떻게 주문해요?", "Restoranda qanday buyurtma berasiz?", "How do you order at a restaurant?", "Как вы делаете заказ в ресторане?"),
      q("자주 가는 식당이 있어요?", "Tez-tez boradigan restoraningiz bormi?", "Is there a restaurant you go to often?", "Есть ресторан, куда вы часто ходите?"),
      q("음식이 마음에 안 들면 어떻게 해요?", "Ovqat yoqmasa nima qilasiz?", "What do you do if you don't like the food?", "Что вы делаете, если еда не понравилась?"),
    ],
    words: ["식당", "주문하다", "메뉴", "계산하다", "맛있다"],
  },
  {
    id: "phone", level: "intermediate", emoji: "📱", ko: "휴대폰과 인터넷", uz: "Telefon va internet", en: "Phones and the internet", ru: "Телефон и интернет",
    questions: [
      q("하루에 휴대폰을 몇 시간 써요?", "Kuniga necha soat telefondan foydalanasiz?", "How many hours a day do you use your phone?", "Сколько часов в день вы пользуетесь телефоном?"),
      q("휴대폰 없이 살 수 있어요?", "Telefonsiz yashay olasizmi?", "Could you live without a phone?", "Вы могли бы жить без телефона?"),
      q("자주 쓰는 앱은 뭐예요?", "Qaysi ilovadan ko'p foydalanasiz?", "Which app do you use most?", "Каким приложением вы пользуетесь чаще всего?"),
    ],
    words: ["휴대폰", "인터넷", "앱", "사용하다", "시간"],
  },
  {
    id: "sports", level: "intermediate", emoji: "⚽", ko: "운동", uz: "Sport", en: "Sports", ru: "Спорт",
    questions: [
      q("어떤 운동을 해 봤어요?", "Qanday sport turlari bilan shug'ullangansiz?", "What sports have you tried?", "Какими видами спорта вы занимались?"),
      q("축구를 보는 것을 좋아해요?", "Futbol ko'rishni yaxshi ko'rasizmi?", "Do you like watching football?", "Вы любите смотреть футбол?"),
      q("일주일에 몇 번 운동해요?", "Haftada necha marta sport qilasiz?", "How many times a week do you exercise?", "Сколько раз в неделю вы занимаетесь спортом?"),
    ],
    words: ["축구", "수영", "운동하다", "경기", "이기다"],
  },
  {
    id: "dream-job", level: "intermediate", emoji: "🌟", ko: "꿈", uz: "Orzular", en: "Dreams", ru: "Мечты",
    questions: [
      q("어렸을 때 꿈이 뭐였어요?", "Bolaligingizda orzuingiz nima edi?", "What was your dream as a child?", "О чём вы мечтали в детстве?"),
      q("지금 꿈은 뭐예요?", "Hozir orzuingiz nima?", "What is your dream now?", "О чём вы мечтаете сейчас?"),
      q("꿈을 이루기 위해서 뭘 하고 있어요?", "Orzuingizga erishish uchun nima qilyapsiz?", "What are you doing to reach your dream?", "Что вы делаете, чтобы осуществить мечту?"),
    ],
    words: ["꿈", "되다", "노력하다", "미래", "직업"],
  },
  {
    id: "childhood", level: "intermediate", emoji: "🧸", ko: "어린 시절", uz: "Bolalik", en: "Childhood", ru: "Детство",
    questions: [
      q("어렸을 때 어디에서 살았어요?", "Bolaligingizda qayerda yashagansiz?", "Where did you live as a child?", "Где вы жили в детстве?"),
      q("어렸을 때 뭘 하면서 놀았어요?", "Bolaligingizda nima o'ynagansiz?", "What did you play as a child?", "Во что вы играли в детстве?"),
      q("어린 시절의 좋은 추억을 이야기해 주세요.", "Bolaligingizdagi yaxshi xotirani aytib bering.", "Tell me a good childhood memory.", "Расскажите хорошее воспоминание из детства."),
    ],
    words: ["어리다", "놀다", "추억", "시절", "고향"],
  },
  {
    id: "future-plans", level: "intermediate", emoji: "🗓️", ko: "앞으로의 계획", uz: "Kelajak rejalari", en: "Future plans", ru: "Планы на будущее",
    questions: [
      q("올해 계획이 뭐예요?", "Bu yilgi rejangiz nima?", "What are your plans for this year?", "Какие у вас планы на этот год?"),
      q("한국에 갈 계획이 있어요?", "Koreyaga borish rejangiz bormi?", "Do you plan to go to Korea?", "Вы планируете поехать в Корею?"),
      q("5년 후에 뭘 하고 있을 것 같아요?", "5 yildan keyin nima qilayotgan bo'lasiz deb o'ylaysiz?", "What do you think you will be doing in 5 years?", "Чем, по-вашему, вы будете заниматься через 5 лет?"),
    ],
    words: ["계획", "올해", "나중에", "준비하다", "목표"],
  },

  // Advanced: opinions, comparison, longer answers.
  {
    id: "life-in-korea", level: "advanced", emoji: "🇰🇷", ko: "한국 생활", uz: "Koreyada yashash", en: "Life in Korea", ru: "Жизнь в Корее",
    questions: [
      q("한국에서 살면 뭐가 제일 좋을 것 같아요?", "Koreyada yashashning eng yaxshi tomoni nima bo'ladi deb o'ylaysiz?", "What do you think would be best about living in Korea?", "Что, по-вашему, лучше всего в жизни в Корее?"),
      q("외국에서 살 때 어떤 어려움이 있을까요?", "Chet elda yashaganda qanday qiyinchiliklar bo'lishi mumkin?", "What difficulties might there be when living abroad?", "Какие трудности могут быть при жизни за границей?"),
      q("한국 사람들의 생활 방식에 대해 어떻게 생각해요?", "Koreyslarning turmush tarzi haqida nima deb o'ylaysiz?", "What do you think about Koreans' way of life?", "Что вы думаете об образе жизни корейцев?"),
    ],
    words: ["생활", "외국", "적응하다", "문화", "어려움"],
  },
  {
    id: "working-in-korea", level: "advanced", emoji: "🏭", ko: "한국에서 일하기", uz: "Koreyada ishlash", en: "Working in Korea", ru: "Работа в Корее",
    questions: [
      q("한국에서 일하고 싶은 이유가 뭐예요?", "Koreyada ishlashni xohlashingiz sababi nima?", "Why do you want to work in Korea?", "Почему вы хотите работать в Корее?"),
      q("직장에서 한국어가 왜 중요하다고 생각해요?", "Ish joyida koreys tili nega muhim deb o'ylaysiz?", "Why do you think Korean matters at work?", "Почему, по-вашему, корейский важен на работе?"),
      q("동료와 문제가 생기면 어떻게 해결하겠어요?", "Hamkasbingiz bilan muammo chiqsa, uni qanday hal qilasiz?", "How would you solve a problem with a coworker?", "Как бы вы решили проблему с коллегой?"),
    ],
    words: ["동료", "해결하다", "안전", "규칙", "중요하다"],
  },
  {
    id: "topik", level: "advanced", emoji: "📝", ko: "토픽 준비", uz: "TOPIK'ka tayyorlanish", en: "Preparing for TOPIK", ru: "Подготовка к TOPIK",
    questions: [
      q("토픽 시험을 어떻게 준비하고 있어요?", "TOPIK imtihoniga qanday tayyorlanyapsiz?", "How are you preparing for TOPIK?", "Как вы готовитесь к TOPIK?"),
      q("듣기와 읽기 중에서 뭐가 더 어려워요?", "Tinglash va o'qishdan qaysi biri qiyinroq?", "Which is harder, listening or reading?", "Что труднее, аудирование или чтение?"),
      q("시험 전에 스트레스를 어떻게 풀어요?", "Imtihon oldidan stressni qanday yengasiz?", "How do you relieve stress before an exam?", "Как вы снимаете стресс перед экзаменом?"),
    ],
    words: ["시험", "준비하다", "듣기", "읽기", "합격하다"],
  },
  {
    id: "culture", level: "advanced", emoji: "🌏", ko: "문화 차이", uz: "Madaniy farqlar", en: "Cultural differences", ru: "Культурные различия",
    questions: [
      q("한국 문화와 우즈베키스탄 문화의 비슷한 점은 뭐예요?", "Koreys va o'zbek madaniyatining o'xshash tomoni nima?", "What do Korean and Uzbek cultures have in common?", "Что общего у корейской и узбекской культур?"),
      q("다른 점 중에서 제일 놀라웠던 것은 뭐예요?", "Farqlardan sizni eng ko'p hayratlantirgani nima?", "Which difference surprised you most?", "Какое различие удивило вас больше всего?"),
      q("어른을 존경하는 문화에 대해 어떻게 생각해요?", "Kattalarni hurmat qilish madaniyati haqida nima deb o'ylaysiz?", "What do you think about the culture of respecting elders?", "Что вы думаете о культуре уважения к старшим?"),
    ],
    words: ["문화", "차이", "비슷하다", "존경하다", "어른"],
  },
  {
    id: "technology", level: "advanced", emoji: "🤖", ko: "기술과 인공지능", uz: "Texnologiya va sun'iy intellekt", en: "Technology and AI", ru: "Технологии и ИИ",
    questions: [
      q("인공지능이 우리 생활을 어떻게 바꾸고 있어요?", "Sun'iy intellekt hayotimizni qanday o'zgartiryapti?", "How is AI changing our lives?", "Как ИИ меняет нашу жизнь?"),
      q("기술이 발전하면 어떤 직업이 없어질까요?", "Texnologiya rivojlansa, qaysi kasblar yo'qolishi mumkin?", "Which jobs may disappear as technology develops?", "Какие профессии могут исчезнуть с развитием технологий?"),
      q("기술의 좋은 점과 나쁜 점을 말해 보세요.", "Texnologiyaning yaxshi va yomon tomonlarini aytib bering.", "Talk about the good and bad sides of technology.", "Расскажите о плюсах и минусах технологий."),
    ],
    words: ["기술", "인공지능", "발전하다", "편리하다", "위험하다"],
  },
  {
    id: "environment", level: "advanced", emoji: "🌱", ko: "환경", uz: "Atrof-muhit", en: "The environment", ru: "Окружающая среда",
    questions: [
      q("요즘 가장 심각한 환경 문제는 뭐라고 생각해요?", "Hozir eng jiddiy ekologik muammo nima deb o'ylaysiz?", "What do you think is the most serious environmental problem today?", "Какая экологическая проблема сейчас самая серьёзная?"),
      q("환경을 위해서 개인이 할 수 있는 일은 뭐예요?", "Atrof-muhit uchun har bir inson nima qila oladi?", "What can individuals do for the environment?", "Что каждый человек может сделать для природы?"),
      q("우즈베키스탄의 물 문제에 대해 들어 봤어요?", "O'zbekistondagi suv muammosi haqida eshitganmisiz?", "Have you heard about water problems in Uzbekistan?", "Вы слышали о проблемах с водой в Узбекистане?"),
    ],
    words: ["환경", "문제", "쓰레기", "줄이다", "보호하다"],
  },
  {
    id: "education", level: "advanced", emoji: "🎓", ko: "교육", uz: "Ta'lim", en: "Education", ru: "Образование",
    questions: [
      q("좋은 선생님은 어떤 사람이라고 생각해요?", "Yaxshi o'qituvchi qanday bo'lishi kerak deb o'ylaysiz?", "What makes a good teacher, in your opinion?", "Каким, по-вашему, должен быть хороший учитель?"),
      q("온라인 수업과 교실 수업 중에서 뭐가 더 효과적이에요?", "Onlayn dars va sinfdagi darsdan qaysi biri samaraliroq?", "Which is more effective, online or classroom lessons?", "Что эффективнее, онлайн-уроки или занятия в классе?"),
      q("한국의 교육 제도에 대해 알고 있는 것이 있어요?", "Koreya ta'lim tizimi haqida nimalarni bilasiz?", "What do you know about Korea's education system?", "Что вы знаете о системе образования в Корее?"),
    ],
    words: ["교육", "효과적이다", "제도", "대학교", "경쟁"],
  },
  {
    id: "social-media", level: "advanced", emoji: "💬", ko: "소셜 미디어", uz: "Ijtimoiy tarmoqlar", en: "Social media", ru: "Соцсети",
    questions: [
      q("소셜 미디어가 사람들의 관계에 어떤 영향을 줘요?", "Ijtimoiy tarmoqlar odamlar munosabatiga qanday ta'sir qiladi?", "How does social media affect relationships?", "Как соцсети влияют на отношения?"),
      q("가짜 뉴스를 어떻게 구별할 수 있어요?", "Yolg'on yangiliklarni qanday ajratish mumkin?", "How can you tell fake news?", "Как отличить фейковые новости?"),
      q("인터넷에서 개인 정보를 어떻게 지켜요?", "Internetda shaxsiy ma'lumotlaringizni qanday himoya qilasiz?", "How do you protect your personal data online?", "Как вы защищаете личные данные в интернете?"),
    ],
    words: ["영향", "관계", "정보", "지키다", "뉴스"],
  },
  {
    id: "money", level: "advanced", emoji: "💰", ko: "돈과 저축", uz: "Pul va jamg'arma", en: "Money and saving", ru: "Деньги и сбережения",
    questions: [
      q("돈을 모으는 좋은 방법이 뭐라고 생각해요?", "Pul yig'ishning yaxshi usuli nima deb o'ylaysiz?", "What do you think is a good way to save money?", "Какой, по-вашему, хороший способ копить деньги?"),
      q("돈이 많으면 행복할까요?", "Pul ko'p bo'lsa, baxtli bo'ladimi?", "Does having a lot of money make you happy?", "Делают ли большие деньги счастливым?"),
      q("최근에 산 물건 중에서 후회한 것이 있어요?", "Yaqinda sotib olgan narsalaringizdan afsuslanganingiz bormi?", "Have you regretted anything you bought recently?", "Вы жалели о какой-нибудь недавней покупке?"),
    ],
    words: ["저축하다", "모으다", "행복하다", "후회하다", "소비"],
  },
  {
    id: "success", level: "advanced", emoji: "🏆", ko: "성공", uz: "Muvaffaqiyat", en: "Success", ru: "Успех",
    questions: [
      q("성공이란 무엇이라고 생각해요?", "Muvaffaqiyat nima deb o'ylaysiz?", "What does success mean to you?", "Что для вас значит успех?"),
      q("실패에서 배운 것이 있어요?", "Muvaffaqiyatsizlikdan biror narsa o'rganganmisiz?", "Have you learned something from failure?", "Вы чему-нибудь научились на неудаче?"),
      q("존경하는 사람은 누구예요? 왜요?", "Kimni hurmat qilasiz? Nega?", "Who do you respect? Why?", "Кого вы уважаете? Почему?"),
    ],
    words: ["성공", "실패", "노력", "경험", "목표"],
  },
  {
    id: "stress", level: "advanced", emoji: "🧘", ko: "스트레스", uz: "Stress", en: "Stress", ru: "Стресс",
    questions: [
      q("요즘 스트레스를 받는 일이 있어요?", "Hozir sizni stressga soladigan narsa bormi?", "Is anything stressing you these days?", "Вас сейчас что-нибудь напрягает?"),
      q("스트레스를 풀기 위해서 뭘 해요?", "Stressni yengish uchun nima qilasiz?", "What do you do to relieve stress?", "Что вы делаете, чтобы снять стресс?"),
      q("일과 쉬는 시간의 균형이 왜 중요해요?", "Ish va dam olish o'rtasidagi muvozanat nega muhim?", "Why is work-life balance important?", "Почему важен баланс работы и отдыха?"),
    ],
    words: ["스트레스", "풀다", "균형", "쉬다", "마음"],
  },
  {
    id: "tradition", level: "advanced", emoji: "🏯", ko: "전통과 현대", uz: "An'ana va zamonaviylik", en: "Tradition and modern life", ru: "Традиции и современность",
    questions: [
      q("지켜야 하는 전통이 있다고 생각해요?", "Saqlab qolish kerak bo'lgan an'analar bor deb o'ylaysizmi?", "Are there traditions we should keep?", "Есть ли традиции, которые нужно сохранить?"),
      q("젊은 세대와 부모 세대는 어떻게 달라요?", "Yoshlar va ota-onalar avlodi qanday farq qiladi?", "How do young people differ from their parents' generation?", "Чем молодёжь отличается от поколения родителей?"),
      q("우즈베키스탄의 결혼식 문화를 설명해 주세요.", "O'zbek to'y madaniyatini tushuntirib bering.", "Describe Uzbek wedding culture.", "Опишите узбекскую свадебную культуру."),
    ],
    words: ["전통", "현대", "세대", "결혼식", "지키다"],
  },
  {
    id: "memorable-trip", level: "advanced", emoji: "🗺️", ko: "잊을 수 없는 경험", uz: "Unutilmas voqea", en: "An unforgettable experience", ru: "Незабываемый опыт",
    questions: [
      q("잊을 수 없는 경험을 이야기해 주세요.", "Unutilmas voqeangizni aytib bering.", "Tell me about an unforgettable experience.", "Расскажите о незабываемом событии."),
      q("그 경험을 통해서 뭘 배웠어요?", "Bu voqeadan nimani o'rgandingiz?", "What did you learn from it?", "Чему вас это научило?"),
      q("다시 할 수 있다면 다르게 하고 싶은 것이 있어요?", "Qayta qila olsangiz, nimani boshqacha qilgan bo'lardingiz?", "If you could do it again, what would you do differently?", "Если бы можно было повторить, что бы вы сделали иначе?"),
    ],
    words: ["경험", "잊다", "배우다", "다르다", "기억"],
  },
  {
    id: "teamwork", level: "advanced", emoji: "🤜", ko: "협력과 리더십", uz: "Jamoa va yetakchilik", en: "Teamwork and leadership", ru: "Командная работа и лидерство",
    questions: [
      q("팀으로 일할 때 가장 중요한 것은 뭐예요?", "Jamoada ishlaganda eng muhimi nima?", "What matters most when working in a team?", "Что важнее всего при работе в команде?"),
      q("좋은 리더는 어떤 사람이에요?", "Yaxshi yetakchi qanday odam?", "What makes a good leader?", "Каким должен быть хороший лидер?"),
      q("의견이 다를 때 어떻게 합의해요?", "Fikrlar har xil bo'lganda qanday kelishasiz?", "How do you reach agreement when opinions differ?", "Как вы договариваетесь, когда мнения расходятся?"),
    ],
    words: ["협력하다", "의견", "리더", "책임", "합의하다"],
  },
];

export function getSpeakingTopic(id) {
  return SPEAKING_TOPICS.find((topic) => topic.id === id) || null;
}

export function topicsForLevel(level) {
  return level ? SPEAKING_TOPICS.filter((topic) => topic.level === level) : SPEAKING_TOPICS;
}

// Title or question text in the interface language, falling back to Uzbek.
export function localized(item, language) {
  return item[language] || item.uz;
}
