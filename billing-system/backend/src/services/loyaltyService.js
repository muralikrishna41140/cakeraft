import Bill from "../models/Bill.js";

class LoyaltyService {
  constructor() {
    // Configurable loyalty settings
    this.LOYALTY_FREQUENCY = parseInt(process.env.LOYALTY_FREQUENCY) || 3; // Every 3rd purchase
    this.LOYALTY_DISCOUNT_PERCENTAGE =
      parseFloat(process.env.LOYALTY_DISCOUNT_PERCENTAGE) || 10; // 10% discount
  }

  /**
   * Check if customer qualifies for loyalty discount
   * @param {string} customerPhone - Customer's phone number
   * @returns {Promise<Object>} - Loyalty status and discount info
   */
  async checkLoyaltyDiscount(customerPhone) {
    try {
      if (!customerPhone) {
        return {
          isLoyaltyCustomer: false,
          purchaseCount: 0,
          nextDiscountAt: this.LOYALTY_FREQUENCY,
          qualifiesForDiscount: false,
          discountPercentage: 0,
          message: "Phone number required for loyalty rewards",
        };
      }

      // Count ONLY cake category purchases for this customer
      const purchaseCount = await Bill.countDocuments({
        "customerInfo.phone": customerPhone,
        hasCakeItems: true, // Only count bills with cake items
      });

      // Check if this will be a loyalty discount purchase
      const nextPurchaseNumber = purchaseCount + 1;
      const qualifiesForDiscount =
        nextPurchaseNumber % this.LOYALTY_FREQUENCY === 0;

      // Calculate next discount purchase
      const nextDiscountAt = qualifiesForDiscount
        ? nextPurchaseNumber
        : this.LOYALTY_FREQUENCY -
          (nextPurchaseNumber % this.LOYALTY_FREQUENCY) +
          nextPurchaseNumber;

      const result = {
        isLoyaltyCustomer: purchaseCount > 0,
        purchaseCount,
        nextPurchaseNumber,
        nextDiscountAt,
        qualifiesForDiscount,
        discountPercentage: qualifiesForDiscount
          ? this.LOYALTY_DISCOUNT_PERCENTAGE
          : 0,
        message: this.getLoyaltyMessage(
          nextPurchaseNumber,
          qualifiesForDiscount
        ),
      };

      console.log(
        `🏆 Loyalty check for ${customerPhone} (Cake purchases only):`,
        result
      );
      return result;
    } catch (error) {
      console.error("❌ Error checking loyalty discount:", error);
      return {
        isLoyaltyCustomer: false,
        purchaseCount: 0,
        nextDiscountAt: this.LOYALTY_FREQUENCY,
        qualifiesForDiscount: false,
        discountPercentage: 0,
        message: "Unable to check loyalty status",
        error: error.message,
      };
    }
  }

  /**
   * Calculate loyalty discount for a bill
   * @param {number} subtotal - Bill subtotal before discount
   * @param {string} customerPhone - Customer's phone number
   * @returns {Promise<Object>} - Discount calculation details
   */
  async calculateLoyaltyDiscount(subtotal, customerPhone) {
    try {
      const loyaltyStatus = await this.checkLoyaltyDiscount(customerPhone);

      if (!loyaltyStatus.qualifiesForDiscount) {
        return {
          discountAmount: 0,
          discountPercentage: 0,
          finalTotal: subtotal,
          loyaltyApplied: false,
          message: loyaltyStatus.message,
        };
      }

      // Calculate discount
      const discountAmount = Math.round(
        (subtotal * loyaltyStatus.discountPercentage) / 100
      );
      const finalTotal = subtotal - discountAmount;

      const result = {
        discountAmount,
        discountPercentage: loyaltyStatus.discountPercentage,
        finalTotal,
        loyaltyApplied: true,
        purchaseNumber: loyaltyStatus.nextPurchaseNumber,
        message: `🎉 Loyalty Reward: ${
          loyaltyStatus.discountPercentage
        }% off on CAKE items for your ${this.getOrdinalNumber(
          loyaltyStatus.nextPurchaseNumber
        )} cake purchase!`,
      };

      console.log("💰 Loyalty discount calculated:", result);
      return result;
    } catch (error) {
      console.error("❌ Error calculating loyalty discount:", error);
      return {
        discountAmount: 0,
        discountPercentage: 0,
        finalTotal: subtotal,
        loyaltyApplied: false,
        message: "Unable to apply loyalty discount",
        error: error.message,
      };
    }
  }

  /**
   * Get customer's loyalty history
   * @param {string} customerPhone - Customer's phone number
   * @returns {Promise<Object>} - Customer's purchase history and loyalty stats
   */
  async getLoyaltyHistory(customerPhone) {
    try {
      if (!customerPhone) {
        return { error: "Phone number required" };
      }

      // Get all customer bills with CAKE ITEMS ONLY
      const customerBills = await Bill.find({
        "customerInfo.phone": customerPhone,
        hasCakeItems: true, // Only count cake purchases
      }).sort({ createdAt: -1 });

      // Calculate loyalty statistics
      const totalPurchases = customerBills.length;
      const totalSpent = customerBills.reduce(
        (sum, bill) => sum + bill.total,
        0
      );
      const loyaltyDiscountsReceived = customerBills.filter(
        (bill) => bill.totalDiscount > 0 && bill.totalDiscount > 0
      ).length;

      const loyaltyStatus = await this.checkLoyaltyDiscount(customerPhone);

      return {
        customerPhone,
        totalPurchases,
        totalSpent,
        loyaltyDiscountsReceived,
        nextDiscountAt: loyaltyStatus.nextDiscountAt,
        recentBills: customerBills.slice(0, 5), // Last 5 bills
        loyaltyLevel: this.getLoyaltyLevel(totalPurchases),
      };
    } catch (error) {
      console.error("❌ Error getting loyalty history:", error);
      return { error: error.message };
    }
  }

  /**
   * Generate appropriate loyalty message
   * @param {number} purchaseNumber - Current purchase number
   * @param {boolean} qualifiesForDiscount - Whether customer gets discount
   * @returns {string} - Loyalty message
   */
  getLoyaltyMessage(purchaseNumber, qualifiesForDiscount) {
    if (qualifiesForDiscount) {
      return `🎉 Congratulations! You get ${
        this.LOYALTY_DISCOUNT_PERCENTAGE
      }% off on CAKE items for your ${this.getOrdinalNumber(
        purchaseNumber
      )} cake purchase!`;
    }

    const remaining =
      this.LOYALTY_FREQUENCY - (purchaseNumber % this.LOYALTY_FREQUENCY);
    if (remaining === this.LOYALTY_FREQUENCY) {
      return `🎂 Welcome back! ${
        remaining === 1 ? "Next" : `${remaining} more`
      } cake purchase${remaining > 1 ? "s" : ""} until your loyalty discount!`;
    }

    return `🌟 ${remaining === 1 ? "Next" : `${remaining} more`} cake purchase${
      remaining > 1 ? "s" : ""
    } until your ${
      this.LOYALTY_DISCOUNT_PERCENTAGE
    }% loyalty discount on cakes!`;
  }

  /**
   * Get ordinal number (1st, 2nd, 3rd, etc.)
   * @param {number} num - Number to convert
   * @returns {string} - Ordinal number
   */
  getOrdinalNumber(num) {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = num % 100;
    return (
      num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
    );
  }

  /**
   * Determine customer loyalty level based on purchase count
   * @param {number} purchaseCount - Total purchases
   * @returns {string} - Loyalty level
   */
  getLoyaltyLevel(purchaseCount) {
    if (purchaseCount >= 50) return "👑 Cake Royalty";
    if (purchaseCount >= 30) return "🏆 Sweet Champion";
    if (purchaseCount >= 15) return "⭐ Loyal Baker";
    if (purchaseCount >= 5) return "🎂 Cake Lover";
    if (purchaseCount >= 1) return "🌟 Sweet Friend";
    return "👋 New Customer";
  }
}

export default new LoyaltyService();
