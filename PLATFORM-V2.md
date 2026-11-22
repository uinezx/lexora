# Lexora: o‘qituvchi va o‘quvchi platformasi

## Tasdiqlangan qarorlar

- Stitch — vizual yo‘nalish. Ekranlarni aynan ko‘chirish talabi yo‘q.
- Asosiy ikki ish maydoni: o‘qituvchi va o‘quvchi. Admin o‘qituvchi huquqini tasdiqlaydi.
- Guruh, so‘zlar va topshiriqlarni faqat tasdiqlangan o‘qituvchi boshqaradi.
- O‘quvchi Telegram botda ro‘yxatdan o‘tadi va kod bilan darhol guruhga qo‘shiladi.
- Misol: `ielts_ge_1630` — guruh nomi; `10089` — qo‘shilish kodi. Bu misol kodi, hozir mavjud guruh emas.
- Kod serverda yaratiladi, UNIQUE cheklovi bilan tekshiriladi. To‘qnashsa yangi kod olinadi. Ichki group ID koddan alohida bo‘ladi.
- O‘quvchi bir nechta guruhga a’zo bo‘lishi mumkin. O‘qituvchi faqat o‘z guruhini boshqaradi.
- Guruhdan chiqarilgan o‘quvchi kodni qayta kiritib cheklovni aylanib o‘ta olmaydi.

## O‘qituvchi maydoni

1. **Bugungi ishlar:** tekshirilmagan speaking/writing, yaqin muddatlar, bajarmagan o‘quvchilar.
2. **Guruhlar:** nom, qo‘shilish kodi, kodni yangilash, a’zolar va arxivlash.
3. **Materiallar:** guruhga tegishli decklar, AI import va nashrdan oldingi tekshirish navbati.
4. **Topshiriqlar:** so‘z, imlo, grammatika, reading, listening, writing va speaking. Har birida daraja, yo‘riqnoma, muddat va baholash mezoni.
5. **Tekshirish:** audio/matnni ko‘rish, ball, yozma yoki ovozli fikr, qayta ishlashga yuborish.
6. **Guruh tahlili:** bajarilish, muntazamlik, ko‘nikmalar kesimidagi o‘sish. XP bilim darajasining o‘rnini bosmaydi.

## O‘quvchi maydoni

1. **Bugun:** muddati yaqin ishlar va takrorlash navbati.
2. **Guruhlarim:** kod bilan kirish va guruh materiallarini ochish.
3. **Topshiriqlar:** boshlash, qoralama, yuborish va tekshiruv holati.
4. **Speaking:** tayyorgarlik taymeri, audio yozish, qayta eshitish va topshirish. Mikrofon ruxsati faqat yozishni boshlaganda so‘raladi.
5. **Fikr va xatolar:** o‘qituvchi izohlari, qayta mashq qilish va yaxshilangan javob.
6. **O‘sish:** haftalik topshiriqlar, ko‘nikmalar va guruh ichidagi adolatli reyting.

## Speaking turlari

- Qisqa javob: kundalik savolga 30–60 soniya.
- IELTS Part 1: mavzu bo‘yicha bir necha savol.
- IELTS Part 2: 1 daqiqa tayyorgarlik, 2 daqiqagacha javob.
- IELTS Part 3: fikr, sabab va misol bilan kengaytirilgan javob.
- General English: role-play va vaziyatli suhbat.

Avval o‘qituvchi bahosi: ravonlik, lug‘at, grammatika va talaffuz bo‘yicha mezonlar. AI fikri keyin alohida yordamchi sifatida qo‘shiladi; haqiqiy audio tahlili ulanmaguncha AI yoki IELTS band bahosi uydirib ko‘rsatilmaydi. Audio private saqlanadi, faqat o‘quvchi va uning o‘qituvchisi ko‘radi. Saqlash muddati mahsulot sozlamasida belgilanadi.

## XP uchun dastlabki balans taklifi

So‘zning oson/qiyinligiga qarab emas, **butun topshiriqning talabiga** qarab:

| Topshiriq | Boshlang‘ich | Standart | Murakkab |
|---|---:|---:|---:|
| Lug‘at mashg‘uloti | 15 | 25 | 35 |
| Imlo | 20 | 30 | 40 |
| Grammatika | 20 | 35 | 50 |
| Reading | 25 | 40 | 60 |
| Listening | 25 | 40 | 60 |
| Speaking | 30 | 50 | 75 |
| Writing | 35 | 55 | 80 |

Bu qiymatlar taklif, o‘quvchilar bilan sinovdan keyin sozlanadi. Topshiriq nashrida mezon va maksimal XP ko‘rinadi; bajarilgandan keyin orqaga qarab o‘zgartirilmaydi.

- Tugallanmagan yoki 50% dan past ish: 0 XP.
- 50–69%: bazaviy XPning 60%; 70–89%: 80%; 90–100%: 100%.
- Speaking/writing XP’si o‘qituvchi tasdig‘idan so‘ng beriladi.
- Qayta yuborishda faqat yaxshilangan natijaning farqi beriladi. Oldin 40, keyin 50 XP bo‘lsa, qo‘shimcha 10.
- Bir o‘quvchi + bir topshiriq uchun bitta umumiy mukofot yozuvi; parallel so‘rovlar ham tranzaksiya bilan tekshiriladi.
- Har bir kartochka tugmasi uchun alohida XP berish olib tashlanadi; SRS foydasi mashg‘ulot natijasi bilan hisoblanadi.
- Reyting bir xil guruh va davr ichida bo‘ladi. Boshqa hajmdagi kurslar xom XP bilan solishtirilmaydi.

## Men qo‘shayotgan mahsulot g‘oyalari

- **Haftalik yo‘l:** vocabulary → kontekstli imlo → speaking’da qo‘llash → feedback.
- **Xatolar daftari:** noto‘g‘ri javoblardan shaxsiy qayta mashq navbati.
- **Qayta topshirish:** o‘qituvchi fikri bilan avvalgi va yangi javobni solishtirish.
- **Yumshoq eslatmalar:** muddat va tekshirilgan ish haqida rozilik bilan Telegram xabari.
- **O‘sish xaritasi:** faqat reyting emas, o‘quvchining o‘z avvalgi natijasiga nisbatan o‘sishi.

## Hozirgi texnik holat

`server/domain.js`: ruxsatlar, darhol qo‘shilish va topshiriq XP qoidalari yozildi. `server/schema.sql`: server bazasi loyihasi. Testlar lokal ishlaydi. Bu fayllar hali autentifikatsiyaga yoki jonli bazaga ulanmagan. Jonli v0.1.1 sayt eski brauzer prototipi bo‘lib turibdi; undagi shaxsiy so‘z qo‘shish va eski XP hali yangi ommaviy tartib deb hisoblanmaydi.

Keyingi ish: Telegram botni ulash → tekshirilgan server sessiyasi → admin tasdiqlaydigan o‘qituvchi → guruh API → topshiriqlar va audio saqlash → ikkala interfeys → migratsiya va deploy. Ishlayotgan eski nusxa avval zaxiralanadi.
