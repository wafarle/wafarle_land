'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';

export default function RobotsGenerator() {
  const { settings } = useSettings();
  const [generated, setGenerated] = useState(false);

  const generateRobotsTxt = () => {
    const seo = settings.website.seo;
    const baseUrl = seo.canonicalUrl || 'https://wafarle.com';
    
    // Generate robots.txt content based on SEO settings
    let robotsContent = '';
    
    if (!seo.robotsIndex || !seo.robotsFollow) {
      // If either index or follow is disabled, use disallow
      if (!seo.robotsIndex && !seo.robotsFollow) {
        robotsContent = `# robots.txt for ${baseUrl}
# Generated automatically based on SEO settings

User-agent: *
Disallow: /`;
      } else if (!seo.robotsIndex) {
        robotsContent = `# robots.txt for ${baseUrl}
# Generated automatically based on SEO settings

User-agent: *
Noindex: /`;
      } else if (!seo.robotsFollow) {
        robotsContent = `# robots.txt for ${baseUrl}
# Generated automatically based on SEO settings

User-agent: *
Nofollow: /`;
      }
    } else {
      // If both index and follow are enabled, allow crawling
      robotsContent = `# robots.txt for ${baseUrl}
# Generated automatically based on SEO settings

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml`;
    }

    // Create and download the file
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  return (
    <div className="p-6 bg-white/5 rounded-xl border border-white/10">
      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-400" />
        ملف robots.txt
      </h4>
      
      <div className="space-y-4">
        <p className="text-white/70 text-sm">
          ملف robots.txt يتحكم في كيفية فهرسة محركات البحث لموقعك. يتم إنشاؤه تلقائياً بناءً على إعدادات SEO الحالية.
        </p>
        
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm">
            📋 <strong>ملاحظة:</strong> بعد تحميل الملف، ضعه في المجلد الجذر لموقعك (public/robots.txt)
          </p>
        </div>
        
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/80 text-sm font-medium mb-2">الإعدادات الحالية:</p>
          <ul className="space-y-1 text-white/60 text-sm">
            <li>• الفهرسة: {settings.website.seo.robotsIndex ? '✅ مفعلة' : '❌ معطلة'}</li>
            <li>• المتابعة: {settings.website.seo.robotsFollow ? '✅ مفعلة' : '❌ معطلة'}</li>
          </ul>
        </div>
        
        <button
          onClick={generateRobotsTxt}
          className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2 ${
            generated ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={generated}
        >
          {generated ? (
            <>
              <CheckCircle className="w-5 h-5" />
              تم التحميل!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              إنشاء وتحميل robots.txt
            </>
          )}
        </button>
      </div>
    </div>
  );
}




