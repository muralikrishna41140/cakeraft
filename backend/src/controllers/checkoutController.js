import Bill from '../models/Bill.js';
import { Product } from '../models/Product.js';
import mongoose from 'mongoose';
import loyaltyService from '../services/loyaltyService.js';

// Create checkout
export const createCheckout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log('Checkout request received:', req.body);
    const { items, customerInfo } = req.body;
    
    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }
    
    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required'
      });
    }
    
    // Verify and process each item
    const billItems = [];
    let subtotal = 0;
    let totalDiscount = 0;
    
    for (const cartItem of items) {
      // Fetch product from database
      const product = await Product.findById(cartItem.product._id).session(session);
      if (!product) {
        throw new Error(`Product not found: ${cartItem.product.name}`);
      }
      
      // Calculate item pricing
      const itemSubtotal = product.price * cartItem.quantity;
      let itemDiscount = 0;
      
      if (cartItem.discount && cartItem.discount > 0) {
        if (cartItem.discountType === 'percentage') {
          itemDiscount = itemSubtotal * (cartItem.discount / 100);
        } else {
          itemDiscount = Math.min(cartItem.discount, itemSubtotal);
        }
      }
      
      const itemTotal = itemSubtotal - itemDiscount;
      
      // Add to bill items
      billItems.push({
        productId: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        price: product.price,
        discount: cartItem.discount || 0,
        discountType: cartItem.discountType || 'percentage'
      });
      
      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
    }

    // Check for loyalty discount
    console.log('🏆 Checking loyalty discount for customer:', customerInfo.phone);
    const loyaltyDiscount = await loyaltyService.calculateLoyaltyDiscount(subtotal, customerInfo.phone);
    
    // Apply loyalty discount if applicable
    const loyaltyDiscountAmount = loyaltyDiscount.loyaltyApplied ? loyaltyDiscount.discountAmount : 0;
    const finalTotalDiscount = totalDiscount + loyaltyDiscountAmount;
    const finalTotal = subtotal - finalTotalDiscount;
    
    console.log('💰 Pricing breakdown:', {
      subtotal,
      itemDiscounts: totalDiscount,
      loyaltyDiscount: loyaltyDiscountAmount,
      finalTotal,
      loyaltyMessage: loyaltyDiscount.message
    });

    // Create bill
    const bill = new Bill({
      items: billItems,
      subtotal,
      totalDiscount: finalTotalDiscount,
      total: finalTotal,
      customerInfo: {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim()
      }
    });
    
    await bill.save({ session });
    await session.commitTransaction();
    
    // Populate product details for response
    const populatedBill = await Bill.findById(bill._id)
      .populate('items.productId', 'name description category');
    
    // Get customer's updated loyalty status for response
    const updatedLoyaltyStatus = await loyaltyService.checkLoyaltyDiscount(customerInfo.phone);
    
    res.status(201).json({
      success: true,
      message: 'Checkout completed successfully!',
      data: populatedBill,
      loyalty: {
        applied: loyaltyDiscount.loyaltyApplied,
        discountAmount: loyaltyDiscountAmount,
        discountPercentage: loyaltyDiscount.discountPercentage,
        message: loyaltyDiscount.message,
        nextDiscountAt: updatedLoyaltyStatus.nextDiscountAt,
        purchaseNumber: loyaltyDiscount.purchaseNumber || updatedLoyaltyStatus.nextPurchaseNumber
      }
    });
    
  } catch (error) {
    await session.abortTransaction();
    console.error('Checkout error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete checkout'
    });
  } finally {
    session.endSession();
  }
};

// Get all bills
export const getBills = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, startDate, endDate } = req.query;
    
    const query = {};
    
    // Search by customer name or bill number
    if (search) {
      query.$or = [
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { billNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const bills = await Bill.find(query)
      .populate('items.productId', 'name description')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Bill.countDocuments(query);
    
    res.json({
      success: true,
      data: bills,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    });
  }
};

// Get single bill
export const getBill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await Bill.findById(id)
      .populate('items.productId', 'name description category');
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill'
    });
  }
};

// Get today's sales summary
export const getSalesSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysBills = await Bill.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    const summary = {
      totalSales: todaysBills.reduce((sum, bill) => sum + bill.total, 0),
      totalOrders: todaysBills.length,
      totalItems: todaysBills.reduce((sum, bill) => 
        sum + bill.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      ),
      totalDiscount: todaysBills.reduce((sum, bill) => sum + bill.totalDiscount, 0)
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales summary'
    });
  }
};

// Check loyalty status for a customer
export const checkLoyaltyStatus = async (req, res) => {
  try {
    const { customerPhone, subtotal } = req.body;
    
    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number is required'
      });
    }
    
    // Get loyalty status
    const loyaltyStatus = await loyaltyService.checkLoyaltyDiscount(customerPhone);
    
    // If subtotal provided, calculate potential discount
    let potentialDiscount = null;
    if (subtotal && subtotal > 0) {
      potentialDiscount = await loyaltyService.calculateLoyaltyDiscount(subtotal, customerPhone);
    }
    
    // Get loyalty history
    const loyaltyHistory = await loyaltyService.getLoyaltyHistory(customerPhone);
    
    res.json({
      success: true,
      data: {
        status: loyaltyStatus,
        potentialDiscount,
        history: loyaltyHistory
      }
    });
    
  } catch (error) {
    console.error('Error checking loyalty status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check loyalty status'
    });
  }
};