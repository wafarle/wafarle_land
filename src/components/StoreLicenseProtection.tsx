'use client';

import { usePathname } from 'next/navigation';
import LicenseGuard from './LicenseGuard';

/**
 * Component that applies license protection only to store pages
 * Admin pages and auth pages are excluded
 */
export default function StoreLicenseProtection({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // صفحات مستثناة من حماية الترخيص
  const excludedPaths = [
    '/admin',           // صفحات الإدارة
    '/auth',            // صفحات المصادقة
    '/licenses',        // لوحة التحكم بالتراخيص
    '/api',             // APIs
  ];
  
  // التحقق من أن المسار الحالي ليس من الصفحات المستثناة
  const isExcluded = excludedPaths.some(path => pathname?.startsWith(path));
  
  // إذا كان المسار مستثنى، اعرض المحتوى مباشرة بدون حماية
  if (isExcluded) {
    return <>{children}</>;
  }
  
  // للصفحات الأخرى (صفحات المتجر)، طبق حماية الترخيص
  return <LicenseGuard>{children}</LicenseGuard>;
}


