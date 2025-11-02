#!/usr/bin/env node

/**
 * Migration Script: إضافة domain للبيانات الموجودة
 * 
 * هذا السكريبت يضيف حقل domain لجميع المنتجات والطلبات والعملاء الموجودة
 * 
 * ⚠️ تحذير: هذا السكريبت يُشغّل مرة واحدة فقط!
 * 
 * الاستخدام:
 *   node scripts/migrate-add-domain.mjs
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// تحميل Service Account Key
// ⚠️ تأكد من تحميل ملف serviceAccountKey.json من Firebase Console
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
} catch (error) {
  console.error('❌ خطأ: لم يتم العثور على ملف serviceAccountKey.json');
  console.log('\n📖 كيفية الحصول عليه:');
  console.log('1. افتح Firebase Console');
  console.log('2. Project Settings → Service Accounts');
  console.log('3. Generate New Private Key');
  console.log('4. احفظ الملف باسم serviceAccountKey.json في المجلد الرئيسي');
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ==========================================================
// CONFIGURATION
// ==========================================================

// ⚠️ هام: حدد domain افتراضي للبيانات الموجودة
const DEFAULT_DOMAIN = process.argv[2] || 'default-store.com';

console.log('┌─────────────────────────────────────────────┐');
console.log('│  🔄 بدء عملية Migration - إضافة Domain   │');
console.log('└─────────────────────────────────────────────┘\n');
console.log(`📍 Default Domain: ${DEFAULT_DOMAIN}\n`);

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

async function migrateCollection(collectionName, defaultDomain) {
  console.log(`\n📦 معالجة: ${collectionName}`);
  console.log('─'.repeat(50));
  
  try {
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`   ℹ️  لا توجد بيانات في ${collectionName}`);
      return { total: 0, updated: 0, skipped: 0, errors: 0 };
    }
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const total = snapshot.size;
    
    console.log(`   📊 إجمالي الوثائق: ${total}`);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // إذا يوجد domain بالفعل، تخطي
      if (data.domain) {
        skipped++;
        continue;
      }
      
      try {
        // إضافة domain
        await db.collection(collectionName).doc(doc.id).update({
          domain: defaultDomain,
          migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        updated++;
        
        // عرض progress كل 10 وثائق
        if (updated % 10 === 0) {
          console.log(`   ⏳ تم: ${updated}/${total - skipped}`);
        }
      } catch (error) {
        console.error(`   ❌ خطأ في ${doc.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`   ✅ تم التحديث: ${updated}`);
    console.log(`   ⏭️  تم التخطي: ${skipped}`);
    if (errors > 0) {
      console.log(`   ❌ أخطاء: ${errors}`);
    }
    
    return { total, updated, skipped, errors };
  } catch (error) {
    console.error(`   ❌ خطأ في معالجة ${collectionName}:`, error);
    return { total: 0, updated: 0, skipped: 0, errors: 1 };
  }
}

// ==========================================================
// MAIN MIGRATION
// ==========================================================

async function runMigration() {
  const startTime = Date.now();
  
  console.log('🚀 بدء Migration...\n');
  
  // Collections to migrate
  const collections = [
    'products',
    'orders',
    'customers',
    'subscriptions',
    'categories',
    'discountCodes'
  ];
  
  const results = {};
  
  for (const collection of collections) {
    results[collection] = await migrateCollection(collection, DEFAULT_DOMAIN);
  }
  
  // Summary
  console.log('\n');
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│          📊 ملخص عملية Migration           │');
  console.log('└─────────────────────────────────────────────┘\n');
  
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const [collection, result] of Object.entries(results)) {
    console.log(`${collection}:`);
    console.log(`  - الإجمالي: ${result.total}`);
    console.log(`  - تم التحديث: ${result.updated}`);
    console.log(`  - تم التخطي: ${result.skipped}`);
    if (result.errors > 0) {
      console.log(`  - أخطاء: ${result.errors}`);
    }
    console.log('');
    
    totalUpdated += result.updated;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('─'.repeat(50));
  console.log(`✅ إجمالي المُحدث: ${totalUpdated}`);
  console.log(`⏭️  إجمالي المُتخطى: ${totalSkipped}`);
  if (totalErrors > 0) {
    console.log(`❌ إجمالي الأخطاء: ${totalErrors}`);
  }
  console.log(`⏱️  الوقت المستغرق: ${duration}s`);
  console.log('');
  
  if (totalErrors === 0) {
    console.log('🎉 تمت عملية Migration بنجاح!');
  } else {
    console.log('⚠️  تمت العملية مع بعض الأخطاء. راجع السجل أعلاه.');
  }
  
  process.exit(0);
}

// ==========================================================
// EXECUTION
// ==========================================================

console.log('\n⚠️  تأكيد العملية:\n');
console.log(`   سيتم إضافة domain: "${DEFAULT_DOMAIN}"`);
console.log('   لجميع الوثائق التي لا تحتوي على domain\n');

if (process.argv.includes('--confirm')) {
  runMigration().catch(error => {
    console.error('❌ فشلت عملية Migration:', error);
    process.exit(1);
  });
} else {
  console.log('💡 للتأكيد، شغّل الأمر مع --confirm:\n');
  console.log('   node scripts/migrate-add-domain.mjs [domain] --confirm\n');
  console.log('   مثال:');
  console.log('   node scripts/migrate-add-domain.mjs store1.com --confirm\n');
  process.exit(0);
}

