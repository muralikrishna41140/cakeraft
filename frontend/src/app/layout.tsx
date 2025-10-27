import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CakeRaft - Professional Cake Business Management',
  description: 'Complete billing and management system for cake businesses with WhatsApp integration and loyalty rewards',
  keywords: 'cake business, billing, bakery management, invoicing, loyalty rewards, WhatsApp integration',
  icons: {
    icon: 'https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg',
    shortcut: 'https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg',
    apple: 'https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg',
  },
  openGraph: {
    title: 'CakeRaft - Professional Cake Business Management',
    description: 'Complete billing and management system for cake businesses',
    images: ['https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>
          <div id="root" className="h-full">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}