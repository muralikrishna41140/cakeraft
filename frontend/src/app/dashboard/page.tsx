"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import RevenueCard from "@/components/ui/RevenueCard";
import OrdersCard from "@/components/ui/OrdersCard";
import RevenueChart from "@/components/ui/RevenueChart";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";
import { revenueAPI } from "@/lib/api";
import {
  ShoppingCart,
  Package,
  LogOut,
  User,
  Calendar,
  Activity,
  DollarSign,
  Settings,
  Cake,
  ChefHat,
  Heart,
  Star,
  Award,
  Crown,
  TrendingUp,
  Users,
  Clock,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Gift,
  Download,
  Upload,
  FileSpreadsheet,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Zap,
  Target,
  Sparkles,
  Coffee,
  Palette,
  Menu,
  X,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  MousePointer,
  Layers,
  Infinity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { admin, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Hide loading skeleton after initial mount
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading("Exporting revenue data to Google Sheets...", {
        id: "export",
      });

      const response = await revenueAPI.exportOldRevenue();
      setExportResult(response.data);

      if (response.data.success) {
        toast.success(
          `✅ Successfully exported ${response.data.exportedDays} days of revenue data to Google Sheets!`,
          {
            id: "export",
            duration: 5000,
          }
        );

        // Refresh dashboard data after export
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Export completed but no data was found to export.", {
          id: "export",
        });
      }
    } catch (error: any) {
      console.error("Export failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to export data to Google Sheets. Please try again.",
        { id: "export" }
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Quick actions data
  const quickActions = [
    {
      id: "billing",
      title: "New Order",
      description: "Create a new cake order",
      icon: ShoppingCart,
      color: "from-emerald-500 to-teal-600",
      action: () => router.push("/billing"),
      keywords: [
        "order",
        "billing",
        "new",
        "create",
        "cake",
        "purchase",
        "buy",
      ],
    },
    {
      id: "products",
      title: "Manage Products",
      description: "Add or edit cake products",
      icon: Cake,
      color: "from-purple-500 to-indigo-600",
      action: () => router.push("/products"),
      keywords: ["products", "manage", "add", "edit", "cake", "items", "menu"],
    },
    {
      id: "categories",
      title: "Categories",
      description: "Organize cake categories",
      icon: Package,
      color: "from-orange-500 to-red-500",
      action: () => router.push("/categories/manage"),
      keywords: [
        "categories",
        "organize",
        "types",
        "birthday",
        "wedding",
        "custom",
      ],
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "View detailed reports",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-600",
      action: () => router.push("/analytics"),
      keywords: [
        "analytics",
        "reports",
        "statistics",
        "revenue",
        "data",
        "insights",
      ],
    },
  ];

  // Filter quick actions based on search query
  const filteredQuickActions = quickActions.filter((action) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      action.title.toLowerCase().includes(query) ||
      action.description.toLowerCase().includes(query) ||
      action.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    );
  });

  // Show loading skeleton on initial load
  if (isInitialLoad || authLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#F5E8D3]/40 to-green-50/30">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Modern Glassmorphism Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="h-full bg-gradient-to-b from-white/95 to-[#F5E8D3]/20 backdrop-blur-xl border-r border-[#E9CF9C]/30 shadow-2xl shadow-green-900/5">
            {/* Sidebar Header */}
            <div className="p-4 sm:p-6 border-b border-[#E9CF9C]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-[#E9CF9C]/50">
                      <img
                        src="https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg"
                        alt="CakeRaft Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-lime-400 to-green-500 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                      CakeRaft
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Artisan Dashboard
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-3 sm:p-4 space-y-1 sm:space-y-2">
              {[
                {
                  id: "overview",
                  label: "Overview",
                  icon: Layers,
                  active: activeView === "overview",
                  action: () => setActiveView("overview"),
                },
                {
                  id: "orders",
                  label: "Orders",
                  icon: ShoppingCart,
                  count: 5,
                  action: () => router.push("/billing"),
                },
                {
                  id: "products",
                  label: "Products",
                  icon: Cake,
                  action: () => router.push("/products"),
                },
                {
                  id: "analytics",
                  label: "Analytics",
                  icon: BarChart3,
                  action: () => router.push("/analytics"),
                },
                {
                  id: "categories",
                  label: "Categories",
                  icon: Package,
                  action: () => router.push("/categories/manage"),
                },
                {
                  id: "export",
                  label: "Export Data",
                  icon: FileSpreadsheet,
                  active: activeView === "export",
                  action: () => setActiveView("export"),
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    item.active
                      ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/25"
                      : "hover:bg-gradient-to-r hover:from-[#F5E8D3]/50 hover:to-green-50/50 text-gray-700 hover:text-green-800"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`h-5 w-5 ${
                        item.active
                          ? "text-white"
                          : "text-gray-500 group-hover:text-green-600"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="bg-[#E9CF9C] text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* User Profile */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E9CF9C]/40">
              <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-[#F5E8D3]/50 hover:to-green-50/30 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {admin?.email}
                  </p>
                  <p className="text-xs text-gray-600">Master Baker</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-[#E9CF9C]/50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-72">
          {/* Top Header */}
          <header className="sticky top-0 z-40 bg-gradient-to-r from-white/95 to-[#F5E8D3]/30 backdrop-blur-xl border-b border-[#E9CF9C]/30 shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors"
                  >
                    <Menu className="h-5 w-5 text-gray-700" />
                  </button>

                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                      <span className="hidden sm:inline">
                        {getGreeting()}, Master Baker!
                      </span>
                      <span className="sm:hidden">{getGreeting()}!</span>
                    </h2>
                    <p className="text-xs sm:text-base text-gray-600 hidden xs:block">
                      Ready to craft some magical moments? ✨
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Search - Hidden on mobile */}
                  <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-[#F5E8D3]/40 to-green-50/40 rounded-xl px-4 py-2 border border-[#E9CF9C]/40">
                    <Search className="h-4 w-4 text-green-600" />
                    <input
                      type="text"
                      placeholder="Search quick actions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-500 w-48"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* New Order Button */}
                  <button
                    onClick={() => router.push("/billing")}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl hover:shadow-lg hover:shadow-green-600/25 transition-all duration-200 flex items-center space-x-2 hover:scale-105"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">New Order</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="p-6 space-y-8">
            {activeView === "overview" && (
              <>
                {/* Dynamic Stats - Only Revenue and Orders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white to-[#F5E8D3]/30 backdrop-blur-sm rounded-2xl p-6 border border-[#E9CF9C]/30 shadow-sm hover:shadow-lg hover:shadow-green-100/10 transition-all duration-300 hover:-translate-y-1">
                    <RevenueCard />
                  </div>
                  <div className="bg-gradient-to-br from-white to-[#F5E8D3]/30 backdrop-blur-sm rounded-2xl p-6 border border-[#E9CF9C]/30 shadow-sm hover:shadow-lg hover:shadow-green-100/10 transition-all duration-300 hover:-translate-y-1">
                    <OrdersCard />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-white to-[#F5E8D3]/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[#E9CF9C]/30 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                        Quick Actions
                      </h3>
                      {searchQuery && (
                        <span className="text-xs sm:text-sm text-green-700 bg-[#F5E8D3]/70 px-2 sm:px-3 py-1 rounded-full border border-[#E9CF9C]/50">
                          {filteredQuickActions.length} result
                          {filteredQuickActions.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 px-2 sm:px-3 py-1 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-pulse" />
                    </div>
                  </div>

                  {filteredQuickActions.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {filteredQuickActions.map((action, index) => (
                        <button
                          key={action.id}
                          onClick={action.action}
                          className="group relative p-6 rounded-xl bg-gradient-to-br from-white to-[#F5E8D3]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-[#E9CF9C]/40 hover:border-[#E9CF9C]/60"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <div
                            className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                          >
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {action.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-4">
                            {action.description}
                          </p>
                          <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-green-600 transition-colors">
                            <span>Get started</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>

                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-[#E9CF9C]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-gray-500 font-medium mb-2">
                        No actions found
                      </h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Try searching for "order", "products", "categories", or
                        "analytics"
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Show all actions
                      </button>
                    </div>
                  )}
                </div>

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Chart */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-white to-[#F5E8D3]/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-[#E9CF9C]/30 shadow-sm">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                            Revenue Analytics
                          </h3>
                          <p className="text-xs sm:text-base text-gray-600 hidden sm:block">
                            Track your cake business performance
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors">
                            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                          </button>
                          <button className="p-1.5 sm:p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors">
                            <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <RevenueChart />
                    </div>
                  </div>

                  {/* Right sidebar - Export Section */}
                  <div className="space-y-6">
                    {/* Export Section */}
                    <div className="bg-gradient-to-br from-[#F5E8D3]/60 to-white rounded-2xl p-6 border border-[#E9CF9C]/50">
                      <div className="text-center">
                        <div className="inline-flex p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl mb-4 border border-[#D4B882]/30">
                          <FileSpreadsheet className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Export Data
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Export old revenue data to Google Sheets
                        </p>
                        <Button
                          onClick={handleExport}
                          disabled={isExporting}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        >
                          {isExporting ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Exporting...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Upload className="h-4 w-4" />
                              <span>Export Now</span>
                            </div>
                          )}
                        </Button>
                        {exportResult && (
                          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">
                              ✅ {exportResult.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-br from-white to-[#F5E8D3]/30 backdrop-blur-sm rounded-2xl p-6 border border-[#E9CF9C]/30 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      Recent Activity
                    </h3>
                    <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                      View All
                    </button>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        icon: ShoppingCart,
                        title: "New order received",
                        description: "Chocolate Birthday Cake - ₹2,450",
                        time: "2 minutes ago",
                        color:
                          "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
                      },
                      {
                        icon: User,
                        title: "New customer registered",
                        description: "Priya Sharma joined the family",
                        time: "15 minutes ago",
                        color:
                          "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
                      },
                      {
                        icon: Cake,
                        title: "Product updated",
                        description: "Red Velvet Cake - Price updated",
                        time: "1 hour ago",
                        color:
                          "bg-gradient-to-br from-purple-500 to-pink-600 text-white",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-[#F5E8D3]/30 hover:to-green-50/30 transition-colors"
                      >
                        <div
                          className={`p-2 rounded-lg ${activity.color} shadow-sm`}
                        >
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeView === "export" && (
              <div className="max-w-4xl mx-auto">
                {/* Export Data View */}
                <div className="bg-gradient-to-br from-white to-[#F5E8D3]/30 backdrop-blur-sm rounded-2xl p-8 border border-[#E9CF9C]/30 shadow-sm">
                  <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
                      <FileSpreadsheet className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      Export Data
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Export old revenue data to Google Sheets for archival and
                      analysis
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#F5E8D3]/60 to-green-50/60 rounded-xl p-6 border border-[#E9CF9C]/50 mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <FileSpreadsheet className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          What happens when you export?
                        </h3>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>
                              Bills older than 30 days are exported to Google
                              Sheets
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>
                              Daily revenue summaries are created for easy
                              analysis
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>
                              Exported bills are safely deleted from the
                              database
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Your database stays optimized and fast</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold"
                    >
                      {isExporting ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Exporting Data...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Upload className="h-5 w-5" />
                          <span>Export Now</span>
                        </div>
                      )}
                    </Button>

                    {exportResult && (
                      <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                          <p className="text-green-800 font-medium">
                            {exportResult.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
