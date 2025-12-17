"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { billsAPI } from "@/lib/api";

export default function PublicBillPage() {
  const params = useParams();
  const billId = params.id as string;
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBill();
  }, [billId]);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const response = await billsAPI.getBill(billId);
      setBill(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bill");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}/pdf`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bill Not Found
          </h1>
          <p className="text-gray-600">
            {error || "The bill you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-200 mr-4">
              <img
                src="https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg"
                alt="CakeRaft Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                CakeRaft
              </h1>
              <p className="text-gray-600">Artisan Cake Creations</p>
            </div>
          </div>

          {/* Bill Details */}
          <div className="border-t-2 border-pink-100 pt-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Invoice
                </h2>
                <p className="text-gray-600">Bill #: {bill.billNumber}</p>
                <p className="text-gray-600">
                  Date: {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 mb-1">Customer</p>
                <p className="font-semibold text-gray-900">
                  {bill.customerInfo.name}
                </p>
                <p className="text-gray-600">{bill.customerInfo.phone}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {bill.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-pink-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ₹{bill.subtotal.toFixed(2)}
                </span>
              </div>
              {bill.totalDiscount > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">
                    -₹{bill.totalDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Total:
                </span>
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  ₹{bill.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF Invoice
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="text-sm">Thank you for choosing CakeRaft!</p>
          <p className="text-xs mt-2">
            For custom orders and inquiries, please contact us.
          </p>
        </div>
      </div>
    </div>
  );
}
