/**
 * Test Google Sheets Export - Run this to see detailed error messages
 * 
 * Instructions:
 * 1. Make sure backend is running on port 5001
 * 2. Login to get a JWT token
 * 3. Run: node testGoogleSheetsExport.js YOUR_JWT_TOKEN
 */

import https from 'https';
import http from 'http';

const API_URL = 'http://localhost:5001/api/revenue/export';
const token = process.argv[2];

if (!token) {
  console.error('❌ Please provide JWT token as argument');
  console.log('Usage: node testGoogleSheetsExport.js YOUR_JWT_TOKEN');
  console.log('\nTo get token:');
  console.log('1. Login at http://localhost:3000/login');
  console.log('2. Open browser DevTools > Application > Local Storage');
  console.log('3. Copy the "token" value');
  process.exit(1);
}

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Testing Google Sheets Export...\n');
console.log('API URL:', API_URL);
console.log('Token:', token.substring(0, 20) + '...\n');

const req = http.request(API_URL, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📊 Response Status:', res.statusCode);
    console.log('📋 Response Headers:', res.headers);
    console.log('\n📝 Response Body:');
    
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (json.success) {
        console.log('\n✅ SUCCESS! Export completed.');
        console.log('📊 Exported days:', json.exportedDays);
        console.log('🗑️  Deleted bills:', json.deletedBills);
        console.log('🔗 Spreadsheet:', json.spreadsheetUrl);
      } else {
        console.log('\n❌ FAILED! Error:', json.message);
        if (json.error) {
          console.log('Error details:', json.error);
        }
        if (json.details) {
          console.log('Additional details:', json.details);
        }
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request Error:', error.message);
  console.error('\nMake sure:');
  console.error('1. Backend is running (npm run dev in backend folder)');
  console.error('2. Port 5001 is accessible');
  console.error('3. You have a valid JWT token');
});

req.end();

console.log('⏳ Waiting for response...');
