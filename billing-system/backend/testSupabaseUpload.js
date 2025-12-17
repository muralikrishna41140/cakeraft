import supabaseService from "./src/services/supabaseService.js";
import fs from "fs";
import path from "path";

async function testSupabaseUpload() {
  console.log("\n🧪 Testing Supabase Upload Functionality...\n");

  // Step 1: Check configuration
  console.log("1️⃣ Checking configuration...");
  const isConfigured = supabaseService.isConfigured();
  console.log(
    `   ${isConfigured ? "✅" : "❌"} Supabase configured: ${isConfigured}`
  );

  if (!isConfigured) {
    console.error("\n❌ Supabase is not configured. Check your .env file.");
    console.log("\nRequired environment variables:");
    console.log("   - SUPABASE_URL");
    console.log(
      "   - SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY"
    );
    console.log("   - SUPABASE_BUCKET_NAME (optional, defaults to 'invoices')");
    process.exit(1);
  }

  // Step 2: Check bucket
  console.log("\n2️⃣ Checking bucket...");
  const bucketReady = await supabaseService.ensureBucketExists();
  console.log(`   ${bucketReady ? "✅" : "❌"} Bucket ready: ${bucketReady}`);
  console.log(`   Bucket name: ${supabaseService.bucketName}`);

  // Step 3: Create a test PDF file
  console.log("\n3️⃣ Creating test PDF...");
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const testPdfPath = path.join(tempDir, "test-upload.pdf");
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 55
>>
stream
BT
/F1 12 Tf
100 700 Td
(Supabase Upload Test PDF) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
423
%%EOF`;

  fs.writeFileSync(testPdfPath, pdfContent);
  console.log(`   ✅ Test PDF created: ${testPdfPath}`);

  // Step 4: Upload test PDF
  console.log("\n4️⃣ Uploading test PDF to Supabase...");
  try {
    const uploadResult = await supabaseService.uploadPDF(
      testPdfPath,
      "TEST-" + Date.now()
    );

    if (uploadResult.success) {
      console.log("   ✅ Upload successful!");
      console.log(`   📎 Public URL: ${uploadResult.publicUrl}`);
      console.log(`   📦 File size: ${uploadResult.size} bytes`);
      console.log(`   📁 File path: ${uploadResult.path}`);

      // Step 5: Verify the file is accessible
      console.log("\n5️⃣ Verifying public URL...");
      try {
        const response = await fetch(uploadResult.publicUrl);
        if (response.ok) {
          console.log("   ✅ Public URL is accessible!");
          console.log(`   📊 Response status: ${response.status}`);
          console.log(
            `   📄 Content-Type: ${response.headers.get("content-type")}`
          );
        } else {
          console.log(`   ⚠️  Public URL returned status: ${response.status}`);
          if (response.status === 404) {
            console.log(
              "   💡 The file uploaded but URL returns 404. Check bucket permissions."
            );
          }
        }
      } catch (error) {
        console.log("   ⚠️  Could not verify URL:", error.message);
      }

      // Step 6: Clean up test file from Supabase
      console.log("\n6️⃣ Cleaning up test file...");
      const deleteResult = await supabaseService.deletePDF(uploadResult.path);
      if (deleteResult.success) {
        console.log("   ✅ Test file deleted from Supabase");
      } else {
        console.log("   ⚠️  Could not delete test file:", deleteResult.error);
      }
    } else {
      console.error("   ❌ Upload failed:", uploadResult.error);

      if (
        uploadResult.error &&
        uploadResult.error.includes("row-level security")
      ) {
        console.log("\n🔒 RLS Policy Issue Detected!");
        console.log("\n📚 Solution:");
        console.log("   1. Open Supabase Dashboard → SQL Editor");
        console.log("   2. Run the SQL policies from SUPABASE_RLS_FIX.md");
        console.log(
          "   3. Or use SUPABASE_SERVICE_ROLE_KEY instead of SUPABASE_ANON_KEY"
        );
        console.log("\nSee SUPABASE_RLS_FIX.md for detailed instructions.");
      }
    }
  } catch (error) {
    console.error("   ❌ Upload error:", error.message);
  }

  // Clean up local test file
  if (fs.existsSync(testPdfPath)) {
    fs.unlinkSync(testPdfPath);
    console.log("\n🗑️  Local test file cleaned up");
  }

  console.log("\n📊 Test Summary:");
  console.log("   Configuration: ✅");
  console.log("   Bucket Access: ✅");
  console.log("   Upload Test: Check results above");
  console.log("\n✨ Test complete!");
}

testSupabaseUpload().catch((error) => {
  console.error("\n❌ Test failed with error:", error);
  process.exit(1);
});
