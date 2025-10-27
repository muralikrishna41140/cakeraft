import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFGenerationService {
  constructor() {
    // Ensure temp directory exists
    this.tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate a professional bill PDF
   * @param {Object} billData - The bill data from MongoDB
   * @returns {Promise<string>} - Path to generated PDF file
   */
  async generateBillPDF(billData) {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          }
        });

        // Generate filename with timestamp
        const fileName = `bill_${billData.billNumber || billData._id}_${Date.now()}.pdf`;
        const filePath = path.join(this.tempDir, fileName);

        // Pipe PDF to file
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Build the PDF content
        this.buildPDFContent(doc, billData);

        // Finalize the PDF
        doc.end();

        // Wait for stream to finish
        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (err) => {
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
    
    // Business name and branding
    doc.fontSize(24)
       .fillColor('#ec4899')
       .text('🎂 CakeRaft', 50, 50, { align: 'left' });

    doc.fontSize(12)
       .fillColor('#666')
       .text('Artisan Cake Creations', 50, 80);

    // Invoice title and number
    doc.fontSize(18)
       .fillColor('#333')
       .text('INVOICE', pageWidth - 150, 50, { align: 'right' });

    doc.fontSize(12)
       .fillColor('#666')
       .text(`Bill #: ${billData.billNumber || billData._id}`, pageWidth - 150, 75, { align: 'right' });

    // Date
    const date = new Date(billData.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Date: ${date}`, pageWidth - 150, 95, { align: 'right' });

    // Horizontal line
    doc.strokeColor('#ec4899')
       .lineWidth(2)
       .moveTo(50, 130)
       .lineTo(pageWidth - 50, 130)
       .stroke();
  }

  /**
   * Add bill details section
   */
  addBillDetails(doc, billData) {
    doc.fontSize(14)
       .fillColor('#333')
       .text('Bill Details', 50, doc.y);

    doc.fontSize(10)
       .fillColor('#666')
       .text(`Created: ${new Date(billData.createdAt).toLocaleString('en-IN')}`, 50, doc.y + 5);
  }

  /**
   * Add customer information
   */
  addCustomerInfo(doc, billData) {
    doc.fontSize(14)
       .fillColor('#333')
       .text('Customer Information', 50, doc.y);

    const customerInfo = billData.customerInfo || {};
    
    doc.fontSize(11)
       .fillColor('#444')
       .text(`Name: ${customerInfo.name || 'N/A'}`, 50, doc.y + 10);

    doc.text(`Phone: ${customerInfo.phone || 'N/A'}`, 50, doc.y + 5);
  }

  /**
   * Add items table with proper formatting
   */
  addItemsTable(doc, billData) {
    const tableTop = doc.y + 10;
    const tableLeft = 50;
    const tableWidth = doc.page.width - 100;

    // Table header
    doc.fontSize(12)
       .fillColor('#333')
       .text('Order Details', 50, tableTop - 20);

    // Table headers
    const headerY = tableTop + 10;
    doc.fontSize(10)
       .fillColor('#fff');

    // Header background
    doc.rect(tableLeft, headerY - 5, tableWidth, 20)
       .fillAndStroke('#ec4899', '#ec4899');

    // Header text
    doc.text('Item', tableLeft + 5, headerY);
    doc.text('Qty', tableLeft + 250, headerY);
    doc.text('Price', tableLeft + 300, headerY);
    doc.text('Discount', tableLeft + 370, headerY);
    doc.text('Total', tableLeft + 450, headerY);

    // Table rows
    let currentY = headerY + 25;
    doc.fillColor('#333');

    billData.items?.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? '#f9f9f9' : '#fff';
      
      // Row background
      doc.rect(tableLeft, currentY - 5, tableWidth, 20)
         .fill(rowBg);

      // Item details
      const itemTotal = (item.price * item.quantity) - (item.discount || 0);
      
      doc.fillColor('#333')
         .text(item.name || 'Unknown Item', tableLeft + 5, currentY);
      doc.text(item.quantity?.toString() || '0', tableLeft + 250, currentY);
      doc.text(`₹${item.price?.toFixed(2) || '0.00'}`, tableLeft + 300, currentY);
      doc.text(`₹${(item.discount || 0).toFixed(2)}`, tableLeft + 370, currentY);
      doc.text(`₹${itemTotal.toFixed(2)}`, tableLeft + 450, currentY);

      currentY += 25;
    });

    doc.y = currentY + 10;
  }

  /**
   * Add totals section with proper calculations
   */
  addTotalsSection(doc, billData) {
    const rightAlign = doc.page.width - 200;
    
    // Background box for totals
    doc.rect(rightAlign - 20, doc.y - 10, 170, 80)
       .fillAndStroke('#f8f9fa', '#e9ecef');

    doc.fontSize(11)
       .fillColor('#666');

    // Subtotal
    doc.text('Subtotal:', rightAlign, doc.y, { width: 80 });
    doc.text(`₹${(billData.subtotal || 0).toFixed(2)}`, rightAlign + 80, doc.y, { align: 'right' });
    
    doc.moveDown(0.5);

    // Discount
    if (billData.totalDiscount && billData.totalDiscount > 0) {
      doc.fillColor('#16a34a')
         .text('Discount:', rightAlign, doc.y, { width: 80 });
      doc.text(`-₹${billData.totalDiscount.toFixed(2)}`, rightAlign + 80, doc.y, { align: 'right' });
      doc.moveDown(0.5);
    }

    // Total
    doc.fontSize(14)
       .fillColor('#ec4899')
       .text('Total:', rightAlign, doc.y, { width: 80 });
    doc.text(`₹${(billData.total || 0).toFixed(2)}`, rightAlign + 80, doc.y, { align: 'right' });
  }

  /**
   * Add footer with business information
   */
  addFooter(doc, billData) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;

    // Move to footer position
    doc.y = footerY;

    // Thank you message
    doc.fontSize(12)
       .fillColor('#ec4899')
       .text('Thank you for choosing CakeRaft! 🎂', 50, footerY, { align: 'center' });

    doc.fontSize(10)
       .fillColor('#666')
       .text('Artisan cakes crafted with passion | Made to order | Premium quality guaranteed', 50, footerY + 20, { align: 'center' });

    // Contact information
    doc.text('For questions about your order, contact us at your convenience', 50, footerY + 40, { align: 'center' });

    // Horizontal line above footer
    doc.strokeColor('#ec4899')
       .lineWidth(1)
       .moveTo(50, footerY - 20)
       .lineTo(doc.page.width - 50, footerY - 20)
       .stroke();
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
      console.error('Error cleaning up PDF:', error);
    }
  }

  /**
   * Clean up old temporary files (older than 1 hour)
   */
  async cleanupOldPDFs() {
    try {
      const files = fs.readdirSync(this.tempDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < oneHourAgo) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error cleaning up old PDFs:', error);
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