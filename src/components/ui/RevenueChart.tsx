'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, RefreshCw, BarChart3, TrendingDown } from 'lucide-react';
import api from '@/lib/api';

interface DailyRevenueData {
  date: string;
  totalRevenue: number;
  totalBills: number;
}

interface RevenueChartData {
  period: string;
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalBills: number;
  dailyData: DailyRevenueData[];
}

export default function RevenueChart() {
  const [chartData, setChartData] = useState<RevenueChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/revenue/30days');
      setChartData(response.data.data);
    } catch (error: any) {
      console.error('Error fetching 30-day revenue:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment before refreshing.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Network connection error. Please check your connection.');
      } else {
        setError('Failed to fetch revenue chart data. Click refresh to try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();

    // Refresh data every 30 minutes instead of 10 minutes to avoid rate limiting
    const interval = setInterval(fetchChartData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-green-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-blue-600">
            Orders: {payload[0].payload.totalBills}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate trend
  const calculateTrend = () => {
    if (!chartData || chartData.dailyData.length < 2) return { trend: 'same', percentage: 0 };
    
    const recentDays = chartData.dailyData.slice(-7); // Last 7 days
    const previousDays = chartData.dailyData.slice(-14, -7); // Previous 7 days
    
    const recentTotal = recentDays.reduce((sum, day) => sum + day.totalRevenue, 0);
    const previousTotal = previousDays.reduce((sum, day) => sum + day.totalRevenue, 0);
    
    if (previousTotal === 0) {
      return { trend: recentTotal > 0 ? 'up' : 'same', percentage: recentTotal > 0 ? 100 : 0 };
    }
    
    const percentage = ((recentTotal - previousTotal) / previousTotal) * 100;
    return {
      trend: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'same',
      percentage: Math.abs(Math.round(percentage * 100) / 100)
    };
  };

  const trend = calculateTrend();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Revenue (Last 30 Days)
            </h3>
            <p className="text-gray-600 text-sm">
              Daily revenue trend and analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-white rounded-lg p-1 border">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'line' 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchChartData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors border bg-white"
              title="Refresh chart data"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        {chartData && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(chartData.totalRevenue)}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {chartData.totalBills}
                </p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {trend.trend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : trend.trend === 'down' ? (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ) : (
                <div className="h-5 w-5" />
              )}
              <span className={`text-sm font-medium ${
                trend.trend === 'up' ? 'text-green-600' : 
                trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trend.percentage > 0 && (trend.trend === 'up' ? '+' : '-')}
                {trend.percentage}% vs last week
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={fetchChartData}
                className="text-blue-600 hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        ) : chartData ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="totalRevenue" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </div>
  );
}