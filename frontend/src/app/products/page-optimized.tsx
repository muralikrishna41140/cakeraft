'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary, ErrorDisplay } from '@/components/ErrorBoundary';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Image as ImageIcon,
  Cake,
  ChefHat,
  RefreshCw
} from 'lucide-react';
import { Product, Category } from '@/types';
import toast from 'react-hot-toast';
import { useProducts, useCategories, useDebouncedSearch } from '@/hooks/useOptimizedQuery';
import optimizedAPI from '@/lib/optimizedApi';
import { getProductImageUrl } from '@/lib/utils';

function ProductsContent() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Debounced search (500ms delay)
  const [debouncedSearch, searchTerm, setSearchTerm] = useDebouncedSearch('', 500);

  // Fetch products with caching and auto-deduplication
  const { 
    data: productsData, 
    isLoading: loadingProducts, 
    error: productsError,
    refetch: refetchProducts 
  } = useProducts(
    { 
      category: selectedCategory || undefined,
      search: debouncedSearch || undefined 
    },
    {
      refetchOnMount: true, // Always fetch fresh on mount
    }
  );

  // Fetch categories with caching
  const { 
    data: categoriesData, 
    isLoading: loadingCategories,
    error: categoriesError 
  } = useCategories({
    refetchOnMount: false, // Use cache if available
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const loading = loadingProducts || loadingCategories;

  // Memoized filtered products (client-side filtering for instant response)
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category._id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Optimized delete handler with optimistic update
  const handleDelete = useCallback(async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading('Deleting product...');

    try {
      await optimizedAPI.products.deleteProduct(productId);
      toast.success('Product deleted successfully', { id: loadingToast });
      
      // Refresh products list
      refetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product', { id: loadingToast });
    }
  }, [refetchProducts]);

  // Handle refresh button
  const handleRefresh = useCallback(() => {
    refetchProducts();
    toast.success('Products refreshed');
  }, [refetchProducts]);

  // Handle category change
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  // Show error if any
  if (productsError || categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-white p-8">
        <ErrorDisplay 
          error={productsError || categoriesError || 'Unknown error'} 
          onRetry={refetchProducts}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-white">
      {/* Decorative Elements - Hidden on mobile */}
      <div className="hidden md:block fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-16 right-10 text-green-200 opacity-20">
          <Cake className="h-16 w-16" />
        </div>
        <div className="absolute bottom-20 left-10 text-cream-300 opacity-20">
          <ChefHat className="h-20 w-20" />
        </div>
      </div>

      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm shadow-lg border-b-4 border-gradient-to-r from-green-300 to-cream-300 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1 sm:gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800 p-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-cream-600 bg-clip-text text-transparent">
                  Products
                </h1>
                <p className="hidden sm:block text-xs sm:text-sm text-gray-600">
                  Manage your delicious offerings
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1 sm:gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800 p-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                onClick={() => router.push('/products/add')}
                className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-cream-500 hover:from-green-600 hover:to-cream-600 p-2 sm:px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Product</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-8 border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm sm:text-base"
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {debouncedSearch !== searchTerm && '🔄 Searching...'}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white transition-all text-sm sm:text-base"
                disabled={loadingCategories}
              >
                <option value="">All Categories</option>
                {categories.map((category: Category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-3 w-3 border-2 border-green-500 border-t-transparent rounded-full" />
                Loading products...
              </span>
            ) : (
              <span>
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              </span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white/60 rounded-2xl backdrop-blur-sm border border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <Cake className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first product'}
            </p>
            {!searchTerm && !selectedCategory && (
              <Button
                onClick={() => router.push('/products/add')}
                className="bg-gradient-to-r from-green-500 to-cream-500 hover:from-green-600 hover:to-cream-600"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onDelete={handleDelete}
                onEdit={() => router.push(`/products/edit/${product._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Memoized Product Card Component
const ProductCard = React.memo(({ 
  product, 
  onDelete, 
  onEdit 
}: { 
  product: Product; 
  onDelete: (id: string) => void;
  onEdit: () => void;
}) => {
  const imageUrl = getProductImageUrl(product.imageUrl);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-green-200">
      {/* Product Image */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-green-50 to-cream-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy" // Native lazy loading
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-cake.png';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-12 sm:h-16 w-12 sm:w-16 text-gray-300" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-green-700 shadow-md">
          {product.category.name}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 h-8 sm:h-10">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-cream-600 bg-clip-text text-transparent">
              ₹{product.price}
            </div>
            {product.priceType === 'per_kg' && (
              <div className="text-xs text-gray-500">per kg</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 text-xs sm:text-sm py-1.5 sm:py-2"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product._id)}
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 text-xs sm:text-sm py-1.5 sm:py-2"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <ProductsContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
