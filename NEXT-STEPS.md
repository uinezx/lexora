# Keyingi bosqich: hisoblar va AI

Foydalanuvchi talabi: Google + Telegram login, ikki xil AI import, boyitilgan UZ → EN kartochka.

## Birinchi deploy nimani qamrab oladi?

Hozirgi sayt o‘quv oqimini sinash uchun tayyor. Lug‘at va progress shu brauzerda saqlanadi. Bu hali barcha foydalanuvchilar uchun hisoblari ishlaydigan ommaviy xizmat emas.

## Haqiqiy ulanishni boshlash uchun kerakli ma’lumotlar

- Mavjud Telegram botning username’i yoki yangi bot ochish qarori.
- Google Cloud loyihasi va Google OAuth client sozlamalariga kirish.
- AI provider va foydalanish budjeti. OpenAI tanlansa, API kalitni sozlash uchun OpenAI Developers pluginini yoqish kerak.
- Kurslar uchun kontent manbasi.

Token, client secret va API kalitlarni GitHub, brauzer JavaScript kodi yoki loyiha hujjatlariga joylamang. Ular hostingning maxfiy runtime sozlamalarida beriladi. Hujjatda faqat o‘zgaruvchi nomlari saqlanadi.

## Keyingi release qabul mezonlari

1. Google yoki Telegram’dan kirgan foydalanuvchi server tomonidan tekshiriladi.
2. Har kim faqat o‘z lug‘ati va progressini ko‘radi; boshqa hisobning ID sini yuborish bilan uning ma’lumotini olib bo‘lmaydi.
3. Eski brauzer ma’lumotlari avval preview qilinib, foydalanuvchi tanlovi bilan hisobga ko‘chiriladi.
4. AI import natijasi avval tekshirish navbatida ko‘rsatiladi, tasdiqdan keyin kartochkaga aylanadi.
5. AI limitlari serverda bajariladi; provider xatolari va qisman natijalar ochiq tushuntiriladi.
6. Telegram eslatmalari faqat foydalanuvchi yoqqanidan keyin yuboriladi.

## Hosting tanlovi

Joriy Sites nashri ChatGPT autentifikatsiya chegarasidan foydalanadi. Bu talab qilingan mustaqil Telegram/Google hisoblarining o‘rnini bosmaydi. Tashqi identity provider qo‘llovi tasdiqlanmasdan login ishlayapti deb ko‘rsatilmaydi. Zarur bo‘lsa, shu GitHub manbasi mustaqil backend hostingiga moslanadi; joriy ishlaydigan versiya saqlanadi.
