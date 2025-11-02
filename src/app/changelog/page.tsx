'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Calendar,
  Download,
  FileText,
  Zap,
  Bug,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { SystemVersion } from '@/lib/firebase';
import { getVersions } from '@/lib/license-management';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ChangelogPage() {
  const [versions, setVersions] = useState<SystemVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'stable' | 'beta'>('all');

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const data = await getVersions();
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVersions = versions.filter((version) => {
    if (filterType === 'stable') return version.isStable && !version.isBeta;
    if (filterType === 'beta') return version.isBeta;
    return true;
  });

  const latestVersion = versions.find(v => v.isLatest);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Header />
      
      <main className="container mx-auto px-4 md:px-6 py-24" dir="rtl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-6">
            <Package className="w-4 h-4" />
            <span>الإصدار الحالي: {latestVersion?.version || 'N/A'}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            سجل التحديثات
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            اطلع على أحدث الميزات والتحسينات والإصلاحات في كل إصدار
          </p>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setFilterType('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            جميع الإصدارات
          </button>
          <button
            onClick={() => setFilterType('stable')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filterType === 'stable'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            الإصدارات المستقرة
          </button>
          <button
            onClick={() => setFilterType('beta')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              filterType === 'beta'
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            الإصدارات التجريبية
          </button>
        </motion.div>

        {/* Versions List */}
        <div className="max-w-5xl mx-auto space-y-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-white/60 mt-6 text-lg">جاري التحميل...</p>
            </div>
          ) : filteredVersions.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <Package className="w-20 h-20 text-white/20 mx-auto mb-6" />
              <p className="text-white/60 text-xl">لا توجد إصدارات</p>
            </div>
          ) : (
            filteredVersions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border transition-all hover:shadow-2xl ${
                  version.isLatest 
                    ? 'border-blue-400/50 shadow-xl shadow-blue-500/10' 
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Version Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <h2 className="text-3xl font-bold text-white">
                        {version.version}
                      </h2>
                      
                      {version.isLatest && (
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                          <Star className="w-3.5 h-3.5" />
                          أحدث إصدار
                        </span>
                      )}
                      
                      {version.isStable && !version.isBeta && (
                        <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          مستقر
                        </span>
                      )}
                      
                      {version.isBeta && (
                        <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                          Beta
                        </span>
                      )}
                      
                      {version.breaking && (
                        <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          تغييرات جذرية
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl text-white/90 font-semibold mb-2">
                      {version.title}
                    </h3>
                    <p className="text-white/60">
                      {version.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className="whitespace-nowrap">
                        {new Date(version.releaseDate).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {version.downloadUrl && (
                      <a
                        href={version.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium justify-center"
                      >
                        <Download className="w-4 h-4" />
                        تحميل
                      </a>
                    )}
                  </div>
                </div>

                {/* Features */}
                {version.features && version.features.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-green-400 mb-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-lg">ميزات جديدة</h4>
                    </div>
                    <ul className="space-y-3">
                      {version.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          className="flex items-start gap-3 text-white/80"
                        >
                          <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-green-400 font-bold text-xs">✓</span>
                          </div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bug Fixes */}
                {version.bugFixes && version.bugFixes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-blue-400 mb-4">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Bug className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-lg">إصلاحات</h4>
                    </div>
                    <ul className="space-y-3">
                      {version.bugFixes.map((fix, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          className="flex items-start gap-3 text-white/80"
                        >
                          <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-400 font-bold text-xs">🔧</span>
                          </div>
                          <span>{fix}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                {(version.minRequiredVersion || version.documentationUrl || (version.requirements && version.requirements.length > 0)) && (
                  <div className="pt-6 border-t border-white/10 space-y-3">
                    {version.minRequiredVersion && (
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>يتطلب الإصدار {version.minRequiredVersion} أو أحدث</span>
                      </div>
                    )}

                    {version.documentationUrl && (
                      <a
                        href={version.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>الوثائق</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}

                    {version.requirements && version.requirements.length > 0 && (
                      <div className="text-white/50 text-sm">
                        <span className="font-semibold">متطلبات النظام: </span>
                        {version.requirements.join(' • ')}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-white/10">
            <Package className="w-16 h-16 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">
              هل تريد تلقي إشعارات بالتحديثات؟
            </h3>
            <p className="text-white/60 max-w-md">
              سجل الدخول لتتمكن من تلقي إشعارات فورية بأحدث الإصدارات والتحديثات
            </p>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              <span>سجل الدخول الآن</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

