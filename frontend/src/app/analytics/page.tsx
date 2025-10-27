'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RevenueChart from '@/components/ui/RevenueChart';
import { revenueAPI } from '@/lib/api';
import { 
  ArrowLeft,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RevenueData {
  date: string;
  totalRevenue: number;
  totalBills: number;
  comparison: {
    yesterday: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'same';
  };
}

interface WeeklyData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingDay: string;
}

export default function AnalyticsPage() {
  const { admin } = useAuth();
  const router = useRouter();
  const [todayData, setTodayData] = useState<RevenueData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [todayResponse, weeklyResponse] = await Promise.all([
        revenueAPI.getTodayRevenue(),
        revenueAPI.getWeeklyRevenue()
      ]);
      
      setTodayData(todayResponse.data.data);
      setWeeklyData(weeklyResponse.data.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const statCards = [
    {
      title: "Today's Revenue",
      value: todayData ? formatCurrency(todayData.totalRevenue) : '₹0',
      change: todayData ? `${todayData.comparison.percentageChange > 0 ? '+' : ''}${todayData.comparison.percentageChange.toFixed(1)}%` : '0%',
      trend: todayData?.comparison.trend || 'same',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600'
    },
    {
      title: "Today's Orders",
      value: todayData?.totalBills.toString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Weekly Revenue',
      value: weeklyData ? formatCurrency(weeklyData.totalRevenue) : '₹0',
      change: '+8.2%',
      trend: 'up',
      icon: BarChart3,
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#F5E8D3]/40 to-green-50/30">
        {/* Header */}
        <header className="bg-gradient-to-r from-white/95 to-[#F5E8D3]/30 backdrop-blur-xl border-b border-[#E9CF9C]/30 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Revenue Analytics</h1>
                  <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchAnalyticsData}
                  disabled={loading}
                  className="p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors">
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#F5E8D3]/50 transition-colors">
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <div
                key={stat.title}
                className="bg-gradient-to-br from-white to-[#F5E8D3]/30 rounded-2xl p-6 border border-[#E9CF9C]/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  {getTrendIcon(stat.trend)}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs yesterday</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 30-Day Revenue Chart */}
          <div className="bg-gradient-to-br from-white to-[#F5E8D3]/30 rounded-2xl border border-[#E9CF9C]/30 shadow-sm">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">30-Day Revenue Trend</h3>
                <p className="text-gray-600">Track your daily revenue performance over the last 30 days</p>
              </div>
              <RevenueChart />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}