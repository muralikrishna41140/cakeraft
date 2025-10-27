'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, Package } from 'lucide-react';
import api from '@/lib/api';

interface OrdersData {
  date: string;
  totalOrders: number;
  pendingDelivery: number;
}

export default function OrdersCard() {
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/revenue/today');
      const revenueData = response.data.data;
      
      // Extract orders data from revenue response
      setOrdersData({
        date: revenueData.date,
        totalOrders: revenueData.totalBills || 0,
        pendingDelivery: Math.floor(revenueData.totalBills * 0.3) // Mock pending delivery calculation
      });
    } catch (error: any) {
      console.error('Error fetching orders data:', error);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait a moment before refreshing.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setError('Network connection error. Please check your connection.');
      } else {
        setError('Failed to fetch orders data. Click refresh to try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();

    // Refresh data every 30 minutes instead of 5 minutes to avoid rate limiting
    const interval = setInterval(fetchOrdersData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-br from-green-50/70 to-white border border-green-100 rounded-xl p-6 shadow-sm hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-blue-700 flex items-center">
              Orders Today 📦
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchOrdersData}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-blue-100/50 transition-colors"
          title="Refresh orders data"
        >
          <RefreshCw className={`h-4 w-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-blue-200/50 rounded w-16 mb-2"></div>
          <div className="h-4 bg-blue-200/50 rounded w-24 mb-1"></div>
          <div className="h-3 bg-blue-200/50 rounded w-20"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={fetchOrdersData}
            className="text-blue-600 text-sm hover:underline"
          >
            Try again
          </button>
        </div>
      ) : ordersData ? (
        <>
          <div className="mb-3">
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {ordersData.totalOrders}
            </p>
            <p className="text-sm text-gray-600">
              {formatDate(ordersData.date)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-xs font-medium text-blue-600">
                {ordersData.pendingDelivery} pending delivery
              </span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}