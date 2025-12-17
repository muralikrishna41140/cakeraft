/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://cakeraft.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/login', '/dashboard', '/products/add', '/products/edit/*', '/billing', '/analytics', '/categories/manage'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/login', '/dashboard', '/products/add', '/products/edit', '/billing', '/analytics', '/categories/manage'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/login', '/dashboard', '/products/add', '/products/edit', '/billing', '/analytics', '/categories/manage'],
      },
    ],
    additionalSitemaps: [
      'https://cakeraft.com/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq for different pages
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.includes('/products')) {
      priority = 0.8;
      changefreq = 'daily';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
