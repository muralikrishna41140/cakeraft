import "dotenv/config";
import mongoose from "mongoose";
import Bill from "./src/models/Bill.js";

async function checkBillPDF() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const latestBill = await Bill.findOne().sort({ createdAt: -1 });

    if (!latestBill) {
      console.log("❌ No bills found in database");
      process.exit(0);
    }

    console.log("📋 Latest Bill Information:");
    console.log("=====================================");
    console.log("Bill Number:", latestBill.billNumber);
    console.log("Customer Name:", latestBill.customerInfo?.name);
    console.log("Customer Phone:", latestBill.customerInfo?.phone);
    console.log("Total:", `₹${latestBill.total}`);
    console.log("Created:", latestBill.createdAt);
    console.log("");
    console.log("📄 PDF Status:");
    console.log("Supabase URL:", latestBill.supabaseUrl || "❌ NOT SET");
    console.log("");

    if (latestBill.supabaseUrl) {
      console.log("✅ PDF URL exists! This should be in WhatsApp message.");
      console.log("");
      console.log("📱 WhatsApp Message Preview:");
      console.log("=====================================");

      const message = `🎂 *CakeRaft - Your Order is Ready!*

Hi ${latestBill.customerInfo?.name}! 👋

Thank you for choosing CakeRaft! 💖

Your delicious cake order has been confirmed and your invoice is ready.

📄 *Download Invoice PDF:*
${latestBill.supabaseUrl}

📋 *View Invoice Online:*
http://localhost:3000/bill/${latestBill._id}

💰 *Payment & Delivery*
Please review your invoice and contact us for any questions.

---
*CakeRaft* 🎂
Artisan Cake Creations
📞 Contact us for custom orders!`;

      console.log(message);
      console.log("");
      console.log("✅ This is what should appear in WhatsApp!");
    } else {
      console.log("❌ NO PDF URL! Bill was not uploaded to Supabase.");
      console.log("");
      console.log("🔍 Troubleshooting:");
      console.log("1. Check if Supabase is configured in .env");
      console.log(
        "2. Check backend console for upload errors when bill was created"
      );
      console.log("3. Create a new bill to test Supabase upload");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkBillPDF();
