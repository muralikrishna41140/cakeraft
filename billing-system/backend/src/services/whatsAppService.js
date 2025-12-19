import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

class WhatsAppService {
  constructor() {
    this.initialized = false;
    this.apiToken = null;
    this.phoneNumberId = null;
    this.baseUrl = "https://graph.facebook.com/v18.0";
    this.testMode = process.env.WHATSAPP_TEST_MODE === "true";
  }

  // Lazy initialization to ensure environment variables are loaded
  _init() {
    if (!this.initialized) {
      this.apiToken = process.env.WHATSAPP_API_TOKEN;
      this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      this.initialized = true;

      if (!this.apiToken || !this.phoneNumberId) {
        console.warn(
          "⚠️ WhatsApp API credentials not configured. PDF sending will be disabled."
        );
      } else {
        console.log("✅ WhatsApp API credentials loaded successfully.");
      }
    }
  }

  /**
   * Validate phone number format
   * @param {string} phoneNumber - Phone number to validate
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      cleaned = "91" + cleaned;
    }

    // Ensure it starts with country code
    if (!cleaned.startsWith("91") && cleaned.length === 12) {
      cleaned = "91" + cleaned.slice(-10);
    }

    return cleaned;
  }

  /**
   * Upload PDF file to WhatsApp servers
   * @param {string} filePath - Path to PDF file
   * @returns {Promise<string>} - Media ID from WhatsApp
   */
  async uploadPDFToWhatsApp(filePath) {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        throw new Error("WhatsApp API credentials not configured");
      }

      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));
      form.append("type", "application/pdf");
      form.append("messaging_product", "whatsapp");

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/media`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      if (response.data && response.data.id) {
        return response.data.id;
      } else {
        throw new Error(
          "Failed to upload PDF to WhatsApp: No media ID returned"
        );
      }
    } catch (error) {
      console.error(
        "Error uploading PDF to WhatsApp:",
        error.response?.data || error.message
      );

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error(
          "WhatsApp API token has expired. Please update your access token."
        );
      } else if (error.response?.status === 400) {
        throw new Error(
          "WhatsApp API error: Invalid request or phone number format."
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "WhatsApp API access denied. Check your permissions and phone number verification."
        );
      }

      throw new Error(
        `WhatsApp upload failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Send PDF document via WhatsApp
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} mediaId - WhatsApp media ID from upload
   * @param {string} caption - Message caption
   * @param {string} filename - Original filename for the document
   * @returns {Promise<Object>} - WhatsApp API response
   */
  async sendPDFMessage(
    phoneNumber,
    mediaId,
    caption = "",
    filename = "bill.pdf"
  ) {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        throw new Error("WhatsApp API credentials not configured");
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const messageData = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "document",
        document: {
          id: mediaId,
          caption: caption,
          filename: filename,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      // Log detailed response for debugging
      console.log(
        "📨 WhatsApp API Response:",
        JSON.stringify(response.data, null, 2)
      );
      console.log("✅ Message ID:", response.data.messages?.[0]?.id);
      console.log(
        "📱 WhatsApp ID:",
        response.data.messages?.[0]?.message_status
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error sending WhatsApp message:",
        error.response?.data || error.message
      );

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error(
          "WhatsApp API token has expired. Please update your access token."
        );
      } else if (error.response?.status === 400) {
        throw new Error("Invalid phone number or message format.");
      } else if (error.response?.status === 403) {
        throw new Error("WhatsApp API access denied. Check your permissions.");
      }

      throw new Error(
        `WhatsApp send failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Send a template message via WhatsApp
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} templateName - Template name (e.g., 'hello_world')
   * @returns {Promise<Object>} - WhatsApp API response
   */
  async sendTemplateMessage(phoneNumber, templateName = "hello_world") {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        throw new Error("WhatsApp API credentials not configured");
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const messageData = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en_US",
          },
        },
      };

      console.log(
        "📤 Sending template message:",
        templateName,
        "to:",
        formattedPhone
      );

      const response = await axios.post(
        `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 30000,
        }
      );

      console.log("✅ Template message sent successfully!");
      console.log("📨 Response:", JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      console.error(
        "Error sending template message:",
        error.response?.data || error.message
      );

      throw new Error(
        `Template message failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Send a text message via WhatsApp
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Text message to send
   * @returns {Promise<Object>} - WhatsApp API response
   */
  async sendTextMessage(phoneNumber, message) {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        throw new Error("WhatsApp API credentials not configured");
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const messageData = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
          body: message,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error sending WhatsApp text:",
        error.response?.data || error.message
      );

      let errorMessage = "WhatsApp text send failed";

      if (error.response?.data?.error) {
        const whatsappError = error.response.data.error;

        if (whatsappError.code === 131030) {
          errorMessage = `Phone number not in WhatsApp allowed list. Please add the recipient to your WhatsApp Business API recipient list.`;
        } else if (whatsappError.code === 190) {
          errorMessage =
            "WhatsApp API token has expired. Please update your token.";
        } else if (whatsappError.message) {
          errorMessage = `WhatsApp API Error: ${whatsappError.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Send bill PDF to customer via WhatsApp
   * @param {string} phoneNumber - Customer phone number
   * @param {string} pdfFilePath - Path to generated PDF
   * @param {Object} billData - Bill data for context
   * @returns {Promise<Object>} - Result object with success/failure info
   */
  async sendBillPDF(phoneNumber, pdfFilePath, billData) {
    try {
      this._init(); // Ensure initialization

      // Test mode simulation
      if (this.testMode) {
        console.log("📧 TEST MODE: Simulating WhatsApp bill sending...");
        console.log(`📱 Would send to: ${phoneNumber}`);
        console.log(`📄 PDF file: ${pdfFilePath}`);

        // Simulate a short delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return {
          success: true,
          messageId: `test_msg_${Date.now()}`,
          whatsappId: phoneNumber,
          message: "Bill sent successfully via WhatsApp (TEST MODE)",
          testMode: true,
        };
      }

      if (!this.apiToken || !this.phoneNumberId) {
        return {
          success: false,
          error: "WhatsApp API not configured. Please contact admin.",
        };
      }

      // Step 0: Send template message first to initiate conversation
      console.log(
        "📨 Step 1: Sending template message to open conversation..."
      );
      try {
        await this.sendTemplateMessage(phoneNumber, "hello_world");
        console.log("✅ Template message sent - conversation window opened!");
        // Wait 3 seconds for template to be delivered and conversation to open
        console.log("⏳ Waiting 3 seconds for conversation window to open...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (templateError) {
        console.warn(
          "⚠️ Template message failed, trying direct PDF send:",
          templateError.message
        );
        // Continue anyway - maybe the conversation is already open
      }

      // Step 1: Upload PDF to WhatsApp
      console.log("📤 Step 2: Uploading PDF to WhatsApp servers...");
      const mediaId = await this.uploadPDFToWhatsApp(pdfFilePath);
      console.log("✅ PDF uploaded successfully, Media ID:", mediaId);

      // Step 2: Prepare message caption
      const customerName = billData.customerInfo?.name || "Valued Customer";
      const billNumber = billData.billNumber || billData._id;
      const total = billData.total || 0;
      const subtotal = billData.subtotal || total;

      // Check if loyalty discount was applied
      const loyaltyApplied = billData.loyaltyInfo?.applied || false;
      const loyaltyDiscount = billData.loyaltyInfo?.discountAmount || 0;
      const loyaltyPercentage = billData.loyaltyInfo?.discountPercentage || 0;

      let caption =
        `🎂 *CakeRaft* - Invoice\n\n` +
        `Dear ${customerName},\n\n` +
        `Thank you for your order! 💖\n\n`;

      // Add order items
      if (billData.items && billData.items.length > 0) {
        caption += `📦 *Order Details:*\n`;
        caption += `${"─".repeat(30)}\n`;

        billData.items.forEach((item, index) => {
          const itemName = item.name || "Item";
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          const weight = item.weight || null;

          // Calculate item total
          let itemTotal = price * quantity;
          if (weight) {
            itemTotal = price * weight * quantity;
          }

          // Format item line
          let itemLine = `${index + 1}. *${itemName}*\n`;

          if (weight) {
            itemLine += `   ${weight}kg × ₹${price.toFixed(2)}/kg`;
          } else {
            itemLine += `   ${quantity}× × ₹${price.toFixed(2)}`;
          }

          if (quantity > 1 && weight) {
            itemLine += ` × ${quantity}`;
          }

          itemLine += ` = ₹${itemTotal.toFixed(2)}\n`;
          caption += itemLine;
        });

        caption += `${"─".repeat(30)}\n`;
        caption += `💵 *Subtotal:* ₹${subtotal.toFixed(2)}\n`;
      }

      // Add loyalty celebration message if applicable
      if (loyaltyApplied && loyaltyDiscount > 0) {
        caption += `🎉 *LOYALTY REWARD!* -₹${loyaltyDiscount.toFixed(
          2
        )} (${loyaltyPercentage}% off) 🎉\n`;
      }

      caption += `💰 *Total Amount:* ₹${total.toFixed(2)}\n\n`;

      caption +=
        `📋 *Bill #:* ${billNumber}\n` +
        `📅 *Date:* ${new Date(billData.createdAt).toLocaleDateString(
          "en-IN"
        )}\n\n` +
        `Your artisan cakes are being crafted with passion! 🧁\n\n`;

      // Add loyalty reminder if discount wasn't applied
      if (!loyaltyApplied) {
        caption += `🎁 *Earn 10% off on your 3rd purchase!*\n\n`;
      }

      caption +=
        `For any questions, feel free to contact us.\n\n` +
        `*CakeRaft Team* 🎂`;

      // Step 3: Send PDF via WhatsApp
      console.log(
        "📱 Step 3: Sending PDF document via WhatsApp to:",
        phoneNumber
      );
      const filename = `CakeRaft_Bill_${billNumber}.pdf`;
      const result = await this.sendPDFMessage(
        phoneNumber,
        mediaId,
        caption,
        filename
      );

      console.log("✅ ✅ ✅ SUCCESS! Bill PDF sent successfully via WhatsApp!");
      console.log("📬 Message Details:", {
        messageId: result.messages?.[0]?.id,
        recipientId: result.contacts?.[0]?.wa_id,
        status: "Delivered to WhatsApp",
      });
      console.log(
        "📱 Customer should receive: 1) Template message + 2) Bill PDF with invoice details"
      );

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        whatsappId: result.messages?.[0]?.wa_id,
        message: "Bill sent successfully via WhatsApp",
      };
    } catch (error) {
      console.error("❌ Error sending bill via WhatsApp:", error);

      let errorMessage = "Failed to send bill via WhatsApp";

      // Handle specific WhatsApp API errors
      if (error.response?.data?.error) {
        const whatsappError = error.response.data.error;

        if (whatsappError.code === 131030) {
          errorMessage = `Phone number not in WhatsApp allowed list. Please add ${phoneNumber} to your WhatsApp Business API recipient list in Facebook Developers Console.`;
        } else if (whatsappError.code === 190) {
          errorMessage =
            "WhatsApp API token has expired. Please update your token.";
        } else if (whatsappError.message) {
          errorMessage = `WhatsApp API Error: ${whatsappError.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if WhatsApp service is configured and ready
   * @returns {boolean} - True if service is ready
   */
  isConfigured() {
    this._init();
    return !!(this.apiToken && this.phoneNumberId);
  }

  /**
   * Get service status information
   * @returns {Object} - Service status
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      apiToken: this.apiToken ? "✅ Set" : "❌ Missing",
      phoneNumberId: this.phoneNumberId ? "✅ Set" : "❌ Missing",
      baseUrl: this.baseUrl,
    };
  }
}

// Export singleton instance
const whatsAppService = new WhatsAppService();

export default whatsAppService;
