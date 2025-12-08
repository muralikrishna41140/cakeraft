    import supabaseService from "./src/services/supabaseService.js";

async function testSupabase() {
  console.log("\n🧪 Testing Supabase Integration...\n");

  // Test 1: Check configuration
  console.log("1️⃣ Checking configuration...");
  const isConfigured = supabaseService.isConfigured();
  console.log(
    `   ${isConfigured ? "✅" : "❌"} Supabase configured: ${isConfigured}`
  );

  if (!isConfigured) {
    console.error("❌ Supabase is not configured. Check your .env file.");
    process.exit(1);
  }

  // Test 2: Check bucket exists
  console.log("\n2️⃣ Checking bucket...");
  const bucketReady = await supabaseService.ensureBucketExists();
  console.log(`   ${bucketReady ? "✅" : "❌"} Bucket ready: ${bucketReady}`);
  console.log(`   Bucket name: ${supabaseService.bucketName}`);

  // Test 3: Get storage stats
  console.log("\n3️⃣ Getting storage stats...");
  const stats = await supabaseService.getStorageStats();

  if (stats.success) {
    console.log("   ✅ Storage stats retrieved:");
    console.log(`      Total files: ${stats.stats.totalFiles}`);
    console.log(`      Total size: ${stats.stats.totalSizeMB} MB`);
    console.log(`      Retention: ${stats.stats.retentionDays} days`);
  } else {
    console.log(`   ❌ Failed to get stats: ${stats.error}`);
  }

  // Test 4: List files
  console.log("\n4️⃣ Listing files...");
  const fileList = await supabaseService.listPDFs();

  if (fileList.success) {
    console.log(`   ✅ Found ${fileList.count} files`);
    if (fileList.count > 0) {
      console.log("\n   Recent files:");
      fileList.files.slice(0, 3).forEach((file, i) => {
        console.log(`   ${i + 1}. ${file.name}`);
        console.log(`      Size: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(
          `      Created: ${new Date(file.createdAt).toLocaleString()}`
        );
        console.log(`      URL: ${file.publicUrl}\n`);
      });
    } else {
      console.log(
        "   ℹ️  No files uploaded yet (this is normal for a new bucket)"
      );
    }
  } else {
    console.log(`   ❌ Failed to list files: ${fileList.error}`);
  }

  // Summary
  console.log("\n📊 Test Summary:");
  console.log("   ✅ Configuration: OK");
  console.log(
    `   ${bucketReady ? "✅" : "❌"} Bucket access: ${
      bucketReady ? "OK" : "FAILED"
    }`
  );
  console.log(
    `   ${stats.success ? "✅" : "❌"} Storage stats: ${
      stats.success ? "OK" : "FAILED"
    }`
  );
  console.log(
    `   ${fileList.success ? "✅" : "❌"} File listing: ${
      fileList.success ? "OK" : "FAILED"
    }`
  );

  if (bucketReady && stats.success && fileList.success) {
    console.log("\n🎉 All tests passed! Supabase is ready for bill uploads.\n");
    console.log("💡 Next steps:");
    console.log("   1. Generate a test bill from the frontend");
    console.log("   2. Check backend console for upload confirmation");
    console.log("   3. Verify PDF appears in Supabase dashboard");
    console.log("   4. Test WhatsApp link with the PDF URL\n");
  } else {
    console.log("\n⚠️  Some tests failed. Check the errors above.\n");
  }
}

// Run tests
testSupabase().catch((error) => {
  console.error("\n❌ Test failed with error:", error.message);
  console.error(error);
  process.exit(1);
});
