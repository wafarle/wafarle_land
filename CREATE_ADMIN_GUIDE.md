# 🔐 دليل إنشاء حساب Admin

## ❌ المشكلة

عند محاولة تسجيل الدخول لـ `/admin`، تظهر رسالة الخطأ:

```
Firebase: Error (auth/invalid-credential)
```

**السبب:** حساب Admin غير موجود في Firebase Authentication.

---

## ✅ الحل - طريقتان

### الطريقة 1: استخدام Script تلقائي (موصى به) ⚡

#### الخطوة 1: تأكد من تفعيل Email/Password Authentication

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/project/wafarle-63a71/authentication/providers)
2. اضغط على **Authentication** > **Sign-in method**
3. تأكد من تفعيل **Email/Password**
4. إذا لم يكن مفعّلاً، فعّله الآن

#### الخطوة 2: شغّل Script إنشاء Admin

```bash
cd wafrly-landing
node scripts/create-admin.mjs
```

**النتيجة المتوقعة:**
```
🚀 Starting admin user creation...

📝 Creating admin user...
   Email: admin@wafarle.com
   Password: admin123

✅ Admin user created successfully!
   UID: abc123xyz...
   Email: admin@wafarle.com

🎉 You can now login with:
   Email: admin@wafarle.com
   Password: admin123
```

#### الخطوة 3: جرّب تسجيل الدخول

1. اذهب إلى: http://localhost:3000/admin
2. أدخل:
   - **البريد:** admin@wafarle.com
   - **كلمة المرور:** admin123
3. اضغط **تسجيل الدخول**

✅ يجب أن يعمل الآن!

---

### الطريقة 2: إنشاء يدوي عبر Firebase Console 🖱️

#### الخطوة 1: افتح Firebase Console

اذهب إلى: [Firebase Authentication Users](https://console.firebase.google.com/project/wafarle-63a71/authentication/users)

#### الخطوة 2: أضف مستخدم جديد

1. اضغط **Add user**
2. أدخل:
   - **Email:** admin@wafarle.com
   - **Password:** admin123
3. اضغط **Add user**

#### الخطوة 3: جرّب تسجيل الدخول

نفس الخطوات في الطريقة 1.

---

## 🔍 استكشاف الأخطاء

### خطأ: "Email/Password authentication is not enabled"

**الحل:**
1. اذهب إلى [Sign-in providers](https://console.firebase.google.com/project/wafarle-63a71/authentication/providers)
2. اضغط على **Email/Password**
3. فعّل الخيار
4. حفظ

### خطأ: "Email already in use"

**الحل:**
- الحساب موجود بالفعل! جرّب تسجيل الدخول:
  - Email: admin@wafarle.com
  - Password: admin123

- إذا نسيت كلمة المرور:
  1. اذهب إلى [Firebase Users](https://console.firebase.google.com/project/wafarle-63a71/authentication/users)
  2. ابحث عن admin@wafarle.com
  3. اضغط ⋮ (ثلاث نقاط)
  4. اختر **Reset password**

### خطأ: "Cannot find module 'firebase/app'"

**الحل:**
```bash
cd wafrly-landing
npm install
```

---

## 🔒 أمان الحساب

### ⚠️ مهم جداً:

1. **كلمة المرور الحالية ضعيفة!**
   - الحالية: `admin123`
   - استخدمها فقط للتطوير

2. **قبل النشر في Production:**
   - غيّر كلمة المرور إلى كلمة قوية
   - استخدم: حروف + أرقام + رموز
   - مثال: `Admin#2025$Secure!`

3. **كيفية تغيير كلمة المرور:**

   أ) من Firebase Console:
   - اذهب إلى [Firebase Users](https://console.firebase.google.com/project/wafarle-63a71/authentication/users)
   - ابحث عن admin@wafarle.com
   - اضغط ⋮ > **Reset password**
   - أدخل كلمة مرور جديدة

   ب) من التطبيق (بعد تسجيل الدخول):
   - يمكنك إضافة صفحة "تغيير كلمة المرور"
   - استخدم `updatePassword()` من Firebase Auth

---

## 📝 معلومات إضافية

### بيانات المشروع:
- **Project ID:** wafarle-63a71
- **Auth Domain:** wafarle-63a71.firebaseapp.com
- **Console:** https://console.firebase.google.com/project/wafarle-63a71

### بيانات الدخول الافتراضية:
- **Email:** admin@wafarle.com
- **Password:** admin123

### صلاحيات Admin:
- في `auth.ts`، الصلاحيات تُحدد بناءً على البريد الإلكتروني
- أي حساب بـ email: `admin@wafarle.com` يعتبر Admin

```typescript
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.email === 'admin@wafarle.com';
};
```

---

## 🚀 ماذا بعد؟

بعد إنشاء الحساب بنجاح:

1. ✅ سجّل الدخول إلى `/admin`
2. ✅ ستصل إلى `/admin/dashboard`
3. ✅ يمكنك إدارة:
   - المنتجات
   - الطلبات
   - التراخيص
   - المدونة
   - المراجعات
   - الإعدادات

---

## 🆘 لا يزال لا يعمل؟

### تحقق من:

1. **Firebase مفعّل؟**
   ```javascript
   // في src/lib/firebase.ts
   export const FIREBASE_ENABLED = true; // يجب أن تكون true
   ```

2. **Email/Password مفعّل في Firebase؟**
   - تحقق من [Providers](https://console.firebase.google.com/project/wafarle-63a71/authentication/providers)

3. **الحساب موجود؟**
   - تحقق من [Users](https://console.firebase.google.com/project/wafarle-63a71/authentication/users)

4. **البيانات صحيحة؟**
   - Email: `admin@wafarle.com` (تأكد من عدم وجود مسافات)
   - Password: `admin123`

---

## 📚 مصادر إضافية

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Create User with Email/Password](https://firebase.google.com/docs/auth/web/password-auth)
- [Manage Users](https://firebase.google.com/docs/auth/web/manage-users)

---

**تم إنشاء هذا الدليل بواسطة:** AI Assistant  
**التاريخ:** 2025-11-02  
**الحالة:** ✅ جاهز للتطبيق

