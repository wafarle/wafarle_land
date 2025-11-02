import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getProductByIdServer } from '@/lib/server-database';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  if (!productId) {
    return {
      title: 'المنتج غير موجود - وافرلي',
      description: 'المنتج المطلوب غير موجود',
    };
  }

  try {
    const product = await getProductByIdServer(productId);
    
    if (!product) {
      return {
        title: 'المنتج غير موجود - وافرلي',
        description: 'المنتج المطلوب غير موجود',
      };
    }

    const host = (await headers()).get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const productUrl = `${baseUrl}/products/${productId}`;
    
    const title = `${product.name} - وافرلي | أفضل عروض الاشتراكات`;
    const description = product.description || `اشتراك ${product.name} بأسعار مميزة وجودة عالية من وافرلي`;
    const image = product.image && product.image !== '/api/placeholder/300/200' 
      ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`)
      : `${baseUrl}/api/placeholder/800/600`;

    return {
      title,
      description,
      keywords: [
        product.name,
        'اشتراك',
        'اشتراكات',
        product.category === 'streaming' ? 'البث المباشر' :
        product.category === 'music' ? 'الموسيقى' :
        product.category === 'gaming' ? 'الألعاب' :
        product.category === 'productivity' ? 'الإنتاجية' : '',
        'وافرلي',
        'wafarle'
      ].filter(Boolean),
      openGraph: {
        title,
        description,
        url: productUrl,
        siteName: 'وافرلي - wafarle',
        locale: 'ar_SA',
        type: 'website',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: productUrl,
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
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'المنتج - وافرلي',
      description: 'عرض تفاصيل المنتج',
    };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

