'use client';

import Script from 'next/script';
import { useSettings } from '../contexts/SettingsContext';
import { useEffect } from 'react';

const AnalyticsProvider = () => {
  const { settings } = useSettings();
  const analytics = settings.analytics;

  // Microsoft Clarity
  useEffect(() => {
    if (analytics.microsoftClarity.enabled && analytics.microsoftClarity.projectId) {
      (function(c,l,a,r,i,t,y){
        // @ts-ignore
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        // @ts-ignore
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        // @ts-ignore
        y=l.getElementsByTagName(r)[0];y.parentNode?.insertBefore(t,y);
      })(window, document, "clarity", "script", analytics.microsoftClarity.projectId);
    }
  }, [analytics.microsoftClarity.enabled, analytics.microsoftClarity.projectId]);

  // Facebook Pixel
  useEffect(() => {
    if (analytics.facebookPixel.enabled && analytics.facebookPixel.pixelId) {
      // @ts-ignore
      !function(f,b,e,v,n,t,s)
      // @ts-ignore
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      // @ts-ignore
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      // @ts-ignore
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      // @ts-ignore
      n.queue=[];t=b.createElement(e);t.async=!0;
      // @ts-ignore
      t.src=v;s=b.getElementsByTagName(e)[0];
      // @ts-ignore
      s.parentNode?.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      // @ts-ignore
      fbq('init', analytics.facebookPixel.pixelId);
      // @ts-ignore
      fbq('track', 'PageView');
    }
  }, [analytics.facebookPixel.enabled, analytics.facebookPixel.pixelId]);

  return (
    <>
      {/* Google Analytics */}
      {analytics.googleAnalytics.enabled && analytics.googleAnalytics.measurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalytics.measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analytics.googleAnalytics.measurementId}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {analytics.googleTagManager.enabled && analytics.googleTagManager.containerId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${analytics.googleTagManager.containerId}');
            `}
          </Script>
        </>
      )}

      {/* Google Search Console Verification */}
      {analytics.googleSearchConsole.enabled && analytics.googleSearchConsole.verificationCode && (
        <meta name="google-site-verification" content={analytics.googleSearchConsole.verificationCode} />
      )}

      {/* Facebook Pixel NoScript fallback */}
      {analytics.facebookPixel.enabled && analytics.facebookPixel.pixelId && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${analytics.facebookPixel.pixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  );
};

export default AnalyticsProvider;
