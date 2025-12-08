import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEST_RECIPIENT = "919959429719"; // Your test number

console.log("🧪 Testing WhatsApp API Connection...\n");
console.log("📋 Configuration:");
console.log(
  "Token:",
  API_TOKEN ? `${API_TOKEN.substring(0, 20)}...` : "❌ Missing"
);
console.log("Phone Number ID:", PHONE_NUMBER_ID || "❌ Missing");
console.log("Test Recipient:", TEST_RECIPIENT);
console.log("\n---\n");

async function testWhatsAppAPI() {
  try {
    // Test 1: Send a simple text message
    console.log("📱 Test 1: Sending text message...");

    const messageData = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: TEST_RECIPIENT,
      type: "text",
      text: {
        body: "🎂 Test message from CakeRaft!\n\nThis is a test to verify WhatsApp integration is working correctly.",
      },
    };

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      messageData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    console.log("✅ SUCCESS! Message sent!");
    console.log("📨 Response:", JSON.stringify(response.data, null, 2));
    console.log("\n✅ WhatsApp API is working correctly!");
    console.log("📱 Check WhatsApp on phone:", TEST_RECIPIENT);
  } catch (error) {
    console.error("❌ ERROR sending message:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error(
        "Error Details:",
        JSON.stringify(error.response.data, null, 2)
      );

      const errorCode = error.response.data?.error?.code;
      const errorMessage = error.response.data?.error?.message;

      console.log("\n🔍 Diagnosis:");

      if (errorCode === 190 || errorCode === 104) {
        console.log("❌ Access Token is INVALID or EXPIRED");
        console.log("📝 Solution: Generate a new access token from:");
        console.log(
          "   https://developers.facebook.com/apps/1780150702640912/whatsapp-business/wa-dev-console/"
        );
      } else if (errorCode === 131030 || errorCode === 131031) {
        console.log("❌ Recipient phone number not in allowed list");
        console.log(
          "📝 Solution: Add",
          TEST_RECIPIENT,
          "to allowed numbers in Meta Developer Console"
        );
      } else if (errorCode === 133010) {
        console.log("❌ Account not registered or phone number not verified");
        console.log("📝 Solution: Verify your WhatsApp Business phone number");
      } else {
        console.log("❌ Unknown error:", errorMessage);
      }
    } else {
      console.error("❌ Network error:", error.message);
    }
  }
}

testWhatsAppAPI();
