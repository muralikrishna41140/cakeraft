"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ProductsListSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  ArrowLeft,
  Image as ImageIcon,
  Cake,
  ChefHat,
  Settings,
} from "lucide-react";
import { productAPI } from "@/lib/api";
import { Product, Category } from "@/types";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/lib/utils";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getProducts(),
        productAPI.getCategories(),
      ]);

      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await productAPI.deleteProduct(productId);
      toast.success("Product deleted successfully");
      loadData(); // Reload products
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedRoute>
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
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-1 sm:gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800 p-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl mr-2 sm:mr-3 shadow-lg">
                    <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    <span className="hidden sm:inline">Cake Masterpieces</span>
                    <span className="sm:hidden">Cakes</span>
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/categories/manage")}
                  className="flex items-center gap-1 sm:gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800 px-2 sm:px-3 py-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Manage Categories</span>
                  <span className="sm:hidden">Categories</span>
                </Button>

                <Button
                  variant="primary"
                  onClick={() => router.push("/products/add")}
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Add New Cake 🎂</span>
                  <span className="xs:hidden">Add 🎂</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-8">
          {/* Filters */}
          <div className="card mb-3 sm:mb-6">
            <div className="card-body p-3 sm:p-4">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div className="md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <ProductsListSkeleton />
          ) : filteredProducts.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by adding your first product."}
                </p>
                {!searchTerm && !selectedCategory && (
                  <Button
                    variant="primary"
                    onClick={() => router.push("/products/add")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="card">
                  <div className="card-body p-3 sm:p-4">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 sm:mb-4 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={getProductImageUrl(product.imageUrl) || ""}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {product.name}
                        </h3>
                        <span className="text-base sm:text-lg font-bold text-green-600 whitespace-nowrap">
                          ₹{product.price.toFixed(2)}
                          {product.priceType === "per_kg" && (
                            <span className="text-xs text-gray-500">/kg</span>
                          )}
                        </span>
                      </div>

                      {/* Hide description on mobile */}
                      <p className="hidden sm:block text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                        <span className="bg-cream-100 text-green-800 px-2 py-1 rounded truncate">
                          {product.category?.name || "No Category"}
                        </span>
                        <span className="text-green-600 font-medium whitespace-nowrap text-xs sm:text-sm">
                          Made to Order
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/products/edit/${product._id}`)
                        }
                        className="flex-1 flex items-center justify-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="hidden xs:inline">Edit</span>
                        <span className="xs:hidden">✏️</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        className="flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
