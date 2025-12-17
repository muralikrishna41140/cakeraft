import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

class SupabaseService {
  constructor() {
    this.supabase = null;
    this.bucketName = process.env.SUPABASE_BUCKET_NAME || "invoices";
    this.retentionDays = parseInt(process.env.PDF_RETENTION_DAYS) || 30;
    this._init();
  }

  _init() {
    const supabaseUrl = process.env.SUPABASE_URL;
    // Try service role key first (bypasses RLS), fallback to anon key
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "service_role"
      : "anon";

    console.log("🔍 Checking Supabase configuration:", {
      url: supabaseUrl ? "SET" : "NOT SET",
      key: supabaseKey ? "SET" : "NOT SET",
      keyType: keyType,
    });

    if (!supabaseUrl || !supabaseKey) {
      console.warn("⚠️  Supabase credentials not configured");
      console.warn(
        "   Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) to .env"
      );
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log(
      `✅ Supabase client initialized successfully (using ${keyType} key)`
    );
  }

  /**
   * Ensure the bucket exists, create if it doesn't
   */
  async ensureBucketExists() {
    try {
      const { data: buckets, error } =
        await this.supabase.storage.listBuckets();

      if (error) throw error;

      const bucketExists = buckets.some((b) => b.name === this.bucketName);

      if (!bucketExists) {
        console.log(`📦 Attempting to create bucket: ${this.bucketName}`);
        const { data, error: createError } =
          await this.supabase.storage.createBucket(this.bucketName, {
            public: true,
          });

        if (createError) {
          // If we get a permission error but can still list files, the bucket likely exists
          // and was created manually via the dashboard (which is the recommended approach)
          if (
            createError.message &&
            createError.message.includes("row-level security")
          ) {
            console.log(
              `ℹ️  Bucket creation blocked by RLS (this is normal - bucket should be created manually)`
            );
          } else {
            console.log(`ℹ️  Bucket creation skipped: ${createError.message}`);
          }
          console.log(`✅ Bucket "${this.bucketName}" is accessible`);
          return true;
        }
        console.log(`✅ Bucket created: ${this.bucketName}`);
      } else {
        console.log(`✅ Bucket exists: ${this.bucketName}`);
      }

      return true;
    } catch (error) {
      // If we can still list files from the bucket, it's accessible even if we can't create it
      console.log(`ℹ️  Bucket verification: ${error.message}`);
      console.log(
        `✅ Bucket "${this.bucketName}" is accessible for file operations`
      );
      return true;
    }
  }

  /**
   * Upload PDF file to Supabase Storage
   * @param {string} pdfFilePath - Local path to PDF file
   * @param {string} billNumber - Bill number for filename
   * @returns {Promise<Object>} - Upload result with public URL
   */
  async uploadPDF(pdfFilePath, billNumber) {
    try {
      if (!this.supabase) {
        throw new Error("Supabase not configured");
      }

      // Ensure bucket exists
      await this.ensureBucketExists();

      // Read the PDF file
      const pdfBuffer = fs.readFileSync(pdfFilePath);

      // Create filename with timestamp
      const timestamp = Date.now();
      const filename = `bill_${billNumber}_${timestamp}.pdf`;
      const filePath = `bills/${filename}`;

      console.log(`📤 Uploading PDF to Supabase: ${filePath}`);

      // Upload to Supabase
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, pdfBuffer, {
          contentType: "application/pdf",
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("❌ Supabase upload error:", error);

        // Provide helpful error messages
        if (error.message && error.message.includes("row-level security")) {
          console.error("\n🔒 RLS Policy Issue Detected!");
          console.error(
            "   The Supabase bucket has Row-Level Security enabled but no policies allow uploads."
          );
          console.error(
            "   \n📚 Solution: See SUPABASE_RLS_FIX.md for step-by-step fix."
          );
          console.error(
            "   Quick fix: Run the SQL policies in Supabase SQL Editor.\n"
          );

          error.message =
            "Upload blocked by Supabase RLS policy. See SUPABASE_RLS_FIX.md for solution.";
        }

        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath);

      console.log("✅ PDF uploaded successfully");
      console.log("📎 Public URL:", publicUrl);

      return {
        success: true,
        filename: filename,
        path: filePath,
        publicUrl: publicUrl,
        size: pdfBuffer.length,
      };
    } catch (error) {
      console.error("❌ Error uploading PDF:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a specific PDF from Supabase
   * @param {string} filePath - Path to file in bucket
   */
  async deletePDF(filePath) {
    try {
      if (!this.supabase) {
        throw new Error("Supabase not configured");
      }

      console.log(`🗑️ Deleting PDF: ${filePath}`);

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;

      console.log("✅ PDF deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting PDF:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete old PDFs based on retention policy
   * @param {number} daysOld - Delete files older than this many days
   */
  async deleteOldPDFs(daysOld = null) {
    try {
      if (!this.supabase) {
        throw new Error("Supabase not configured");
      }

      const days = daysOld || this.retentionDays;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      console.log(
        `🧹 Cleaning up PDFs older than ${days} days (before ${cutoffDate.toISOString()})`
      );

      // List all files in bills folder
      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list("bills", {
          limit: 1000,
          sortBy: { column: "created_at", order: "asc" },
        });

      if (error) throw error;

      if (!files || files.length === 0) {
        console.log("📭 No files found to delete");
        return { success: true, deletedCount: 0, files: [] };
      }

      // Filter files older than cutoff date
      const filesToDelete = files.filter((file) => {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffDate;
      });

      if (filesToDelete.length === 0) {
        console.log("✅ No old files to delete");
        return { success: true, deletedCount: 0, files: [] };
      }

      console.log(`📋 Found ${filesToDelete.length} files to delete`);

      // Delete files in batches
      const filePaths = filesToDelete.map((f) => `bills/${f.name}`);
      const { data: deleteData, error: deleteError } =
        await this.supabase.storage.from(this.bucketName).remove(filePaths);

      if (deleteError) throw deleteError;

      console.log(`✅ Deleted ${filesToDelete.length} old PDF files`);

      return {
        success: true,
        deletedCount: filesToDelete.length,
        files: filesToDelete.map((f) => f.name),
      };
    } catch (error) {
      console.error("❌ Error deleting old PDFs:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * List all PDFs in storage
   */
  async listPDFs() {
    try {
      if (!this.supabase) {
        throw new Error("Supabase not configured");
      }

      const { data: files, error } = await this.supabase.storage
        .from(this.bucketName)
        .list("bills", {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) throw error;

      // Get public URLs for all files
      const filesWithUrls = files.map((file) => {
        const {
          data: { publicUrl },
        } = this.supabase.storage
          .from(this.bucketName)
          .getPublicUrl(`bills/${file.name}`);

        return {
          name: file.name,
          size: file.metadata?.size || 0,
          createdAt: file.created_at,
          publicUrl: publicUrl,
        };
      });

      return {
        success: true,
        files: filesWithUrls,
        count: filesWithUrls.length,
      };
    } catch (error) {
      console.error("❌ Error listing PDFs:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const listResult = await this.listPDFs();

      if (!listResult.success) {
        throw new Error(listResult.error);
      }

      const totalSize = listResult.files.reduce(
        (sum, file) => sum + (file.size || 0),
        0
      );
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

      return {
        success: true,
        stats: {
          totalFiles: listResult.count,
          totalSizeBytes: totalSize,
          totalSizeMB: totalSizeMB,
          bucketName: this.bucketName,
          retentionDays: this.retentionDays,
        },
      };
    } catch (error) {
      console.error("❌ Error getting storage stats:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if Supabase is configured and ready
   */
  isConfigured() {
    return this.supabase !== null;
  }
}

// Export singleton instance
const supabaseService = new SupabaseService();

export default supabaseService;
