# 🚀 دليل البدء السريع - Quick Start Guide

## خطوات فصل نظام التراخيص في 10 دقائق

---

## ✅ المرحلة الأولى: المشروع الأصلي (Backend)

### 1. تأكد من أن المشروع الأصلي يعمل

```bash
cd wafrly-landing
npm run dev
```

يجب أن يعمل على `http://localhost:3000`

### 2. اختبر الـ APIs الجديدة

```bash
# اختبار جلب التراخيص
curl http://localhost:3000/api/licenses

# اختبار جلب الإصدارات
curl http://localhost:3000/api/versions

# اختبار آخر إصدار
curl http://localhost:3000/api/versions?latest=true
```

إذا عملت APIs بنجاح ✅ انتقل للمرحلة التالية

---

## ✅ المرحلة الثانية: إنشاء المشروع المنفصل

### 1. إنشاء المشروع

```bash
cd ..  # اخرج من مجلد wafrly-landing
npx create-next-app@latest wafrly-licenses-dashboard --typescript --tailwind --app
cd wafrly-licenses-dashboard
```

### 2. تثبيت المكتبات

```bash
npm install axios framer-motion lucide-react date-fns recharts
```

### 3. إنشاء هيكل المجلدات

```bash
# Windows
mkdir src\lib src\hooks src\components
mkdir src\app\licenses\[id]
mkdir src\app\stores\[id]

# Linux/Mac
mkdir -p src/lib src/hooks src/components
mkdir -p src/app/licenses/\[id\]
mkdir -p src/app/stores/\[id\]
```

### 4. إنشاء ملف البيئة

أنشئ `.env.local` في مجلد المشروع:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_KEY=your-secret-key-here
```

---

## ✅ المرحلة الثالثة: نسخ الملفات الأساسية

### 1. أنشئ `src/lib/api-client.ts`

انسخ المحتوى من ملف `SEPARATED_PROJECT_STRUCTURE.md` القسم 3

### 2. أنشئ `src/lib/types.ts`

انسخ المحتوى من ملف `SEPARATED_PROJECT_STRUCTURE.md` القسم 4

### 3. أنشئ `src/lib/licenses-api.ts`

انسخ المحتوى من ملف `SEPARATED_PROJECT_STRUCTURE.md` القسم 5

### 4. أنشئ `src/hooks/useLicenses.ts`

انسخ المحتوى من ملف `SEPARATED_PROJECT_STRUCTURE.md` القسم 6

### 5. استبدل `src/app/page.tsx`

انسخ المحتوى من ملف `SEPARATED_PROJECT_STRUCTURE.md` القسم 7

---

## ✅ المرحلة الرابعة: التشغيل

### 1. شغل المشروع المنفصل

```bash
cd wafrly-licenses-dashboard
npm run dev
```

سيعمل على `http://localhost:3001`

### 2. افتح المتصفح

```
http://localhost:3001
```

يجب أن ترى لوحة التراخيص مع البيانات من Firebase! 🎉

---

## 🧪 اختبار سريع

### 1. تأكد من ظهور التراخيص

يجب أن ترى:
- ✅ إحصائيات التراخيص (إجمالي، نشط، تجريبي، منتهي)
- ✅ قائمة بجميع التراخيص
- ✅ تفاصيل كل ترخيص

### 2. تأكد من عمل التحديث

اضغط زر التحديث (🔄) يجب أن يعيد تحميل البيانات

### 3. اختبر التنقل

اضغط على أي ترخيص للانتقال لصفحة التفاصيل

---

## 🔧 حل المشاكل الشائعة

### ❌ خطأ: CORS Error

**الحل:** أضف في `src/middleware.ts` للمشروع الأصلي:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
    return response;
  }
  return NextResponse.next();
}
```

### ❌ خطأ: Connection Refused

**السبب:** المشروع الأصلي غير مشغل

**الحل:** شغل المشروع الأصلي أولاً:
```bash
cd wafrly-landing
npm run dev
```

### ❌ خطأ: 404 Not Found

**السبب:** API endpoints غير موجودة

**الحل:** تأكد من إنشاء ملفات الـ API في:
- `src/app/api/licenses/route.ts`
- `src/app/api/licenses/[id]/route.ts`
- `src/app/api/versions/route.ts`

### ❌ خطأ: Firebase not initialized

**السبب:** Firebase غير متصل

**الحل:** تأكد من ملف `.env.local` في المشروع الأصلي يحتوي على:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# إلخ...
```

---

## 📊 الخطوات التالية

بعد نجاح التشغيل الأساسي:

### 1. أضف صفحة تفاصيل الترخيص

`src/app/licenses/[id]/page.tsx`

### 2. أضف صفحة المتجر

`src/app/stores/[id]/page.tsx`

### 3. أضف صفحة الإصدارات

`src/app/versions/page.tsx`

### 4. أضف Authentication

### 5. أضف Error Handling محسن

### 6. أضف Loading States

---

## 🎯 Checklist للتأكد من اكتمال الإعداد

- [ ] المشروع الأصلي يعمل على port 3000
- [ ] APIs تستجيب بنجاح عند الاختبار
- [ ] المشروع المنفصل تم إنشاؤه
- [ ] جميع المكتبات تم تثبيتها
- [ ] ملف `.env.local` تم إنشاؤه
- [ ] ملفات API Client تم إنشاؤها
- [ ] المشروع المنفصل يعمل على port 3001
- [ ] البيانات تظهر في لوحة التحكم
- [ ] التنقل بين الصفحات يعمل
- [ ] زر التحديث يعمل

---

## 📱 هيكل نهائي للمشاريع

```
projects/
├── wafrly-landing/                    # المشروع الأصلي (Backend)
│   ├── src/app/api/
│   │   ├── licenses/                 # ✅ APIs جديدة
│   │   └── versions/                 # ✅ APIs جديدة
│   └── ...
│
└── wafrly-licenses-dashboard/         # المشروع المنفصل (Frontend)
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # الصفحة الرئيسية
    │   │   ├── licenses/[id]/
    │   │   └── stores/[id]/
    │   ├── lib/
    │   │   ├── api-client.ts         # ✅
    │   │   ├── types.ts              # ✅
    │   │   └── licenses-api.ts       # ✅
    │   └── hooks/
    │       └── useLicenses.ts        # ✅
    └── .env.local                    # ✅
```

---

## 🎉 تم!

الآن لديك:
- ✅ APIs كاملة للتراخيص
- ✅ APIs كاملة للإصدارات  
- ✅ مشروع منفصل يعمل
- ✅ اتصال ناجح بين المشروعين
- ✅ لوحة تحكم مستقلة للتراخيص

---

## 💡 نصائح إضافية

1. **للتطوير:** استخدم `npm run dev` في كلا المشروعين
2. **للإنتاج:** انشر كل مشروع على دومين منفصل
3. **للأمان:** أضف JWT authentication للـ APIs
4. **للأداء:** استخدم SWR أو React Query للتخزين المؤقت
5. **للمراقبة:** أضف logging لكل API call

---

تم إنشاء هذا الدليل: 2025 🚀

