import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Product } from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const migrateImagesToCloudinary = async () => {
  try {
    console.log('🚀 Starting image migration to Cloudinary...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products with images
    const products = await Product.find({
      'image.filename': { $exists: true, $ne: null }
    });

    console.log(`📦 Found ${products.length} products with images\n`);

    if (products.length === 0) {
      console.log('✨ No products with old image format found. Migration complete!');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;
    const uploadsDir = path.join(__dirname, '../../uploads');

    for (const product of products) {
      try {
        // Skip if already migrated
        if (product.image.url && product.image.publicId) {
          console.log(`⏭️  Product "${product.name}" already migrated, skipping...`);
          continue;
        }

        const oldFilename = product.image.filename;
        const localPath = path.join(uploadsDir, oldFilename);

        // Check if local file exists
        if (!fs.existsSync(localPath)) {
          console.log(`⚠️  Image file not found for "${product.name}": ${oldFilename}`);
          errorCount++;
          continue;
        }

        console.log(`📤 Uploading image for "${product.name}"...`);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'cakeraft/products',
          public_id: `product-${product._id}`,
          transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }],
        });

        // Update product with Cloudinary URL and public_id
        product.image = {
          url: result.secure_url,
          publicId: result.public_id,
          originalName: product.image.originalName || oldFilename,
          size: product.image.size || null,
        };

        await product.save();

        console.log(`✅ Migrated "${product.name}"`);
        console.log(`   URL: ${result.secure_url}`);
        console.log(`   Public ID: ${result.public_id}\n`);

        successCount++;
      } catch (error) {
        console.error(`❌ Error migrating "${product.name}":`, error.message, '\n');
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📦 Total: ${products.length}\n`);

    if (successCount > 0) {
      console.log('💡 Tip: You can now safely delete the /backend/uploads folder');
      console.log('   after verifying all images are working correctly.\n');
    }

    console.log('✨ Migration complete!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run migration
migrateImagesToCloudinary();
