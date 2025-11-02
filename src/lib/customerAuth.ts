'use client';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, FIREBASE_ENABLED } from '@/lib/firebase';
import { addCustomer, updateCustomer, getCustomers } from '@/lib/database';
import { Customer } from '@/lib/firebase';

// Customer authentication context
export interface CustomerUser {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  address?: string;
  city?: string;
  customerId?: string;
}

// Mock customer user for development
const mockCustomerUser: CustomerUser = {
  uid: 'mock-customer-uid',
  email: 'customer@example.com',
  displayName: 'عميل تجريبي',
  phone: '+966501234567',
  customerId: 'mock-customer-1'
};

// Sign up new customer
export const signUpCustomer = async (
  email: string, 
  password: string, 
  name: string, 
  phone: string
): Promise<CustomerUser> => {
  if (!FIREBASE_ENABLED || !auth) {
    // Return mock user for development
    return {
      uid: 'mock-' + Date.now(),
      email: email,
      displayName: name,
      phone: phone,
      customerId: 'mock-customer-' + Date.now()
    };
  }

  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: name
    });

    // Create customer record in database
    const customerId = await addCustomer({
      name: name,
      email: email,
      phone: phone,
      status: 'active',
      lastOrderDate: new Date()
    });
    return {
      uid: user.uid,
      email: user.email || email,
      displayName: name,
      phone: phone,
      customerId: customerId
    };
  } catch (error: any) {
    console.error('Error signing up customer:', error);
    throw new Error(error.message || 'حدث خطأ في إنشاء الحساب');
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<CustomerUser> => {
  if (!FIREBASE_ENABLED || !auth || !googleProvider) {
    // Return mock user for development
    return {
      uid: 'mock-google-' + Date.now(),
      email: 'google.user@example.com',
      displayName: 'مستخدم Google',
      customerId: 'mock-google-customer-' + Date.now()
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if customer exists in database
    const customers = await getCustomers();
    let customerData = customers.find(c => c.email === user.email);
    
    // If customer doesn't exist, create new customer record
    if (!customerData) {
      const customerId = await addCustomer({
        name: user.displayName || 'مستخدم Google',
        email: user.email || '',
        phone: user.phoneNumber || '',
        status: 'active',
        lastOrderDate: new Date(),
        authProvider: 'google'
      });
      
      customerData = {
        id: customerId,
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
      };
    } else {
      // Update existing customer with Google info if needed
      if (!customerData.authProvider) {
        await updateCustomer(customerData.id, {
          authProvider: 'google'
        });
      }
    }
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || customerData.name,
      phone: user.phoneNumber || customerData.phone,
      customerId: customerData.id
    };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    let errorMessage = 'حدث خطأ في تسجيل الدخول باستخدام Google';
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'تم إغلاق نافذة تسجيل الدخول';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'تم حظر نافذة تسجيل الدخول، يرجى السماح بالنوافذ المنبثقة';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'تم إلغاء طلب تسجيل الدخول';
    }
    
    throw new Error(errorMessage);
  }
};

// Sign in customer
export const signInCustomer = async (email: string, password: string): Promise<CustomerUser> => {
  if (!FIREBASE_ENABLED || !auth) {
    // Mock authentication for development
    if (email === 'customer@example.com' && password === 'password123') {
      return mockCustomerUser;
    }
    throw new Error('بيانات تسجيل الدخول غير صحيحة');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get customer data from database
    const customers = await getCustomers();
    const customerData = customers.find(c => c.email === user.email);
    return {
      uid: user.uid,
      email: user.email || email,
      displayName: user.displayName || customerData?.name,
      phone: customerData?.phone,
      customerId: customerData?.id
    };
  } catch (error: any) {
    console.error('Error signing in customer:', error);
    
    // Handle specific Firebase errors
    let errorMessage = 'حدث خطأ في تسجيل الدخول';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'البريد الإلكتروني غير مسجل';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'كلمة المرور غير صحيحة';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'البريد الإلكتروني غير صحيح';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'تم تجاوز عدد المحاولات المسموحة، حاول لاحقاً';
    }
    
    throw new Error(errorMessage);
  }
};

// Sign out customer
export const signOutCustomer = async (): Promise<void> => {
  if (!FIREBASE_ENABLED || !auth) {
    return Promise.resolve();
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out customer:', error);
    throw error;
  }
};

// Get current customer user
export const getCurrentCustomerUser = (): CustomerUser | null => {
  if (!FIREBASE_ENABLED || !auth) {
    // Return null for development when no mock session
    return null;
  }
  
  const user = auth.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || undefined,
  };
};

// Listen to customer auth state changes
export const onCustomerAuthStateChange = (callback: (user: CustomerUser | null) => void) => {
  if (!FIREBASE_ENABLED || !auth) {
    // For development, call with null initially
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get additional customer data
      const customers = await getCustomers();
      const customerData = customers.find(c => c.email === user.email);

      const customerUser: CustomerUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || customerData?.name,
        phone: customerData?.phone,
        customerId: customerData?.id
      };
      
      callback(customerUser);
    } else {
      callback(null);
    }
  });
};

// Password reset
export const resetCustomerPassword = async (email: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !auth) {
    return Promise.resolve();
  }

  try {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    let errorMessage = 'حدث خطأ في إرسال رسالة إعادة تعيين كلمة المرور';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'البريد الإلكتروني غير مسجل';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'البريد الإلكتروني غير صحيح';
    }
    
    throw new Error(errorMessage);
  }
};

// Update customer profile
export const updateCustomerProfile = async (
  uid: string,
  updates: {
    displayName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  }
): Promise<void> => {
  if (!FIREBASE_ENABLED || !auth) {
    return Promise.resolve();
  }

  try {
    const user = auth.currentUser;
    if (!user || user.uid !== uid) {
      throw new Error('لا يوجد مستخدم مسجل دخول أو المعرف غير صحيح');
    }

    // Update Firebase profile
    if (updates.displayName) {
      await updateProfile(user, {
        displayName: updates.displayName
      });
    }

    // Update customer record in database
    const customers = await getCustomers();
    const customerData = customers.find(c => c.email === user.email);
    
    if (customerData) {
      // Only include fields that have actual values (not undefined)
      const updateData: Record<string, any> = {};
      
      if (updates.displayName !== undefined) {
        updateData.name = updates.displayName;
      }
      if (updates.email !== undefined) {
        updateData.email = updates.email;
      }
      if (updates.phone !== undefined) {
        updateData.phone = updates.phone;
      }
      if (updates.address !== undefined) {
        updateData.address = updates.address;
      }
      if (updates.city !== undefined) {
        updateData.city = updates.city;
      }

      // Only update if we have fields to update
      if (Object.keys(updateData).length > 0) {
        await updateCustomer(customerData.id, updateData);
      }
    }
  } catch (error) {
    console.error('Error updating customer profile:', error);
    throw error;
  }
};

// Check if user is authenticated customer
export const isCustomerAuthenticated = (): boolean => {
  if (!FIREBASE_ENABLED || !auth) {
    return false; // For development
  }
  
  return !!auth.currentUser;
};
