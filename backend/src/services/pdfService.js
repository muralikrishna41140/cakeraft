import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFGenerationService {
  constructor() {
    // Ensure temp directory exists
    this.tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    // CakeRaft logo URL
    this.logoUrl =
      "https://res.cloudinary.com/du4jhwpak/image/upload/v1765107523/WhatsApp_Image_2025-12-04_at_15.13.04_80e34f88_owuux1.jpg";
    this.logoPath = path.join(this.tempDir, "cakeraft-logo.jpg");
  }

  /**
   * Download logo if not exists
   */
  async ensureLogo() {
    if (fs.existsSync(this.logoPath)) {
      return this.logoPath;
    }

    try {
      const response = await axios.get(this.logoUrl, {
        responseType: "arraybuffer",
      });
      fs.writeFileSync(this.logoPath, response.data);
      return this.logoPath;
    } catch (error) {
      console.error("Error downloading logo:", error);
      return null;
    }
  }

  /**
   * Generate a professional bill PDF
   * @param {Object} billData - The bill data from MongoDB
   * @returns {Promise<string>} - Path to generated PDF file
   */
  async generateBillPDF(billData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure logo is downloaded
        await this.ensureLogo();

        // Create a new PDF document
        const doc = new PDFDocument({
          size: "A4",
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        // Generate filename with timestamp
        const fileName = `bill_${
          billData.billNumber || billData._id
        }_${Date.now()}.pdf`;
        const filePath = path.join(this.tempDir, fileName);

        // Pipe PDF to file
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Build the PDF content
        this.buildPDFContent(doc, billData);

        // Finalize the PDF
        doc.end();

        // Wait for stream to finish
        stream.on("finish", () => {
          resolve(filePath);
        });

        stream.on("error", (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Build the PDF content with professional styling
   * @param {PDFDocument} doc - PDF document instance
   * @param {Object} billData - Bill data
   */
  buildPDFContent(doc, billData) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;

    // Header with business info
    this.addHeader(doc, billData);

    // Bill details section
    doc.moveDown(2);
    this.addBillDetails(doc, billData);

    // Customer information
    doc.moveDown();
    this.addCustomerInfo(doc, billData);

    // Items table
    doc.moveDown(2);
    this.addItemsTable(doc, billData);

    // Totals section
    doc.moveDown(2);
    this.addTotalsSection(doc, billData);

    // Footer
    this.addFooter(doc, billData);
  }

  /**
   * Add header section with business branding
   */
  addHeader(doc, billData) {
    const pageWidth = doc.page.width;

    // Add decorative header background
    doc.rect(0, 0, pageWidth, 160).fillAndStroke("#fff5f7", "#fff5f7");

    // Add CakeRaft Logo Image
    if (fs.existsSync(this.logoPath)) {
      try {
        doc.image(this.logoPath, 50, 45, {
          width: 70,
          height: 70,
          fit: [70, 70],
          align: "center",
          valign: "center",
        });

        // Add circular border effect using path
        doc.circle(85, 80, 37).lineWidth(3).strokeColor("#ec4899").stroke();
      } catch (error) {
        console.error("Error adding logo to PDF:", error);
        // Fallback to emoji if logo fails
        doc.fontSize(50).fillColor("#ec4899").text("🎂", 55, 50);
      }
    } else {
      // Fallback to emoji if logo doesn't exist
      doc.fontSize(50).fillColor("#ec4899").text("🎂", 55, 50);
    }

    // Logo and Business name
    doc
      .fontSize(32)
      .fillColor("#ec4899")
      .font("Helvetica-Bold")
      .text("CakeRaft", 135, 50, { align: "left" });

    doc
      .fontSize(12)
      .fillColor("#666")
      .font("Helvetica")
      .text("Artisan Cake Creations", 135, 88);

    doc
      .fontSize(10)
      .fillColor("#888")
      .text("Made with Love & Passion 🎂", 135, 108);

    // Invoice title box - right side
    doc.rect(pageWidth - 200, 50, 150, 75).fillAndStroke("#ec4899", "#ec4899");

    doc
      .fontSize(22)
      .fillColor("#fff")
      .font("Helvetica-Bold")
      .text("INVOICE", pageWidth - 180, 60, { width: 110, align: "center" });

    doc
      .fontSize(10)
      .fillColor("#fff")
      .font("Helvetica")
      .text(
        `Bill #: ${billData.billNumber || billData._id}`,
        pageWidth - 195,
        95,
        { width: 140, align: "center" }
      );

    // Date below invoice box
    const date = new Date(billData.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc
      .fontSize(9)
      .fillColor("#666")
      .text(`Date: ${date}`, pageWidth - 200, 133, {
        width: 150,
        align: "center",
      });

    // Decorative border line
    doc
      .strokeColor("#ec4899")
      .lineWidth(3)
      .moveTo(50, 170)
      .lineTo(pageWidth - 50, 170)
      .stroke();

    // Reset position
    doc.y = 190;
  }

  /**
   * Add bill details section
   */
  addBillDetails(doc, billData) {
    const pageWidth = doc.page.width;
    const detailsY = doc.y;

    // Bill info box on the right side
    doc
      .rect(pageWidth - 250, detailsY, 200, 65)
      .fillAndStroke("#f8f9fa", "#e9ecef");

    doc
      .fontSize(12)
      .fillColor("#ec4899")
      .font("Helvetica-Bold")
      .text("BILL INFORMATION", pageWidth - 240, detailsY + 10);

    const billDate = new Date(billData.createdAt);
    const time = billDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    doc
      .fontSize(9)
      .fillColor("#666")
      .font("Helvetica")
      .text(`Created: ${time}`, pageWidth - 240, detailsY + 32);

    // Add payment status or note
    doc
      .fontSize(9)
      .fillColor("#16a34a")
      .font("Helvetica-Bold")
      .text("✓ Payment Received", pageWidth - 240, detailsY + 48);

    doc.y = detailsY;
  }

  /**
   * Add customer information
   */
  addCustomerInfo(doc, billData) {
    const customerInfo = billData.customerInfo || {};
    const boxY = doc.y;

    // Customer info box with border
    doc.rect(50, boxY, 250, 65).fillAndStroke("#f8f9fa", "#e9ecef");

    doc
      .fontSize(12)
      .fillColor("#ec4899")
      .font("Helvetica-Bold")
      .text("BILL TO", 60, boxY + 10);

    doc
      .fontSize(11)
      .fillColor("#333")
      .font("Helvetica-Bold")
      .text(`${customerInfo.name || "N/A"}`, 60, boxY + 30);

    doc
      .fontSize(10)
      .fillColor("#666")
      .font("Helvetica")
      .text(`📞 ${customerInfo.phone || "N/A"}`, 60, boxY + 48);

    doc.y = boxY + 80;
  }

  /**
   * Add items table with proper formatting
   */
  addItemsTable(doc, billData) {
    const tableTop = doc.y + 15;
    const tableLeft = 50;
    const tableWidth = doc.page.width - 100;

    // Table header
    doc
      .fontSize(13)
      .fillColor("#333")
      .font("Helvetica-Bold")
      .text("ORDER DETAILS", 50, tableTop - 25);

    // Table headers
    const headerY = tableTop + 5;

    // Header background with gradient effect
    doc
      .rect(tableLeft, headerY - 5, tableWidth, 25)
      .fillAndStroke("#ec4899", "#ec4899");

    doc.fontSize(10).fillColor("#fff").font("Helvetica-Bold");

    // Header text
    doc.text("ITEM", tableLeft + 8, headerY + 5);
    doc.text("QTY", tableLeft + 260, headerY + 5);
    doc.text("PRICE", tableLeft + 310, headerY + 5);
    doc.text("DISCOUNT", tableLeft + 380, headerY + 5);
    doc.text("TOTAL", tableLeft + 465, headerY + 5);

    // Table rows
    let currentY = headerY + 30;
    doc.font("Helvetica");

    billData.items?.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? "#fef2f2" : "#fff";
      const rowHeight = 28;

      // Row background
      doc.rect(tableLeft, currentY - 5, tableWidth, rowHeight).fill(rowBg);

      // Add subtle border
      doc
        .strokeColor("#f3f4f6")
        .lineWidth(0.5)
        .rect(tableLeft, currentY - 5, tableWidth, rowHeight)
        .stroke();

      // Item details
      const itemTotal = item.price * item.quantity - (item.discount || 0);

      doc
        .fontSize(9)
        .fillColor("#333")
        .font("Helvetica")
        .text(item.name || "Unknown Item", tableLeft + 8, currentY + 2, {
          width: 240,
          ellipsis: true,
        });

      doc
        .font("Helvetica-Bold")
        .text(item.quantity?.toString() || "0", tableLeft + 265, currentY + 2);

      doc
        .font("Helvetica")
        .text(
          `₹${item.price?.toFixed(2) || "0.00"}`,
          tableLeft + 310,
          currentY + 2
        );

      if (item.discount && item.discount > 0) {
        doc
          .fillColor("#16a34a")
          .text(`-₹${item.discount.toFixed(2)}`, tableLeft + 380, currentY + 2);
      } else {
        doc.fillColor("#666").text("₹0.00", tableLeft + 380, currentY + 2);
      }

      doc
        .fillColor("#333")
        .font("Helvetica-Bold")
        .text(`₹${itemTotal.toFixed(2)}`, tableLeft + 460, currentY + 2);

      currentY += rowHeight;
    });

    // Bottom border of table
    doc
      .strokeColor("#ec4899")
      .lineWidth(2)
      .moveTo(tableLeft, currentY)
      .lineTo(tableLeft + tableWidth, currentY)
      .stroke();

    doc.y = currentY + 15;
  }

  /**
   * Add totals section with proper calculations
   */
  addTotalsSection(doc, billData) {
    const rightAlign = doc.page.width - 220;
    const boxWidth = 190;
    const startY = doc.y;

    // Calculate box height based on whether there's a discount
    const boxHeight =
      billData.totalDiscount && billData.totalDiscount > 0 ? 110 : 80;

    // Background box for totals with border
    doc
      .rect(rightAlign - 10, startY, boxWidth, boxHeight)
      .fillAndStroke("#fff5f7", "#ec4899");

    let currentY = startY + 15;

    // Subtotal
    doc
      .fontSize(11)
      .fillColor("#666")
      .font("Helvetica")
      .text("Subtotal:", rightAlign, currentY, { width: 90 });
    doc
      .font("Helvetica-Bold")
      .text(
        `₹${(billData.subtotal || 0).toFixed(2)}`,
        rightAlign + 90,
        currentY,
        { width: 80, align: "right" }
      );

    currentY += 25;

    // Discount
    if (billData.totalDiscount && billData.totalDiscount > 0) {
      doc
        .fontSize(11)
        .fillColor("#16a34a")
        .font("Helvetica")
        .text("Discount:", rightAlign, currentY, { width: 90 });
      doc
        .font("Helvetica-Bold")
        .text(
          `-₹${billData.totalDiscount.toFixed(2)}`,
          rightAlign + 90,
          currentY,
          { width: 80, align: "right" }
        );

      currentY += 25;
    }

    // Separator line
    doc
      .strokeColor("#ec4899")
      .lineWidth(1)
      .moveTo(rightAlign, currentY - 5)
      .lineTo(rightAlign + boxWidth - 20, currentY - 5)
      .stroke();

    // Total with highlighted background
    doc
      .rect(rightAlign - 10, currentY, boxWidth, 35)
      .fillAndStroke("#ec4899", "#ec4899");

    doc
      .fontSize(14)
      .fillColor("#fff")
      .font("Helvetica-Bold")
      .text("TOTAL:", rightAlign, currentY + 10, { width: 90 });
    doc
      .fontSize(16)
      .text(
        `₹${(billData.total || 0).toFixed(2)}`,
        rightAlign + 90,
        currentY + 10,
        { width: 80, align: "right" }
      );

    doc.y = currentY + 50;
  }

  /**
   * Add footer with business information
   */
  addFooter(doc, billData) {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    const footerY = pageHeight - 120;

    // Decorative line above footer
    doc
      .strokeColor("#ec4899")
      .lineWidth(2)
      .moveTo(50, footerY - 15)
      .lineTo(pageWidth - 50, footerY - 15)
      .stroke();

    // Footer background
    doc.rect(0, footerY, pageWidth, 120).fillAndStroke("#fff5f7", "#fff5f7");

    // Thank you message with icon
    doc
      .fontSize(14)
      .fillColor("#ec4899")
      .font("Helvetica-Bold")
      .text("🎂 Thank You for Choosing CakeRaft!", 50, footerY + 15, {
        align: "center",
        width: pageWidth - 100,
      });

    doc
      .fontSize(10)
      .fillColor("#666")
      .font("Helvetica")
      .text(
        "Artisan Cakes Crafted with Passion | Made to Order | Premium Quality Guaranteed",
        50,
        footerY + 40,
        { align: "center", width: pageWidth - 100 }
      );

    // Contact information
    doc
      .fontSize(9)
      .fillColor("#888")
      .text(
        "For questions about your order, please reach out to us at your convenience",
        50,
        footerY + 60,
        { align: "center", width: pageWidth - 100 }
      );

    // Branding tagline at bottom
    doc
      .fontSize(8)
      .fillColor("#ec4899")
      .font("Helvetica-Bold")
      .text("CakeRaft - Where Every Cake Tells a Story 💝", 50, footerY + 85, {
        align: "center",
        width: pageWidth - 100,
      });
  }

  /**
   * Clean up temporary PDF files
   * @param {string} filePath - Path to PDF file to delete
   */
  async cleanupPDF(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Error cleaning up PDF:", error);
    }
  }

  /**
   * Clean up old temporary files (older than 1 hour)
   */
  async cleanupOldPDFs() {
    try {
      const files = fs.readdirSync(this.tempDir);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < oneHourAgo) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error("Error cleaning up old PDFs:", error);
    }
  }
}

// Export singleton instance
const pdfService = new PDFGenerationService();

// Clean up old files on service start
pdfService.cleanupOldPDFs();

// Set up periodic cleanup (every hour)
setInterval(() => {
  pdfService.cleanupOldPDFs();
}, 60 * 60 * 1000);

export default pdfService;
