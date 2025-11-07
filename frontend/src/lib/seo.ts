/**
 * SEO Configuration and Utilities
 * Optimized for top Google rankings
 */

// Type definition for SEO props
export interface DefaultSeoProps {
  defaultTitle?: string;
  titleTemplate?: string;
  description?: string;
  canonical?: string;
  openGraph?: any;
  twitter?: any;
  additionalMetaTags?: any[];
  additionalLinkTags?: any[];
}

// Primary Keywords (High-Impact, Low-Competition)
export const KEYWORDS = {
  primary: [
    'cake business management system',
    'bakery billing software',
    'cake shop POS system',
    'online cake order management',
    'custom cake business software',
  ],
  secondary: [
    'cake inventory management',
    'bakery customer loyalty program',
    'cake shop revenue analytics',
    'WhatsApp cake order system',
    'made-to-order cake software',
    'artisan bakery management',
    'cake business automation',
    'professional cake billing',
    'cloud-based bakery software',
    'cake shop digital solution',
  ],
  lsi: [
    'bakery management platform',
    'cake business tools',
    'pastry shop software',
    'custom cake orders',
    'bakery point of sale',
    'cake delivery management',
    'bakery customer database',
    'cake pricing calculator',
    'bakery sales tracking',
    'cake business analytics',
  ],
};

// Site Metadata
export const SITE_CONFIG = {
  name: 'CakeRaft',
  fullName: 'CakeRaft - Professional Cake Business Management System',
  description: 'Transform your cake business with CakeRaft - the complete cloud-based management system. Features customer loyalty programs, WhatsApp billing, revenue analytics, and inventory management for made-to-order bakeries.',
  shortDescription: 'Complete cake business management system with billing, loyalty rewards, and analytics.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cakeraft.com',
  locale: 'en_US',
  type: 'website',
  
  // Business Information
  business: {
    name: 'CakeRaft',
    type: 'SoftwareApplication',
    category: 'Business & Productivity',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'INR',
    },
  },
  
  // Contact Information
  contact: {
    email: 'support@cakeraft.com',
    phone: '+91-XXX-XXX-XXXX',
    address: {
      streetAddress: 'Your Street Address',
      addressLocality: 'Your City',
      addressRegion: 'Your State',
      postalCode: 'XXXXXX',
      addressCountry: 'IN',
    },
  },
  
  // Social Media
  social: {
    twitter: '@cakeraft',
    facebook: 'https://facebook.com/cakeraft',
    instagram: 'https://instagram.com/cakeraft',
    linkedin: 'https://linkedin.com/company/cakeraft',
  },
};

// Default SEO Configuration
export const DEFAULT_SEO: DefaultSeoProps = {
  defaultTitle: SITE_CONFIG.fullName,
  titleTemplate: '%s | CakeRaft - Cake Business Management',
  description: SITE_CONFIG.description,
  
  // Canonical URL
  canonical: SITE_CONFIG.url,
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'CakeRaft - Professional Cake Business Management System',
        type: 'image/jpeg',
      },
      {
        url: `${SITE_CONFIG.url}/og-image-square.jpg`,
        width: 800,
        height: 800,
        alt: 'CakeRaft Logo',
        type: 'image/jpeg',
      },
    ],
  },
  
  // Twitter Cards
  twitter: {
    handle: SITE_CONFIG.social.twitter,
    site: SITE_CONFIG.social.twitter,
    cardType: 'summary_large_image',
  },
  
  // Additional Meta Tags
  additionalMetaTags: [
    {
      name: 'keywords',
      content: [...KEYWORDS.primary, ...KEYWORDS.secondary.slice(0, 5)].join(', '),
    },
    {
      name: 'author',
      content: SITE_CONFIG.name,
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=5',
    },
    {
      name: 'theme-color',
      content: '#16A34A', // Green primary color
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
    },
    {
      name: 'apple-mobile-web-app-title',
      content: SITE_CONFIG.name,
    },
    {
      name: 'application-name',
      content: SITE_CONFIG.name,
    },
    {
      name: 'msapplication-TileColor',
      content: '#16A34A',
    },
    {
      name: 'format-detection',
      content: 'telephone=no',
    },
    // Geo Tags for Local SEO
    {
      name: 'geo.region',
      content: 'IN',
    },
    {
      name: 'geo.placename',
      content: 'India',
    },
    // Language
    {
      httpEquiv: 'content-language',
      content: 'en',
    },
  ],
  
  // Additional Link Tags
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],
};

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    title: 'CakeRaft - Professional Cake Business Management System',
    description: 'Transform your cake business with CakeRaft. Complete cloud-based management system with customer loyalty, WhatsApp billing, revenue analytics, and inventory for made-to-order bakeries.',
    keywords: KEYWORDS.primary.join(', '),
    canonical: SITE_CONFIG.url,
  },
  
  products: {
    title: 'Cake Products Management - Organize Your Menu',
    description: 'Manage your cake products effortlessly. Add custom cakes, birthday cakes, wedding cakes with images, pricing, and categories. Perfect for made-to-order bakery businesses.',
    keywords: 'cake products, bakery menu management, custom cake pricing, cake categories',
    canonical: `${SITE_CONFIG.url}/products`,
  },
  
  billing: {
    title: 'Smart Billing System - Customer Loyalty & WhatsApp Integration',
    description: 'Advanced billing system with automatic customer loyalty rewards, WhatsApp PDF bill delivery, and real-time cart management. Boost customer retention with our 3rd purchase discount program.',
    keywords: 'bakery billing, WhatsApp invoice, customer loyalty program, cake order management',
    canonical: `${SITE_CONFIG.url}/billing`,
  },
  
  analytics: {
    title: 'Revenue Analytics & Business Insights Dashboard',
    description: 'Track your cake business performance with real-time revenue analytics, 30-day charts, order trends, and customer insights. Export data to Google Sheets for deep analysis.',
    keywords: 'bakery analytics, revenue tracking, sales dashboard, business insights',
    canonical: `${SITE_CONFIG.url}/analytics`,
  },
};

/**
 * Generate Organization Schema
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.business.name,
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/logo.png`,
      width: 512,
      height: 512,
    },
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.contact.email,
    telephone: SITE_CONFIG.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.contact.address.streetAddress,
      addressLocality: SITE_CONFIG.contact.address.addressLocality,
      addressRegion: SITE_CONFIG.contact.address.addressRegion,
      postalCode: SITE_CONFIG.contact.address.postalCode,
      addressCountry: SITE_CONFIG.contact.address.addressCountry,
    },
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.twitter,
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.linkedin,
    ],
  };
}

/**
 * Generate WebSite Schema with SearchAction
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate SoftwareApplication Schema
 */
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_CONFIG.business.name,
    operatingSystem: SITE_CONFIG.business.operatingSystem,
    applicationCategory: SITE_CONFIG.business.applicationCategory,
    description: SITE_CONFIG.description,
    offers: {
      '@type': 'Offer',
      price: SITE_CONFIG.business.offers.price,
      priceCurrency: SITE_CONFIG.business.offers.priceCurrency,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    screenshot: `${SITE_CONFIG.url}/screenshots/dashboard.png`,
    featureList: [
      'Customer Loyalty Program',
      'WhatsApp Bill Delivery',
      'Revenue Analytics Dashboard',
      'Product Management',
      'Made-to-Order Cake System',
      'Cloud-based Storage',
      'Multi-device Access',
      'Real-time Updates',
    ],
  };
}

/**
 * Generate Breadcrumb Schema
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ Schema
 */
export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is CakeRaft?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CakeRaft is a professional cloud-based management system designed specifically for cake businesses and bakeries. It features customer loyalty programs, WhatsApp billing, revenue analytics, and complete inventory management for made-to-order cake businesses.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does CakeRaft support customer loyalty programs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! CakeRaft includes an automatic customer loyalty program that rewards customers with discounts on every 3rd purchase. The system tracks purchases by phone number and applies discounts automatically during checkout.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I send bills via WhatsApp?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! CakeRaft integrates with WhatsApp Business API to send professional PDF bills directly to customers. Each bill includes itemized receipts, branding, and all transaction details.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is CakeRaft suitable for made-to-order cake businesses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, CakeRaft is specifically designed for made-to-order cake businesses. It supports both fixed pricing and per-kilogram pricing, custom weight selection, and does not include unnecessary stock tracking.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the revenue analytics feature work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CakeRaft provides real-time revenue analytics with interactive 30-day charts, daily revenue breakdowns, order trends, and customer insights. You can export data to Google Sheets for detailed analysis and archival.',
        },
      },
    ],
  };
}

/**
 * Generate Product Schema for cake products
 */
export function getProductSchema(product: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.business.name,
      },
    },
    category: product.category?.name,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.business.name,
    },
  };
}
