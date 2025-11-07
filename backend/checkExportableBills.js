/**
 * Check if there are bills to export
 */

import mongoose from 'mongoose';
import Bill from './src/models/Bill.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Checking for exportable bills...\n');

async function checkBills() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    console.log('📅 Today:', today.toISOString().split('T')[0]);
    console.log('📅 30 days ago:', thirtyDaysAgo.toISOString().split('T')[0]);
    console.log('📊 Looking for bills older than 30 days...\n');

    // Count total bills
    const totalBills = await Bill.countDocuments();
    console.log('📋 Total bills in database:', totalBills);

    // Count old bills (older than 30 days)
    const oldBills = await Bill.countDocuments({
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log('🗂️  Bills older than 30 days:', oldBills);

    // Count recent bills (last 30 days)
    const recentBills = await Bill.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    console.log('📊 Bills from last 30 days:', recentBills);

    if (oldBills === 0) {
      console.log('\n⚠️  NO BILLS TO EXPORT!');
      console.log('\nThis is normal if:');
      console.log('- Your system is new (less than 30 days old)');
      console.log('- You already exported all old bills');
      console.log('- All bills are recent\n');
      console.log('💡 To test export with sample data:');
      console.log('1. Create some test bills');
      console.log('2. Manually update their createdAt date to be > 30 days old');
      console.log('3. Try export again\n');
    } else {
      console.log('\n✅ You have', oldBills, 'bills ready to export!');
      
      // Show summary by date
      const oldBillsRevenue = await Bill.aggregate([
        {
          $match: {
            createdAt: { $lt: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$createdAt"
              }
            },
            totalRevenue: { $sum: '$total' },
            totalBills: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      console.log('\n📊 Bills to be exported by date:');
      console.log('─'.repeat(50));
      oldBillsRevenue.forEach(item => {
        console.log(`${item._id}: ₹${item.totalRevenue.toFixed(2)} (${item.totalBills} bills)`);
      });
      console.log('─'.repeat(50));
      
      const totalRevenue = oldBillsRevenue.reduce((sum, item) => sum + item.totalRevenue, 0);
      console.log(`TOTAL: ₹${totalRevenue.toFixed(2)} (${oldBills} bills)\n`);
    }

    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBills();
