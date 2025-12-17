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
    "cake business management system",
    "bakery billing software",
    "cake shop POS system",
    "online cake order management",
    "custom cake business software",
    "bakery management software India",
    "cake shop billing system",
    "WhatsApp billing for bakeries",
  ],
  secondary: [
    "cake inventory management",
    "bakery customer loyalty program",
    "cake shop revenue analytics",
    "WhatsApp cake order system",
    "made-to-order cake software",
    "artisan bakery management",
    "cake business automation",
    "professional cake billing",
    "cloud-based bakery software",
    "cake shop digital solution",
    "bakery POS system",
    "cake business dashboard",
    "customer retention software bakery",
    "bakery sales management",
    "cake order tracking system",
  ],
  lsi: [
    "bakery management platform",
    "cake business tools",
    "pastry shop software",
    "custom cake orders",
    "bakery point of sale",
    "cake delivery management",
    "bakery customer database",
    "cake pricing calculator",
    "bakery sales tracking",
    "cake business analytics",
    "home bakery software",
    "small bakery management",
    "cake shop CRM",
    "bakery invoice system",
    "cake business growth tools",
    "bakery profit tracking",
    "cake business automation software",
    "bakery ERP system",
  ],
  location: [
    "India",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
  ],
  businessType: [
    "home bakery",
    "custom cake business",
    "wedding cake business",
    "birthday cake shop",
    "artisan bakery",
    "boutique cake shop",
    "online cake business",
    "cake studio",
  ],
};

// Site Metadata
export const SITE_CONFIG = {
  name: "CakeRaft",
  fullName:
    "CakeRaft - Complete Cake Business Management & Billing Software for Bakeries",
  description:
    "CakeRaft is the ultimate cloud-based cake business management system designed for modern bakeries and cake shops. Streamline your operations with intelligent billing, automated customer loyalty rewards, WhatsApp invoice delivery, real-time revenue analytics, inventory tracking, and Google Sheets integration. Perfect for custom cake businesses, artisan bakeries, and made-to-order cake shops looking to grow their business and increase customer retention.",
  shortDescription:
    "Professional cake business management software with smart billing, loyalty rewards, WhatsApp integration, and real-time analytics for bakeries.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://cakeraft.com",
  locale: "en_US",
  type: "website",

  // Business Information
  business: {
    name: "CakeRaft",
    type: "SoftwareApplication",
    category: "Business & Productivity",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser, All Platforms",
    aggregateRating: {
      ratingValue: "4.9",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    offers: {
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2026-12-31",
    },
    featureList: [
      "Smart Billing System",
      "Customer Loyalty Program",
      "WhatsApp Invoice Delivery",
      "Revenue Analytics Dashboard",
      "Product & Category Management",
      "Google Sheets Integration",
      "Real-time Cart Management",
      "Customer Purchase Tracking",
      "30-Day Revenue Charts",
      "Automated Discount Calculation",
    ],
  },

  // Contact Information
  contact: {
    email: "support@cakeraft.com",
    phone: "+91-XXX-XXX-XXXX",
    address: {
      streetAddress: "Your Street Address",
      addressLocality: "Your City",
      addressRegion: "Your State",
      postalCode: "XXXXXX",
      addressCountry: "IN",
    },
  },

  // Social Media
  social: {
    twitter: "@cakeraft",
    facebook: "https://facebook.com/cakeraft",
    instagram: "https://instagram.com/cakeraft",
    linkedin: "https://linkedin.com/company/cakeraft",
  },
};

// Default SEO Configuration
export const DEFAULT_SEO: DefaultSeoProps = {
  defaultTitle: SITE_CONFIG.fullName,
  titleTemplate: "%s | CakeRaft - Cake Business Management",
  description: SITE_CONFIG.description,

  // Canonical URL
  canonical: SITE_CONFIG.url,

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
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
        alt: "CakeRaft - Professional Cake Business Management System",
        type: "image/jpeg",
      },
      {
        url: `${SITE_CONFIG.url}/og-image-square.jpg`,
        width: 800,
        height: 800,
        alt: "CakeRaft Logo",
        type: "image/jpeg",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    handle: SITE_CONFIG.social.twitter,
    site: SITE_CONFIG.social.twitter,
    cardType: "summary_large_image",
  },

  // Additional Meta Tags
  additionalMetaTags: [
    {
      name: "keywords",
      content: [...KEYWORDS.primary, ...KEYWORDS.secondary.slice(0, 5)].join(
        ", "
      ),
    },
    {
      name: "author",
      content: SITE_CONFIG.name,
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1, maximum-scale=5",
    },
    {
      name: "theme-color",
      content: "#16A34A", // Green primary color
    },
    {
      name: "mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-capable",
      content: "yes",
    },
    {
      name: "apple-mobile-web-app-status-bar-style",
      content: "default",
    },
    {
      name: "apple-mobile-web-app-title",
      content: SITE_CONFIG.name,
    },
    {
      name: "application-name",
      content: SITE_CONFIG.name,
    },
    {
      name: "msapplication-TileColor",
      content: "#16A34A",
    },
    {
      name: "format-detection",
      content: "telephone=no",
    },
    // Geo Tags for Local SEO
    {
      name: "geo.region",
      content: "IN",
    },
    {
      name: "geo.placename",
      content: "India",
    },
    // Language
    {
      httpEquiv: "content-language",
      content: "en",
    },
  ],

  // Additional Link Tags
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ],
};

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    title:
      "CakeRaft - #1 Cake Business Management Software | Smart Billing & Analytics",
    description:
      "Transform your cake business with CakeRaft, the complete cloud-based management system trusted by 100+ bakeries. Features: 🎂 Smart billing with customer loyalty rewards 📱 WhatsApp invoice delivery 📊 Real-time revenue analytics 🎯 Automated discount calculation 📈 30-day performance tracking. Perfect for home bakeries, custom cake shops, and artisan bakeries. Start managing your cake business like a pro today!",
    keywords: [...KEYWORDS.primary, ...KEYWORDS.businessType].join(", "),
    canonical: SITE_CONFIG.url,
  },

  products: {
    title:
      "Cake Product Management - Digital Menu Builder for Bakeries | CakeRaft",
    description:
      "Create and manage your complete cake catalog with CakeRaft. Easily add custom cakes, birthday cakes, wedding cakes, and specialty desserts with beautiful images, competitive pricing, and organized categories. Features: ✨ Visual product cards 🖼️ Image upload & management 💰 Flexible pricing 🏷️ Category organization 📱 Mobile-friendly interface. Showcase your creations and streamline your made-to-order bakery menu.",
    keywords:
      "cake products, bakery menu management, custom cake pricing, cake categories, digital bakery menu, cake catalog software, product management bakery",
    canonical: `${SITE_CONFIG.url}/products`,
  },

  billing: {
    title: "Smart Billing & Loyalty System - WhatsApp Invoices | CakeRaft",
    description:
      "Revolutionary billing system for cake businesses with built-in customer loyalty rewards. Features: 💳 Lightning-fast checkout process 🎁 Automatic 3rd purchase discounts 📱 WhatsApp PDF invoice delivery 👥 Customer purchase tracking 🛒 Real-time cart management 💰 Item-level discount system. Increase customer retention by 40% with our proven loyalty program. Perfect for busy bakeries processing multiple orders daily.",
    keywords:
      "bakery billing, WhatsApp invoice, customer loyalty program, cake order management, automated billing bakery, loyalty rewards system, WhatsApp invoicing India",
    canonical: `${SITE_CONFIG.url}/billing`,
  },

  analytics: {
    title: "Revenue Analytics Dashboard - Track Bakery Performance | CakeRaft",
    description:
      "Make data-driven decisions with CakeRaft's powerful analytics dashboard. Features: 📊 Real-time revenue tracking 📈 30-day performance charts 📉 Daily sales breakdown 💼 Order count metrics 📤 Google Sheets export 🎯 Customer insights. Monitor your cake business growth, identify trends, and optimize pricing strategies. Complete visibility into your bakery's financial performance.",
    keywords:
      "bakery analytics, revenue tracking, sales dashboard, business insights, bakery profit tracking, cake business analytics, sales reporting bakery",
    canonical: `${SITE_CONFIG.url}/analytics`,
  },

  categories: {
    title: "Cake Categories Management - Organize Your Bakery Menu | CakeRaft",
    description:
      "Organize your cake offerings with smart category management. Create categories for birthday cakes, wedding cakes, custom orders, seasonal specials, and more. Streamline your menu structure for better customer browsing experience.",
    keywords:
      "cake categories, bakery menu organization, cake types management, product categories bakery",
    canonical: `${SITE_CONFIG.url}/categories`,
  },

  dashboard: {
    title: "Admin Dashboard - Complete Business Overview | CakeRaft",
    description:
      "Your cake business command center. View today's revenue, manage products, process orders, track customer loyalty, and analyze performance - all from one beautiful dashboard. Get instant insights and take action to grow your bakery.",
    keywords:
      "bakery dashboard, business management dashboard, cake shop admin panel, bakery control center",
    canonical: `${SITE_CONFIG.url}/dashboard`,
  },
};

/**
 * Generate Organization Schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "SoftwareOrganization"],
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.business.name,
    legalName: SITE_CONFIG.business.name,
    alternateName: "CakeRaft Business Software",
    url: SITE_CONFIG.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.url}/logo.png`,
      width: 512,
      height: 512,
      caption: "CakeRaft Logo",
    },
    image: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.url}/og-image.jpg`,
      width: 1200,
      height: 630,
    },
    description: SITE_CONFIG.description,
    slogan: "Transform Your Cake Business with Smart Management",
    email: SITE_CONFIG.contact.email,
    telephone: SITE_CONFIG.contact.phone,
    address: {
      "@type": "PostalAddress",
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE_CONFIG.business.aggregateRating.ratingValue,
      ratingCount: SITE_CONFIG.business.aggregateRating.ratingCount,
      bestRating: SITE_CONFIG.business.aggregateRating.bestRating,
    },
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: "5-10",
    },
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "CakeRaft Team",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    knowsAbout: [
      "Bakery Management",
      "POS Systems",
      "Customer Loyalty Programs",
      "Business Analytics",
      "Cloud Software",
    ],
  };
}

/**
 * Generate WebSite Schema with SearchAction
 */
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      "@id": `${SITE_CONFIG.url}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate SoftwareApplication Schema
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_CONFIG.url}/#software`,
    name: SITE_CONFIG.business.name,
    operatingSystem: SITE_CONFIG.business.operatingSystem,
    applicationCategory: SITE_CONFIG.business.applicationCategory,
    applicationSubCategory: "Business Management Software, POS System",
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.business.name,
      url: SITE_CONFIG.url,
    },
    offers: {
      "@type": "Offer",
      price: SITE_CONFIG.business.offers.price,
      priceCurrency: SITE_CONFIG.business.offers.priceCurrency,
      availability: SITE_CONFIG.business.offers.availability,
      priceValidUntil: SITE_CONFIG.business.offers.priceValidUntil,
      url: SITE_CONFIG.url,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE_CONFIG.business.aggregateRating.ratingValue,
      ratingCount: SITE_CONFIG.business.aggregateRating.ratingCount,
      bestRating: SITE_CONFIG.business.aggregateRating.bestRating,
      worstRating: SITE_CONFIG.business.aggregateRating.worstRating,
      reviewCount: SITE_CONFIG.business.aggregateRating.ratingCount,
    },
    screenshot: `${SITE_CONFIG.url}/screenshots/dashboard.png`,
    image: `${SITE_CONFIG.url}/og-image.jpg`,
    softwareVersion: "2.0",
    releaseNotes:
      "Latest version with enhanced WhatsApp integration and improved analytics",
    downloadUrl: SITE_CONFIG.url,
    installUrl: SITE_CONFIG.url,
    featureList: SITE_CONFIG.business.featureList,
    audience: {
      "@type": "Audience",
      audienceType:
        "Bakery Owners, Cake Shop Managers, Home Bakers, Pastry Chefs, Food Entrepreneurs",
    },
    inLanguage: "en-IN",
    availableLanguage: ["en", "hi"],
    keywords: [...KEYWORDS.primary, ...KEYWORDS.secondary.slice(0, 5)].join(
      ", "
    ),
  };
}

/**
 * Generate Breadcrumb Schema
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
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
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is CakeRaft?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CakeRaft is a professional cloud-based management system designed specifically for cake businesses and bakeries. It features customer loyalty programs, WhatsApp billing, revenue analytics, and complete inventory management for made-to-order cake businesses.",
        },
      },
      {
        "@type": "Question",
        name: "Does CakeRaft support customer loyalty programs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! CakeRaft includes an automatic customer loyalty program that rewards customers with discounts on every 3rd purchase. The system tracks purchases by phone number and applies discounts automatically during checkout.",
        },
      },
      {
        "@type": "Question",
        name: "Can I send bills via WhatsApp?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely! CakeRaft integrates with WhatsApp Business API to send professional PDF bills directly to customers. Each bill includes itemized receipts, branding, and all transaction details.",
        },
      },
      {
        "@type": "Question",
        name: "Is CakeRaft suitable for made-to-order cake businesses?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, CakeRaft is specifically designed for made-to-order cake businesses. It supports both fixed pricing and per-kilogram pricing, custom weight selection, and does not include unnecessary stock tracking.",
        },
      },
      {
        "@type": "Question",
        name: "How does the revenue analytics feature work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CakeRaft provides real-time revenue analytics with interactive 30-day charts, daily revenue breakdowns, order trends, and customer insights. You can export data to Google Sheets for detailed analysis and archival.",
        },
      },
      {
        "@type": "Question",
        name: "Is CakeRaft free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CakeRaft offers a free plan to get started. You can manage unlimited products, process bills, track customer loyalty, and access basic analytics at no cost. Premium features and advanced integrations are available in paid plans.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use CakeRaft on my mobile phone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! CakeRaft is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. You can manage your cake business from anywhere with an internet connection.",
        },
      },
      {
        "@type": "Question",
        name: "How does the customer loyalty tracking work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CakeRaft automatically tracks customer purchases using their phone number. Every 3rd purchase qualifies for a 10% discount (configurable). The system displays loyalty status during checkout and automatically applies rewards, helping you build customer retention.",
        },
      },
      {
        "@type": "Question",
        name: "Can I manage multiple cake categories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely! CakeRaft allows you to create unlimited categories like Birthday Cakes, Wedding Cakes, Custom Cakes, Cupcakes, Pastries, and more. Organize your menu for easy browsing and better product management.",
        },
      },
      {
        "@type": "Question",
        name: "Does CakeRaft work for home bakeries?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! CakeRaft is perfect for home bakeries, small cake shops, boutique bakeries, and large commercial operations. The system scales with your business and includes all essential features without unnecessary complexity.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my sales data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! CakeRaft integrates with Google Sheets for easy data export. You can export bills older than 30 days for archival, create custom reports, and maintain comprehensive business records for tax and accounting purposes.",
        },
      },
      {
        "@type": "Question",
        name: "How secure is my data on CakeRaft?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "CakeRaft uses industry-standard security practices including JWT authentication, encrypted connections (HTTPS), secure cloud storage with MongoDB Atlas, and regular backups. Your business data is safe and accessible only to authorized users.",
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
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.business.name,
      },
    },
    category: product.category?.name,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.business.name,
    },
  };
}
