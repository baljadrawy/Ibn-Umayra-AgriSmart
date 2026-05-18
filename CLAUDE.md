# CLAUDE.md — مرجع المساعد الذكي لمشروع "ابن عميرة AgriSmart"

## المشروع

**"ابن عميرة AgriSmart"** — تقويم زراعي ذكي يدمج الخبرة التراثية (تقويم ابن عميرة) مع بيانات الطقس الحية والذكاء الاصطناعي. مخصص للمزارع السعودي.

**الجمهور:** عربي، واجهة عربية RTL.  
**المنصة:** Pi 4 خادم منزلي — يعمل على port 9002.  
**GitHub:** https://github.com/baljadrawy/Ibn-Umayra-AgriSmart

---

## Stack التقني

| الطبقة | التقنية |
|--------|--------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Firebase Genkit + Google Gemini 2.5 Flash |
| Database | Firebase Firestore |
| Weather API | Open-Meteo API (مجانية، بدون مفتاح) |
| Bot | Python + python-telegram-bot |
| Deploy | Docker Compose (2 حاويات: web + telegram-bot) |

---

## بنية الملفات

```
agrismart/
├── src/
│   ├── app/
│   │   ├── page.tsx                # الصفحة الرئيسية — dashboard + onboarding
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── dashboard/
│   │       ├── NawaaCard.tsx       # بطاقة النوء الحالي
│   │       ├── WeatherCompare.tsx  # مقارنة الطقس الحي بالتقويم
│   │       └── RecommendationList.tsx  # توصيات الزراعة الديناميكية
│   ├── ai/
│   │   ├── genkit.ts               # تهيئة Genkit + Gemini
│   │   └── flows/                  # AI flows (المستشار الزراعي)
│   ├── firebase/
│   │   └── config.ts               # Firebase config (من .env)
│   └── lib/
│       └── location-data.ts        # *** العقل الأساسي للنظام ***
├── telegram-bot/
│   ├── bot.py                      # الكود الرئيسي للبوت
│   ├── nawaa_data.py               # نسخة Python من location-data.ts
│   └── requirements.txt
├── docs/
│   ├── SYSTEM_DOCUMENTATION.md     # التوثيق التقني الشامل
│   └── DATA_SOURCES.md
├── Dockerfile                      # Next.js — multi-stage build
├── docker-compose.yml
└── .env                            # (لا يُرفع لـ git)
```

---

## الملف الأهم: `src/lib/location-data.ts`

هذا هو "عقل" النظام — أي تعديل على المنطق الزراعي يبدأ من هنا:

- **30 نوءاً** (نجماً) مع مواعيد دخولها وخروجها (ميلادي + هجري)
- **5 أحزمة مناخية** للمملكة مع معاملات التعديل (Offsets):
  | المنطقة | التعديل | السبب |
  |--------|--------|-------|
  | جبال الحجاز (مرجع) | 0 يوم | تقويم ابن عميرة مبني على الطائف |
  | الهضبة الوسطى (الرياض) | +7 أيام شتاء | برودة التربة |
  | الشمال (تبوك، حائل) | +14 يوماً | موسم صقيع أطول |
  | الشرق (الدمام) | -10 أيام | دفء ورطوبة مبكرة |
  | الغرب (جدة، جازان) | -7 أيام | + دعم محاصيل استوائية |
- **أكثر من 60 مدينة** بإحداثياتها الجغرافية

**nawaa_data.py** هي نسخة Python من نفس الملف — عند تعديل location-data.ts، حدّث nawaa_data.py أيضاً.

---

## منطق التوصيات الديناميكية

```
الحرارة الحية (Open-Meteo) ↔ الحرارة المتوقعة في النوء
├── فرق > +5 درجات → "كثّف الري المسائي"
├── فرق < -5 درجات → "احمِ الشتلات من البرد"
└── منطقة غربية → أضف محاصيل استوائية (مانجو، بابايا)
```

---

## متغيرات البيئة (`.env` — لا يُرفع لـ git)

```
TELEGRAM_BOT_TOKEN=...
ADMIN_CHAT_ID=...
```

Firebase config يُوضع في `src/firebase/config.ts` مباشرة (public keys — مقبول).

---

## النشر

```bash
cd /home/pi/agrismart

# تشغيل الكل
docker compose up -d

# إعادة بناء بعد تغيير الكود
docker compose up -d --build

# إعادة بناء حاوية واحدة
docker compose build --no-cache web && docker compose up -d web
docker compose build telegram-bot && docker compose up -d telegram-bot

# اللوقات
docker compose logs -f web
docker compose logs -f telegram-bot
```

**المنافذ:**
- Web: `9002` → `localhost:3000` داخل الحاوية
- Telegram bot: لا يحتاج port (يتصل بـ Telegram API خارجياً)

---

## بوت تلقرام

**أوامر البوت:**
| الأمر | الوظيفة |
|-------|---------|
| `/start` | بداية واختيار المنطقة |
| `/today` | النوء الحالي وتوصيات اليوم |
| `/weather` | الطقس الحي مقارنة بالتقويم |
| `/crop` | المحاصيل والأنشطة الموصى بها |
| `/calendar` | أنجم الشهر الحالي |
| `/setlocation` | تغيير المدينة |
| `/subscribe` | تنبيهات صباحية |

---

## قواعد مهمة

### الأرقام — استخدم `ar-SA-u-nu-latn` دائماً
```typescript
// ✅ أرقام لاتينية مع نص عربي
date.toLocaleDateString('ar-SA-u-nu-latn')
// ❌ تنتج أرقاماً هندية
date.toLocaleDateString('ar-SA')
```

### مزامنة الملفين
أي تعديل على منطق النواء أو المدن في `location-data.ts` → يجب تطبيقه في `nawaa_data.py` أيضاً.

### الأمان
- الحاويتان تعملان بمستخدم غير-root (`USER node` للـ web، `USER appuser` للبوت)
- لا secrets في الكود — كلها من `.env`

---

**آخر تحديث:** 2026-05-18  
**النسخة:** 1.0
