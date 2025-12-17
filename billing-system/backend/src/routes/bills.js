import express from "express";
import { protect } from "../middleware/auth.js";
import Bill from "../models/Bill.js";
import pdfService from "../services/pdfService.js";
import whatsAppService from "../services/whatsAppService.js";

const router = express.Router();

// @desc    Send bill as PDF via WhatsApp
// @route   POST /api/bills/:id/send-whatsapp
// @access  Private
router.post("/:id/send-whatsapp", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;

    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Find the bill
    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Check if WhatsApp service is configured
    if (!whatsAppService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          "WhatsApp service not configured. Please contact administrator.",
        details: "WhatsApp API credentials are missing",
      });
    }

    // Generate PDF
    console.log("📄 Generating PDF for bill:", bill._id);
    const pdfPath = await pdfService.generateBillPDF(bill);
    console.log("✅ PDF generated at:", pdfPath);

    // Send via WhatsApp
    console.log("📱 Sending PDF via WhatsApp...");
    const whatsappResult = await whatsAppService.sendBillPDF(
      phoneNumber,
      pdfPath,
      bill
    );

    // Clean up PDF file after sending (or attempting to send)
    setTimeout(() => {
      pdfService.cleanupPDF(pdfPath);
    }, 5000); // Clean up after 5 seconds

    if (whatsappResult.success) {
      return res.status(200).json({
        success: true,
        message: "Bill sent successfully via WhatsApp",
        data: {
          billId: bill._id,
          billNumber: bill.billNumber,
          phoneNumber: phoneNumber,
          messageId: whatsappResult.messageId,
          whatsappId: whatsappResult.whatsappId,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to send bill via WhatsApp",
        error: whatsappResult.error,
      });
    }
  } catch (error) {
    console.error("❌ Error in send-whatsapp endpoint:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while sending WhatsApp message",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
    });
  }
});

// @desc    Get bill details for WhatsApp sending
// @route   GET /api/bills/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bill details",
    });
  }
});

// @desc    Get all bills with pagination
// @route   GET /api/bills
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Bill.countDocuments();

    // Get bills with pagination
    const bills = await Bill.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return res.status(200).json({
      success: true,
      data: bills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bills:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bills",
    });
  }
});

// @desc    Test WhatsApp service configuration
// @route   GET /api/bills/whatsapp/status
// @access  Private
router.get("/whatsapp/status", protect, async (req, res) => {
  try {
    const status = whatsAppService.getStatus();

    return res.status(200).json({
      success: true,
      message: "WhatsApp service status",
      data: status,
    });
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking WhatsApp service status",
    });
  }
});

// @desc    Send test PDF via WhatsApp
// @route   POST /api/bills/whatsapp/test
// @access  Private
router.post("/whatsapp/test", protect, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for test",
      });
    }

    // Check if WhatsApp service is configured
    if (!whatsAppService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: "WhatsApp service not configured",
        details: whatsAppService.getStatus(),
      });
    }

    // Create a sample bill for testing
    const sampleBill = {
      _id: "TEST_BILL_ID",
      billNumber: "TEST-" + Date.now(),
      items: [
        {
          name: "Chocolate Birthday Cake",
          quantity: 1,
          price: 500,
          discount: 0,
        },
        {
          name: "Vanilla Cupcakes (6 pcs)",
          quantity: 2,
          price: 180,
          discount: 20,
        },
      ],
      subtotal: 860,
      totalDiscount: 20,
      total: 840,
      customerInfo: {
        name: "Test Customer",
        phone: phoneNumber,
      },
      createdAt: new Date(),
    };

    // Generate test PDF
    console.log("📄 Generating test PDF...");
    const pdfPath = await pdfService.generateBillPDF(sampleBill);

    // Send test message
    const result = await whatsAppService.sendBillPDF(
      phoneNumber,
      pdfPath,
      sampleBill
    );

    // Clean up test PDF
    setTimeout(() => {
      pdfService.cleanupPDF(pdfPath);
    }, 5000);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Test bill sent successfully via WhatsApp",
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to send test bill",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("❌ Error in WhatsApp test:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending test message",
      error: error.message,
    });
  }
});

// @desc    Download bill PDF
// @route   GET /api/bills/:id/pdf
// @access  Public (no auth needed for customer download)
router.get("/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Generate PDF
    console.log("📄 Generating PDF for download:", bill._id);
    const pdfPath = await pdfService.generateBillPDF(bill);

    // Send PDF file
    res.download(pdfPath, `CakeRaft_Bill_${bill.billNumber}.pdf`, (err) => {
      if (err) {
        console.error("Error sending PDF:", err);
      }
      // Clean up PDF after download
      setTimeout(() => {
        pdfService.cleanupPDF(pdfPath);
      }, 1000);
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating PDF",
      error: error.message,
    });
  }
});

export default router;
