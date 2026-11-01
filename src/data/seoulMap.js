// The learner's journey through Seoul: one place per lesson, from the airport
// to the 63 Building. A place is "visited" once its lesson is mostly learned.

export const SEOUL_PLACES = [
  { lesson: 1, emoji: "✈️", ko: "인천공항", en: "Incheon Airport", uz: "Incheon aeroporti", ru: "Аэропорт Инчхон" },
  { lesson: 2, emoji: "🚉", ko: "서울역", en: "Seoul Station", uz: "Seul vokzali", ru: "Сеульский вокзал" },
  { lesson: 3, emoji: "🏯", ko: "경복궁", en: "Gyeongbokgung Palace", uz: "Gyeongbokgung saroyi", ru: "Дворец Кёнбоккун" },
  { lesson: 4, emoji: "🏘️", ko: "북촌 한옥마을", en: "Bukchon Hanok Village", uz: "Bukchon xanok qishlog'i", ru: "Деревня Пукчон" },
  { lesson: 5, emoji: "🎎", ko: "인사동", en: "Insadong", uz: "Insadong", ru: "Инсадон" },
  { lesson: 6, emoji: "🛍️", ko: "명동", en: "Myeongdong", uz: "Myeongdong", ru: "Мёндон" },
  { lesson: 7, emoji: "🗼", ko: "남산 서울타워", en: "N Seoul Tower", uz: "N Seul minorasi", ru: "Башня N Сеул" },
  { lesson: 8, emoji: "🏮", ko: "남대문시장", en: "Namdaemun Market", uz: "Namdaemun bozori", ru: "Рынок Намдэмун" },
  { lesson: 9, emoji: "🌍", ko: "이태원", en: "Itaewon", uz: "Itaewon", ru: "Итэвон" },
  { lesson: 10, emoji: "🌉", ko: "한강공원", en: "Hangang Park", uz: "Xangang bog'i", ru: "Парк Ханган" },
  { lesson: 11, emoji: "🌸", ko: "여의도", en: "Yeouido", uz: "Yeouido oroli", ru: "Остров Ёыйдо" },
  { lesson: 12, emoji: "🎸", ko: "홍대", en: "Hongdae", uz: "Hongdae", ru: "Хондэ" },
  { lesson: 13, emoji: "🎓", ko: "신촌", en: "Sinchon", uz: "Sinchon", ru: "Синчхон" },
  { lesson: 14, emoji: "🏛️", ko: "동대문디자인플라자", en: "Dongdaemun Design Plaza", uz: "Dongdaemun dizayn maydoni", ru: "Тондэмун Дизайн Плаза" },
  { lesson: 15, emoji: "🌳", ko: "창덕궁", en: "Changdeokgung Palace", uz: "Changdeokgung saroyi", ru: "Дворец Чхандоккун" },
  { lesson: 16, emoji: "💧", ko: "청계천", en: "Cheonggyecheon Stream", uz: "Cheonggyecheon ariği", ru: "Ручей Чхонгечхон" },
  { lesson: 17, emoji: "🎭", ko: "대학로", en: "Daehangno", uz: "Daehangno", ru: "Тэхангно" },
  { lesson: 18, emoji: "🎢", ko: "롯데월드", en: "Lotte World", uz: "Lotte World", ru: "Лотте Ворлд" },
  { lesson: 19, emoji: "🏙️", ko: "롯데월드타워", en: "Lotte World Tower", uz: "Lotte World minorasi", ru: "Башня Лотте Ворлд" },
  { lesson: 20, emoji: "📚", ko: "코엑스", en: "COEX", uz: "COEX", ru: "КОЭКС" },
  { lesson: 21, emoji: "🕶️", ko: "강남", en: "Gangnam", uz: "Gangnam", ru: "Каннам" },
  { lesson: 22, emoji: "☕", ko: "가로수길", en: "Garosu-gil", uz: "Garosu-gil", ru: "Гаросугиль" },
  { lesson: 23, emoji: "🌲", ko: "서울숲", en: "Seoul Forest", uz: "Seul o'rmoni", ru: "Сеульский лес" },
  { lesson: 24, emoji: "🏔️", ko: "북한산", en: "Bukhansan Mountain", uz: "Bukhansan tog'i", ru: "Гора Пукхансан" },
  { lesson: 25, emoji: "🐟", ko: "노량진 수산시장", en: "Noryangjin Fish Market", uz: "Noryangjin baliq bozori", ru: "Рыбный рынок Норянджин" },
  { lesson: 26, emoji: "🥟", ko: "광장시장", en: "Gwangjang Market", uz: "Gwangjang bozori", ru: "Рынок Кванджан" },
  { lesson: 27, emoji: "⛩️", ko: "광화문 광장", en: "Gwanghwamun Square", uz: "Gwanghwamun maydoni", ru: "Площадь Кванхвамун" },
  { lesson: 28, emoji: "🌇", ko: "63빌딩", en: "63 Building", uz: "63 bino", ru: "Здание 63" },
];

// A lesson counts as visited when 80% of its words have been answered right.
export const VISITED_PERCENT = 80;
