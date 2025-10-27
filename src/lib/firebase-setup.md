# Firebase Firestore Index Setup Guide

## خطأ الفهرس المركب (Composite Index Error)

عند ظهور خطأ `The query requires an index`, اتبع هذه الخطوات:

### الحل السريع ✅
1. **انقر على الرابط الموجود في الخطأ** - سيأخذك مباشرة لإنشاء الفهرس
2. **اضغط "Create Index"** في Firebase Console
3. **انتظر** حتى يكتمل إنشاء الفهرس (عادة 2-5 دقائق)

### الحل اليدوي 🛠️
إذا لم يعمل الرابط، اتبع هذه الخطوات:

1. **اذهب إلى Firebase Console**
   ```
   https://console.firebase.google.com/project/wafarle-63a71/firestore/indexes
   ```

2. **انتقل إلى Firestore > Indexes**

3. **اضغط "Create Index"**

4. **أدخل البيانات التالية:**
   - **Collection ID:** `subscriptions`
   - **Fields:**
     - Field: `customerEmail`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
     - Field: `__name__`, Order: `Ascending`

5. **اضغط "Create"**

### الفهارس المطلوبة للنظام 📋

#### 1. Subscriptions Collection
```
Collection: subscriptions
Fields: customerEmail (Ascending), createdAt (Descending)
```

#### 2. Chat Messages Collection 💬
```
Collection: chatMessages
Fields: conversationId (Ascending), timestamp (Ascending)
```
**الرابط المباشر:** [Create Chat Messages Index](https://console.firebase.google.com/v1/r/project/wafarle-63a71/firestore/indexes?create_composite=ClJwcm9qZWN0cy93YWZhcmxlLTYzYTcxL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9jaGF0TWVzc2FnZXMvaW5kZXhlcy9fEAEaEgoOY29udmVyc2F0aW9uSWQQARoNCgl0aW1lc3RhbXAQARoMCghfX25hbWVfXxAB)

#### 3. Orders Collection (اختياري)
```
Collection: orders
Fields: customerEmail (Ascending), createdAt (Descending)
```

#### 4. Customers Collection (اختياري)
```
Collection: customers
Fields: status (Ascending), registrationDate (Descending)
```

### التحقق من حالة الفهرس 🔍

1. **اذهب إلى Firestore > Indexes**
2. **تأكد أن الحالة "Building" أو "Enabled"**
3. **انتظر حتى تصبح الحالة "Enabled"**

### ملاحظات مهمة ⚠️

- **إنشاء الفهرس يستغرق من 2-10 دقائق**
- **النظام يعمل حالياً بدون فهرس** (مع ترتيب يدوي)
- **بعد إنشاء الفهرس ستتحسن السرعة**
- **يمكن تشغيل النظام قبل إكمال الفهرس**

### استكشاف الأخطاء 🐛

#### إذا استمر الخطأ:
1. تأكد من أن project ID صحيح: `wafarle-63a71`
2. تأكد من أن Collection name صحيح: `subscriptions`
3. امسح cache المتصفح وأعد تحميل الصفحة
4. تحقق من صلاحيات Firebase Rules

#### إذا كان الفهرس بطيء:
- الفهارس الكبيرة تستغرق وقت أطول
- يمكن المتابعة بالنظام البديل مؤقتاً
- تحقق من حالة الفهرس في Firebase Console

### الحل البديل المؤقت 🔄

النظام يتضمن حل بديل يعمل بدون فهرس:
- يستخدم استعلام بسيط `where` فقط
- يرتب البيانات يدوياً في JavaScript
- أبطأ قليلاً لكن يعمل فوراً
- ينتقل تلقائياً للفهرس عند توفره

### Firebase Rules المطلوبة 🔐

تأكد من أن Firestore Rules تسمح بالقراءة والكتابة:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // للتطوير فقط
    }
  }
}
```

### للإنتاج 🚀

في الإنتاج، استخدم قواعد أكثر أماناً:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /subscriptions/{subscriptionId} {
      allow read, write: if request.auth != null 
        && request.auth.token.email == resource.data.customerEmail;
    }
    
    match /orders/{orderId} {
      allow read, write: if request.auth != null 
        && request.auth.token.email == resource.data.customerEmail;
    }
    
    match /customers/{customerId} {
      allow read, write: if request.auth != null 
        && request.auth.token.email == resource.data.email;
    }
  }
}
```

---

## تم الانتهاء! ✅

بعد إنشاء الفهرس، سيعمل النظام بأقصى كفاءة وسرعة.
