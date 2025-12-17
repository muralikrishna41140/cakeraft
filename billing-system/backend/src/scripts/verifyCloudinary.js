    import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

console.log('🔍 Verifying Cloudinary Configuration...\n');

// Check if env vars are set
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Environment Variables:');
console.log(`CLOUDINARY_CLOUD_NAME: ${cloudName ? `"${cloudName}"` : '❌ NOT SET'}`);
console.log(`CLOUDINARY_API_KEY: ${apiKey ? `"${apiKey.substring(0, 6)}..."` : '❌ NOT SET'}`);
console.log(`CLOUDINARY_API_SECRET: ${apiSecret ? `"${apiSecret.substring(0, 6)}..."` : '❌ NOT SET'}`);
console.log('');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Error: Missing Cloudinary environment variables!');
  console.log('\nPlease add to your .env file:');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

console.log('🧪 Testing Cloudinary Connection...\n');

// Test the configuration by trying to get account details
try {
  const result = await cloudinary.api.ping();
  console.log('✅ Cloudinary Configuration is VALID!');
  console.log('✅ Connection successful!');
  console.log('\nResponse:', result);
  console.log('\n🎉 Your Cloudinary credentials are working correctly!');
} catch (error) {
  console.error('❌ Cloudinary Configuration FAILED!');
  console.error('\nError:', error);
  console.error('\nError message:', error?.message || 'Unknown error');
  console.error('\nError response:', error?.error || error?.http_code);
  
  const errorMsg = error?.message || error?.error?.message || '';
  
  if (errorMsg.includes('Invalid cloud_name') || errorMsg.includes('cloud_name')) {
    console.error('\n⚠️  The cloud_name is incorrect!');
    console.error('\n📋 Steps to fix:');
    console.error('1. Login to https://cloudinary.com/console');
    console.error('2. Check the "Cloud Name" shown on your dashboard');
    console.error('3. Update CLOUDINARY_CLOUD_NAME in your .env file');
    console.error('\n💡 Note: Cloud name is usually NOT the same as your account username!');
    console.error('   It often looks like: dxxxxxx or a custom name you set.');
  } else if (errorMsg.includes('Invalid API key') || errorMsg.includes('api_key')) {
    console.error('\n⚠️  The API key or secret is incorrect!');
    console.error('\n📋 Steps to fix:');
    console.error('1. Login to https://cloudinary.com/console');
    console.error('2. Go to Settings → Access Keys (or Dashboard)');
    console.error('3. Copy the correct API Key and API Secret');
    console.error('4. Update your .env file');
  }
  
  process.exit(1);
}
