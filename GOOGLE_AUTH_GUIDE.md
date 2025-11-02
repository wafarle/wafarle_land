# 🔐 تسجيل الدخول وإنشاء الحساب باستخدام Google

## ✅ تم تفعيل Google Auth بنجاح!

لقد قمت بإضافة تسجيل الدخول وإنشاء الحساب باستخدام Google إلى النظام. إليك ملخص الميزة:

### 🎯 **الميزات المضافة**

#### 1. **Google Auth Provider**
- ✅ تم إضافة `GoogleAuthProvider` إلى Firebase
- ✅ تم تكوين Provider مع `prompt: 'select_account'`
- ✅ تم إضافة حقل `authProvider` إلى واجهة `Customer`

#### 2. **دوال المصادقة**
- ✅ `signInWithGoogle()` - تسجيل الدخول باستخدام Google
- ✅ إنشاء حساب تلقائي للمستخدمين الجدد
- ✅ ربط الحسابات الموجودة بـ Google
- ✅ معالجة الأخطاء الشائعة

#### 3. **واجهة المستخدم**
- ✅ زر Google في صفحة تسجيل الدخول
- ✅ زر Google في صفحة إنشاء الحساب
- ✅ تصميم متجاوب مع أيقونة Google الرسمية
- ✅ رسائل خطأ واضحة باللغة العربية

## 🔧 **كيفية العمل**

### **تسجيل الدخول بـ Google**
```typescript
const handleGoogleSignIn = async () => {
  setIsLoading(true);
  setError('');

  try {
    await signInWithGoogle();
    router.push('/customer/dashboard');
  } catch (error: any) {
    setError(error.message || 'حدث خطأ في تسجيل الدخول باستخدام Google');
  } finally {
    setIsLoading(false);
  }
};
```

### **إنشاء حساب بـ Google**
```typescript
const handleGoogleSignUp = async () => {
  setIsLoading(true);
  setError('');

  try {
    await signInWithGoogle(); // نفس الدالة تعمل للتسجيل والإنشاء
    router.push('/customer/dashboard');
  } catch (error: any) {
    setError(error.message || 'حدث خطأ في إنشاء الحساب باستخدام Google');
  } finally {
    setIsLoading(false);
  }
};
```

## 🎨 **التصميم البصري**

### **زر Google**
```typescript
<button
  type="button"
  onClick={handleGoogleSignIn}
  disabled={isLoading}
  className="w-full py-3 px-4 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
>
  <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
    {/* Google Logo SVG */}
  </svg>
  تسجيل الدخول باستخدام Google
</button>
```

### **فاصل بصري**
```typescript
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300"></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-white text-gray-500">أو</span>
  </div>
</div>
```

## 🔄 **تدفق العمل**

### **للمستخدمين الجدد**
1. **النقر على زر Google** → فتح نافذة Google
2. **اختيار حساب Google** → تسجيل الدخول
3. **إنشاء سجل عميل** → حفظ البيانات في قاعدة البيانات
4. **التوجه للوحة التحكم** → `/customer/dashboard`

### **للمستخدمين الموجودين**
1. **النقر على زر Google** → فتح نافذة Google
2. **اختيار حساب Google** → تسجيل الدخول
3. **البحث عن العميل** → في قاعدة البيانات
4. **ربط الحساب** → إضافة `authProvider: 'google'`
5. **التوجه للوحة التحكم** → `/customer/dashboard`

## 📊 **إدارة البيانات**

### **حقل authProvider**
```typescript
export interface Customer {
  // ... other fields
  authProvider?: 'email' | 'google' | 'facebook' | 'apple';
}
```

### **إنشاء عميل جديد**
```typescript
const customerId = await addCustomer({
  name: user.displayName || 'مستخدم Google',
  email: user.email || '',
  phone: user.phoneNumber || '',
  status: 'active',
  lastOrderDate: new Date(),
  authProvider: 'google',
  totalOrders: 0,
  totalSpent: 0,
  averageOrderValue: 0,
  registrationDate: new Date()
});
```

## 🚨 **معالجة الأخطاء**

### **أخطاء شائعة**
```typescript
let errorMessage = 'حدث خطأ في تسجيل الدخول باستخدام Google';
if (error.code === 'auth/popup-closed-by-user') {
  errorMessage = 'تم إغلاق نافذة تسجيل الدخول';
} else if (error.code === 'auth/popup-blocked') {
  errorMessage = 'تم حظر نافذة تسجيل الدخول، يرجى السماح بالنوافذ المنبثقة';
} else if (error.code === 'auth/cancelled-popup-request') {
  errorMessage = 'تم إلغاء طلب تسجيل الدخول';
}
```

## 🧪 **الاختبار**

### **1. اختبار تسجيل الدخول**
1. اذهب إلى `/auth/login`
2. انقر على "تسجيل الدخول باستخدام Google"
3. اختر حساب Google
4. تحقق من التوجه للوحة التحكم

### **2. اختبار إنشاء الحساب**
1. اذهب إلى `/auth/register`
2. انقر على "إنشاء حساب باستخدام Google"
3. اختر حساب Google
4. تحقق من إنشاء الحساب والتوجه للوحة التحكم

### **3. اختبار ربط الحسابات**
1. أنشئ حساب بالبريد الإلكتروني
2. سجل خروج
3. سجل دخول بـ Google بنفس البريد الإلكتروني
4. تحقق من ربط الحسابين

## 🔧 **الإعدادات المطلوبة**

### **Firebase Console**
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك
3. اذهب إلى Authentication > Sign-in method
4. فعّل Google provider
5. أضف domain الموقع في Authorized domains

### **متغيرات البيئة**
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📁 **الملفات المحدثة**

### `src/lib/firebase.ts`
- ✅ إضافة `GoogleAuthProvider`
- ✅ تكوين Provider
- ✅ إضافة حقل `authProvider` إلى `Customer`

### `src/lib/customerAuth.ts`
- ✅ إضافة `signInWithGoogle()`
- ✅ معالجة إنشاء الحسابات الجديدة
- ✅ معالجة ربط الحسابات الموجودة
- ✅ معالجة الأخطاء

### `src/app/auth/login/page.tsx`
- ✅ إضافة زر Google
- ✅ إضافة دالة `handleGoogleSignIn`
- ✅ إضافة فاصل بصري

### `src/app/auth/register/page.tsx`
- ✅ إضافة زر Google
- ✅ إضافة دالة `handleGoogleSignUp`
- ✅ إضافة فاصل بصري

## 🎯 **الفوائد**

✅ **سهولة الاستخدام**: تسجيل دخول سريع بنقرة واحدة  
✅ **أمان عالي**: استخدام نظام Google الآمن  
✅ **تجربة سلسة**: لا حاجة لتذكر كلمات مرور إضافية  
✅ **ربط الحسابات**: ربط الحسابات الموجودة بـ Google  
✅ **تصميم متجاوب**: يعمل على جميع الأجهزة  
✅ **معالجة أخطاء**: رسائل خطأ واضحة باللغة العربية  

## 🚀 **الاستخدام**

### **للمستخدمين**
1. **اذهب إلى صفحة تسجيل الدخول أو إنشاء الحساب**
2. **انقر على زر Google**
3. **اختر حساب Google**
4. **استمتع بالتجربة السلسة!**

### **للمطورين**
```typescript
// استخدام الدالة مباشرة
import { signInWithGoogle } from '@/lib/customerAuth';

const user = await signInWithGoogle();
```

## ⚠️ **ملاحظات مهمة**

1. **النوافذ المنبثقة**: تأكد من السماح بالنوافذ المنبثقة
2. **Firebase Console**: فعّل Google provider في Firebase Console
3. **Domains**: أضف domain الموقع في Authorized domains
4. **HTTPS**: Google Auth يتطلب HTTPS في الإنتاج

## 🔄 **الخطوات التالية**

1. **اختبار الميزة** في بيئة التطوير
2. **إعداد Firebase Console** للإنتاج
3. **إضافة domains** المطلوبة
4. **اختبار في الإنتاج**

الميزة جاهزة للاستخدام! 🎉






