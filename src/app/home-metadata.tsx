import type { Metadata } from 'next';
import { PAGE_SEO, SITE_CONFIG } from '@/lib/seo';

export const metadata: Metadata = {
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  keywords: PAGE_SEO.home.keywords,
  alternates: {
    canonical: PAGE_SEO.home.canonical,
  },
  openGraph: {
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    url: PAGE_SEO.home.canonical,
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      {/* SEO-optimized content will be added here */}
    </>
  );
}
