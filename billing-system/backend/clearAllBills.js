import mongoose from "mongoose";
import Bill from "./src/models/Bill.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

async function clearAllBills() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log(
      "MongoDB URI:",
      process.env.MONGODB_URI ? "Found" : "Not found"
    );

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB successfully!\n");

    // Get count before deletion
    const billCount = await Bill.countDocuments();
    console.log(`📊 Current bills in database: ${billCount}`);

    if (billCount === 0) {
      console.log("✨ Database is already clean! No bills to delete.");
      await mongoose.connection.close();
      return;
    }

    // Ask for confirmation (in real scenario)
    console.log("\n⚠️  WARNING: This will delete ALL bills from the database!");
    console.log("⚠️  This action cannot be undone!");
    console.log("⚠️  All customer loyalty data will be reset!\n");

    // Delete all bills
    console.log("🗑️  Deleting all bills...");
    const result = await Bill.deleteMany({});

    console.log(`\n✅ Successfully deleted ${result.deletedCount} bills!`);
    console.log(
      "✨ Database is now clean and ready for fresh loyalty tracking."
    );
    console.log(
      "🎂 From now on, only CAKE category purchases will count towards loyalty!\n"
    );

    // Verify deletion
    const remainingBills = await Bill.countDocuments();
    console.log(`📊 Remaining bills: ${remainingBills}`);

    // Close connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
    console.log("✅ Cleanup complete!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    console.error("Error details:", error.message);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
}

// Run the cleanup
console.log("🧹 Starting database cleanup script...\n");
clearAllBills();
