import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the full image URL for a product
 * Handles both Cloudinary URLs (starts with http/https) and local uploads
 * @param imageUrl - The image URL from the product
 * @returns Full image URL or null
 */
export function getProductImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  
  // If it's already a full URL (Cloudinary), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, it's a local upload path, prepend API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix
  return `${baseUrl}${imageUrl}`;
}

/**
 * Format price with currency symbol
 * @param price - Price value
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = '₹'): string {
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Format date to locale string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date and time
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
