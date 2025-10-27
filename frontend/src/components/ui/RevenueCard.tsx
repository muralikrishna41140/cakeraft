'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

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

export default function RevenueCard() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/revenue/today');
      setRevenueData(response.data.data);
    } catch (error: any) {
      console.error('Error fetching revenue data:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment before refreshing.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Network connection error. Please check your connection.');
      } else {
        setError('Failed to fetch revenue data. Click refresh to try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();

    // Refresh data every 30 minutes instead of 5 minutes to avoid rate limiting
    const interval = setInterval(fetchRevenueData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-green-50/70 to-white border border-green-100 rounded-xl p-6 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-green-700 flex items-center">
              Today's Revenue 💰
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchRevenueData}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-green-100/50 transition-colors"
          title="Refresh revenue data"
        >
          <RefreshCw className={`h-4 w-4 text-green-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-green-200/50 rounded w-32 mb-2"></div>
          <div className="h-4 bg-green-200/50 rounded w-24 mb-1"></div>
          <div className="h-3 bg-green-200/50 rounded w-20"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={fetchRevenueData}
            className="text-green-600 text-sm hover:underline"
          >
            Try again
          </button>
        </div>
      ) : revenueData ? (
        <>
          <div className="mb-3">
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {formatCurrency(revenueData.totalRevenue)}
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(revenueData.date)} • From {revenueData.totalBills} order{revenueData.totalBills !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getTrendIcon(revenueData.comparison.trend)}
              <span className={`text-xs font-medium ml-1 ${getTrendColor(revenueData.comparison.trend)}`}>
                {revenueData.comparison.percentageChange > 0 ? '+' : ''}
                {revenueData.comparison.percentageChange.toFixed(1)}%
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">
                Yesterday: {formatCurrency(revenueData.comparison.yesterday)}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}