# صالون شهد | SALON SHAHD

موقع حجز مواعيد فاخر لصالون نسائي. نظام حجز كامل مع قاعدة بيانات، مصادقة، ولوحة تحكم إدارية.

## المميزات

### الموقع العام
- **الصفحة الرئيسية**: قسم ترحيبي، خدمات مميزة، لماذا نحن، آراء العملاء، ودعوة للحجز
- **صفحة الخدمات**: كتالوج كامل من قاعدة البيانات مع أسعار ومدة كل خدمة
- **صفحة الحجز**: اختيار الخدمة → التاريخ → الوقت → البيانات → التأكيد (متصل بقاعدة البيانات)
- **صفحة من نحن**: قصة الصالون وفلسفة الجمال
- **صفحة تواصل معنا**: نموذج تواصل يحفظ الرسائل في قاعدة البيانات

### نظام الحجز
- حجز مواعيد حقيقي مع التحقق من الأوقات المتاحة
- احترام ساعات العمل والأوقات المحجوبة
- منع الحجز المزدوج
- التحقق من المدخلات باستخدام Zod

### المصادقة والأمان
- تسجيل دخول / تسجيل حساب
- تشفير كلمات المرور (bcrypt)
- حماية المسارات
- صلاحيات حسب الدور (ADMIN / USER)

### لوحة التحكم (خاصة بالإدارة فقط)
- **لا تظهر** في القائمة العامة
- الوصول عبر `/admin` بعد تسجيل الدخول
- للمستخدمين بدور ADMIN فقط
- إدارة المواعيد (عرض، تحديث الحالة، حذف)
- إدارة الخدمات
- إدارة ساعات العمل
- إدارة الأوقات المحجوبة
- إعدادات الصالون

## التقنيات

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- Auth.js (NextAuth v5)
- Zod للتحقق
- React Hook Form
- Lucide React، date-fns

## متطلبات التشغيل

- Node.js 18+
- PostgreSQL
- npm أو yarn

## متغيرات البيئة

1. انسخي `.env.example` إلى `.env` وعدّلي القيم.
2. **قائمة كاملة وشرح الإنتاج** (Twilio، SMTP، Cron، Cloudinary، Upstash، إلخ): انظري قسم **[النشر (Production)](#النشر-production--موقع-حي-لعملاء-حقيقيين)** أدناه وجدول المتغيرات هناك.

الحد الأدنى للتطوير المحلي:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
AUTH_SECRET="your-secret-key-at-least-32-chars"
AUTH_URL="http://localhost:3000"
```

## خطوات الإعداد

### 1. تثبيت الحزم

```bash
npm install
```

بعد التثبيت يُشغَّل تلقائياً `prisma generate` (سكربت `postinstall`) لمطابقة أنواع TypeScript مع `schema.prisma`. إذا سحبتِ تغييرات جديدة على المخطط، شغّلي يدوياً: `npx prisma generate`.

### 2. إعداد ملف البيئة

```bash
cp .env.example .env
```

عدّل `.env` وأضف كلمة مرور PostgreSQL الحقيقية في `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/salon?schema=public"
```

### 3. إعداد قاعدة البيانات (تلقائي)

شغّل الأمر التالي. سيقوم بـ:
- إنشاء قاعدة البيانات `salon` إذا لم تكن موجودة
- تشغيل migrations
- إدخال البيانات الأولية

```bash
npm run db:setup
```

**ملاحظة:** يجب أن يكون PostgreSQL مثبتاً ويعمل. إذا ظهر خطأ اتصال:
- **Windows:** ثبّت من [postgresql.org](https://www.postgresql.org/download/windows/) وشغّل خدمة postgresql
- **macOS:** `brew install postgresql@16` ثم `brew services start postgresql@16`
- **Linux:** `sudo apt install postgresql` ثم `sudo systemctl start postgresql`

سيتم إنشاء:
- مستخدم إداري: `admin@salonshahd.com` / `admin123`
- خدمات نموذجية
- ساعات عمل
- مواعيد ووقت محجوب للاختبار

### 4. تشغيل التطبيق

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

### 5. تسجيل الدخول للوحة التحكم

1. اذهب إلى `/auth/signin`
2. سجّل الدخول بـ `admin@salonshahd.com` / `admin123`
3. اذهب إلى `/admin` للوصول للوحة التحكم

## أوامر قاعدة البيانات

| الأمر | الوصف |
|-------|-------|
| `npm run db:setup` | إعداد كامل: إنشاء DB إن لم تكن موجودة، migrate، seed |
| `npm run db:create` | إنشاء قاعدة البيانات فقط (إن لم تكن موجودة) |
| `npm run db:generate` | توليد عميل Prisma |
| `npm run db:push` | دفع المخطط إلى قاعدة البيانات (بدون migrations) |
| `npm run db:migrate` | تشغيل migrations |
| `npm run db:seed` | تشغيل البيانات الأولية |
| `npm run db:studio` | فتح Prisma Studio لإدارة البيانات |

## هيكل المشروع

```
src/
├── app/
│   ├── admin/           # لوحة التحكم (محمية)
│   ├── api/             # مسارات API
│   ├── auth/            # صفحات تسجيل الدخول والتسجيل
│   ├── book/            # صفحة الحجز
│   ├── contact/         # صفحة التواصل
│   ├── services/        # صفحة الخدمات
│   ├── actions/         # Server Actions
│   └── ...
├── components/
│   ├── admin/
│   ├── home/
│   └── layout/
├── lib/
│   ├── db.ts
│   └── booking-server.ts
├── auth.ts
└── middleware.ts
prisma/
├── schema.prisma
└── seed.ts
```

## النشر (Production) — موقع حي لعملاء حقيقيين

### المكدس المقترح

| الطبقة | خيارات شائعة |
|--------|----------------|
| تطبيق Next.js | [Vercel](https://vercel.com) (مُوصى به لهذا المشروع — `vercel.json` جاهز للتذكيرات) |
| PostgreSQL | [Neon](https://neon.tech)، [Supabase](https://supabase.com)، [Railway](https://railway.app)، أي Postgres مُدار |
| وسائط المعرض (إنتاج) | **Cloudinary** إلزامي لرفع المعرض على Vercel (التخزين المحلي غير مدعوم لرفع الملفات الدائم) |
| جدولة التذكيرات | **Vercel Cron** (`vercel.json`: كل ساعة `0 * * * *`) أو أي خدمة تضرب `GET /api/cron/appointment-reminders` مع `Authorization: Bearer CRON_SECRET` |

### متغيرات البيئة — مرجع كامل

انسخي `.env.example` إلى `.env` محلياً. في الإنتاج عيّني نفس المفاتيح في لوحة الاستضافة.

| المتغير | مطلوب | الوصف |
|---------|--------|--------|
| `DATABASE_URL` | نعم | اتصال PostgreSQL (SSL غالباً `?sslmode=require` مع السحابة) |
| `AUTH_SECRET` أو `NEXTAUTH_SECRET` | نعم (إنتاج) | سر توقيع الجلسات |
| `AUTH_URL` | نعم (إنتاج) | رابط الموقع العلني **بدون** شرطة مائلة أخيرة، مثل `https://salon.example.com` — **مهم لجلسات Auth.js والروابط المطلقة** |
| `TWILIO_ACCOUNT_SID` | للواتساب/SMS | من لوحة Twilio |
| `TWILIO_AUTH_TOKEN` | للواتساب/SMS | |
| `TWILIO_PHONE_NUMBER` | SMS | مرسل SMS بصيغة E.164 |
| `TWILIO_WHATSAPP_NUMBER` | واتساب | مثل `whatsapp:+14155238886` حسب Twilio |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | اختياري | قناة البريد في Nodemailer |
| `CRON_SECRET` | مُستحسن | حماية مسار التذكيرات خارج Vercel Cron |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | **نعم لرفع المعرض في الإنتاج** | بدونها يرفض `POST /api/admin/gallery` في `NODE_ENV=production` |
| `CLOUDINARY_GALLERY_FOLDER` | اختياري | مجلد في Cloudinary |
| `UPSTASH_REDIS_REST_URL` + `TOKEN` | اختياري | حدّ معدل موحّد بين عُقد serverless |
| `VERCEL` | تلقائي على Vercel | `1` — يسمح لـ Cron الرسمي باستدعاء التذكيرات |
| `ALLOW_ADMIN_TEST_WHATSAPP` | افتراضي معطّل في الإنتاج | ضعي `true` فقط مؤقتاً لتفعيل `POST /api/test-whatsapp` |

عند ربط **نطاق مخصص**: حدّثي `AUTH_URL` ليطابق النطاق العام (غالباً `https://www...`). لا حاجة لتعديل كود المسارات — Auth.js يستخدم `trustHost: true`.

### التحقق عند التشغيل (startup)

ملف جذر المشروع `instrumentation.ts` يستدعي `validateServerEnv()` عند بدء خادم Node:

- **إنتاج:** يتطلب `DATABASE_URL`، سر مصادقة، و **`AUTH_URL`** (وإلا يتوقف التشغيل).
- **تحذيرات (إنتاج):** قاعدة بيانات تبدو كـ localhost، غياب Twilio/SMTP/Cloudinary/Upstash — تُطبع في السجلات فقط.

### نشر على Vercel (خطوات عملية)

1. اربطي المستودع أو ارفعي المشروع إلى مشروع Vercel جديد.
2. أنشئي قاعدة Postgres (Neon مثلاً) وانسخي `DATABASE_URL` إلى **Environment Variables** في Vercel.
3. عيّني `AUTH_SECRET`، `AUTH_URL` (رابط الإنتاج)، ومتغيرات Twilio/SMTP وCloudinary حسب الحاجة.
4. **أمر البناء:** الافتراضي `next build` كافٍ؛ `postinstall` يشغّل `prisma generate` تلقائياً.
5. **بعد أول نشر ناجح** (أو قبله من الجهاز مع نفس `DATABASE_URL`):

   ```bash
   npx prisma migrate deploy
   ```

   لا تعتمدي على `db push` للإنتاج إذا كنتِ تستخدم مجلد `prisma/migrations`.

6. (اختياري) بذور بيانات أولية — **للتطوير/مرة واحدة** فقط، وليس لكل نشر:

   ```bash
   npm run db:seed
   ```

   أنشئي حساب إداري حقيقي وغيّري كلمة المرور فوراً.

7. تحققي من **Cron Jobs** في لوحة Vercel — يجب أن يظهر المسار `/api/cron/appointment-reminders` بالجدولة من `vercel.json`.

### التذكيرات (إنتاج)

- **المسار:** `GET /api/cron/appointment-reminders`
- **الأمان:** `Authorization: Bearer CRON_SECRET` **أو** (على Vercel فقط) `x-vercel-cron: 1` مع `VERCEL=1`
- **الجدولة:** كل ساعة — نافذة ~24 ساعة قبل الموعد؛ **لا تكرار** عملي بفضل `reminderSentAt` وسجل الإشعارات
- **السجلات:** تفاصيل آمنة في `console` على الاستضافة — لا تُعرض للمستخدم

### التخزين والمعرض

- **التطوير:** رفع المعرض قد يستخدم `public/uploads/gallery`.
- **الإنتاج:** **Cloudinary إلزامي** لمسار رفع المعرض الإداري؛ وإلا يعاد خطأ واضح بالعربية.

### التحقق من البناء محلياً

```bash
npm run prod:check
```

(يشغّل `prisma validate`، `prisma generate`، و`next build`.)

### الأمان قبل الإطلاق

- **`/admin`** و`/book` و`/profile` محمية عبر `middleware.ts`؛ مسارات `api/admin/*` تتحقق من جلسة **ADMIN** في كل route.
- **الأسرار** لا تُرفع إلى Git — استخدمي متغيرات البيئة فقط.
- **أخطاء API** موحّدة وآمنة للمستخدم (`src/lib/api-response.ts`).
- **Rate limiting:** مفعّل على مسارات حساسة؛ للإنتاج متعدد العُقد استخدمي Upstash.
- **`/api/test-whatsapp`:** معطّل في الإنتاج ما لم تضيفي `ALLOW_ADMIN_TEST_WHATSAPP=true` (للتشخيص المؤقت فقط).

### استجابات الأخطاء في API

مسارات `api/*` تعيد `{ "ok": false, "error", "code" }` واختياريًا `issues` للتحقق (Zod). التفاصيل التقنية في السجلات فقط.

### الأرشفة الناعمة (Soft delete)

- **الخدمات، العملاء، معرض الصور:** أرشفة ناعمة مع استعادة من لوحة الإدارة؛ تفاصيل سابقة في نفس المستند.

### قائمة تحقق نشر + QA (قبل فتح الموقع للعملاء)

| # | السيناريو | ماذا تتحققين |
|---|-----------|----------------|
| 1 | **تسجيل** | عميلة جديدة في `/register` أو `/auth/signup` — إنشاء حساب بدون أخطاء. |
| 2 | **تسجيل دخول** | `/login` — جلسة تعمل؛ `AUTH_URL` يطابق النطاق. |
| 3 | **حجز** | `/book` — موعد جديد بحالة `pending` فقط؛ لا رسالة تأكيد رسمية قبل الإدارة. |
| 4 | **تأكيد إداري** | `/admin/appointments` — من `pending` إلى `confirmed` مرة واحدة؛ واتساب/قناة العميل تعمل. |
| 5 | **واتساب** | رسالة التأكيد تصل برقم E.164 صحيح (+972…). |
| 6 | **تذكير** | بعد التأكيد، خلال نافذة 24 ساعة — استدعاء cron أو انتظار Vercel Cron؛ تذكير واحد؛ `reminderSentAt` يُملأ. |
| 7 | **زيارة مكتملة** | `completed` من الإدارة — إشعار إن وُجدت القناة؛ ولاء يتحدث للمستخدم المرتبط. |
| 8 | **ولاء** | خصم على حجز لاحق؛ إشعار ترقية مرة لكل مستوى. |
| 9 | **إلغاء** | من الملف الشخصي ضمن السياسة — `cancelled`. |
| 10 | **إعادة جدولة** | من الملف الشخصي — قواعد الساعات/الحظر/التداخل. |
| 11 | **معرض** | رفع صورة في الإنتاج عبر Cloudinary — ظهورها في الرئيسية عند النشر. |

### قواعد العمل الأساسية (للمراجعة)

- حجز العميلة → **pending** فقط؛ التأكيد الرسمي عند **تأكيد الإدارة** فقط.
- التذكير → **confirmed** فقط؛ منع التكرار (`reminderSentAt` + سجل إشعارات).
- الولاء → **completed** لنفس **userId**؛ إشعار المكافأة مرة لكل مستوى خصم.
- منع الحجز المزدوج + ساعات العمل + الأوقات المحجوبة + buffer (`booking-engine`, `reschedule-appointment`).

## ملاحظات

- الموقع بالكامل بالعربية مع تخطيط RTL
- العملة: ريال سعودي (SAR)
- رابط لوحة التحكم `/admin` غير ظاهر في القائمة العامة
- غيّر كلمة مرور المدير فوراً في بيئة الإنتاج
