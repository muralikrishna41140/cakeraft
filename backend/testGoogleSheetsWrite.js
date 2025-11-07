/**
 * Test actual write to Google Sheets
 */

import googleSheetsService from './src/services/googleSheetsService.js';

console.log('🧪 Testing Google Sheets WRITE access...\n');

async function testWrite() {
  try {
    console.log('🔐 Authenticating...');
    await googleSheetsService.authenticate();
    console.log('✅ Authenticated\n');

    console.log('📝 Attempting to write test data...');
    
    const testData = [
      {
        date: '2025-11-07',
        totalRevenue: 100,
        totalBills: 1
      }
    ];

    const result = await googleSheetsService.exportRevenueData(testData);
    
    console.log('\n🎉 SUCCESS! Write test passed!');
    console.log('✅ Exported rows:', result.exportedRows);
    console.log('📊 Spreadsheet:', result.spreadsheetUrl);
    console.log('📍 Updated range:', result.updatedRange);
    console.log('\n✨ Your export feature should work now!');
    
  } catch (error) {
    console.log('\n❌ WRITE TEST FAILED!\n');
    console.log('Error Message:', error.message);
    console.log('Error Code:', error.code);
    
    if (error.message.includes('permission') || error.code === 403) {
      console.log('\n🚨 PERMISSION ERROR DETECTED!\n');
      console.log('The spreadsheet is NOT shared with the service account.\n');
      console.log('🔧 FIX THIS NOW:');
      console.log('1. Open: https://docs.google.com/spreadsheets/d/1zOa9loQwHqg-fC8skSyE39XP1gZtsm-f7RXyd9lBQzc');
      console.log('2. Click "Share" button (top right)');
      console.log('3. Add email: sheets-service-account@cakeraft.iam.gserviceaccount.com');
      console.log('4. Permission: Editor');
      console.log('5. Uncheck "Notify people"');
      console.log('6. Click "Share"');
      console.log('\n After sharing, run this test again!\n');
    } else {
      console.log('\nFull error details:');
      console.log(error);
    }
    
    process.exit(1);
  }
}

testWrite();
