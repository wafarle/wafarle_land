import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: 'مدونة وافرلي - مقالات في التقنية وريادة الأعمال',
  description: 'اكتشف أحدث المقالات في عالم التقنية وريادة الأعمال والتسويق الرقمي. نصائح وإرشادات من خبراء الصناعة.',
  keywords: 'مدونة, مقالات, تقنية, ريادة أعمال, تسويق رقمي, نصائح, إرشادات',
  openGraph: {
    title: 'مدونة وافرلي - مقالات في التقنية وريادة الأعمال',
    description: 'اكتشف أحدث المقالات في عالم التقنية وريادة الأعمال والتسويق الرقمي. نصائح وإرشادات من خبراء الصناعة.',
    type: 'website',
    url: 'https://wafarle.com/blog',
    siteName: 'وافرلي'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مدونة وافرلي - مقالات في التقنية وريادة الأعمال',
    description: 'اكتشف أحدث المقالات في عالم التقنية وريادة الأعمال والتسويق الرقمي. نصائح وإرشادات من خبراء الصناعة.'
  },
  alternates: {
    canonical: 'https://wafarle.com/blog'
  }
};

export default function BlogPage() {
  return <BlogPageClient />;
}




