'use client';

import { useSettings } from '@/contexts/SettingsContext';
import Head from 'next/head';

export default function SEOHead() {
  const { settings } = useSettings();
  const seo = settings.website.seo;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${seo.canonicalUrl}/#organization`,
        "name": seo.structuredData.organization.name,
        "url": seo.structuredData.organization.url,
        "logo": {
          "@type": "ImageObject",
          "url": seo.structuredData.organization.logo
        },
        "description": seo.structuredData.organization.description,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": seo.structuredData.organization.contactPoint.telephone,
          "contactType": seo.structuredData.organization.contactPoint.contactType,
          "email": seo.structuredData.organization.contactPoint.email
        },
        "sameAs": seo.structuredData.organization.sameAs
      },
      {
        "@type": "WebSite",
        "@id": `${seo.canonicalUrl}/#website`,
        "url": seo.structuredData.website.url,
        "name": seo.structuredData.website.name,
        "description": seo.structuredData.website.description,
        "publisher": {
          "@id": `${seo.canonicalUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": seo.structuredData.website.potentialAction.target
          },
          "query-input": seo.structuredData.website.potentialAction.queryInput
        }
      }
    ]
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seo.metaTitle}</title>
      <meta name="description" content={seo.metaDescription} />
      <meta name="keywords" content={seo.metaKeywords} />
      <meta name="robots" content={`${seo.robotsIndex ? 'index' : 'noindex'}, ${seo.robotsFollow ? 'follow' : 'nofollow'}`} />
      <link rel="canonical" href={seo.canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={seo.ogTitle} />
      <meta property="og:description" content={seo.ogDescription} />
      <meta property="og:image" content={seo.ogImage} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={settings.website.siteName} />
      <meta property="og:locale" content="ar_SA" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={seo.twitterCard} />
      <meta name="twitter:site" content={seo.twitterSite} />
      <meta name="twitter:creator" content={seo.twitterCreator} />
      <meta name="twitter:title" content={seo.ogTitle} />
      <meta name="twitter:description" content={seo.ogDescription} />
      <meta name="twitter:image" content={seo.ogImage} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1e40af" />
      <meta name="language" content="ar" />
      <meta name="author" content={settings.website.siteName} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Favicon */}
      {settings.website.favicon && (
        <link rel="icon" href={settings.website.favicon} />
      )}
    </Head>
  );
}

