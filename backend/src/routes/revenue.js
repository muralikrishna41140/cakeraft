import express from 'express';
import { protect } from '../middleware/auth.js';
import Bill from '../models/Bill.js';
import googleSheetsService from '../services/googleSheetsService.js';

const router = express.Router();

// GET /api/revenue/today - Get today's revenue
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get yesterday's range for comparison
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);

    // Aggregate today's revenue
    const todayRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalBills: { $sum: 1 }
        }
      }
    ]);

    // Aggregate yesterday's revenue for comparison
    const yesterdayRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYesterday,
            $lt: endOfYesterday
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalBills: { $sum: 1 }
        }
      }
    ]);

    const todayTotal = todayRevenue[0]?.totalRevenue || 0;
    const todayBills = todayRevenue[0]?.totalBills || 0;
    const yesterdayTotal = yesterdayRevenue[0]?.totalRevenue || 0;

    // Calculate percentage change
    let percentageChange = 0;
    if (yesterdayTotal > 0) {
      percentageChange = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    } else if (todayTotal > 0) {
      percentageChange = 100; // If no revenue yesterday but revenue today, it's 100% increase
    }

    res.json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        totalRevenue: todayTotal,
        totalBills: todayBills,
        comparison: {
          yesterday: yesterdayTotal,
          percentageChange: Math.round(percentageChange * 100) / 100,
          trend: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'same'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching today\'s revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue data',
      error: error.message
    });
  }
});

// GET /api/revenue/weekly - Get this week's revenue (for future extension)
router.get('/weekly', protect, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weeklyRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfWeek,
            $lt: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalBills: { $sum: 1 }
        }
      }
    ]);

    const total = weeklyRevenue[0]?.totalRevenue || 0;
    const bills = weeklyRevenue[0]?.totalBills || 0;

    res.json({
      success: true,
      data: {
        weekStart: startOfWeek.toISOString().split('T')[0],
        weekEnd: endOfWeek.toISOString().split('T')[0],
        totalRevenue: total,
        totalBills: bills
      }
    });

  } catch (error) {
    console.error('Error fetching weekly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly revenue data',
      error: error.message
    });
  }
});

// GET /api/revenue/30days - Get last 30 days revenue
router.get('/30days', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Set to start of day for accurate date filtering
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate revenue by day for the last 30 days
    const dailyRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: thirtyDaysAgo
          }
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

    // Create a complete array of the last 30 days with zero revenue for missing days
    const completeData = [];
    const currentDate = new Date(thirtyDaysAgo);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Find existing data for this date
      const existingData = dailyRevenue.find(item => item._id === dateStr);
      
      completeData.push({
        date: dateStr,
        totalRevenue: existingData ? existingData.totalRevenue : 0,
        totalBills: existingData ? existingData.totalBills : 0
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate total revenue and bills for the period
    const totalRevenue = completeData.reduce((sum, day) => sum + day.totalRevenue, 0);
    const totalBills = completeData.reduce((sum, day) => sum + day.totalBills, 0);

    res.json({
      success: true,
      data: {
        period: '30 days',
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        totalRevenue,
        totalBills,
        dailyData: completeData
      }
    });

  } catch (error) {
    console.error('Error fetching 30-day revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching 30-day revenue data',
      error: error.message
    });
  }
});

// POST /api/revenue/export - Export old revenue to Google Sheets and delete from MongoDB
router.post('/export', protect, async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    console.log(`📊 Starting revenue export for bills older than ${thirtyDaysAgo.toISOString()}`);

    // Step 1: Aggregate bills older than 30 days by date
    const oldBillsRevenue = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $lt: thirtyDaysAgo
          }
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
          totalBills: { $sum: 1 },
          billIds: { $push: '$_id' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    if (oldBillsRevenue.length === 0) {
      return res.json({
        success: true,
        message: 'No old revenue data found to export',
        exportedDays: 0,
        deletedBills: 0
      });
    }

    // Step 2: Format data for Google Sheets export
    const revenueData = oldBillsRevenue.map(item => ({
      date: item._id,
      totalRevenue: item.totalRevenue,
      totalBills: item.totalBills
    }));

    // Step 3: Export to Google Sheets
    let exportResult;
    try {
      exportResult = await googleSheetsService.exportRevenueData(revenueData);
      console.log('✅ Export to Google Sheets successful');
    } catch (exportError) {
      console.error('❌ Export to Google Sheets failed:', exportError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to export to Google Sheets',
        error: exportError.message
      });
    }

    // Step 4: Only delete bills if export was successful
    const allBillIds = oldBillsRevenue.flatMap(item => item.billIds);
    
    const deleteResult = await Bill.deleteMany({
      _id: { $in: allBillIds }
    });

    console.log(`🗑️  Deleted ${deleteResult.deletedCount} bills from MongoDB`);

    // Step 5: Return success response
    res.json({
      success: true,
      message: `Successfully exported ${revenueData.length} days of revenue data and deleted ${deleteResult.deletedCount} bills`,
      exportedDays: revenueData.length,
      deletedBills: deleteResult.deletedCount,
      dateRange: {
        from: revenueData[0]?.date,
        to: revenueData[revenueData.length - 1]?.date
      },
      spreadsheetUrl: exportResult.spreadsheetUrl,
      totalRevenue: revenueData.reduce((sum, item) => sum + item.totalRevenue, 0)
    });

  } catch (error) {
    console.error('❌ Error in revenue export:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting revenue data',
      error: error.message
    });
  }
});

// GET /api/revenue/export/test - Test Google Sheets connection
router.get('/export/test', protect, async (req, res) => {
  try {
    const testResult = await googleSheetsService.testConnection();
    res.json(testResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing Google Sheets connection',
      error: error.message
    });
  }
});

export default router;