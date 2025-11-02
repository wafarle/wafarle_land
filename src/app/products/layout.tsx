import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'جميع المنتجات - وافرلي | أفضل عروض الاشتراكات',
  description: 'اكتشف مجموعة واسعة من خدمات الاشتراكات التي نقدمها بأسعار تنافسية وجودة عالية. Netflix، Spotify، Shahid، Disney+ والمزيد من وافرلي.',
  keywords: [
    'منتجات',
    'اشتراكات',
    'البث المباشر',
    'الموسيقى',
    'الألعاب',
    'الإنتاجية',
    'Netflix',
    'Spotify',
    'Shahid',
    'Disney+',
    'وافرلي',
    'wafarle',
  ],
  openGraph: {
    title: 'جميع المنتجات - وافرلي',
    description: 'اكتشف مجموعة واسعة من خدمات الاشتراكات بأسعار تنافسية',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'وافرلي - wafarle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'جميع المنتجات - وافرلي',
    description: 'اكتشف مجموعة واسعة من خدمات الاشتراكات بأسعار تنافسية',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}



