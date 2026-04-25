/**
 * LifeLink - Analytics Controller
 * Provides dashboard statistics and insights
 */

const Donor = require('../models/Donor');
const Request = require('../models/Request');

// @desc    Get overall platform analytics
// @route   GET /api/analytics
// @access  Public
exports.getAnalytics = async (req, res) => {
  try {
    // Total and active donors
    const totalDonors = await Donor.countDocuments({ isActive: true });
    const activeDonors = await Donor.countDocuments({ isActive: true, isAvailable: true });

    // Request statistics
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const activeRequests = await Request.countDocuments({ status: { $in: ['pending', 'accepted'] } });

    // Lives saved (completed requests * average units)
    const completedRequestsData = await Request.find({ status: 'completed' });
    const livesSaved = completedRequestsData.reduce((sum, r) => sum + (r.unitsNeeded || 1), 0);

    // Blood group distribution
    const bloodGroupDistribution = await Donor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Most requested blood groups
    const mostRequestedGroups = await Request.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // City distribution
    const cityDistribution = await Donor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity (donors registered in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentDonors = await Donor.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Emergency requests
    const emergencyRequests = await Request.countDocuments({ isEmergency: true, status: { $ne: 'cancelled' } });

    res.json({
      success: true,
      data: {
        overview: {
          totalDonors,
          activeDonors,
          totalRequests,
          pendingRequests,
          completedRequests,
          activeRequests,
          livesSaved,
          emergencyRequests,
          recentDonors
        },
        bloodGroupDistribution: bloodGroupDistribution.map(bg => ({
          bloodGroup: bg._id,
          count: bg.count
        })),
        mostRequestedGroups: mostRequestedGroups.map(bg => ({
          bloodGroup: bg._id,
          count: bg.count
        })),
        cityDistribution: cityDistribution.map(c => ({
          city: c._id,
          count: c.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: error.message
    });
  }
};

// @desc    Get recent donors (for real-time simulation)
// @route   GET /api/analytics/recent-donors
// @access  Public
exports.getRecentDonors = async (req, res) => {
  try {
    const recentDonors = await Donor.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name bloodGroup city createdAt isAvailable')
      .lean();

    res.json({
      success: true,
      data: recentDonors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
