#!/usr/bin/env node

/**
 * Script to create Admin user in Firebase Authentication
 * 
 * Run: node scripts/create-admin.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Config (using the same credentials from your code)
const firebaseConfig = {
  apiKey: "AIzaSyADXAZf6_DAgya_HcwRYQvNxo1lUFu4LqE",
  authDomain: "wafarle-63a71.firebaseapp.com",
  projectId: "wafarle-63a71",
  storageBucket: "wafarle-63a71.firebasestorage.app",
  messagingSenderId: "234030784195",
  appId: "1:234030784195:web:fef98ef416f0c1bc388c76",
};

console.log('\n🔥 Firebase Admin Setup Script\n');
console.log('📦 Project:', firebaseConfig.projectId);
console.log('🌐 Domain:', firebaseConfig.authDomain);

// Note: Firebase Admin SDK requires service account credentials
// Since we're using client SDK credentials, we'll use the client SDK instead

import { initializeApp as clientInitializeApp } from 'firebase/app';
import { getAuth as clientGetAuth, createUserWithEmailAndPassword } from 'firebase/auth';

console.log('\n⚠️  Note: Using Firebase Client SDK for user creation');
console.log('   For production, use Firebase Admin SDK with service account\n');

const app = clientInitializeApp(firebaseConfig);
const auth = clientGetAuth(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@wafarle.com';
const ADMIN_PASSWORD = 'admin123';

async function createAdminUser() {
  try {
    console.log('📝 Creating admin user...');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('');

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    console.log('✅ Admin user created successfully!');
    console.log('   UID:', userCredential.user.uid);
    console.log('   Email:', userCredential.user.email);
    console.log('');
    console.log('🎉 You can now login with:');
    console.log('   Email: admin@wafarle.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🔒 Remember to change the password in production!');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✅ Admin user already exists!');
      console.log('');
      console.log('🎯 Login credentials:');
      console.log('   Email: admin@wafarle.com');
      console.log('   Password: admin123');
      console.log('');
      console.log('💡 If you forgot the password, reset it in Firebase Console:');
      console.log('   https://console.firebase.google.com/project/wafarle-63a71/authentication/users');
      process.exit(0);
    }
    
    console.error('❌ Error creating admin user:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.log('');
    console.log('📚 Troubleshooting:');
    console.log('   1. Make sure Email/Password authentication is enabled in Firebase Console');
    console.log('   2. Check your Firebase project settings');
    console.log('   3. Visit: https://console.firebase.google.com/project/wafarle-63a71/authentication/providers');
    console.log('');
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting admin user creation...\n');
createAdminUser();

