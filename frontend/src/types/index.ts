export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  priceType: 'fixed' | 'per_kg';
  availableWeights: number[];
  category: Category;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  weight?: number; // For weight-based products
  finalPrice?: number; // Calculated price based on weight
}

export interface CustomerInfo {
  name: string;
  phone: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}