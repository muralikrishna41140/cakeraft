"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ArrowLeft,
  Upload,
  X,
  Camera,
  ChefHat,
  Cake,
  Star,
  Heart,
  Gift,
  Award,
  Plus,
} from "lucide-react";
import { productAPI } from "@/lib/api";
import { Category, Product } from "@/types";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/lib/utils";

interface ProductForm {
  name: string;
  price: number;
  category: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductForm>();

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productRes, categoriesRes] = await Promise.all([
        productAPI.getProduct(productId),
        productAPI.getCategories(),
      ]);

      const productData = productRes.data.data;
      setProduct(productData);
      setCategories(categoriesRes.data.data || []);

      // Pre-populate form
      setValue("name", productData.name);
      setValue("price", productData.price);
      setValue("category", productData.category._id);

      // Set existing image preview
      if (productData.imageUrl) {
        setImagePreview(getProductImageUrl(productData.imageUrl));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load product data");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", product?.description || ""); // Keep existing description
      formData.append("price", data.price.toString());
      formData.append("category", data.category);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await productAPI.updateProduct(productId, formData);
      toast.success("Cake updated successfully! 🎂");
      router.push("/products");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update cake");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading product data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-cream-50 to-white">
        {/* Decorative Elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 text-green-200 opacity-20">
            <Cake className="h-20 w-20" />
          </div>
          <div className="absolute top-40 right-20 text-cream-300 opacity-20">
            <Heart className="h-16 w-16" />
          </div>
          <div className="absolute bottom-20 left-1/4 text-green-300 opacity-20">
            <Gift className="h-24 w-24" />
          </div>
          <div className="absolute bottom-40 right-10 text-cream-200 opacity-20">
            <Star className="h-12 w-12" />
          </div>
        </div>

        {/* Header */}
        <div className="relative bg-white/70 backdrop-blur-sm shadow-lg border-b-4 border-gradient-to-r from-green-300 to-cream-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/products")}
                  className="flex items-center gap-2 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Cakes
                </Button>
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl mr-3 shadow-lg">
                    <ChefHat className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Edit Delicious Cake
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <Award className="h-12 w-12 text-white/90 mr-4" />
                <h2 className="text-3xl font-bold text-center">
                  Update Your Masterpiece
                </h2>
              </div>
              <p className="text-center text-white/90 text-lg">
                Perfect your delightful creation ✨
              </p>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Product Details */}
                <div className="space-y-6">
                  {/* Cake Name */}
                  <div className="group">
                    <label className="form-label text-green-800 font-semibold flex items-center gap-2">
                      <Cake className="h-5 w-5 text-green-600" />
                      Cake Name
                    </label>
                    <input
                      type="text"
                      {...register("name", {
                        required: "Please enter the cake name",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                      })}
                      className="input border-green-200 focus:border-green-400 focus:ring-green-300 bg-green-50/50 transition-all duration-300 group-hover:bg-green-50"
                      placeholder="e.g., Chocolate Fudge Delight"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-4 w-4" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Price Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="form-label text-green-800 font-semibold">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("price", {
                          required: "Please set a price",
                          min: {
                            value: 0.01,
                            message: "Price must be greater than 0",
                          },
                        })}
                        className="input border-green-200 focus:border-green-400 focus:ring-green-300 bg-green-50/50 transition-all duration-300 group-hover:bg-green-50"
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-4 w-4" />
                          {errors.price.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="group">
                    <label className="form-label text-green-800 font-semibold">
                      Category
                    </label>
                    <div className="flex gap-2">
                      <select
                        {...register("category", {
                          required: "Please select a category",
                        })}
                        className="input border-green-200 focus:border-green-400 focus:ring-green-300 bg-green-50/50 transition-all duration-300 group-hover:bg-green-50 flex-1"
                      >
                        <option value="">Choose category...</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={() => router.push("/categories/manage")}
                        className="px-4 bg-white/80 hover:bg-white border-green-200 text-green-700 hover:text-green-800"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-4 w-4" />
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div className="space-y-6">
                  <div className="group">
                    <label className="form-label text-green-800 font-semibold flex items-center gap-2">
                      <Camera className="h-5 w-5 text-green-600" />
                      Cake Photo
                    </label>

                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative">
                          <div className="w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-200 shadow-xl">
                            <img
                              src={imagePreview}
                              alt="Cake preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer group">
                          <div className="w-full h-64 border-4 border-dashed border-green-300 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group-hover:border-green-400 group-hover:shadow-lg">
                            <Upload className="h-12 w-12 text-green-400 mb-4 group-hover:text-green-500 transition-colors duration-300" />
                            <p className="text-green-600 font-semibold mb-2">
                              Upload Cake Photo
                            </p>
                            <p className="text-green-500 text-sm text-center px-4">
                              Click to select or drag and drop your delicious
                              cake photo here
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-8 border-t border-green-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/products")}
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating Cake...
                    </>
                  ) : (
                    <>
                      <ChefHat className="h-5 w-5 mr-2" />
                      Update Delicious Cake 🎂
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
