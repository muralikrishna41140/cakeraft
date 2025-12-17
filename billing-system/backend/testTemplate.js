import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEST_RECIPIENT = "919959429719";

console.log("🧪 Testing WhatsApp Template Message...\n");
console.log("Token:", API_TOKEN ? "Set ✅" : "❌ Missing");
console.log("Phone ID:", PHONE_NUMBER_ID || "❌ Missing");
console.log("Recipient:", TEST_RECIPIENT);
console.log("\n---\n");

async function testTemplate() {
  try {
    console.log('📱 Sending "hello_world" template...');

    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: TEST_RECIPIENT,
        type: "template",
        template: {
          name: "hello_world",
          language: { code: "en_US" },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    console.log("✅ SUCCESS!");
    console.log("📨 Response:", JSON.stringify(response.data, null, 2));
    console.log('\n📱 Check WhatsApp - you should receive "Hello World"!');
  } catch (error) {
    console.error("❌ ERROR:");
    console.error(
      JSON.stringify(error.response?.data || error.message, null, 2)
    );
  }
}

testTemplate();
