# Script to fix i18n.js by adding roadmap translations and removing duplicates
import re

# Read the file
with open('src/lib/i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add nav.futureUpdates to English section
content = content.replace(
    '"nav.light": "Light Mode",',
    '"nav.light": "Light Mode",\n      "nav.futureUpdates": "Future Updates",'
)

# Add nav.futureUpdates to Uzbek section
content = content.replace(
    '"nav.light": "Yorug\' rejim",',
    '"nav.light": "Yorug\' rejim",\n      "nav.futureUpdates": "Kelajakdagi yangilanishlar",'
)

# Add nav.futureUpdates to Russian section (first occurrence only)
content = content.replace(
    '"nav.light": "Светлая тема",',
    '"nav.light": "Светлая тема",\n      "nav.futureUpdates": "Будущие обновления",'
)

# Add roadmap translations to Uzbek section before exercise types
uzbek_roadmap = '''
      // Future Updates / Roadmap
      "roadmap.comingSoon": "KELAJAKDA",
      "roadmap.title": "Kelajakdagi yangilanishlar",
      "roadmap.subtitle": "Biz K-TALIM doimiy ravishda yaxshilab chiqmoqdamiz — koreyscha o'rganishni aqlliroq, osonroq va samaraliroq qilish uchun.",
      "roadmap.planned": "REJALASHTIRILGAN",
      "roadmap.future": "KELAJAK",
      "roadmap.benefit": "Sizga qanday yordam beradi",
      
      "roadmap.feature1.title": "Kirish va Ro'yxatdan o'tish",
      "roadmap.feature1.description": "Foydalanuvchilar shaxsiy K-TALIM hisobini yaratishi mumkin bo'ladi.",
      "roadmap.feature1.benefit": "O'rganish progressi, ustozlik, sevimlilar, statistika va o'rganish tarixi hisobingizga bog'lanishi mumkin. Qurilmani o'zgartirganda o'rganish ma'lumotlaringizni yo'qotmaysiz.",
      
      "roadmap.feature2.title": "Bulut sinx va ko'p qurilma",
      "roadmap.feature2.description": "O'rganish ma'lumotlari qurilmalar o'rtasida sinxlanadi.",
      "roadmap.feature2.benefit": "Telefondan o'rganishni boshlab, laptop yoki boshqa qurilmada davom etishingiz mumkin — progressni yo'qotmasdan.",
      
      "roadmap.feature3.title": "TOPIK I mashqlari",
      "roadmap.feature3.description": "TOPIK I tayyorlash materiallari K-TALIM ga qo'shiladi. O'qish mashqlari, tinglash mashqlari, imtihon uslubidagi savollar, vaqtinchalik mashqlar, to'liq sinovlar va performance tahlili.",
      "roadmap.feature3.benefit": "O'quvchilar alohida resurslardan foydalanmasdan, to'g'ridan K-TALIM ichida TOPIK I ga tayyorlashlari mumkin.",
      
      "roadmap.feature4.title": "TOPIK II mashqlari",
      "roadmap.feature4.description": "Ko'proqilgan TOPIK II tayyorlash tizimi qo'shiladi. O'qish, tinglash, yozish, imtihon uslubidagi mashq, to'liq sinov va performance tahlili.",
      "roadmap.feature4.benefit": "Ilgor o'quvchilar oxir-oqibat bir xil platform ichida TOPIK II ga tayyorlashlari mumkin.",
      
      "roadmap.feature5.title": "AI koreyscha o'qituvchi",
      "roadmap.feature5.description": "AI bilan ishlaydigan shaxsiylashtirilgan o'qituvchi yordam beradi. Lug'atni tushuntirish, grammatikani tushuntirish, misol jumla berish, xatolarni tushuntirish, ishoralar berish, koreyscha o'rganish savollariga javob berish va keyin nima mashq qilishni tavsiya qilish kabi imkoniyatlar.",
      "roadmap.feature5.benefit": "O'quvchilar K-TALIM dan chiqmasdan shaxsiylashtirilgan tushuntirish va yo'riqtirish olishlari mumkin.",
      
      "roadmap.feature6.title": "Aqlli ko'rib chiqish va oraliq takrorlash",
      "roadmap.feature6.description": "K-TALIM har bir lug'at elementini qachon ko'rib chiqish kerakligini aqlli tarzda aniqlaydi. Tizim oldingi javoblar, ustozlik, xatolar, ko'rib chiqish tarixi va eslab qolish performanceidan foydalanib shaxsiylashtirilgan ko'rib chiqish sessiyalarini yaratadi.",
      "roadmap.feature6.benefit": "Yaxshi bilgan so'zlar kamroq ko'rinadi, qiyin yoki tez unutiladigan so'zlar esa to'g'ri vaqtda qaytadi.",
      
      "roadmap.feature7.title": "Gapirish va talaffuz mashqlari",
      "roadmap.feature7.description": "Foydalanuvchilar koreyscha gapirishni mashq qilish va talaffuzga qaratilgan fikr-mulohaza olishlari mumkin.",
      "roadmap.feature7.benefit": "O'quvchilar lug'atni tanishdan o'tib, koreyscha so'zlar va jumlalarni haqiqatan ishlab chiqishni mashq qilishlari mumkin.",
      
      "roadmap.feature8.title": "Shaxsiy o'rganish paneli",
      "roadmap.feature8.description": "Batafsil panel o'rganish progressini bir joyga jamlaydi. Lug'at ustozligi, TOPIK progressi, mashq performance, kuchli tomonlar, zaif tomonlar, o'rganish davomiyoti va o'rganish tarixini ko'rsatadi.",
      "roadmap.feature8.benefit": "Koreyscha qobiliyatingiz qanday rivojlanayotganini aniq tushunishingiz mumkin.",
      
      "roadmap.feature9.title": "Shaxsiylashtirilgan o'rganish yo'li",
      "roadmap.feature9.description": "K-TALIM oxir-oqibat har bir o'quvchiga moslashadigan o'rganish tavsiyalari beradi.",
      "roadmap.feature9.benefit": "Tizim haqiqiy performanceingizga asoslangan holda keyingi dars, lug'at, ko'rib chiqish sessiyasi yoki mashq turini tavsiya qilishi mumkin.",
      
      "roadmap.feature10.title": "Kontekstga asoslangan lug'at",
      "roadmap.feature10.description": "Lug'at tabiiy koreyscha jumlar va haqiqiy foydalanish kontekstlari orqali o'rganiladi.",
      "roadmap.feature10.benefit": "O'quvchilar so'z nima deganini emas, balki u qachon va qanday tabiiy foydalanishini tushunishlari mumkin.",
      
      // Timeline
      "roadmap.timeline.now": "HOZIR",
      "roadmap.timeline.current": "Joriy K-TALIM platformi",
      "roadmap.timeline.next": "KEYINGI",
      "roadmap.timeline.later": "KEYINROQ",
      "roadmap.timeline.future": "KELAJAK",
      
      // CTA
      "roadmap.cta.title": "Ko'proq narsalar kelmoqda.",
      "roadmap.cta.subtitle": "Koreyscha o'rganish safari faqat boshlanmoqda.",
      "roadmap.cta.button": "O'rganishni boshlash",
      
'''

content = content.replace(
    '"study.check": "Tekshirish",\n      \n      // Exercise Types',
    '"study.check": "Tekshirish",' + uzbek_roadmap + '\n      // Exercise Types'
)

# Write the file
with open('src/lib/i18n.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("i18n.js fixed successfully!")
