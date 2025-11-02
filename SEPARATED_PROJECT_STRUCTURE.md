# 📁 هيكل المشروع المنفصل - wafrly-licenses-dashboard

## 🎯 الملفات الأساسية للبدء

### 1. `package.json`

```json
{
  "name": "wafrly-licenses-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "axios": "^1.6.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

### 2. `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_KEY=your-secret-api-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=Wafrly Licenses Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

### 3. `src/lib/api-client.ts`

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add API key
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }

        // Add auth token if available
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('auth_token') 
          : null;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error
          console.error('API Error:', error.response.status, error.response.data);
          
          // Handle 401 Unauthorized
          if (error.response.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }
          }
        } else if (error.request) {
          // Request made but no response
          console.error('Network Error:', error.request);
        } else {
          // Something else happened
          console.error('Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

const apiClient = new ApiClient().instance;

export default apiClient;
```

---

### 4. `src/lib/types.ts`

```typescript
// License Types
export interface License {
  id: string;
  licenseKey: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  domain: string;
  domains?: string[];
  purchaseDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  isPermanent: boolean;
  version: string;
  allowedVersion?: string;
  type: 'basic' | 'professional' | 'enterprise';
  features: string[];
  maxProducts?: number;
  maxOrders?: number;
  status: 'active' | 'expired' | 'suspended' | 'trial';
  lastCheckDate?: Date;
  installationId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Version Types
export interface SystemVersion {
  id: string;
  version: string;
  title: string;
  description: string;
  releaseDate: Date;
  isLatest: boolean;
  isStable: boolean;
  isBeta?: boolean;
  features?: string[];
  bugFixes?: string[];
  breaking?: string[];
  downloadUrl?: string;
  documentationUrl?: string;
  minRequiredVersion?: string;
  supportedLicenseTypes?: ('basic' | 'professional' | 'enterprise')[];
  releaseNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LicensesResponse {
  success: boolean;
  licenses: License[];
  total: number;
}

export interface VersionsResponse {
  success: boolean;
  versions: SystemVersion[];
  total: number;
}
```

---

### 5. `src/lib/licenses-api.ts`

```typescript
import apiClient from './api-client';
import { License, SystemVersion, LicensesResponse, VersionsResponse } from './types';

// ==================== LICENSES ====================

export const getLicenses = async (): Promise<License[]> => {
  try {
    const response = await apiClient.get<LicensesResponse>('/licenses');
    return response.data.licenses;
  } catch (error) {
    console.error('Error fetching licenses:', error);
    throw error;
  }
};

export const getLicenseById = async (id: string): Promise<License> => {
  try {
    const response = await apiClient.get(`/licenses/${id}`);
    return response.data.license;
  } catch (error) {
    console.error('Error fetching license:', error);
    throw error;
  }
};

export const createLicense = async (data: Partial<License>): Promise<{
  licenseId: string;
  licenseKey: string;
}> => {
  try {
    const response = await apiClient.post('/licenses', data);
    return {
      licenseId: response.data.licenseId,
      licenseKey: response.data.licenseKey,
    };
  } catch (error) {
    console.error('Error creating license:', error);
    throw error;
  }
};

export const updateLicense = async (
  id: string, 
  data: Partial<License>
): Promise<void> => {
  try {
    await apiClient.put(`/licenses/${id}`, data);
  } catch (error) {
    console.error('Error updating license:', error);
    throw error;
  }
};

export const deleteLicense = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/licenses/${id}`);
  } catch (error) {
    console.error('Error deleting license:', error);
    throw error;
  }
};

export const verifyLicense = async (
  licenseKey: string,
  domain: string,
  currentVersion?: string
): Promise<{
  valid: boolean;
  license?: License;
  message: string;
}> => {
  try {
    const response = await apiClient.post('/licenses/verify', {
      licenseKey,
      domain,
      currentVersion: currentVersion || '1.0.0',
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying license:', error);
    throw error;
  }
};

// ==================== VERSIONS ====================

export const getVersions = async (): Promise<SystemVersion[]> => {
  try {
    const response = await apiClient.get<VersionsResponse>('/versions');
    return response.data.versions;
  } catch (error) {
    console.error('Error fetching versions:', error);
    throw error;
  }
};

export const getLatestVersion = async (): Promise<SystemVersion> => {
  try {
    const response = await apiClient.get('/versions?latest=true');
    return response.data.version;
  } catch (error) {
    console.error('Error fetching latest version:', error);
    throw error;
  }
};

export const createVersion = async (
  data: Partial<SystemVersion>
): Promise<string> => {
  try {
    const response = await apiClient.post('/versions', data);
    return response.data.versionId;
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
};

export const updateVersion = async (
  id: string,
  data: Partial<SystemVersion>
): Promise<void> => {
  try {
    await apiClient.put(`/versions/${id}`, data);
  } catch (error) {
    console.error('Error updating version:', error);
    throw error;
  }
};

export const deleteVersion = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/versions/${id}`);
  } catch (error) {
    console.error('Error deleting version:', error);
    throw error;
  }
};

// ==================== UPDATES ====================

export const checkForUpdates = async (
  licenseKey: string,
  domain: string,
  currentVersion: string
): Promise<any> => {
  try {
    const response = await apiClient.post('/check-updates', {
      licenseKey,
      domain,
      currentVersion,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking updates:', error);
    throw error;
  }
};
```

---

### 6. `src/hooks/useLicenses.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { License } from '@/lib/types';
import { getLicenses } from '@/lib/licenses-api';

export const useLicenses = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLicenses();
      setLicenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل التراخيص');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  return {
    licenses,
    loading,
    error,
    reload: loadLicenses,
  };
};
```

---

### 7. `src/app/page.tsx` (الصفحة الرئيسية)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLicenses } from '@/hooks/useLicenses';
import { License } from '@/lib/types';
import { 
  Key, 
  Shield, 
  TrendingUp, 
  Users,
  Package,
  Calendar,
  RefreshCw
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { licenses, loading, error, reload } = useLicenses();
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    trial: 0,
  });

  useEffect(() => {
    if (licenses.length > 0) {
      setStats({
        total: licenses.length,
        active: licenses.filter(l => l.status === 'active').length,
        expired: licenses.filter(l => l.status === 'expired').length,
        trial: licenses.filter(l => l.status === 'trial').length,
      });
    }
  }, [licenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Key className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">لوحة إدارة التراخيص</h1>
                <p className="text-sm text-white/60">إدارة المتاجر والتجار</p>
              </div>
            </div>

            <button 
              onClick={reload}
              className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-blue-100 text-sm">إجمالي التراخيص</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="w-12 h-12 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-green-100 text-sm">نشط</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <Shield className="w-12 h-12 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-orange-100 text-sm">تجريبي</p>
                <p className="text-3xl font-bold mt-1">{stats.trial}</p>
              </div>
              <Calendar className="w-12 h-12 opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-red-100 text-sm">منتهي</p>
                <p className="text-3xl font-bold mt-1">{stats.expired}</p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-20" />
            </div>
          </div>
        </div>

        {/* Licenses List */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">التراخيص</h2>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              {licenses.map((license) => (
                <div
                  key={license.id}
                  onClick={() => router.push(`/licenses/${license.id}`)}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-400/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{license.customerName}</h3>
                      <p className="text-white/60 text-sm">{license.customerEmail}</p>
                      <code className="text-yellow-400 text-xs">{license.licenseKey}</code>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        license.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        license.status === 'trial' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {license.status === 'active' ? 'نشط' :
                         license.status === 'trial' ? 'تجريبي' : 'منتهي'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 8. `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Enable API proxy in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

---

### 9. `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 🚀 خطوات سريعة للبدء

```bash
# 1. إنشاء المشروع
npx create-next-app@latest wafrly-licenses-dashboard --typescript --tailwind --app
cd wafrly-licenses-dashboard

# 2. تثبيت المكتبات
npm install axios framer-motion lucide-react date-fns recharts

# 3. نسخ الملفات أعلاه إلى المشروع

# 4. إضافة .env.local

# 5. تشغيل المشروع
npm run dev
```

---

## 📝 ملاحظات

- تأكد من تشغيل المشروع الأصلي أولاً على port 3000
- المشروع المنفصل سيعمل على port 3001
- جميع الملفات أعلاه جاهزة للنسخ واللصق مباشرة

---

تم! 🎉

