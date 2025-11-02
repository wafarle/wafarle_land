# 🏢 دليل فصل نظام التراخيص - License System Separation Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية فصل نظام التراخيص `/licenses/dashboard` ليصبح مشروع مستقل متصل بالمشروع الأصلي عبر APIs.

---

## 🏗️ المعمارية Architecture

```
┌─────────────────────────────────┐
│   المشروع الأصلي (Backend)        │
│   wafrly-landing                │
│                                 │
│   ✅ Firebase / Database        │
│   ✅ Authentication             │
│   ✅ APIs للتراخيص               │
│   ✅ APIs للإصدارات             │
│   ✅ APIs للتحقق                │
│                                 │
└────────────┬────────────────────┘
             │
             │ REST APIs
             │ HTTP/HTTPS
             ▼
┌─────────────────────────────────┐
│   المشروع المنفصل (Frontend)      │
│   wafrly-licenses-dashboard     │
│                                 │
│   ✅ لوحة التحكم بالتراخيص        │
│   ✅ إدارة المتاجر والتجار        │
│   ✅ إدارة الإصدارات             │
│   ✅ التقارير والإحصائيات         │
│                                 │
└─────────────────────────────────┘
```

---

## 📁 هيكل المشروع الأصلي (Backend APIs)

تم إضافة APIs التالية في المشروع الأصلي:

```
src/app/api/
├── licenses/
│   ├── route.ts                 # GET (all), POST (create)
│   ├── [id]/
│   │   └── route.ts            # GET, PUT, DELETE (single)
│   └── verify/
│       └── route.ts            # POST (verify license)
│
├── versions/
│   ├── route.ts                # GET (all/latest), POST (create)
│   └── [id]/
│       └── route.ts            # PUT, DELETE (single)
│
└── check-updates/
    └── route.ts                # POST (check updates)
```

---

## 🔌 API Endpoints

### 1️⃣ **Licenses APIs**

#### GET `/api/licenses` - جلب جميع التراخيص
```json
Response:
{
  "success": true,
  "licenses": [...],
  "total": 10
}
```

#### POST `/api/licenses` - إنشاء ترخيص جديد
```json
Request:
{
  "customerName": "محمد أحمد",
  "customerEmail": "mohamed@example.com",
  "domain": "store.example.com",
  "type": "professional",
  "isPermanent": false,
  "features": ["unlimited_products", "advanced_analytics"],
  "expiryDate": "2025-12-31"
}

Response:
{
  "success": true,
  "licenseId": "xxx",
  "licenseKey": "XXXX-YYYY-ZZZZ-WWWW"
}
```

#### GET `/api/licenses/[id]` - جلب ترخيص محدد
```json
Response:
{
  "success": true,
  "license": { ... }
}
```

#### PUT `/api/licenses/[id]` - تحديث ترخيص
```json
Request:
{
  "status": "active",
  "expiryDate": "2026-12-31",
  ...
}

Response:
{
  "success": true,
  "message": "License updated successfully"
}
```

#### DELETE `/api/licenses/[id]` - حذف ترخيص
```json
Response:
{
  "success": true,
  "message": "License deleted successfully"
}
```

#### POST `/api/licenses/verify` - التحقق من ترخيص
```json
Request:
{
  "licenseKey": "XXXX-YYYY-ZZZZ-WWWW",
  "domain": "store.example.com",
  "currentVersion": "1.0.0"
}

Response:
{
  "success": true,
  "valid": true,
  "license": { ... }
}
```

---

### 2️⃣ **Versions APIs**

#### GET `/api/versions` - جلب جميع الإصدارات
```json
Response:
{
  "success": true,
  "versions": [...],
  "total": 5
}
```

#### GET `/api/versions?latest=true` - جلب آخر إصدار
```json
Response:
{
  "success": true,
  "version": {
    "version": "1.5.0",
    "title": "تحديث مهم",
    ...
  }
}
```

#### POST `/api/versions` - إنشاء إصدار جديد
```json
Request:
{
  "version": "1.5.0",
  "title": "تحديث مهم",
  "description": "...",
  "features": [...],
  "isLatest": true,
  "isStable": true
}

Response:
{
  "success": true,
  "versionId": "xxx"
}
```

#### PUT `/api/versions/[id]` - تحديث إصدار
#### DELETE `/api/versions/[id]` - حذف إصدار

---

### 3️⃣ **Updates API**

#### POST `/api/check-updates` - فحص التحديثات
```json
Request:
{
  "licenseKey": "XXXX-YYYY-ZZZZ-WWWW",
  "domain": "store.example.com",
  "currentVersion": "1.0.0"
}

Response:
{
  "success": true,
  "hasUpdate": true,
  "currentVersion": "1.0.0",
  "latestVersion": "1.5.0",
  "updateInfo": { ... }
}
```

---

## 🚀 خطوات إنشاء المشروع المنفصل

### المرحلة 1: إنشاء المشروع

```bash
# إنشاء مشروع Next.js جديد
npx create-next-app@latest wafrly-licenses-dashboard --typescript --tailwind --app

cd wafrly-licenses-dashboard
```

### المرحلة 2: تثبيت المكتبات المطلوبة

```bash
npm install axios
npm install framer-motion
npm install lucide-react
npm install date-fns
npm install recharts  # للرسوم البيانية
```

### المرحلة 3: إنشاء ملف البيئة

أنشئ `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# أو في الإنتاج:
# NEXT_PUBLIC_API_URL=https://yourstore.com/api

# Optional: API Key for authentication
NEXT_PUBLIC_API_KEY=your-secret-api-key
```

### المرحلة 4: إنشاء API Client

أنشئ `src/lib/api-client.ts`:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

export default apiClient;
```

---

## 📦 نقل المكونات

### ملفات يجب نقلها من المشروع الأصلي:

1. **الصفحات:**
   - `src/app/licenses/dashboard/page.tsx`
   - `src/app/licenses/store/[id]/page.tsx`

2. **المكونات:**
   - `src/components/admin/LicensesTab.tsx`
   - `src/components/admin/VersionsTab.tsx`

3. **الأنواع (Types):**
   - نسخ `License`, `SystemVersion` من `src/lib/firebase.ts`

---

## 🔄 تعديل الكود ليستخدم APIs

### مثال: تحويل `getLicenses()` من Firebase إلى API

**قبل (Firebase مباشرة):**
```typescript
import { getLicenses } from '@/lib/license-management';

const licenses = await getLicenses();
```

**بعد (API Call):**
```typescript
import apiClient from '@/lib/api-client';

const response = await apiClient.get('/licenses');
const licenses = response.data.licenses;
```

### مثال كامل: `src/lib/licenses-api.ts`

```typescript
import apiClient from './api-client';
import { License, SystemVersion } from './types';

// Licenses
export const getLicenses = async (): Promise<License[]> => {
  const response = await apiClient.get('/licenses');
  return response.data.licenses;
};

export const getLicenseById = async (id: string): Promise<License> => {
  const response = await apiClient.get(`/licenses/${id}`);
  return response.data.license;
};

export const createLicense = async (data: any): Promise<string> => {
  const response = await apiClient.post('/licenses', data);
  return response.data.licenseKey;
};

export const updateLicense = async (id: string, data: any): Promise<void> => {
  await apiClient.put(`/licenses/${id}`, data);
};

export const deleteLicense = async (id: string): Promise<void> => {
  await apiClient.delete(`/licenses/${id}`);
};

export const verifyLicense = async (
  licenseKey: string, 
  domain: string
): Promise<any> => {
  const response = await apiClient.post('/licenses/verify', {
    licenseKey,
    domain,
  });
  return response.data;
};

// Versions
export const getVersions = async (): Promise<SystemVersion[]> => {
  const response = await apiClient.get('/versions');
  return response.data.versions;
};

export const getLatestVersion = async (): Promise<SystemVersion> => {
  const response = await apiClient.get('/versions?latest=true');
  return response.data.version;
};

export const createVersion = async (data: any): Promise<string> => {
  const response = await apiClient.post('/versions', data);
  return response.data.versionId;
};

export const updateVersion = async (id: string, data: any): Promise<void> => {
  await apiClient.put(`/versions/${id}`, data);
};

export const deleteVersion = async (id: string): Promise<void> => {
  await apiClient.delete(`/versions/${id}`);
};
```

---

## 🔐 إضافة Authentication للـ APIs

في المشروع الأصلي، قم بتعديل APIs لتتحقق من المصادقة:

```typescript
// src/app/api/licenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  // التحقق من API Key
  const headersList = headers();
  const apiKey = headersList.get('x-api-key');
  
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // باقي الكود...
}
```

في `.env` للمشروع الأصلي:
```env
API_SECRET_KEY=your-super-secret-key-here
```

---

## 🌐 CORS Configuration

إذا كان المشروع المنفصل على دومين مختلف، أضف CORS:

```typescript
// src/middleware.ts (في المشروع الأصلي)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if it's an API route
  if (request.nextUrl.pathname.startsWith('/api/licenses') || 
      request.nextUrl.pathname.startsWith('/api/versions')) {
    
    const response = NextResponse.next();
    
    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
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

## 📊 هيكل المشروع المنفصل

```
wafrly-licenses-dashboard/
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
├── public/
│   └── logo.svg
│
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                    # لوحة التحكم الرئيسية
    │   ├── licenses/
    │   │   └── [id]/
    │   │       └── page.tsx            # تفاصيل الترخيص
    │   └── stores/
    │       └── [id]/
    │           └── page.tsx            # صفحة المتجر
    │
    ├── components/
    │   ├── LicensesTable.tsx
    │   ├── VersionsTable.tsx
    │   ├── StoreDetails.tsx
    │   └── charts/
    │       └── LicensesChart.tsx
    │
    ├── lib/
    │   ├── api-client.ts               # Axios instance
    │   ├── licenses-api.ts             # API functions
    │   └── types.ts                    # TypeScript types
    │
    └── hooks/
        ├── useLicenses.ts
        └── useVersions.ts
```

---

## 🧪 اختبار الـ APIs

### استخدام Postman أو cURL:

```bash
# 1. جلب جميع التراخيص
curl -X GET http://localhost:3000/api/licenses

# 2. إنشاء ترخيص جديد
curl -X POST http://localhost:3000/api/licenses \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "أحمد محمد",
    "customerEmail": "ahmed@example.com",
    "domain": "store.example.com",
    "type": "professional"
  }'

# 3. التحقق من ترخيص
curl -X POST http://localhost:3000/api/licenses/verify \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "XXXX-YYYY-ZZZZ-WWWW",
    "domain": "store.example.com"
  }'

# 4. جلب آخر إصدار
curl -X GET http://localhost:3000/api/versions?latest=true
```

---

## 🚀 التشغيل والنشر

### تشغيل محلي:

```bash
# المشروع الأصلي (Backend)
cd wafrly-landing
npm run dev # Port 3000

# المشروع المنفصل (Frontend)
cd wafrly-licenses-dashboard
npm run dev # Port 3001
```

### النشر:

1. **المشروع الأصلي:** انشره كالمعتاد على Vercel/Netlify
2. **المشروع المنفصل:** انشره على دومين منفصل أو subdomain
   - مثال: `licenses.wafrly.com`

تأكد من تحديث `NEXT_PUBLIC_API_URL` في المشروع المنفصل ليشير للدومين الصحيح.

---

## ✅ Checklist

- [ ] تم إنشاء جميع API endpoints في المشروع الأصلي
- [ ] تم اختبار APIs باستخدام Postman
- [ ] تم إنشاء المشروع المنفصل
- [ ] تم تثبيت المكتبات المطلوبة
- [ ] تم إنشاء API Client
- [ ] تم نقل المكونات والصفحات
- [ ] تم تعديل الكود ليستخدم APIs بدلاً من Firebase مباشرة
- [ ] تم إضافة Authentication/Authorization
- [ ] تم إضافة CORS (إذا لزم الأمر)
- [ ] تم الاختبار المحلي
- [ ] تم النشر

---

## 📝 ملاحظات مهمة

1. **الأمان:** تأكد من تأمين APIs بـ API Keys أو JWT
2. **معالجة الأخطاء:** أضف try-catch في جميع API calls
3. **Loading States:** أضف مؤشرات تحميل للمستخدم
4. **Caching:** استخدم SWR أو React Query للتخزين المؤقت
5. **Rate Limiting:** أضف حدود للطلبات لتجنب الإساءة
6. **Logging:** أضف سجلات لجميع API calls للمراقبة

---

## 🆘 الدعم

إذا واجهت أي مشاكل:
1. تحقق من console.log في كلا المشروعين
2. تأكد من أن المشروع الأصلي يعمل على Port 3000
3. تحقق من CORS headers
4. تحقق من API Keys والمصادقة

---

تم إنشاء هذا الدليل بواسطة: Assistant AI
التاريخ: 2025

