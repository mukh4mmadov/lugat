import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      // Navigation
      "nav.home": "Bosh sahifa",
      "nav.study": "O'rganish",
      "nav.search": "Qidirish",
      "nav.favorites": "Sevimlilar",
      "nav.difficult": "Qiyin so'zlar",
      "nav.stats": "Statistika",
      "nav.settings": "Sozlamalar",
      "nav.dark": "Qorong'i rejim",
      "nav.light": "Yorug' rejim",
      
      // Home Page
      "home.title": "Premium koreyscha lug'at o'rganish",
      "home.subtitle": "K-TALIM 1A kitobidan olingan aniq lug'atni o'rganing: flashcards, tinglash, quiz, yozish, sevimlilar va aqlli takrorlash.",
      "home.officialSource": "Faqat rasmiy manba",
      "home.continueLesson": "1-darsni davom etish",
      "home.reviewMode": "Takrorlash rejimi",
      "home.progress": "Progress",
      "home.dashboard": "O'rganish panelingiz",
      "home.words": "So'zlar",
      "home.lessons": "Darslar",
      "home.completed": "Yakunlandi",
      "home.streak": "Ketma-ketma",
      "home.dailyChallenge": "Kunlik sinov",
      "home.dailyChallengeText": "Bugungi asosiyali sessiya: {{lesson}}-dars",
      "home.dailyChallengeSubtitle": "Avval flashcards bilan ishlash, keyin quiz va yozish mashqlari bilan yakunlang.",
      "home.startChallenge": "Sinovni boshlash",
      "home.wordsLearned": "{{percent}}% o'rganildi",
      "home.continue": "Davom etish",
      
      // Study Page
      "study.title": "O'rganish rejimi",
      "study.subtitle": "Yodlash uchun o'z temizda — ballar, quiz. Darsni tanlang, har bir so'zni ko'rib chiqib, keyin Mashqda o'zingizni sinang.",
      "study.learnFirst": "Avval o'rganing, keyin sinov",
      "study.lessonCompleted": "Dars yakunlandi 🎉",
      "study.lessonCompletedText": "{{count}} ta so'zni ko'rib chiqdingiz {{lesson}}-dars. O'zingizni sinashga tayyormisizmi?",
      "study.lessonNotFound": "Dars topilmadi",
      "study.showMeaning": "Ma'noni ko'rsatish",
      "study.reveal": "Ochish",
      "study.headerTitle": "O'rganish — Dars {{lesson}}",
      "home.studyAgain": "Qayta o'rganish",
      "home.goToPractice": "Mashqqa o'tish",
      
      // Practice Modes
      "practice.flashcards": "Flashcards",
      "practice.listening": "Tinglash",
      "practice.quiz": "Quiz",
      "practice.writing": "Yozish",
      "practice.smartReview": "Aqlli takrorlash",
      
      // Flashcards
      "flashcards.hint": "Ishora",
      "flashcards.iKnow": "Bilaman",
      "flashcards.dontKnow": "Bilmayman",
      "flashcards.favorite": "Sevimli",
      "flashcards.saved": "Saqlangan",
      "flashcards.replayAudio": "Audio qayta tinglash",
      "flashcards.next": "Keyingi",
      "flashcards.korean": "Koreys",
      "flashcards.uzbek": "O'zbek",
      "flashcards.answer": "Javob",
      "flashcards.tapToFlip": "Kartani bosish",
      "flashcards.noDifficultWords": "Hali qiyin so'zlar yo'q",
      "flashcards.noDifficultText": "Flashcardsda Bilmayamni bosib shu yerga so'zlar yig'ib oling.",
      
      // Practice Cards
      "practice.audioFirst": "Avval audio",
      "practice.play": "Tinglash",
      "practice.typeKorean": "Eshitgan koreyscha so'zni yozing",
      "practice.fourChoices": "4 ta variant",
      "practice.typeTranslation": "Tarjimani yozing",
      "practice.correct": "To'g'ri",
      "practice.incorrect": "Javob: {{answer}}",
      "practice.replayAudio": "Audio qayta tinglash",
      "practice.next": "Keyingi",
      
      // Library Pages
      "library.search": "Qidirish",
      "library.searchBadge": "Koreys · O'zbek · Romanizatsiya",
      "library.searchPlaceholder": "Barcha 452 ta lug'at yozuvlarini qidirish",
      "library.favorites": "Sevimlilar",
      "library.favoritesEmpty": "Hali sevimlilar yo'q. Flashcards yoki qidirishdan so'zlarni saqlang.",
      "library.difficult": "Qiyin so'zlar",
      "library.autoCollected": "Avtomatik yig'ilgan",
      "library.difficultEmpty": "Hali qiyin so'zlar yo'q. Mashq davomida Bilmayamni bosib shu yerga so'zlar yig'ib oling.",
      "library.stats": "Statistika",
      "library.analytics": "O'rganish tahlili",
      "library.settings": "Sozlamalar",
      "library.personalization": "Shaxsiylashtirish",
      
      // Statistics
      "stats.dailyStreak": "Kunlik ketma-ketma",
      "stats.accuracy": "Aniqlik",
      "stats.wordsLearned": "O'rganilgan so'zlar",
      "stats.studyTime": "O'rganish vaqti",
      "stats.completedLessons": "Yakunlangan darslar",
      "stats.hardestLesson": "Eng qiyin dars",
      "stats.hardWords": "Qiyin so'zlar",
      "stats.reviews": "Takrorlashlar",
      "stats.milestones": "Muhim nuqtalar",
      "stats.achievements": "Yutuqlar",
      "stats.latestPractice": "So'nggi mashq",
      "stats.recentActivity": "So'nggi faoliyat",
      "stats.noActivity": "Hali faoliyat yo'q.",
      
      // Achievements
      "achievement.firstStep": "Birinchi qadam",
      "achievement.hundredReviews": "100 ta takrorlash",
      "achievement.sevenDayStreak": "7 kunlik ketma-ketma",
      "achievement.halfWay": "Yarim yo'l",
      "achievement.master": "K-TALIM ustasi",
      
      // Settings
      "settings.pronunciation": "Talaffuz",
      "settings.pronunciationText": "Audio har bir so'z uchun brauzerning koreyscha nutq ovozi (ko-KR) dan foydalanadi.",
      "settings.resetProgress": "Progressni qayta tiklash",
      "settings.resetProgressText": "Bu o'rganilgan so'zlar, sevimlilar, qiyin so'zlar, statistika, ketma-ketma va saqlangan palublarni tozalaydi.",
      "settings.resetConfirm": "Barcha mahalliy progressni qayta tiklaysizmi?",
      "settings.resetButton": "Progressni qayta tiklash",
      "settings.resetProgressText": "Bu o'rganilgan so'zlar, sevimlilar, qiyin so'zlar, statistika, ketma-ketma va saqlangan palublarni tozalaydi.",
      "settings.resetButton": "Progressni qayta tiklash",
      
      // Search
      "search.noResults": "Mos keladigan so'zlar topilmadi.",
      
      // Common
      "common.back": "Orqaga",
      "common.loading": "Yuklanmoqda...",
      "common.save": "Saqlash",
      "common.cancel": "Bekor qilish",
      "common.delete": "O'chirish",
      "common.edit": "Tahrirlash",
      "common.close": "Yopish",
      "common.search": "Qidirish",
      "common.filter": "Filtr",
      "common.sort": "Saralash",
      "common.view": "Ko'rish",
      "common.share": "Ulashish",
      "common.copy": "Nusxa olish",
      "common.download": "Yuklab olish",
      "common.upload": "Yuklash",
      "common.confirm": "Tasdiqlash",
      "common.yes": "Ha",
      "common.no": "Yo'q",
      "common.tryAgain": "Qayta urinib ko'ring",
      "common.stop": "To'xtatish",
      "common.none": "—",
      "common.success": "Muvaffaqiyatli",
      "common.error": "Xatolik",
      "common.warning": "Ogohlantirish",
      "common.info": "Ma'lumot",
      
      // Practice
      "practice.shuffle": "Aralashtirish",
      "practice.autoPlay": "Avto-tinglash",
      "practice.manualDifficult": "Qiyin deb belgilash",
      "practice.markDifficult": "Qiyin deb belgilash",
      
      // Study Modes
      "study.full": "Hammasini ko'rsatish",
      "study.hideUzbek": "O'zbekni yashirish",
      "study.onlyKorean": "Faqat koreyscha",
      
      // Modes
      "mode.korean": "Koreys → O'zbek",
      "mode.uzbek": "O'zbek → Koreys",
      "mode.random": "Random",
      
      // Card States
      "card.word": "So'z {{number}} / {{total}}",
      "card.lesson": "Dars {{lesson}}",
      "card.category": "Kategoriya",
      "card.verified": "Rasmdan tasdiqlangan",
      "card.needsReview": "Tekshirish kerak",
      
      // Buttons
      "button.start": "Boshlash",
      "button.continue": "Davom etish",
      "button.next": "Keyingi",
      "button.previous": "Oldingi",
      "button.finish": "Yakunlash",
      "button.skip": "O'tkazib yuborish",
      "button.retry": "Qayta urinib ko'ring",
      "button.back": "Orqaga",
      
      // Feedback
      "feedback.correct": "To'g'ri!",
      "feedback.incorrect": "Noto'g'ri",
      "feedback.tryAgain": "Qayta urinib ko'ring",
      
      // Empty States
      "empty.noData": "Ma'lumot yo'q",
      "empty.noResults": "Natijalar yo'q",
      "empty.noFavorites": "Sevimlilar yo'q",
      "empty.noActivity": "Faoliyat yo'q",
      
      // Time
      "time.minutes": "daqiqa",
      "time.hours": "soat",
      "time.days": "kun",
      "time.weeks": "hafta",
      "time.months": "oy",
      "time.years": "yil",
      
      // Footer
      "footer.vocabularySource": "Lug'at manbasi",
      "footer.educationalOnly": "Faqat ta'lim maqsadida",
      "footer.developer": "Dasturchi",
      "footer.contact": "Xatolik yoki xatolar uchun",
      "footer.contactTelegram": "Telegram @mukh4mmadov",

      // IELTS Recommendation Modal
      "ielts.title": "Ingliz tilini davom ettiring",
      "ielts.description": "Agar siz koreyscha o'rganayotgan bo'lsangiz, ingliz tilini o'qishni yaxshilash sizga tillarni tezroq o'rganishga yordam beradi. Bizning IELTS Reading platformamizni sinab ko'ring - AI tushuntirishlari, professional matnlar va haqiqiy imtihon mashqlari bilan.",
      "ielts.openButton": "IELTS Reading bilan mashq qiling",
      "ielts.continueButton": "Koreyscha o'rganishni davom eting",
      "ielts.footer": "Xuddi shu dasturchi tomonidan yaratilgan."
    }
  },
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.study": "Study",
      "nav.search": "Search",
      "nav.favorites": "Favorites",
      "nav.difficult": "Difficult Words",
      "nav.stats": "Statistics",
      "nav.settings": "Settings",
      "nav.dark": "Dark Mode",
      "nav.light": "Light Mode",
      
      // Home Page
      "home.title": "Premium Korean Vocabulary Practice",
      "home.subtitle": "Study the exact vocabulary extracted from the official source: flashcards, listening, quizzes, writing, favorites, and smart review.",
      "home.officialSource": "Official source only",
      "home.continueLesson": "Continue Lesson 1",
      "home.reviewMode": "Review Mode",
      "home.progress": "Progress",
      "home.dashboard": "Your study dashboard",
      "home.words": "Words",
      "home.lessons": "Lessons",
      "home.completed": "Completed",
      "home.streak": "Streak",
      "home.dailyChallenge": "Daily Challenge",
      "home.dailyChallengeText": "Today's focused session: Lesson {{lesson}}",
      "home.dailyChallengeSubtitle": "Warm up with flashcards, then finish with quiz and writing practice.",
      "home.startChallenge": "Start Challenge",
      "home.wordsLearned": "{{percent}}% learned",
      "home.continue": "Continue",
      
      // Study Page
      "study.title": "Study Mode",
      "study.subtitle": "Memorize vocabulary at your own pace — no scoring, no quiz. Pick a lesson to review every word, then head to Practice to test yourself.",
      "study.learnFirst": "Study first, then practice",
      "study.lessonCompleted": "Lesson completed 🎉",
      "study.lessonCompletedText": "You've gone through all {{count}} words in Lesson {{lesson}}. Ready to test yourself?",
      "study.lessonNotFound": "Lesson not found",
      "study.showMeaning": "Show Meaning",
      "study.reveal": "Reveal",
      "study.headerTitle": "Study — Lesson {{lesson}}",
      "home.studyAgain": "Study Again",
      "home.goToPractice": "Go to Practice",
      
      // Practice Modes
      "practice.flashcards": "Flashcards",
      "practice.listening": "Listening",
      "practice.quiz": "Quiz",
      "practice.writing": "Writing",
      "practice.smartReview": "Smart Review",
      
      // Flashcards
      "flashcards.hint": "Hint",
      "flashcards.iKnow": "I Know",
      "flashcards.dontKnow": "Don't Know",
      "flashcards.favorite": "Favorite",
      "flashcards.saved": "Saved",
      "flashcards.replayAudio": "Replay Audio",
      "flashcards.next": "Next",
      "flashcards.korean": "Korean",
      "flashcards.uzbek": "Uzbek",
      "flashcards.answer": "Answer",
      "flashcards.tapToFlip": "Tap card to flip",
      "flashcards.noDifficultWords": "No difficult words yet",
      "flashcards.noDifficultText": "Press Don't Know in flashcards to collect words here automatically.",
      
      // Practice Cards
      "practice.audioFirst": "Audio first",
      "practice.play": "Play",
      "practice.typeKorean": "Type the Korean word you hear",
      "practice.fourChoices": "4 choices",
      "practice.typeTranslation": "Type translation",
      "practice.correct": "Correct",
      "practice.incorrect": "Answer: {{answer}}",
      "practice.replayAudio": "Replay Audio",
      "practice.next": "Next",
      
      // Library Pages
      "library.search": "Search",
      "library.searchBadge": "Korean · Uzbek · Romanization",
      "library.searchPlaceholder": "Search all 452 vocabulary entries",
      "library.favorites": "Favorites",
      "library.favoritesEmpty": "No favorites yet. Save words from flashcards or search.",
      "library.difficult": "Difficult Words",
      "library.autoCollected": "Auto collected",
      "library.difficultEmpty": "No difficult words yet. Press Don't Know during practice.",
      "library.stats": "Statistics",
      "library.analytics": "Learning analytics",
      "library.settings": "Settings",
      "library.personalization": "Personalization",
      
      // Statistics
      "stats.dailyStreak": "Daily streak",
      "stats.accuracy": "Accuracy",
      "stats.wordsLearned": "Words learned",
      "stats.studyTime": "Study time",
      "stats.completedLessons": "Completed lessons",
      "stats.hardestLesson": "Hardest lesson",
      "stats.hardWords": "Hard words",
      "stats.reviews": "Reviews",
      "stats.milestones": "Milestones",
      "stats.achievements": "Achievements",
      "stats.latestPractice": "Latest practice",
      "stats.recentActivity": "Recent activity",
      "stats.noActivity": "No activity yet.",
      
      // Achievements
      "achievement.firstStep": "First Step",
      "achievement.hundredReviews": "100 Reviews",
      "achievement.sevenDayStreak": "7 Day Streak",
      "achievement.halfWay": "Half Way",
      "achievement.master": "Vocabulary Master",
      
      // Settings
      "settings.pronunciation": "Pronunciation",
      "settings.pronunciationText": "Audio uses your browser's Korean speech synthesis voice (ko-KR) for every word.",
      "settings.resetProgress": "Reset Progress",
      "settings.resetProgressText": "This clears learned words, favorites, difficult words, stats, streak, and saved decks.",
      "settings.resetConfirm": "Reset all local progress?",
      "settings.resetButton": "Reset Progress",
      "settings.resetProgressText": "This clears learned words, favorites, difficult words, stats, streak, and saved decks.",
      "settings.resetButton": "Reset Progress",
      
      // Search
      "search.noResults": "No matching words found.",
      
      // Common
      "common.back": "Back",
      "common.loading": "Loading...",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.close": "Close",
      "common.search": "Search",
      "common.filter": "Filter",
      "common.sort": "Sort",
      "common.view": "View",
      "common.share": "Share",
      "common.copy": "Copy",
      "common.download": "Download",
      "common.upload": "Upload",
      "common.confirm": "Confirm",
      "common.yes": "Yes",
      "common.no": "No",
      "common.tryAgain": "Try Again",
      "common.stop": "Stop",
      "common.none": "—",
      "common.success": "Success",
      "common.error": "Error",
      "common.warning": "Warning",
      "common.info": "Info",
      
      // Practice
      "practice.shuffle": "Shuffle",
      "practice.autoPlay": "Auto Play",
      "practice.manualDifficult": "Mark as difficult",
      "practice.markDifficult": "Mark as difficult",
      
      // Study Modes
      "study.full": "Show everything",
      "study.hideUzbek": "Hide Uzbek",
      "study.onlyKorean": "Only Korean",
      
      // Modes
      "mode.korean": "Korean → Uzbek",
      "mode.uzbek": "Uzbek → Korean",
      "mode.random": "Random",
      
      // Card States
      "card.word": "Word {{number}} / {{total}}",
      "card.lesson": "Lesson {{lesson}}",
      "card.category": "Category",
      "card.verified": "Verified from image",
      "card.needsReview": "Needs review",
      
      // Buttons
      "button.start": "Start",
      "button.continue": "Continue",
      "button.next": "Next",
      "button.previous": "Previous",
      "button.finish": "Finish",
      "button.skip": "Skip",
      "button.retry": "Try Again",
      "button.back": "Back",
      
      // Feedback
      "feedback.correct": "Correct!",
      "feedback.incorrect": "Incorrect",
      "feedback.tryAgain": "Try Again",
      
      // Empty States
      "empty.noData": "No data available",
      "empty.noResults": "No results found",
      "empty.noFavorites": "No favorites yet",
      "empty.noActivity": "No activity yet",
      
      // Time
      "time.minutes": "minutes",
      "time.hours": "hours",
      "time.days": "days",
      "time.weeks": "weeks",
      "time.months": "months",
      "time.years": "years",
      
      // Footer
      "footer.vocabularySource": "Vocabulary Source",
      "footer.educationalOnly": "Educational purposes only",
      "footer.developer": "Developer",
      "footer.contact": "For bugs or errors",
      "footer.contactTelegram": "Telegram @mukh4mmadov",

      // IELTS Recommendation Modal
      "ielts.title": "Continue improving your English",
      "ielts.description": "If you're learning Korean, improving your English reading will help you learn languages faster. Try our IELTS Reading platform with AI explanations, professional passages and real exam practice.",
      "ielts.openButton": "Practice IELTS Reading",
      "ielts.continueButton": "Continue Learning Korean",
      "ielts.footer": "Created by the same developer."
    }
  },
  ru: {
    translation: {
      // Navigation
      "nav.home": "Главная",
      "nav.study": "Учёба",
      "nav.search": "Поиск",
      "nav.favorites": "Избранное",
      "nav.difficult": "Сложные слова",
      "nav.stats": "Статистика",
      "nav.settings": "Настройки",
      "nav.dark": "Тёмная тема",
      "nav.light": "Светлая тема",
      
      // Home Page
      "home.title": "Премиум изучение корейского словаря",
      "home.subtitle": "Изучайте точный словарь из официального источника: карточки, аудирование, викторины, письмо, избранное и умный повтор.",
      "home.officialSource": "Только официальный источник",
      "home.continueLesson": "Продолжить урок 1",
      "home.reviewMode": "Режим повторения",
      "home.progress": "Прогресс",
      "home.dashboard": "Ваша панель учёбы",
      "home.words": "Слова",
      "home.lessons": "Уроки",
      "home.completed": "Завершено",
      "home.streak": "Серия",
      "home.dailyChallenge": "Ежедневный вызов",
      "home.dailyChallengeText": "Сегодняшняя сессия: Урок {{lesson}}",
      "home.dailyChallengeSubtitle": "Сначала разомнитесь с карточками, затем завершите викториной и письмом.",
      "home.startChallenge": "Начать вызов",
      "home.wordsLearned": "{{percent}}% выучено",
      "home.continue": "Продолжить",
      
      // Study Page
      "study.title": "Режим учёбы",
      "study.subtitle": "Запоминайте словарь в своём темпе — без очков, без викторин. Выберите урок, чтобы просмотреть каждое слово, затем перейдите к Практике для проверки.",
      "study.learnFirst": "Сначала учиться, потом практиковаться",
      "study.lessonCompleted": "Урок завершён 🎉",
      "study.lessonCompletedText": "Вы прошли все {{count}} слов в уроке {{lesson}}. Готовы проверить себя?",
      "study.lessonNotFound": "Урок не найден",
      "study.showMeaning": "Показать значение",
      "study.reveal": "Показать",
      "study.headerTitle": "Учёба — Урок {{lesson}}",
      "home.studyAgain": "Учиться снова",
      "home.goToPractice": "Перейти к практике",
      
      // Practice Modes
      "practice.flashcards": "Карточки",
      "practice.listening": "Аудирование",
      "practice.quiz": "Викторина",
      "practice.writing": "Письмо",
      "practice.smartReview": "Умный повтор",
      
      // Flashcards
      "flashcards.hint": "Подсказка",
      "flashcards.iKnow": "Знаю",
      "flashcards.dontKnow": "Не знаю",
      "flashcards.favorite": "Избранное",
      "flashcards.saved": "Сохранено",
      "flashcards.replayAudio": "Повторить аудио",
      "flashcards.next": "Далее",
      "flashcards.korean": "Корейский",
      "flashcards.uzbek": "Узбекский",
      "flashcards.answer": "Ответ",
      "flashcards.tapToFlip": "Нажмите, чтобы перевернуть",
      "flashcards.noDifficultWords": "Пока нет сложных слов",
      "flashcards.noDifficultText": "Нажмите Не знаю в карточках, чтобы автоматически собирать слова здесь.",
      
      // Practice Cards
      "practice.audioFirst": "Сначала аудио",
      "practice.play": "Воспроизвести",
      "practice.typeKorean": "Введите услышанное корейское слово",
      "practice.fourChoices": "4 варианта",
      "practice.typeTranslation": "Введите перевод",
      "practice.correct": "Правильно",
      "practice.incorrect": "Ответ: {{answer}}",
      "practice.replayAudio": "Повторить аудио",
      "practice.next": "Далее",
      
      // Library Pages
      "library.search": "Поиск",
      "library.searchBadge": "Корейский · Узбекский · Романизация",
      "library.searchPlaceholder": "Поиск по всем 452 словарным записям",
      "library.favorites": "Избранное",
      "library.favoritesEmpty": "Пока нет избранного. Сохраняйте слова из карточек или поиска.",
      "library.difficult": "Сложные слова",
      "library.autoCollected": "Автоматически собраны",
      "library.difficultEmpty": "Пока нет сложных слов. Нажмите Не знаю во время практики.",
      "library.stats": "Статистика",
      "library.analytics": "Аналитика обучения",
      "library.settings": "Настройки",
      "library.personalization": "Персонализация",
      
      // Statistics
      "stats.dailyStreak": "Ежедневная серия",
      "stats.accuracy": "Точность",
      "stats.wordsLearned": "Выученные слова",
      "stats.studyTime": "Время учёбы",
      "stats.completedLessons": "Завершённые уроки",
      "stats.hardestLesson": "Самый сложный урок",
      "stats.hardWords": "Сложные слова",
      "stats.reviews": "Повторы",
      "stats.milestones": "Вехи",
      "stats.achievements": "Достижения",
      "stats.latestPractice": "Последняя практика",
      "stats.recentActivity": "Недавняя активность",
      "stats.noActivity": "Пока нет активности.",
      
      // Achievements
      "achievement.firstStep": "Первый шаг",
      "achievement.hundredReviews": "100 повторов",
      "achievement.sevenDayStreak": "7-дневная серия",
      "achievement.halfWay": "На полпути",
      "achievement.master": "Мастер словаря",
      
      // Settings
      "settings.pronunciation": "Произношение",
      "settings.pronunciationText": "Аудио использует корейский голос синтеза речи вашего браузера (ko-KR) для каждого слова.",
      "settings.resetProgress": "Сбросить прогресс",
      "settings.resetProgressText": "Это очищает выученные слова, избранное, сложные слова, статистику, серию и сохранённые колоды.",
      "settings.resetConfirm": "Сбросить весь локальный прогресс?",
      "settings.resetButton": "Сбросить прогресс",
      
      // Search
      "search.noResults": "Совпадений не найдено.",
      
      // Common
      "common.back": "Назад",
      "common.loading": "Загрузка...",
      "common.save": "Сохранить",
      "common.cancel": "Отмена",
      "common.delete": "Удалить",
      "common.edit": "Редактировать",
      "common.close": "Закрыть",
      "common.search": "Поиск",
      "common.filter": "Фильтр",
      "common.sort": "Сортировка",
      "common.view": "Просмотр",
      "common.share": "Поделиться",
      "common.copy": "Копировать",
      "common.download": "Скачать",
      "common.upload": "Загрузить",
      "common.confirm": "Подтвердить",
      "common.yes": "Да",
      "common.no": "Нет",
      "common.tryAgain": "Попробуйте снова",
      "common.stop": "Остановить",
      "common.none": "—",
      "common.success": "Успех",
      "common.error": "Ошибка",
      "common.warning": "Предупреждение",
      "common.info": "Информация",
      
      // Practice
      "practice.shuffle": "Перемешать",
      "practice.autoPlay": "Автовоспроизведение",
      "practice.manualDifficult": "Отметить как сложное",
      "practice.markDifficult": "Отметить как сложное",
      
      // Study Modes
      "study.full": "Показать всё",
      "study.hideUzbek": "Скрыть узбекский",
      "study.onlyKorean": "Только корейский",
      
      // Modes
      "mode.korean": "Корейский → Узбекский",
      "mode.uzbek": "Узбекский → Корейский",
      "mode.random": "Случайный",
      
      // Card States
      "card.word": "Слово {{number}} / {{total}}",
      "card.lesson": "Урок {{lesson}}",
      "card.category": "Категория",
      "card.verified": "Проверено из изображения",
      "card.needsReview": "Требуется проверка",
      
      // Buttons
      "button.start": "Начать",
      "button.continue": "Продолжить",
      "button.next": "Далее",
      "button.previous": "Предыдущий",
      "button.finish": "Завершить",
      "button.skip": "Пропустить",
      "button.retry": "Попробовать снова",
      "button.back": "Назад",
      
      // Feedback
      "feedback.correct": "Правильно!",
      "feedback.incorrect": "Неправильно",
      "feedback.tryAgain": "Попробуйте снова",
      
      // Empty States
      "empty.noData": "Нет данных",
      "empty.noResults": "Результаты не найдены",
      "empty.noFavorites": "Пока нет избранного",
      "empty.noActivity": "Пока нет активности",
      
      // Time
      "time.minutes": "минут",
      "time.hours": "часов",
      "time.days": "дней",
      "time.weeks": "недель",
      "time.months": "месяцев",
      "time.years": "лет",
      
      // Footer
      "footer.vocabularySource": "Источник словаря",
      "footer.educationalOnly": "Только в образовательных целях",
      "footer.developer": "Разработчик",
      "footer.contact": "Для ошибок и проблем",
      "footer.contactTelegram": "Telegram @mukh4mmadov",

      // IELTS Recommendation Modal
      "ielts.title": "Продолжайте улучшать английский",
      "ielts.description": "Если вы изучаете корейский, улучшение чтения на английском поможет вам быстрее учить языки. Попробуйте нашу платформу IELTS Reading с AI-объяснениями, профессиональными текстами и практикой реальных экзаменов.",
      "ielts.openButton": "Практиковать IELTS Reading",
      "ielts.continueButton": "Продолжить изучать корейский",
      "ielts.footer": "Создано тем же разработчиком."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'uz', // Default to Uzbek
    fallbackLng: 'uz',
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;