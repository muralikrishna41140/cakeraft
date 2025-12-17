import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || "invoices";

async function deleteAllBills() {
  try {
    console.log("🚀 Starting Supabase bill deletion...");
    console.log("📦 Bucket:", bucketName);
    console.log("🔗 URL:", supabaseUrl);
    console.log("");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials in .env file");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // List all files in the bills folder
    console.log("📋 Fetching list of all PDF files...");
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list("bills", {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log("✅ No bills found in Supabase storage");
      console.log("📭 Storage is already empty!");
      return;
    }

    console.log(`📊 Found ${files.length} PDF files to delete`);
    console.log("");

    // Show sample files
    console.log("📄 Sample files:");
    files.slice(0, 5).forEach((file, index) => {
      console.log(
        `   ${index + 1}. ${file.name} (${new Date(
          file.created_at
        ).toLocaleString()})`
      );
    });
    if (files.length > 5) {
      console.log(`   ... and ${files.length - 5} more files`);
    }
    console.log("");

    // Delete all files
    const filePaths = files.map((f) => `bills/${f.name}`);

    console.log("🗑️  Deleting all PDF files...");
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);

    if (deleteError) {
      throw new Error(`Failed to delete files: ${deleteError.message}`);
    }

    console.log("");
    console.log("✅ SUCCESS! All bills deleted from Supabase");
    console.log(`🗑️  Total deleted: ${files.length} PDF files`);
    console.log("");

    // Verify deletion
    const { data: remainingFiles, error: verifyError } = await supabase.storage
      .from(bucketName)
      .list("bills", { limit: 10 });

    if (!verifyError) {
      const remaining = remainingFiles?.length || 0;
      if (remaining === 0) {
        console.log("✅ Verification: Storage is now empty!");
      } else {
        console.log(`⚠️  Warning: ${remaining} files still remain`);
      }
    }

    console.log("");
    console.log("📊 Summary:");
    console.log(`   • Bucket: ${bucketName}`);
    console.log(`   • Deleted: ${files.length} files`);
    console.log(
      `   • Storage freed: ~${(files.length * 0.5).toFixed(2)} MB (estimated)`
    );
    console.log("");
    console.log("🎉 Done!");
  } catch (error) {
    console.error("");
    console.error("❌ ERROR:", error.message);
    console.error("");
    console.error("💡 Troubleshooting:");
    console.error("   1. Check SUPABASE_URL in .env file");
    console.error("   2. Check SUPABASE_ANON_KEY in .env file");
    console.error("   3. Verify bucket name is 'invoices'");
    console.error("   4. Check Supabase RLS policies allow deletion");
    console.error("");
    console.error("Full error:", error);
    process.exit(1);
  }
}

// Run the deletion
console.log("");
console.log("═══════════════════════════════════════════");
console.log("  🗑️  DELETE ALL BILLS FROM SUPABASE  🗑️");
console.log("═══════════════════════════════════════════");
console.log("");

deleteAllBills();
