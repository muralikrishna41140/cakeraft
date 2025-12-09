import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import {
  SITE_CONFIG,
  KEYWORDS,
  getOrganizationSchema,
  getWebsiteSchema,
  getSoftwareApplicationSchema,
  getFAQSchema,
} from "@/lib/seo";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Viewport configuration for better mobile SEO
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#16A34A",
};

// Enhanced Metadata for SEO
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    default: SITE_CONFIG.fullName,
    template: "%s | CakeRaft",
  },

  description: SITE_CONFIG.description,

  keywords: [...KEYWORDS.primary, ...KEYWORDS.secondary, ...KEYWORDS.lsi].join(
    ", "
  ),

  authors: [{ name: SITE_CONFIG.name }],

  creator: SITE_CONFIG.name,

  publisher: SITE_CONFIG.name,

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/du4jhwpak/image/upload/v1765109404/cakeraft_white_logo_dyo9lo.jpg",
        type: "image/jpeg",
      },
    ],
    shortcut:
      "https://res.cloudinary.com/du4jhwpak/image/upload/v1765109404/cakeraft_white_logo_dyo9lo.jpg",
    apple:
      "https://res.cloudinary.com/du4jhwpak/image/upload/v1765109404/cakeraft_white_logo_dyo9lo.jpg",
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "CakeRaft - Professional Cake Business Management System",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.social.twitter,
    images: [`${SITE_CONFIG.url}/twitter-image.jpg`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },

  alternates: {
    canonical: SITE_CONFIG.url,
  },

  category: "Business & Productivity",

  // Additional comprehensive meta tags for better SEO
  other: {
    // Business Information
    "business:contact_data:street_address":
      SITE_CONFIG.contact.address.streetAddress,
    "business:contact_data:locality":
      SITE_CONFIG.contact.address.addressLocality,
    "business:contact_data:region": SITE_CONFIG.contact.address.addressRegion,
    "business:contact_data:postal_code": SITE_CONFIG.contact.address.postalCode,
    "business:contact_data:country_name":
      SITE_CONFIG.contact.address.addressCountry,
    "business:contact_data:email": SITE_CONFIG.contact.email,
    "business:contact_data:phone_number": SITE_CONFIG.contact.phone,

    // Software Application Tags
    "application-name": SITE_CONFIG.name,
    "software-application": "Business Management Software",
    "software-category": "Bakery Management, Billing Software, POS System",

    // Target Audience
    "target-audience":
      "Cake Businesses, Bakeries, Home Bakers, Pastry Shops, Custom Cake Makers",

    // Geographic Coverage
    "geographic-coverage": "India, Worldwide",
    "content-language": "en-IN",

    // Business Features
    features:
      "Smart Billing, Customer Loyalty, WhatsApp Integration, Revenue Analytics, Inventory Management",

    // Mobile App Capable
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": SITE_CONFIG.name,

    // Rating & Reviews
    rating: "4.9 out of 5 stars",
    "review-count": "127",

    // Industry Classification
    industry:
      "Software as a Service (SaaS), Business Management Software, Food & Beverage Technology",

    // Pricing
    price: "Free to Start",
    currency: "INR",

    // Distribution
    distribution: "Global",
    availability: "Online",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate structured data schemas
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();
  const softwareSchema = getSoftwareApplicationSchema();
  const faqSchema = getFAQSchema();

  return (
    <html lang="en" className="h-full">
      <head>
        {/* Enhanced Meta Tags for SEO */}
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Business & Industry Specific Meta Tags */}
        <meta
          name="industry"
          content="Software, Food & Beverage Technology, Business Management"
        />
        <meta
          name="classification"
          content="Business Software, SaaS Platform, Bakery Management System"
        />
        <meta
          name="subject"
          content="Cake Business Management, Bakery Billing Software, Customer Loyalty System"
        />
        <meta
          name="topic"
          content="Bakery Management, POS System, Business Automation"
        />
        <meta
          name="summary"
          content="Complete cake business management system with billing, loyalty rewards, WhatsApp integration, and analytics"
        />

        {/* Search Engine Specific Tags */}
        <meta
          name="googlebot"
          content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"
        />
        <meta
          name="bingbot"
          content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"
        />
        <meta name="allow-search" content="yes" />
        <meta
          name="audience"
          content="Business Owners, Entrepreneurs, Bakery Managers, Cake Shop Owners"
        />

        {/* Geographic & Location Tags */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="" />
        <meta name="ICBM" content="" />

        {/* Copyright & Ownership */}
        <meta name="copyright" content="CakeRaft" />
        <meta name="designer" content="CakeRaft Team" />
        <meta name="owner" content="CakeRaft" />
        <meta name="url" content={SITE_CONFIG.url} />
        <meta name="identifier-URL" content={SITE_CONFIG.url} />

        {/* Page Type & Classification */}
        <meta
          name="pagename"
          content="CakeRaft - Cake Business Management System"
        />
        <meta name="category" content="Business & Productivity Software" />
        <meta name="coverage" content="Global" />

        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />

        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* DNS Prefetch for faster loading */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
              anonymize_ip: true,
            });
          `}
        </Script>

        <AuthProvider>
          <div id="root" className="h-full">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                style: {
                  background: "#10b981",
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: "#ef4444",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
