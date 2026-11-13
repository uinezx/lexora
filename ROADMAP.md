# Lexora — bo‘limlar va bosqichlar

Kelishilgan yo‘nalish: barcha foydalanuvchilar uchun platforma. Kartochka oldi o‘zbekcha, orqasi inglizcha. GitHub repository ochiq.

| Bo‘lim | Vazifasi | v0.1 holati | Keyingi ish |
|---|---|---|---|
| Bosh sahifa | Bugungi maqsad, to‘plamlar, keyingi mashq | Ishlaydi, brauzer ma’lumotlaridan hisoblanadi | Hisobga bog‘lash |
| Lug‘at / deck | So‘zlarni mavzu yoki kitob unitiga ajratish | So‘z qo‘shish, deck nomi, qidirish, tahrir, o‘chirish | Alohida deck boshqaruvi va ulashish |
| Import | Ko‘p so‘zni birdan kiritish | Tayyor so‘z va tarjimalarni import qiladi | Raqamlangan ro‘yxat, AI orqali tozalash va preview |
| Tekshirish navbati | AI natijasini foydalanuvchi tasdiqlashi | Rejalashtirilgan | Dublikat, tarjima va misollarni tekshirish |
| SRS kartochka | O‘zbekcha savol, inglizcha javob, 4 baho | Soddalashtirilgan SM-2 ishlaydi | Algoritm tanlash, qisqa qayta o‘rganish bosqichlari |
| Talaffuz | Inglizcha javobni eshitish | Qurilma speechSynthesis funksiyasi | US/UK tanlovi, tezlik va avtomatik talaffuz |
| Imlo | Tarjimadan inglizcha yozish | Lug‘atdagi so‘zlar, tekshirish, XP | Xatolar navbati va qayta urinish |
| Mini darslar | Qisqa tushuntirish va savol | 3 ta boshlang‘ich dars | To‘liq dars kontenti va bosqichni ochish qoidalari |
| Kurslar / CEFR | Darajalar, unitlar, grammatika va mashqlar | Hali to‘liq kurs emas | Kontent manbasi va o‘tish balli kerak |
| O‘yinlar | Matching, gap tuzish va tezkor imlo | Hozir alohida o‘yin yo‘q | Qaysi o‘yinni avval qo‘shishni tanlash |
| Reyting | Haqiqiy foydalanuvchilar musobaqasi | Shaxsiy XP bor, umumiy jadval yo‘q | Server va aldashga qarshi tekshiruv |
| Tahlil | Takrorlash, o‘sish va imlo aniqligi | Haqiqiy mahalliy mashqlardan hisoblanadi | Server va vaqt mintaqasi bo‘yicha hisoblash |
| Telegram | Mini App, eslatma va sync | Ulanish rejasi bor, bot ulanmagan | Bot tanlash, initData tekshirish, rozilik bilan eslatma |
| Ustoz / admin | Guruh, deck tarqatish va progress | Hali ulanmagan | Rollar va vakolatlar modeli |
| Sozlamalar | Ism, kunlik maqsad, backup | Ishlaydi | Akkaunt, maxfiylik va data eksporti |

## Keyingi arxitektura

Ommaviy platformada har foydalanuvchining lug‘ati va SRS jadvali alohida bo‘lishi kerak. Frontenddagi foydalanuvchi ID yoki admin belgisi ishonchli ruxsat manbasi emas. Server har amal uchun sessiya va yozuv egasini tekshiradi. AI va Telegram tokenlari faqat server secrets sifatida saqlanadi.

## Foydalanuvchidan aniqlashtiriladigan qarorlar

1. Kirish: Telegram, Google, email yoki bir nechtasi?
2. AI import: faqat inglizcha ro‘yxatdan tarjima/misol yaratishmi yoki tayyor EN–UZ ro‘yxatni boyitishmi?
3. Kartochka orqasi: inglizcha so‘z, IPA, so‘z turkumi, misol, misol tarjimasi va sinonimlardan qaysilari majburiy?
4. SRS: videodagi qisqa Again/Hard (10 daqiqa), Good (1 kun), Easy (2 kun) boshlang‘ich qiymatlarimi yoki boshqa tartib?
5. To‘liq kurslarni kim tayyorlaydi va kontentdan foydalanishga ruxsat bormi?
6. Bepul/pullik qismlar va kunlik AI limitlari qanday bo‘ladi?

v0.1 ushbu qarorlarni taxmin qilib haqiqiy servis sifatida ko‘rsatmaydi. Yangi bosqichlar alohida commit va deploy bilan qo‘shiladi.
