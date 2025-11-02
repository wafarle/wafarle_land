import { 
  collection, 
  doc, 
  getDocs,
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db, FIREBASE_ENABLED, License, SystemVersion, UpdateNotification, LicenseCheck } from '@/lib/firebase';

// Collections
let licensesCollection: any;
let versionsCollection: any;
let updateNotificationsCollection: any;
let licenseChecksCollection: any;

if (FIREBASE_ENABLED && db) {
  licensesCollection = collection(db, 'licenses');
  versionsCollection = collection(db, 'versions');
  updateNotificationsCollection = collection(db, 'updateNotifications');
  licenseChecksCollection = collection(db, 'licenseChecks');
}

// ==================== LICENSE MANAGEMENT ====================

/**
 * Generate a unique license key
 */
export function generateLicenseKey(): string {
  const segments = 4;
  const segmentLength = 4;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  let key = '';
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < segments - 1) key += '-';
  }
  
  return key;
}

/**
 * Get all licenses
 */
export const getLicenses = async (): Promise<License[]> => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return [];
  }

  try {
    const q = query(licensesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        purchaseDate: data.purchaseDate?.toDate?.() || new Date(),
        expiryDate: data.expiryDate?.toDate?.() || null,
        lastCheckDate: data.lastCheckDate?.toDate?.() || null,
      } as License;
    });
  } catch (error) {
    console.error('Error getting licenses:', error);
    throw error;
  }
};

/**
 * Get license by ID
 */
export const getLicenseById = async (id: string): Promise<License | null> => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return null;
  }

  try {
    const docRef = doc(licensesCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...(docSnap.data() as any),
        createdAt: (docSnap.data() as any).createdAt?.toDate?.() || new Date(),
        updatedAt: (docSnap.data() as any).updatedAt?.toDate?.() || new Date(),
        purchaseDate: (docSnap.data() as any).purchaseDate?.toDate?.() || new Date(),
        expiryDate: (docSnap.data() as any).expiryDate?.toDate?.() || null,
        lastCheckDate: (docSnap.data() as any).lastCheckDate?.toDate?.() || null,
      } as License;
    }
    return null;
  } catch (error) {
    console.error('Error getting license:', error);
    throw error;
  }
};

/**
 * Get license by license key
 */
export const getLicenseByKey = async (licenseKey: string): Promise<License | null> => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return null;
  }

  try {
    const q = query(licensesCollection, where('licenseKey', '==', licenseKey));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as any),
        createdAt: (docSnap.data() as any).createdAt?.toDate?.() || new Date(),
        updatedAt: (docSnap.data() as any).updatedAt?.toDate?.() || new Date(),
        purchaseDate: (docSnap.data() as any).purchaseDate?.toDate?.() || new Date(),
        expiryDate: (docSnap.data() as any).expiryDate?.toDate?.() || null,
        lastCheckDate: (docSnap.data() as any).lastCheckDate?.toDate?.() || null,
      } as License;
    }
    return null;
  } catch (error) {
    console.error('Error getting license by key:', error);
    throw error;
  }
};

/**
 * Get license by domain
 */
export const getLicenseByDomain = async (domain: string): Promise<License | null> => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return null;
  }

  try {
    // البحث في domain الأساسي
    let q = query(licensesCollection, where('domain', '==', domain));
    let querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as any),
        createdAt: (docSnap.data() as any).createdAt?.toDate?.() || new Date(),
        updatedAt: (docSnap.data() as any).updatedAt?.toDate?.() || new Date(),
        purchaseDate: (docSnap.data() as any).purchaseDate?.toDate?.() || new Date(),
        expiryDate: (docSnap.data() as any).expiryDate?.toDate?.() || null,
        lastCheckDate: (docSnap.data() as any).lastCheckDate?.toDate?.() || null,
      } as License;
    }
    
    // البحث في domains الإضافية
    q = query(licensesCollection, where('domains', 'array-contains', domain));
    querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as any),
        createdAt: (docSnap.data() as any).createdAt?.toDate?.() || new Date(),
        updatedAt: (docSnap.data() as any).updatedAt?.toDate?.() || new Date(),
        purchaseDate: (docSnap.data() as any).purchaseDate?.toDate?.() || new Date(),
        expiryDate: (docSnap.data() as any).expiryDate?.toDate?.() || null,
        lastCheckDate: (docSnap.data() as any).lastCheckDate?.toDate?.() || null,
      } as License;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting license by domain:', error);
    throw error;
  }
};

/**
 * Add new license
 */
export const addLicense = async (license: Omit<License, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return Promise.resolve('mock-license-id');
  }

  try {
    const licenseData: Record<string, any> = {
      licenseKey: license.licenseKey,
      customerName: license.customerName,
      customerEmail: license.customerEmail,
      domain: license.domain,
      purchaseDate: license.purchaseDate,
      isActive: license.isActive,
      isPermanent: license.isPermanent,
      version: license.version,
      type: license.type,
      features: license.features || [],
      status: license.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (license.customerPhone) licenseData.customerPhone = license.customerPhone;
    if (license.domains) licenseData.domains = license.domains;
    if (license.expiryDate) licenseData.expiryDate = license.expiryDate;
    if (license.allowedVersion) licenseData.allowedVersion = license.allowedVersion;
    if (license.maxProducts) licenseData.maxProducts = license.maxProducts;
    if (license.maxOrders) licenseData.maxOrders = license.maxOrders;
    if (license.lastCheckDate) licenseData.lastCheckDate = license.lastCheckDate;
    if (license.installationId) licenseData.installationId = license.installationId;
    if (license.notes) licenseData.notes = license.notes;
    
    const docRef = await addDoc(licensesCollection, licenseData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding license:', error);
    throw error;
  }
};

/**
 * Update license
 */
export const updateLicense = async (id: string, updates: Partial<License>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return Promise.resolve();
  }

  try {
    const docRef = doc(licensesCollection, id);
    const updateData: Record<string, any> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating license:', error);
    throw error;
  }
};

/**
 * Delete license
 */
export const deleteLicense = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return Promise.resolve();
  }

  try {
    await deleteDoc(doc(licensesCollection, id));
  } catch (error) {
    console.error('Error deleting license:', error);
    throw error;
  }
};

/**
 * Verify license
 */
export const verifyLicense = async (
  licenseKey: string, 
  domain: string,
  currentVersion: string
): Promise<{ valid: boolean; message: string; license?: License }> => {
  if (!FIREBASE_ENABLED || !db) {
    return { valid: true, message: 'Firebase disabled' };
  }

  try {
    const license = await getLicenseByKey(licenseKey);
    
    if (!license) {
      return { valid: false, message: 'License key not found' };
    }

    if (!license.isActive) {
      return { valid: false, message: 'License is inactive' };
    }

    if (license.status === 'expired') {
      return { valid: false, message: 'License has expired' };
    }

    if (license.status === 'suspended') {
      return { valid: false, message: 'License is suspended' };
    }

    // Check domain
    const allowedDomains = [license.domain, ...(license.domains || [])];
    if (!allowedDomains.includes(domain)) {
      return { valid: false, message: 'Domain not authorized' };
    }

    // Check expiry date
    if (!license.isPermanent && license.expiryDate && new Date(license.expiryDate) < new Date()) {
      return { valid: false, message: 'License has expired' };
    }

    // Update last check date
    await updateLicense(license.id, {
      lastCheckDate: new Date(),
    });

    // Log license check
    await logLicenseCheck({
      licenseKey,
      domain,
      currentVersion,
      latestVersion: currentVersion, // Will be updated with actual latest version
      isValid: true,
      status: 'success',
    });

    return { valid: true, message: 'License is valid', license };
  } catch (error) {
    console.error('Error verifying license:', error);
    return { valid: false, message: 'Verification error' };
  }
};

/**
 * Verify store license by domain
 * Used for protecting the store from running without a valid license
 */
export const verifyStoreLicense = async (
  domain: string
): Promise<{ valid: boolean; message: string; license?: License }> => {
  if (!FIREBASE_ENABLED || !db) {
    // في حالة تعطيل Firebase، نسمح بالعمل (للتطوير المحلي)
    console.warn('⚠️ Firebase disabled - Store protection bypassed');
    return { valid: true, message: 'Firebase disabled - running in development mode' };
  }

  try {
    console.log('🔍 Verifying store license for domain:', domain);
    
    // البحث عن ترخيص للنطاق الحالي
    const license = await getLicenseByDomain(domain);
    
    if (!license) {
      console.error('❌ No license found for domain:', domain);
      return { 
        valid: false, 
        message: 'لا يوجد ترخيص لهذا النطاق. يرجى التواصل مع وفرلي للحصول على ترخيص.' 
      };
    }

    // التحقق من حالة الترخيص
    if (!license.isActive) {
      console.error('❌ License is inactive for domain:', domain);
      return { 
        valid: false, 
        message: 'الترخيص غير نشط. يرجى تفعيل الترخيص.',
        license 
      };
    }

    if (license.status === 'expired') {
      console.error('❌ License has expired for domain:', domain);
      return { 
        valid: false, 
        message: 'الترخيص منتهي الصلاحية. يرجى تجديد الترخيص.',
        license 
      };
    }

    if (license.status === 'suspended') {
      console.error('❌ License is suspended for domain:', domain);
      return { 
        valid: false, 
        message: 'الترخيص موقوف. يرجى التواصل مع الدعم.',
        license 
      };
    }

    // التحقق من تاريخ الانتهاء
    if (!license.isPermanent && license.expiryDate) {
      const expiryDate = new Date(license.expiryDate);
      const now = new Date();
      
      if (expiryDate < now) {
        console.error('❌ License has expired on:', expiryDate);
        await updateLicense(license.id, { status: 'expired' });
        return { 
          valid: false, 
          message: `الترخيص منتهي بتاريخ ${expiryDate.toLocaleDateString('ar-SA')}. يرجى التجديد.`,
          license 
        };
      }
    }

    // تحديث آخر تحقق
    await updateLicense(license.id, {
      lastCheckDate: new Date(),
    });

    console.log('✅ License is valid for domain:', domain);
    
    return { 
      valid: true, 
      message: 'الترخيص صالح ونشط',
      license 
    };
  } catch (error) {
    console.error('❌ Error verifying store license:', error);
    return { 
      valid: false, 
      message: 'حدث خطأ أثناء التحقق من الترخيص. يرجى المحاولة لاحقاً.' 
    };
  }
};

/**
 * Log license check
 */
export const logLicenseCheck = async (check: Omit<LicenseCheck, 'id' | 'checkDate'>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !licenseChecksCollection) {
    return Promise.resolve();
  }

  try {
    await addDoc(licenseChecksCollection, {
      ...check,
      checkDate: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging license check:', error);
  }
};

// ==================== VERSION MANAGEMENT ====================

/**
 * Get all versions
 */
export const getVersions = async (): Promise<SystemVersion[]> => {
  if (!FIREBASE_ENABLED || !db || !versionsCollection) {
    return [];
  }

  try {
    const q = query(versionsCollection, orderBy('releaseDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        releaseDate: data.releaseDate?.toDate?.() || new Date(),
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as SystemVersion;
    });
  } catch (error) {
    console.error('Error getting versions:', error);
    throw error;
  }
};

/**
 * Get latest version
 */
export const getLatestVersion = async (): Promise<SystemVersion | null> => {
  if (!FIREBASE_ENABLED || !db || !versionsCollection) {
    return null;
  }

  try {
    const q = query(
      versionsCollection,
      where('isLatest', '==', true),
      where('isStable', '==', true),
      firestoreLimit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...(docSnap.data() as any),
        releaseDate: (docSnap.data() as any).releaseDate?.toDate?.() || new Date(),
        createdAt: (docSnap.data() as any).createdAt?.toDate?.() || new Date(),
        updatedAt: (docSnap.data() as any).updatedAt?.toDate?.() || new Date(),
      } as SystemVersion;
    }
    return null;
  } catch (error) {
    console.error('Error getting latest version:', error);
    throw error;
  }
};

/**
 * Add new version
 */
export const addVersion = async (version: Omit<SystemVersion, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !versionsCollection) {
    return Promise.resolve('mock-version-id');
  }

  try {
    // If this is marked as latest, unmark other versions
    if (version.isLatest) {
      const existingVersions = await getVersions();
      for (const v of existingVersions) {
        if (v.isLatest) {
          await updateDoc(doc(versionsCollection, v.id), { isLatest: false });
        }
      }
    }

    const versionData = {
      ...version,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(versionsCollection, versionData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding version:', error);
    throw error;
  }
};

/**
 * Update version
 */
export const updateVersion = async (id: string, updates: Partial<SystemVersion>): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !versionsCollection) {
    return Promise.resolve();
  }

  try {
    // If updating to latest, unmark other versions
    if (updates.isLatest) {
      const existingVersions = await getVersions();
      for (const v of existingVersions) {
        if (v.isLatest && v.id !== id) {
          await updateDoc(doc(versionsCollection, v.id), { isLatest: false });
        }
      }
    }

    const docRef = doc(versionsCollection, id);
    const updateData: Record<string, any> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating version:', error);
    throw error;
  }
};

/**
 * Delete version
 */
export const deleteVersion = async (id: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !versionsCollection) {
    return Promise.resolve();
  }

  try {
    await deleteDoc(doc(versionsCollection, id));
  } catch (error) {
    console.error('Error deleting version:', error);
    throw error;
  }
};

/**
 * Compare versions
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
}

/**
 * Check for updates
 */
export const checkForUpdates = async (currentVersion: string): Promise<{
  hasUpdate: boolean;
  latestVersion?: SystemVersion;
  message: string;
}> => {
  try {
    const latest = await getLatestVersion();
    
    if (!latest) {
      return { hasUpdate: false, message: 'No version information available' };
    }

    const comparison = compareVersions(latest.version, currentVersion);
    
    if (comparison > 0) {
      return {
        hasUpdate: true,
        latestVersion: latest,
        message: `New version ${latest.version} is available!`,
      };
    }

    return { hasUpdate: false, message: 'You are using the latest version' };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { hasUpdate: false, message: 'Error checking for updates' };
  }
};

// ==================== UPDATE NOTIFICATIONS ====================

/**
 * Get all update notifications
 */
export const getUpdateNotifications = async (): Promise<UpdateNotification[]> => {
  if (!FIREBASE_ENABLED || !db || !updateNotificationsCollection) {
    return [];
  }

  try {
    const q = query(
      updateNotificationsCollection,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        expiresAt: data.expiresAt?.toDate?.() || null,
      } as UpdateNotification;
    });
  } catch (error) {
    console.error('Error getting update notifications:', error);
    throw error;
  }
};

/**
 * Get notifications for specific license type
 */
export const getNotificationsForLicenseType = async (
  licenseType: 'basic' | 'professional' | 'enterprise'
): Promise<UpdateNotification[]> => {
  const allNotifications = await getUpdateNotifications();
  
  return allNotifications.filter(notification => {
    // Check if notification is targeted to this license type
    if (!notification.targetLicenseTypes || notification.targetLicenseTypes.length === 0) {
      return true; // No target means for all
    }
    return notification.targetLicenseTypes.includes(licenseType);
  });
};

/**
 * Add update notification
 */
export const addUpdateNotification = async (
  notification: Omit<UpdateNotification, 'id' | 'createdAt'>
): Promise<string> => {
  if (!FIREBASE_ENABLED || !db || !updateNotificationsCollection) {
    return Promise.resolve('mock-notification-id');
  }

  try {
    const notificationData = {
      ...notification,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(updateNotificationsCollection, notificationData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding update notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string, userId: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !db || !updateNotificationsCollection) {
    return Promise.resolve();
  }

  try {
    const docRef = doc(updateNotificationsCollection, notificationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const readBy = docSnap.data().readBy || [];
      if (!readBy.includes(userId)) {
        readBy.push(userId);
        await updateDoc(docRef, { readBy });
      }
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Subscribe to licenses
 */
export const subscribeToLicenses = (callback: (licenses: License[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !licensesCollection) {
    return () => {};
  }

  const q = query(licensesCollection, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const licenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
      createdAt: (doc.data() as any).createdAt?.toDate?.() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate?.() || new Date(),
      purchaseDate: (doc.data() as any).purchaseDate?.toDate?.() || new Date(),
      expiryDate: (doc.data() as any).expiryDate?.toDate?.() || null,
      lastCheckDate: (doc.data() as any).lastCheckDate?.toDate?.() || null,
    })) as License[];
    
    callback(licenses);
  });
};

/**
 * Subscribe to versions
 */
export const subscribeToVersions = (callback: (versions: SystemVersion[]) => void) => {
  if (!FIREBASE_ENABLED || !db || !versionsCollection) {
    return () => {};
  }

  const q = query(versionsCollection, orderBy('releaseDate', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const versions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
      releaseDate: (doc.data() as any).releaseDate?.toDate?.() || new Date(),
      createdAt: (doc.data() as any).createdAt?.toDate?.() || new Date(),
      updatedAt: (doc.data() as any).updatedAt?.toDate?.() || new Date(),
    })) as SystemVersion[];
    
    callback(versions);
  });
};

