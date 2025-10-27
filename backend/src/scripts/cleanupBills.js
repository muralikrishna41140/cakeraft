import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bill from '../models/Bill.js';

// Load environment variables
dotenv.config();

const cleanupDuplicateBills = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all bills with duplicate bill numbers
    const duplicates = await Bill.aggregate([
      {
        $group: {
          _id: '$billNumber',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    console.log(`Found ${duplicates.length} sets of duplicate bill numbers`);

    for (const duplicate of duplicates) {
      console.log(`Processing duplicate bill number: ${duplicate._id}`);
      
      // Keep the first bill and delete the rest
      const idsToDelete = duplicate.ids.slice(1);
      
      const deleteResult = await Bill.deleteMany({
        _id: { $in: idsToDelete }
      });
      
      console.log(`  Deleted ${deleteResult.deletedCount} duplicate bills`);
    }

    // Also clean up bills with null bill numbers
    const nullBillsResult = await Bill.deleteMany({
      billNumber: null
    });
    
    if (nullBillsResult.deletedCount > 0) {
      console.log(`🗑️  Deleted ${nullBillsResult.deletedCount} bills with null bill numbers`);
    }

    console.log('✅ Cleanup completed successfully!');

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

// Run the script
cleanupDuplicateBills();