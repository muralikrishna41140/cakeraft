import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.spreadsheetId = null; // Will be loaded when needed
    this.sheetName = "Sheet1"; // Default sheet name
  }

  getSpreadsheetId() {
    // Lazy load the spreadsheet ID from environment variable
    if (!this.spreadsheetId) {
      this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || null;
    }
    return this.spreadsheetId;
  }

  async authenticate() {
    try {
      // Check if Google Sheets is configured
      if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
        console.log(
          "⚠️  Google Sheets not configured - export feature will be disabled"
        );
        return false;
      }

      const credentialsPath = path.join(
        __dirname,
        "..",
        "config",
        "google-credentials.json"
      );

      // Check if credentials file exists
      const fs = await import("fs");
      if (!fs.existsSync(credentialsPath)) {
        console.log(
          "⚠️  Google Sheets credentials file not found - export feature will be disabled"
        );
        return false;
      }

      this.auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      this.sheets = google.sheets({ version: "v4", auth: this.auth });

      console.log("✅ Google Sheets authentication successful");
      return true;
    } catch (error) {
      console.error("⚠️  Google Sheets authentication failed:", error.message);
      console.log("   Google Sheets export feature will be disabled");
      return false;
    }
  }

  async createOrGetSpreadsheet(title = "CakeRaft - Revenue Archive") {
    try {
      if (!this.sheets) {
        await this.authenticate();
      }

      const spreadsheetId = this.getSpreadsheetId();

      // If spreadsheet ID is provided, use it
      if (spreadsheetId) {
        try {
          // Verify the spreadsheet exists
          await this.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
          });
          console.log(`✅ Using existing spreadsheet: ${spreadsheetId}`);
          return spreadsheetId;
        } catch (error) {
          console.log("Spreadsheet not found, creating new one...");
        }
      }

      // Create new spreadsheet
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title,
          },
          sheets: [
            {
              properties: {
                title: "Revenue Archive",
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 10,
                },
              },
            },
          ],
        },
      });

      this.spreadsheetId = response.data.spreadsheetId;

      // Add headers
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Revenue Archive!A1:B1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Date", "Total Sales (₹)"]],
        },
      });

      console.log(`✅ Created new spreadsheet: ${this.spreadsheetId}`);
      console.log(
        `🔗 Access it at: https://docs.google.com/spreadsheets/d/${this.spreadsheetId}`
      );

      return this.spreadsheetId;
    } catch (error) {
      console.error("❌ Error creating/getting spreadsheet:", error.message);
      throw error;
    }
  }

  async setupSheetHeaders() {
    try {
      const spreadsheetId = this.getSpreadsheetId();

      if (!spreadsheetId) {
        throw new Error("Google Sheets spreadsheet ID not configured");
      }

      // First, check if Revenue Archive sheet exists, if not use Sheet1
      let sheetName = "Sheet1"; // Default sheet name

      try {
        const spreadsheet = await this.sheets.spreadsheets.get({
          spreadsheetId: spreadsheetId,
        });

        // Check if Revenue Archive exists
        const revenueSheet = spreadsheet.data.sheets.find(
          (sheet) => sheet.properties.title === "Revenue Archive"
        );

        if (revenueSheet) {
          sheetName = "Revenue Archive";
        } else {
          // Use the first available sheet
          sheetName = spreadsheet.data.sheets[0].properties.title;
        }

        console.log(`📋 Using sheet: ${sheetName}`);
      } catch (error) {
        console.log("⚠️ Could not get spreadsheet info, using Sheet1");
      }

      // Check if headers already exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A1:C1`,
      });

      // If no headers or incomplete headers, add them
      if (
        !response.data.values ||
        response.data.values.length === 0 ||
        response.data.values[0].length < 3
      ) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: `${sheetName}!A1:C1`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["Date", "Total Revenue (₹)", "Total Orders"]],
          },
        });
        console.log("✅ Headers added to Google Sheet");
      }

      // Store the sheet name for later use
      this.sheetName = sheetName;
    } catch (error) {
      console.error("❌ Error setting up sheet headers:", error.message);
      // Set default sheet name
      this.sheetName = "Sheet1";
    }
  }

  async exportRevenueData(revenueData) {
    try {
      console.log("🔍 Starting Google Sheets export...");
      console.log("📝 Revenue data to export:", revenueData.length, "days");

      if (!this.sheets) {
        console.log("🔐 Authenticating with Google Sheets...");
        await this.authenticate();
      }

      const spreadsheetId = this.getSpreadsheetId();
      console.log("📊 Spreadsheet ID:", spreadsheetId);

      if (!spreadsheetId) {
        throw new Error("Google Sheets spreadsheet ID not configured");
      }

      // First, ensure the sheet has headers and get the sheet name
      console.log("📋 Setting up sheet headers...");
      await this.setupSheetHeaders();
      console.log("✅ Sheet name:", this.sheetName);

      // Format data for Google Sheets
      const values = revenueData.map((item) => [
        item.date,
        item.totalRevenue,
        item.totalBills || 0,
      ]);

      if (values.length === 0) {
        throw new Error("No revenue data to export");
      }

      console.log("📤 Appending", values.length, "rows to Google Sheets...");

      // Append data to the sheet using the detected sheet name
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: `${this.sheetName}!A:C`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: values,
        },
      });

      console.log(
        `✅ Exported ${values.length} days of revenue data to Google Sheets`
      );

      return {
        success: true,
        exportedRows: values.length,
        spreadsheetId: spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        updatedRange: response.data.updates.updatedRange,
      };
    } catch (error) {
      console.error("❌ Error exporting to Google Sheets:");
      console.error("Error Message:", error.message);
      console.error("Error Code:", error.code);
      console.error("Error Details:", error.response?.data || error);
      throw error;
    }
  }

  async testConnection() {
    try {
      await this.authenticate();
      const spreadsheetId = await this.createOrGetSpreadsheet(
        "Test Spreadsheet"
      );

      // Test write
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: "Sheet1!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Test Connection - " + new Date().toISOString()]],
        },
      });

      return {
        success: true,
        message: "Google Sheets connection successful",
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default new GoogleSheetsService();
