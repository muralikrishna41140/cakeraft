import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bill from '../models/Bill.js';

// Load environment variables
dotenv.config();

const addIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Add index on createdAt field for better query performance
    await Bill.collection.createIndex({ createdAt: -1 }, {
      name: 'bills_createdAt_index',
      background: true
    });
    console.log('✅ Index created on Bills.createdAt field');

    // Add composite index for date range queries
    await Bill.collection.createIndex({ 
      createdAt: -1, 
      total: 1 
    }, {
      name: 'bills_createdAt_total_index',
      background: true
    });
    console.log('✅ Composite index created on Bills.createdAt and total fields');

    // List all indexes to verify
    const indexes = await Bill.collection.getIndexes();
    console.log('📋 Current indexes on Bills collection:');
    console.log(Object.keys(indexes).join(', '));

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    process.exit(1);
  }
};

// Run the script
addIndexes();