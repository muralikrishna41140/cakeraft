"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { Eye, EyeOff, Shield, UserCircle, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/apiRetry";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>();

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Please check your internet connection.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log("✅ User already authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: LoginFormData) => {
    // Check if online
    if (!isOnline) {
      toast.error("You are offline. Please check your internet connection.");
      return;
    }

    try {
      console.log("📝 Submitting login form...");
      await login(data.email, data.password);
      console.log("✅ Login successful, redirecting to dashboard...");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("❌ Login form error:", error);

      // Extract meaningful error message
      const errorMessage = getErrorMessage(error);

      // Set form errors based on API response
      if (errorMessage.toLowerCase().includes("email")) {
        setError("email", { message: errorMessage });
      } else if (
        errorMessage.toLowerCase().includes("password") ||
        errorMessage.toLowerCase().includes("credentials")
      ) {
        setError("password", { message: errorMessage });
      } else {
        // Show general error - toast already shown in AuthContext
        // Only set error if it's not already shown
        if (
          !errorMessage.includes("timeout") &&
          !errorMessage.includes("network")
        ) {
          setError("password", { message: errorMessage });
        }
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-full overflow-hidden border-2 border-green-600 shadow-lg mb-4">
            <img
              src="https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg"
              alt="CakeRaft Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent mb-2">
            CakeRaft
          </h1>
          <p className="text-gray-600">
            Sign in to manage your artisan cake business
          </p>
        </div>

        {/* Login Form */}
        <div className="card animate-fade-in">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-center flex items-center justify-center gap-2">
              <UserCircle className="h-5 w-5" />
              Admin Login
            </h2>
          </div>

          <div className="card-body">
            {/* Network Status Indicator */}
            {!isOnline && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">
                  You are offline. Please check your internet connection.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className={`input ${errors.email ? "input-error" : ""}`}
                  placeholder="Enter your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`input pr-10 ${
                      errors.password ? "input-error" : ""
                    }`}
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                disabled={!isOnline || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              {/* Help text for slow connections */}
              {isSubmitting && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mt-2 animate-pulse">
                    Please wait... This may take a few seconds on first load.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Secure billing management system</p>
        </div>
      </div>
    </div>
  );
}
