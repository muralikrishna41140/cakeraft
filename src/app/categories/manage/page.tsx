"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Package,
  ChefHat,
  Cake,
  Heart,
  Star,
  Crown,
  Calendar,
} from "lucide-react";
import { productAPI } from "@/lib/api";
import { Category } from "@/types";
import toast from "react-hot-toast";

export default function CategoryManagePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getCategories();
      console.log("Categories response:", response);
      console.log("Response data:", response.data);
      console.log("Response data.data:", response.data?.data);

      // Backend returns { success: true, data: [...categories] }
      const categoriesData = response.data?.data || response.data || [];
      console.log("Parsed categories:", categoriesData);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      if (editingCategory) {
        await productAPI.updateCategory(editingCategory._id, formData);
        toast.success("🎂 Category updated successfully!");
      } else {
        await productAPI.createCategory(formData);
        toast.success("🎂 New category added successfully!");
      }

      resetForm();
      loadCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await productAPI.deleteCategory(categoryId);
      toast.success("Category deleted successfully");
      loadCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingCategory(null);
    setShowAddModal(false);
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("birthday"))
      return <Cake className="h-7 w-7 text-blue-600" />;
    if (name.includes("wedding"))
      return <Heart className="h-7 w-7 text-pink-600" />;
    if (name.includes("custom"))
      return <Crown className="h-7 w-7 text-purple-600" />;
    if (name.includes("celebration"))
      return <Star className="h-7 w-7 text-orange-600" />;
    if (name.includes("pastry") || name.includes("pastries"))
      return <ChefHat className="h-7 w-7 text-amber-600" />;
    if (name.includes("cake"))
      return <Cake className="h-7 w-7 text-rose-600" />;
    return <Package className="h-7 w-7 text-emerald-600" />;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-white">
        {/* Decorative Elements - Hidden on mobile */}
        <div className="hidden md:block fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 text-green-200 opacity-20">
            <Cake className="h-20 w-20" />
          </div>
          <div className="absolute bottom-20 left-10 text-cream-300 opacity-20">
            <ChefHat className="h-24 w-24" />
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
                  onClick={() => router.push("/products")}
                  className="flex items-center gap-1 sm:gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800 p-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden xs:inline">Back to Products</span>
                </Button>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl mr-2 sm:mr-3 shadow-lg">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    <span className="hidden sm:inline">
                      Category Management
                    </span>
                    <span className="sm:hidden">Categories</span>
                  </h1>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Add Category</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="group relative bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300 border border-green-100/50 overflow-hidden"
                  >
                    {/* Decorative gradient overlay */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>

                    <div className="relative p-5">
                      {/* Icon and Title Section */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          {getCategoryIcon(category.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-green-700 transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date and Actions Section */}
                      <div className="flex items-center justify-between pt-4 border-t border-green-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="font-medium">
                            {new Date(category.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="p-2.5 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                            title="Edit category"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(category._id)}
                            className="p-2.5 bg-white text-red-600 border-2 border-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                            title="Delete category"
                          >
                            <Trash2 className="h-4.5 w-4.5 stroke-[2.5]" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Categories Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first cake category to get started!
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Category
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl text-white">
                <h3 className="text-xl font-bold">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="form-label text-green-800 font-semibold">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input border-green-200 focus:border-green-400 focus:ring-green-300"
                    placeholder="e.g., Birthday Cakes, Wedding Cakes"
                    required
                  />
                </div>

                <div>
                  <label className="form-label text-green-800 font-semibold">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="input border-green-200 focus:border-green-400 focus:ring-green-300 resize-none"
                    placeholder="Describe this category..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    {editingCategory ? "Update" : "Add"} Category
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
