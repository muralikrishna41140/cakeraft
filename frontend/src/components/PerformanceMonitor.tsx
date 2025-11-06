/**
 * Performance Monitoring Component
 * Tracks and displays application performance metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { apiCache } from '@/lib/apiCache';
import { requestQueue } from '@/lib/performance';

interface PerformanceMetrics {
  cacheHitRate: number;
  avgResponseTime: number;
  activeRequests: number;
  totalRequests: number;
}

export function PerformanceMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHitRate: 0,
    avgResponseTime: 0,
    activeRequests: 0,
    totalRequests: 0,
  });

  useEffect(() => {
    if (!isOpen) return;

    const updateMetrics = () => {
      const stats = apiCache.getStats();
      
      setMetrics({
        cacheHitRate: stats.cacheSize > 0 
          ? ((stats.cacheSize / (stats.cacheSize + stats.pendingRequests)) * 100) 
          : 0,
        avgResponseTime: 0, // Can be calculated from response timestamps
        activeRequests: stats.pendingRequests,
        totalRequests: stats.cacheSize + stats.pendingRequests,
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        title="Performance Monitor"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>

      {/* Metrics Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Performance Metrics</h3>
              <p className="text-xs text-purple-100">Real-time monitoring</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Metrics */}
          <div className="p-4 space-y-4">
            {/* Cache Hit Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Cache Hit Rate</span>
                <span className="text-lg font-bold text-purple-600">
                  {metrics.cacheHitRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.cacheHitRate}%` }}
                />
              </div>
            </div>

            {/* Active Requests */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeRequests}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            {/* Total Cached */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-600">Cached Responses</p>
                <p className="text-2xl font-bold text-gray-900">{apiCache.getStats().cacheSize}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
            </div>

            {/* Cache Actions */}
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  apiCache.clear();
                  alert('Cache cleared!');
                }}
                className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
              >
                Clear Cache
              </button>
            </div>

            {/* Cache Details */}
            <details className="text-xs">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Cache Details ({apiCache.getStats().entries.length} entries)
              </summary>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {apiCache.getStats().entries.map((entry, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded text-gray-600 break-all"
                  >
                    <div className="font-mono text-xs">{entry.key}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Expires in: {Math.round(entry.expiresIn / 1000)}s
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Network Status Indicator
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className="font-medium">No internet connection</span>
    </div>
  );
}

export default PerformanceMonitor;
