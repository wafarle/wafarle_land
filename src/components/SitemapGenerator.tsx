'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';

export default function SitemapGenerator() {
  const { settings } = useSettings();
  const [generated, setGenerated] = useState(false);

  const generateSitemapXml = () => {
    const seo = settings.website.seo;
    const currentDate = new Date().toISOString();
    
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${seo.canonicalUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${seo.canonicalUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${seo.canonicalUrl}/products</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${seo.canonicalUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${seo.canonicalUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    // Create and download the file
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
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
        <FileText className="w-5 h-5 text-purple-400" />
        ملف sitemap.xml
      </h4>
      
      <div className="space-y-4">
        <p className="text-white/70 text-sm">
          ملف sitemap.xml يساعد محركات البحث على اكتشاف وفهرسة صفحات موقعك بشكل أفضل.
        </p>
        
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-purple-400 text-sm">
            📋 <strong>ملاحظة:</strong> بعد تحميل الملف، ضعه في المجلد الجذر لموقعك (public/sitemap.xml)
          </p>
        </div>
        
        <button
          onClick={generateSitemapXml}
          className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 ${
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
              إنشاء وتحميل sitemap.xml
            </>
          )}
        </button>
      </div>
    </div>
  );
}






