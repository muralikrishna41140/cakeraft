import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Product, Category } from "./src/models/Product.js";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

async function checkData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!\n");

    // Check categories
    console.log("📂 Categories:");
    const categories = await Category.find();
    categories.forEach((cat) => {
      console.log(`   - ${cat.name} (ID: ${cat._id})`);
    });
    console.log("");

    // Check products
    console.log("🎂 Products:");
    const products = await Product.find().populate("category", "name");
    if (products.length === 0) {
      console.log("   ⚠️  No products found");
    } else {
      products.forEach((prod) => {
        console.log(
          `   - ${prod.name} (₹${prod.price}) - Category: ${
            prod.category?.name || "None"
          }`
        );
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkData();
