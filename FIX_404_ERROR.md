# 🔧 حل خطأ 404 - Fix API 404 Error

## ❌ المشكلة

```
AxiosError: Request failed with status code 404
GET http://localhost:3000/api/licenses
```

---

## ✅ الحل

### الخطوة 1: تأكد من تشغيل المشروع الأصلي

```bash
# افتح Terminal جديد
cd wafrly-landing
npm run dev
```

**يجب أن ترى:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in X.Xs
```

---

### الخطوة 2: اختبر الـ API مباشرة

افتح المتصفح على:
```
http://localhost:3000/api/licenses
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "licenses": [...],
  "total": X
}
```

**إذا رأيت خطأ 404:**
- تأكد من وجود ملف `src/app/api/licenses/route.ts`
- أعد تشغيل المشروع الأصلي

---

### الخطوة 3: تحقق من الملفات

تأكد من وجود هذه الملفات في `wafrly-landing`:

```
✅ src/app/api/licenses/route.ts
✅ src/app/api/licenses/[id]/route.ts
✅ src/app/api/licenses/verify/route.ts
✅ src/app/api/versions/route.ts
✅ src/app/api/versions/[id]/route.ts
```

---

### الخطوة 4: تحقق من الـ .env.local في المشروع الجديد

في `wafrly-licenses-dashboard/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_KEY=your-secret-api-key-here
```

**مهم:** لا توجد `/` في النهاية!

---

## 🧪 الاختبار

### في المشروع الأصلي (wafrly-landing):

```bash
# Windows PowerShell
Invoke-RestMethod -Uri http://localhost:3000/api/licenses

# أو افتح في المتصفح
http://localhost:3000/api/licenses
```

### في المشروع الجديد (wafrly-licenses-dashboard):

```bash
# أعد تشغيل المشروع
npm run dev
```

ثم افتح `http://localhost:3001`

---

## 📋 Checklist للتأكد

- [ ] المشروع الأصلي يعمل على port 3000
- [ ] يمكنك فتح `http://localhost:3000/api/licenses` في المتصفح
- [ ] ترى استجابة JSON (ليس 404)
- [ ] ملف `.env.local` موجود في المشروع الجديد
- [ ] الـ URL في `.env.local` صحيح
- [ ] أعدت تشغيل المشروع الجديد

---

## 🔄 إعادة التشغيل الكاملة

إذا استمرت المشكلة:

### Terminal 1 (المشروع الأصلي):
```bash
cd wafrly-landing
# أوقف المشروع (Ctrl+C)
npm run dev
```

### Terminal 2 (المشروع الجديد):
```bash
cd wafrly-licenses-dashboard
# أوقف المشروع (Ctrl+C)
npm run dev
```

---

## 🐛 مشاكل شائعة أخرى

### خطأ: Port already in use

**الحل:**
```bash
# غير البورت في package.json
"dev": "next dev -p 3002"
```

### خطأ: CORS

إذا رأيت خطأ CORS:

في `wafrly-landing/src/middleware.ts`:
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

export const config = {
  matcher: '/api/:path*',
};
```

---

## ✅ حل سريع (Quick Fix)

```bash
# Terminal 1
cd wafrly-landing
npm run dev

# انتظر حتى يبدأ...

# Terminal 2
cd wafrly-licenses-dashboard
npm run dev

# افتح المتصفح
http://localhost:3001
```

---

## 📞 لا زال لا يعمل؟

1. تحقق من console في المشروع الأصلي - هل هناك أخطاء؟
2. جرب فتح `http://localhost:3000/api/licenses` في المتصفح
3. تحقق من firewall أو antivirus
4. جرب port مختلف

---

تم! ✅

