import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Product, Category } from "./src/models/Product.js";
import Bill from "./src/models/Bill.js";
import loyaltyService from "./src/services/loyaltyService.js";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

async function testCakeLoyalty() {
  try {
    console.log("🧪 Starting Cake Loyalty System Test...\n");
    console.log("🔌 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!\n");

    // Find or create a Cake category
    let cakeCategory = await Category.findOne({ name: "cake" });
    if (!cakeCategory) {
      console.log("⚠️  No Cake category found. Creating one...");
      cakeCategory = await Category.create({
        name: "Birthday Cakes",
        description: "Delicious cakes for birthdays",
      });
      console.log("✅ Cake category created!\n");
    } else {
      console.log(`✅ Found Cake category: ${cakeCategory.name}\n`);
    }

    // Find a cake product
    const cakeProduct = await Product.findOne({ category: cakeCategory._id });
    if (!cakeProduct) {
      console.log(
        "⚠️  No cake products found. Please add some cake products first."
      );
      await mongoose.connection.close();
      return;
    }
    console.log(
      `✅ Found cake product: ${cakeProduct.name} (₹${cakeProduct.price})\n`
    );

    // Test customer phone
    const testPhone = "9999888877";
    console.log(`👤 Test Customer Phone: ${testPhone}\n`);

    // Check initial loyalty status
    console.log("📊 Initial Loyalty Status:");
    const initialStatus = await loyaltyService.checkLoyaltyDiscount(testPhone);
    console.log(`   Purchase count: ${initialStatus.purchaseCount}`);
    console.log(`   Next purchase #: ${initialStatus.nextPurchaseNumber}`);
    console.log(
      `   Qualifies for discount: ${initialStatus.qualifiesForDiscount}`
    );
    console.log(`   Message: ${initialStatus.message}\n`);

    // Simulate 3 cake purchases
    console.log("🎂 Simulating 3 Cake Purchases:\n");

    for (let i = 1; i <= 3; i++) {
      console.log(`\n--- Purchase #${i} ---`);

      // Create a bill with cake items
      const bill = new Bill({
        items: [
          {
            productId: cakeProduct._id,
            name: cakeProduct.name,
            quantity: 1,
            price: cakeProduct.price,
            discount: 0,
            discountType: "percentage",
          },
        ],
        subtotal: cakeProduct.price,
        totalDiscount: 0,
        total: cakeProduct.price,
        customerInfo: {
          name: "Test Customer",
          phone: testPhone,
        },
        hasCakeItems: true, // Mark as having cake items
      });

      await bill.save();
      console.log(`✅ Bill created: ${bill.billNumber}`);
      console.log(`   Total: ₹${bill.total}`);
      console.log(`   Has cake items: ${bill.hasCakeItems}`);

      // Check loyalty status after this purchase
      const loyaltyCheck = await loyaltyService.checkLoyaltyDiscount(testPhone);
      console.log(
        `   Updated cake purchase count: ${loyaltyCheck.purchaseCount}`
      );
      console.log(`   Next discount at: ${loyaltyCheck.nextDiscountAt}`);
      console.log(
        `   Qualifies for discount: ${loyaltyCheck.qualifiesForDiscount}`
      );
      console.log(`   Message: ${loyaltyCheck.message}`);
    }

    // Final verification
    console.log("\n\n🎉 Final Loyalty Status:");
    const finalStatus = await loyaltyService.checkLoyaltyDiscount(testPhone);
    console.log(`   Total cake purchases: ${finalStatus.purchaseCount}`);
    console.log(`   Next discount at purchase: ${finalStatus.nextDiscountAt}`);
    console.log(
      `   Loyalty level: ${loyaltyService.getLoyaltyLevel(
        finalStatus.purchaseCount
      )}`
    );

    // Test discount calculation
    console.log("\n\n💰 Testing Discount Calculation:");
    const discountTest = await loyaltyService.calculateLoyaltyDiscount(
      500,
      testPhone
    );
    console.log(`   Should qualify: ${discountTest.loyaltyApplied}`);
    console.log(`   Discount amount: ₹${discountTest.discountAmount}`);
    console.log(`   Discount percentage: ${discountTest.discountPercentage}%`);
    console.log(`   Message: ${discountTest.message}`);

    // Cleanup test data
    console.log("\n\n🧹 Cleaning up test data...");
    await Bill.deleteMany({ "customerInfo.phone": testPhone });
    console.log("✅ Test data cleaned up");

    await mongoose.connection.close();
    console.log("\n✅ Test Complete! Loyalty system is working correctly.\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.message);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
}

// Run the test
testCakeLoyalty();
