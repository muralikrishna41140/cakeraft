/**
 * Quick Google Sheets Permission Check
 * This will tell you if the service account has access to your spreadsheet
 */

import googleSheetsService from './src/services/googleSheetsService.js';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1zOa9loQwHqg-fC8skSyE39XP1gZtsm-f7RXyd9lBQzc';

console.log('🔍 Checking Google Sheets Access...\n');
console.log('📊 Spreadsheet ID:', SPREADSHEET_ID);
console.log('🔗 Spreadsheet URL:', `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}\n`);

async function checkAccess() {
  try {
    // Try to authenticate
    console.log('🔐 Step 1: Authenticating...');
    await googleSheetsService.authenticate();
    console.log('✅ Authentication successful!\n');

    // Try to access the spreadsheet
    console.log('📋 Step 2: Accessing spreadsheet...');
    await googleSheetsService.setupSheetHeaders();
    console.log('✅ Successfully accessed spreadsheet!');
    console.log('📄 Sheet name:', googleSheetsService.sheetName);
    
    console.log('\n🎉 SUCCESS! Everything is configured correctly!');
    console.log('\n✅ Your Google Sheets export should work now.');
    
  } catch (error) {
    console.log('\n❌ ERROR FOUND:\n');
    console.log('Error Message:', error.message);
    console.log('Error Code:', error.code);
    
    if (error.code === 403) {
      console.log('\n🔧 FIX REQUIRED:');
      console.log('The spreadsheet is NOT shared with the service account!\n');
      console.log('DO THIS NOW:');
      console.log('1. Open:', `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
      console.log('2. Click "Share" button');
      console.log('3. Add this email: sheets-service-account@cakeraft.iam.gserviceaccount.com');
      console.log('4. Set permission to: Editor');
      console.log('5. Uncheck "Notify people"');
      console.log('6. Click "Share"\n');
      
    } else if (error.code === 404) {
      console.log('\n🔧 FIX REQUIRED:');
      console.log('Spreadsheet not found!\n');
      console.log('Either:');
      console.log('A) The spreadsheet ID is wrong');
      console.log('B) The spreadsheet was deleted\n');
      console.log('Create a new spreadsheet:');
      console.log('1. Go to: https://sheets.google.com');
      console.log('2. Create new spreadsheet');
      console.log('3. Copy the ID from URL');
      console.log('4. Update GOOGLE_SHEETS_SPREADSHEET_ID in .env file\n');
      
    } else if (error.code === 401) {
      console.log('\n🔧 FIX REQUIRED:');
      console.log('Google credentials are invalid!\n');
      console.log('Check:');
      console.log('1. File exists: backend/src/config/google-credentials.json');
      console.log('2. File is valid JSON');
      console.log('3. Credentials are not expired\n');
      
    } else {
      console.log('\n🔧 UNEXPECTED ERROR:');
      console.log('Full error:', error);
    }
    
    process.exit(1);
  }
}

checkAccess();
