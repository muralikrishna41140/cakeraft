"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BillingPageSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  User,
  Phone,
  ArrowLeft,
  Package,
  Search,
  Percent,
  Tag,
  CheckCircle,
  Calendar,
  Clock,
  Receipt,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react";
import { productAPI, checkoutAPI, billsAPI } from "@/lib/api";
import { Product, CartItem, CustomerInfo, Category } from "@/types";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/lib/utils";

interface LocalCartItem {
  product: Product;
  quantity: number;
  weight?: number; // Selected weight in kg (for per_kg products)
  discount?: number; // Discount percentage (0-100)
  discountType?: "percentage" | "fixed"; // Discount type
}

// WhatsApp Send Section Component
interface WhatsAppSendSectionProps {
  billId: string;
  customerPhone: string;
  customerName: string;
}

function WhatsAppSendSection({
  billId,
  customerPhone,
  customerName,
}: WhatsAppSendSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState(
    customerPhone ? customerPhone.replace(/^\+\d+/, "") : ""
  );
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendWhatsApp = async () => {
    const fullPhoneNumber = `${countryCode}${phoneNumber.trim()}`;

    if (!phoneNumber?.trim() || !billId) {
      toast.error("Phone number and bill ID are required");
      return;
    }

    try {
      setIsSending(true);
      setSendStatus("idle");
      setErrorMessage("");

      // Skip API - Directly use WhatsApp Web with PDF link
      console.log("📱 Preparing WhatsApp Web message with PDF link...");
      console.log("Bill ID:", billId);
      console.log("Phone:", fullPhoneNumber);

      toast.loading("Preparing WhatsApp message with PDF link...", {
        id: "whatsapp-send",
      });

      // Get the bill details to fetch Supabase PDF URL
      let pdfUrl = "";
      try {
        const billResponse = await billsAPI.getBill(billId);
        console.log("📦 Full Bill Response:", billResponse.data);

        // Extract supabaseUrl from response
        if (billResponse.data?.data?.supabaseUrl) {
          pdfUrl = billResponse.data.data.supabaseUrl;
          console.log("✅ PDF URL found:", pdfUrl);
        } else {
          console.warn("⚠️ No PDF URL in bill record");
        }
      } catch (err) {
        console.error("❌ Could not fetch bill PDF URL:", err);
        toast.error("Could not fetch bill details", { id: "whatsapp-send" });
        setIsSending(false);
        return;
      } // Create message with PDF link only
      let messageText = `Hi ${customerName}! 🎂\n\nThank you for choosing CakeRaft!\n\nYour invoice is ready for download:`;

      // Add PDF download link if available
      if (pdfUrl) {
        messageText += `\n\n📄 Download Invoice:\n${pdfUrl}`;
      } else {
        messageText += `\n\nYour invoice will be sent shortly.`;
      }

      messageText += `\n\nFor any queries, feel free to contact us.\n\nCakeRaft - Artisan Cake Creations ✨`;

      const formattedPhone = fullPhoneNumber.replace(/[^0-9]/g, "");

      // Use wa.me format with simple encoding
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
        messageText
      )}`;

      console.log("📱 WhatsApp URL generated (NEW):");
      console.log("Message text:", messageText);
      console.log("PDF URL included:", !!pdfUrl);
      console.log("PDF URL:", pdfUrl || "NOT AVAILABLE");
      console.log("Full URL:", whatsappUrl);

      // Copy message to clipboard as backup
      try {
        await navigator.clipboard.writeText(messageText);
        console.log("✅ Message copied to clipboard!");
      } catch (e) {
        console.warn("Could not copy to clipboard:", e);
      }

      // Open WhatsApp Web - try multiple approaches
      const opened = window.open(whatsappUrl, "_blank");

      if (!opened) {
        // If popup blocked, try direct navigation
        console.warn("Popup blocked, trying alternative method...");
        window.location.href = whatsappUrl;
      }

      setSendStatus("success");
      const successMsg = pdfUrl
        ? "📱 WhatsApp opened! Message copied to clipboard. Paste if needed."
        : "📱 WhatsApp opened! Message copied to clipboard.";
      toast.success(successMsg, {
        id: "whatsapp-send",
        duration: 6000,
      });
    } catch (error: any) {
      console.error("❌ Error preparing WhatsApp message:", error);
      setSendStatus("error");
      setErrorMessage(error.message || "Failed to prepare WhatsApp message");
      toast.error("Failed to prepare WhatsApp message", {
        id: "whatsapp-send",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border border-green-200 rounded-lg overflow-hidden">
      <div
        className="bg-green-50 p-4 cursor-pointer flex items-center justify-between hover:bg-green-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <div>
            <h5 className="font-semibold text-green-800">
              Send Bill via WhatsApp
            </h5>
            <p className="text-sm text-green-600">
              Send a professional PDF bill instantly
            </p>
          </div>
        </div>
        <div className="text-green-600">{isExpanded ? "−" : "+"}</div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white border-t border-green-200">
          <div className="space-y-4">
            {/* Phone Input with Country Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Phone Number
              </label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative w-32">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                    disabled={isSending}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+60">🇲🇾 +60</option>
                  </select>
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={isSending}
                    maxLength={10}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select country code and enter phone number (India +91 by
                default)
              </p>
            </div>

            {/* Status Messages */}
            {sendStatus === "success" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    WhatsApp opened! Message copied to clipboard ✓
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-2 leading-relaxed">
                  <strong>Important:</strong> When WhatsApp opens, if the
                  message field is empty:
                  <br />• Press{" "}
                  <kbd className="px-1 py-0.5 bg-white border border-green-300 rounded text-xs">
                    Ctrl+V
                  </kbd>{" "}
                  to paste the message
                  <br />
                  • The message includes the PDF download link
                  <br />• Then click Send in WhatsApp
                </p>
              </div>
            )}

            {sendStatus === "error" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <X className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Failed to send bill
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {errorMessage ||
                    "Please check the phone number and try again."}
                </p>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendWhatsApp}
              disabled={!phoneNumber?.trim() || isSending}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send via WhatsApp
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 space-y-1">
              <p>✓ Professional PDF bill with CakeRaft branding</p>
              <p>✓ Itemized receipt with all discounts and totals</p>
              <p>✓ Instant delivery to customer's WhatsApp</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any>(null);
  const [loyaltyInfo, setLoyaltyInfo] = useState<any>(null);
  const [showLoyaltyInfo, setShowLoyaltyInfo] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState<string>("");

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts();
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const addToCart = (product: Product) => {
    // If product has per_kg pricing, show weight selection modal
    if (product.priceType === "per_kg") {
      setSelectedProduct(product);
      setSelectedWeight(null);
      setWeightInput(""); // Clear input field
      setShowWeightModal(true);
      return;
    }

    // For fixed price products, add directly to cart
    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.product._id === product._id && !item.weight
      );
      if (existingItem) {
        return prev.map((item) =>
          item.product._id === product._id && !item.weight
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const addToCartWithWeight = () => {
    if (!selectedProduct || !selectedWeight) return;

    setCart((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product._id === selectedProduct._id &&
          item.weight === selectedWeight
      );
      if (existingItem) {
        return prev.map((item) =>
          item.product._id === selectedProduct._id &&
          item.weight === selectedWeight
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        { product: selectedProduct, quantity: 1, weight: selectedWeight },
      ];
    });
    toast.success(
      `${selectedProduct.name} (${selectedWeight}kg) added to cart`
    );
    setShowWeightModal(false);
    setWeightInput(""); // Reset input
    setSelectedWeight(null);
  };

  const updateQuantity = (
    productId: string,
    newQuantity: number,
    weight?: number
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId &&
        (weight === undefined || item.weight === weight)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, weight?: number) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product._id === productId &&
            (weight === undefined || item.weight === weight)
          )
      )
    );
    toast.success("Item removed from cart");
  };

  const applyDiscount = (
    productId: string,
    discount: number,
    type: "percentage" | "fixed",
    weight?: number
  ) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId &&
        (weight === undefined || item.weight === weight)
          ? { ...item, discount, discountType: type }
          : item
      )
    );
    toast.success("Discount applied successfully!");
    setShowDiscountModal(false);
    setDiscountValue(0);
    setSelectedCartItem(null);
  };

  const removeDiscount = (productId: string, weight?: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId &&
        (weight === undefined || item.weight === weight)
          ? { ...item, discount: 0, discountType: "percentage" }
          : item
      )
    );
    toast.success("Discount removed");
  };

  const openDiscountModal = (productId: string, weight?: number) => {
    const item = cart.find(
      (item) =>
        item.product._id === productId &&
        (weight === undefined || item.weight === weight)
    );
    if (item) {
      setSelectedCartItem(productId);
      setDiscountValue(item.discount || 0);
      setDiscountType(item.discountType || "percentage");
      setShowDiscountModal(true);
      // Store weight for the discount application
      setSelectedWeight(weight || null);
    }
  };

  const calculateItemTotal = (item: LocalCartItem) => {
    // Calculate base price considering weight for per_kg products
    let basePrice = item.product.price * item.quantity;
    if (item.weight) {
      basePrice = item.product.price * item.weight * item.quantity;
    }

    if (!item.discount || item.discount === 0) return basePrice;

    if (item.discountType === "percentage") {
      return basePrice - basePrice * (item.discount / 100);
    } else {
      return Math.max(0, basePrice - item.discount);
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate total of ONLY cake items for loyalty discount
  const getCakesSubtotal = () => {
    return cart.reduce((total, item) => {
      const categoryName =
        item.product.category?.name?.toLowerCase().trim() || "";
      const isCakeCategory = categoryName.includes("cake");

      if (isCakeCategory) {
        return total + calculateItemTotal(item);
      }
      return total;
    }, 0);
  };

  // Check if cart contains items from the "cake" category only
  const hasCakeProducts = () => {
    return cart.some((item) => {
      const categoryName =
        item.product.category?.name?.toLowerCase().trim() || "";
      return categoryName.includes("cake");
    });
  };

  // Calculate final total with loyalty discount applied to cakes only
  const getFinalTotal = () => {
    const totalAmount = getTotalAmount();
    const cakesSubtotal = getCakesSubtotal();

    // If loyalty discount is applied
    if (loyaltyInfo?.potentialDiscount?.loyaltyApplied) {
      const loyaltyDiscount = loyaltyInfo.potentialDiscount.discountAmount;
      // Subtract loyalty discount from total (discount only applies to cakes)
      return totalAmount - loyaltyDiscount;
    }

    return totalAmount;
  };

  // Check loyalty status when customer phone changes
  const checkLoyaltyStatus = async (phone: string, subtotal?: number) => {
    if (!phone || phone.length < 10) {
      setLoyaltyInfo(null);
      return;
    }

    // Only check loyalty if cart has cake products
    if (!hasCakeProducts()) {
      setLoyaltyInfo(null);
      console.log("🎂 No cake products in cart - loyalty not applicable");
      return;
    }

    try {
      // Pass ONLY cakes subtotal for loyalty calculation
      const cakesSubtotal = getCakesSubtotal();
      console.log(`🎂 Checking loyalty with cakes subtotal: ₹${cakesSubtotal}`);

      const response = await checkoutAPI.checkLoyaltyStatus({
        customerPhone: phone,
        subtotal: cakesSubtotal, // Send only cake items total
      });

      if (response.data.success) {
        setLoyaltyInfo(response.data.data);
        console.log("🏆 Loyalty info updated:", response.data.data);
      }
    } catch (error) {
      console.error("Error checking loyalty status:", error);
      setLoyaltyInfo(null);
    }
  };

  // Update loyalty info when customer phone or cart total changes
  useEffect(() => {
    if (customerInfo.phone && cart.length > 0 && hasCakeProducts()) {
      const debounceTimer = setTimeout(() => {
        checkLoyaltyStatus(customerInfo.phone); // getCakesSubtotal is called inside
      }, 500);

      return () => clearTimeout(debounceTimer);
    } else {
      setLoyaltyInfo(null);
    }
  }, [customerInfo.phone, cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      toast.error("Please enter customer name and phone number");
      return;
    }

    setIsCheckingOut(true);

    try {
      const checkoutData = {
        items: cart.map((item) => ({
          product: {
            _id: item.product._id,
            name: item.product.name,
          },
          quantity: item.quantity,
          weight: item.weight, // Include weight for per_kg products
          discount: item.discount || 0,
          discountType: item.discountType || "percentage",
        })),
        customerInfo: {
          name: customerInfo.name.trim(),
          phone: customerInfo.phone.trim(),
        },
      };

      const response = await checkoutAPI.createCheckout(checkoutData);

      if (response.data.success) {
        // Store both bill data and loyalty info
        setCheckoutSuccess({
          bill: response.data.data,
          loyalty: response.data.loyalty,
        });
        setCart([]);
        setCustomerInfo({ name: "", phone: "" });
        setLoyaltyInfo(null);
        setShowCheckout(false);

        // Show appropriate success message based on loyalty
        if (response.data.loyalty?.applied) {
          toast.success(`🎉 ${response.data.loyalty.message}`, {
            duration: 5000,
          });
        } else {
          toast.success("🎉 Order completed successfully!");
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message || "Failed to complete checkout"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      (typeof product.category === "object"
        ? product.category._id === selectedCategory
        : product.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <BillingPageSkeleton />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-1 sm:gap-2 p-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
                {/* Logo and Title - Hidden on mobile */}
                <div className="hidden md:flex items-center">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary-200 mr-3">
                    <img
                      src="https://res.cloudinary.com/dsguaqukb/image/upload/v1758778085/cake_fak42q.jpg"
                      alt="CakeRaft Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    CakeRaft Billing
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                {/* Cart count */}
                <div className="text-xs sm:text-sm text-gray-600">
                  Cart: {getTotalItems()} items
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-8 pb-32 sm:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Products Section */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold">Available Products</h2>
                  <div className="mt-4 space-y-3">
                    {/* Category Filter */}
                    <div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm sm:text-base border-2 border-green-200 rounded-lg focus:border-green-400 focus:ring-2 focus:ring-green-300 focus:outline-none bg-gradient-to-r from-green-50 to-emerald-50 text-gray-700 font-medium shadow-sm hover:border-green-300 transition-colors appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.5em 1.5em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No products available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((product: Product) => (
                        <div
                          key={product._id}
                          className="border border-gray-200 rounded-lg p-3 sm:p-4"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={
                                    getProductImageUrl(product.imageUrl) || ""
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                                {product.name}
                              </h3>
                              {/* Hide description on mobile */}
                              <p className="hidden sm:block text-sm text-gray-500 truncate">
                                {product.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-primary-600 text-sm sm:text-base">
                                  ₹{product.price.toFixed(2)}
                                  {product.priceType === "per_kg" && (
                                    <span className="text-xs text-gray-500">
                                      /kg
                                    </span>
                                  )}
                                </span>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                  className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                                >
                                  <Plus className="h-3 w-3" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Section - Now visible on all screens */}
            <div>
              <div className="card rounded-lg shadow-md">
                <div className="card-header">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Shopping Cart
                  </h2>
                </div>

                <div className="card-body max-h-[40vh] lg:max-h-none overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-4 sm:py-8">
                      <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">
                        Cart is empty
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-4">
                      {cart.map((item) => (
                        <div
                          key={`${item.product._id}-${item.weight || "fixed"}`}
                          className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-green-50"
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                                {item.product.name}
                                {item.weight && (
                                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-gray-600">
                                    ({item.weight}kg)
                                  </span>
                                )}
                              </h4>
                              <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                  {item.weight
                                    ? `₹${item.product.price.toFixed(2)}/kg × ${
                                        item.weight
                                      }kg`
                                    : `₹${item.product.price.toFixed(2)}`}
                                </p>
                                {item.discount && item.discount > 0 && (
                                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">
                                    <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                    {item.discountType === "percentage"
                                      ? `${item.discount}%`
                                      : `₹${item.discount}`}
                                  </span>
                                )}
                              </div>

                              {/* Price breakdown - Simplified on mobile */}
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs sm:text-sm">
                                  <span>Subtotal ({item.quantity}x):</span>
                                  <span>
                                    ₹
                                    {(item.weight
                                      ? item.product.price *
                                        item.weight *
                                        item.quantity
                                      : item.product.price * item.quantity
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                {item.discount && item.discount > 0 && (
                                  <>
                                    <div className="flex justify-between text-sm text-green-600">
                                      <span>Discount:</span>
                                      <span>
                                        -₹
                                        {(item.discountType === "percentage"
                                          ? (item.weight
                                              ? item.product.price *
                                                item.weight *
                                                item.quantity
                                              : item.product.price *
                                                item.quantity) *
                                            (item.discount / 100)
                                          : Math.min(
                                              item.discount,
                                              item.weight
                                                ? item.product.price *
                                                    item.weight *
                                                    item.quantity
                                                : item.product.price *
                                                    item.quantity
                                            )
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between font-medium text-pink-600 border-t pt-1">
                                      <span>Total:</span>
                                      <span>
                                        ₹{calculateItemTotal(item).toFixed(2)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between mt-3 sm:mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity - 1,
                                    item.weight
                                  )
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 p-0 flex items-center justify-center"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>

                              <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                                {item.quantity}
                              </span>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(
                                    item.product._id,
                                    item.quantity + 1,
                                    item.weight
                                  )
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 p-0 flex items-center justify-center"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Action Controls */}
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              {/* Discount Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openDiscountModal(
                                    item.product._id,
                                    item.weight
                                  )
                                }
                                className="flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 text-xs sm:text-sm px-2 sm:px-3"
                              >
                                <Percent className="h-3 w-3" />
                                <span className="hidden sm:inline">
                                  {item.discount && item.discount > 0
                                    ? "Edit"
                                    : "Discount"}
                                </span>
                              </Button>

                              {/* Remove Discount Button */}
                              {item.discount && item.discount > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeDiscount(
                                      item.product._id,
                                      item.weight
                                    )
                                  }
                                  className="flex items-center gap-1 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 w-7 h-7 sm:w-8 sm:h-8 p-0 justify-center"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}

                              {/* Remove Item Button */}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  removeFromCart(item.product._id, item.weight)
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 p-0 flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="border-t pt-4 space-y-3">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center text-base">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold text-gray-900">
                            ₹{getTotalAmount().toFixed(2)}
                          </span>
                        </div>

                        {/* Loyalty Discount Preview */}
                        {loyaltyInfo?.potentialDiscount?.loyaltyApplied && (
                          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-3 animate-pulse">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">🎉</span>
                                <div>
                                  <p className="text-sm font-bold text-pink-700">
                                    Loyalty Reward Applied!
                                  </p>
                                  <p className="text-xs text-pink-600">
                                    {
                                      loyaltyInfo.potentialDiscount
                                        .discountPercentage
                                    }
                                    % off on cake items
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-green-600">
                                  -₹
                                  {loyaltyInfo.potentialDiscount.discountAmount}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Final Total */}
                        <div className="flex justify-between items-center font-bold text-xl border-t pt-3">
                          <span>Total:</span>
                          <span className="text-green-600">
                            ₹{getFinalTotal().toFixed(2)}
                          </span>
                        </div>

                        {/* Loyalty Status Message (if no discount) */}
                        {loyaltyInfo &&
                          !loyaltyInfo.potentialDiscount?.loyaltyApplied &&
                          customerInfo.phone && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <p className="text-xs text-blue-700">
                                  {loyaltyInfo.status?.message}
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Customer Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Customer Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            name: e.target.value,
                          })
                        }
                        className="input pl-10"
                        placeholder="Enter customer name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            phone: e.target.value,
                          })
                        }
                        className="input pl-10"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Loyalty Information */}
                  {loyaltyInfo && customerInfo.phone && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">
                            Loyalty Status
                          </span>
                        </div>
                        <span className="text-sm text-pink-600 font-medium">
                          {loyaltyInfo.history?.loyaltyLevel ||
                            "🌟 Sweet Friend"}
                        </span>
                      </div>

                      {loyaltyInfo.potentialDiscount?.loyaltyApplied ? (
                        <div className="bg-white/60 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🎉</span>
                            <span className="font-bold text-pink-700">
                              Loyalty Reward!
                            </span>
                          </div>
                          <p className="text-sm text-pink-600 mb-2">
                            {loyaltyInfo.potentialDiscount.message}
                          </p>
                          <div className="flex justify-between items-center text-sm">
                            <span>Discount Amount:</span>
                            <span className="font-bold text-green-600">
                              -₹{loyaltyInfo.potentialDiscount.discountAmount}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-pink-600">
                          <p>{loyaltyInfo.status?.message}</p>
                          {loyaltyInfo.history && (
                            <div className="mt-2 flex justify-between text-xs">
                              <span>
                                Total Purchases:{" "}
                                {loyaltyInfo.history.totalPurchases}
                              </span>
                              <span>
                                Next Reward:{" "}
                                {loyaltyInfo.status.nextDiscountAt -
                                  loyaltyInfo.status.purchaseCount}{" "}
                                more
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t mt-6 pt-4">
                  {/* Total Amount with Loyalty Discount */}
                  {loyaltyInfo?.potentialDiscount?.loyaltyApplied ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹{getTotalAmount().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>
                          Loyalty Discount (
                          {loyaltyInfo.potentialDiscount.discountPercentage}%):
                        </span>
                        <span>
                          -₹
                          {loyaltyInfo.potentialDiscount.discountAmount.toFixed(
                            2
                          )}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-lg">
                            Final Total:
                          </span>
                          <span className="text-xl font-bold text-primary-600">
                            ₹{getFinalTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-xl font-bold text-primary-600">
                        ₹{getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {isCheckingOut ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        "Complete Order"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discount Modal */}
        {showDiscountModal && selectedCartItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <Percent className="h-6 w-6 mr-2" />
                  Apply Discount
                </h3>
                <p className="text-green-100 mt-1">
                  Set discount for this item
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Discount Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Discount Type
                  </label>
                  <div className="flex space-x-3">
                    <Button
                      variant={
                        discountType === "percentage" ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => setDiscountType("percentage")}
                      className="flex-1"
                    >
                      <Percent className="h-4 w-4 mr-1" />
                      Percentage
                    </Button>
                    <Button
                      variant={discountType === "fixed" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setDiscountType("fixed")}
                      className="flex-1"
                    >
                      ₹ Fixed Amount
                    </Button>
                  </div>
                </div>

                {/* Discount Value Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {discountType === "percentage"
                      ? "Discount Percentage"
                      : "Discount Amount (₹)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={discountType === "percentage" ? "100" : "999"}
                      step={discountType === "percentage" ? "1" : "0.01"}
                      value={discountValue || ""}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="input w-full pl-8 border-green-200 focus:border-green-400 focus:ring-green-300"
                      placeholder={
                        discountType === "percentage"
                          ? "Enter %"
                          : "Enter amount"
                      }
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {discountType === "percentage" ? "%" : "₹"}
                    </div>
                  </div>
                  {discountType === "percentage" && discountValue > 100 && (
                    <p className="text-red-500 text-xs mt-1">
                      Percentage cannot exceed 100%
                    </p>
                  )}
                </div>

                {/* Preview */}
                {selectedCartItem && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                    {(() => {
                      const item = cart.find(
                        (i) => i.product._id === selectedCartItem
                      );
                      if (!item) return null;

                      const originalTotal = item.product.price * item.quantity;
                      let discountAmount = 0;

                      if (
                        discountType === "percentage" &&
                        discountValue <= 100
                      ) {
                        discountAmount = originalTotal * (discountValue / 100);
                      } else if (discountType === "fixed") {
                        discountAmount = Math.min(discountValue, originalTotal);
                      }

                      const finalTotal = originalTotal - discountAmount;

                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Original Total:</span>
                            <span>₹{originalTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-₹{discountAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium text-pink-600 border-t pt-2">
                            <span>New Total:</span>
                            <span>₹{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDiscountModal(false);
                      setDiscountValue(0);
                      setSelectedCartItem(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (
                        discountType === "percentage" &&
                        discountValue > 100
                      ) {
                        toast.error("Percentage cannot exceed 100%");
                        return;
                      }
                      if (selectedCartItem) {
                        applyDiscount(
                          selectedCartItem,
                          discountValue,
                          discountType,
                          selectedWeight || undefined
                        );
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    Apply Discount
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Success Modal */}
        {checkoutSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header with CakeRaft Branding */}
              <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 p-6 rounded-t-2xl text-white relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
                </div>

                {/* Logo and Brand Name */}
                <div className="relative z-10 flex items-center justify-center mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
                      <img
                        src="https://res.cloudinary.com/du4jhwpak/image/upload/v1765107523/WhatsApp_Image_2025-12-04_at_15.13.04_80e34f88_owuux1.jpg"
                        alt="CakeRaft Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold tracking-wide">
                      CakeRaft
                    </h2>
                    <p className="text-pink-100 text-sm">
                      Artisan Cake Creations
                    </p>
                  </div>
                </div>

                {/* Success Message */}
                <div className="relative z-10 flex items-center justify-center mb-3">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-center">
                  Order Completed Successfully!
                </h3>
                <p className="text-pink-100 text-center mt-2">
                  Bill #{checkoutSuccess?.bill?.billNumber || "N/A"}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-pink-600" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">
                        {checkoutSuccess?.bill?.customerInfo?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <p className="font-medium">
                        {checkoutSuccess?.bill?.customerInfo?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loyalty Reward Notice */}
                {checkoutSuccess.loyalty?.applied && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎉</span>
                      <span className="font-bold text-pink-700">
                        Loyalty Reward Applied!
                      </span>
                    </div>
                    <p className="text-sm text-pink-600 mb-2">
                      {checkoutSuccess?.loyalty?.message || ""}
                    </p>
                    <div className="flex justify-between items-center text-sm bg-white/60 rounded p-2">
                      <span>Discount Earned:</span>
                      <span className="font-bold text-green-600">
                        ₹{checkoutSuccess?.loyalty?.discountAmount || 0} (
                        {checkoutSuccess?.loyalty?.discountPercentage || 0}%
                        OFF)
                      </span>
                    </div>
                    {checkoutSuccess?.loyalty?.nextDiscountAt && (
                      <p className="text-xs text-pink-600 mt-2">
                        🌟 Next loyalty reward in{" "}
                        {checkoutSuccess.loyalty.nextDiscountAt -
                          checkoutSuccess.loyalty.purchaseNumber}{" "}
                        more purchases!
                      </p>
                    )}
                  </div>
                )}

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-pink-600" />
                    Order Summary
                  </h4>
                  <div className="space-y-3">
                    {checkoutSuccess?.bill?.items?.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h5 className="font-medium">
                              {item?.name || "Unknown Item"}
                            </h5>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Quantity: {item?.quantity || 0}</p>
                              <p>
                                Price per item: ₹
                                {(item?.weight
                                  ? (item.price * item.weight).toFixed(2)
                                  : item?.price?.toFixed(2)) || "0.00"}
                              </p>
                              {item?.discount > 0 && (
                                <p className="text-green-600">
                                  Discount:{" "}
                                  {item.discountType === "percentage"
                                    ? `${item.discount}%`
                                    : `₹${item.discount}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ₹
                              {(() => {
                                const basePrice = item?.weight
                                  ? item.price * item.weight * item.quantity
                                  : item.price * item.quantity;

                                if (item?.discountType === "percentage") {
                                  return (
                                    basePrice -
                                    basePrice * (item.discount / 100 || 0)
                                  ).toFixed(2);
                                } else {
                                  return Math.max(
                                    0,
                                    basePrice - (item.discount || 0)
                                  ).toFixed(2);
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                      )
                    ) || []}
                    {(!checkoutSuccess?.bill?.items ||
                      checkoutSuccess.bill.items.length === 0) && (
                      <div className="text-center text-gray-500 py-4">
                        No items found
                      </div>
                    )}
                  </div>
                </div>

                {/* Bill Totals */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        ₹{checkoutSuccess?.bill?.subtotal?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    {checkoutSuccess?.bill?.totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Total Discount:</span>
                        <span>
                          -₹
                          {checkoutSuccess?.bill?.totalDiscount?.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-pink-600">
                        ₹{checkoutSuccess?.bill?.total?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bill Info */}
                <div className="text-center text-sm text-gray-500 space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {checkoutSuccess?.bill?.createdAt
                        ? new Date(
                            checkoutSuccess.bill.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {checkoutSuccess?.bill?.createdAt
                        ? new Date(
                            checkoutSuccess.bill.createdAt
                          ).toLocaleTimeString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Send Section */}
                <WhatsAppSendSection
                  billId={checkoutSuccess?.bill?._id}
                  customerPhone={checkoutSuccess?.bill?.customerInfo?.phone}
                  customerName={checkoutSuccess?.bill?.customerInfo?.name}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-pink-500 text-pink-600 hover:bg-pink-50"
                    onClick={() => window.print()}
                  >
                    Print Bill
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setCheckoutSuccess(null)}
                    className="flex-1 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 shadow-lg"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weight Selection Modal */}
        {showWeightModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
              <h3 className="text-2xl font-bold text-[#0B6623] mb-2">
                Enter Weight
              </h3>
              <p className="text-gray-600 mb-6">{selectedProduct.name}</p>

              {/* Manual Weight Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (in kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter weight (e.g., 0.25, 0.5, 1, 2)"
                    value={weightInput}
                    onChange={(e) => {
                      setWeightInput(e.target.value);
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        setSelectedWeight(value);
                      } else {
                        setSelectedWeight(null);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#0B6623] focus:outline-none text-lg font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    kg
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: 0.25, 0.5, 0.75, 1, 1.5, 2, 3 kg
                </p>
              </div>

              {selectedWeight && selectedWeight > 0 && (
                <div className="bg-[#E9CF9C] bg-opacity-30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">
                    Price for {selectedWeight}kg:
                  </p>
                  <p className="text-2xl font-bold text-[#0B6623]">
                    ₹{(selectedProduct.price * selectedWeight).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowWeightModal(false);
                    setSelectedProduct(null);
                    setSelectedWeight(null);
                    setWeightInput(""); // Reset input
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedWeight && selectedWeight > 0) {
                      addToCartWithWeight();
                    }
                  }}
                  disabled={!selectedWeight || selectedWeight <= 0}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    selectedWeight && selectedWeight > 0
                      ? "bg-[#0B6623] text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Checkout Button at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-green-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  Total Amount
                </span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ₹{getFinalTotal().toFixed(2)}
                </span>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Checkout ({getTotalItems()})</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
