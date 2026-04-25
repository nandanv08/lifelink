/**
 * LifeLink - Analytics Routes
 * Dashboard and statistics endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getRecentDonors
} = require('../controllers/analyticsController');

router.get('/', getAnalytics);
router.get('/recent-donors', getRecentDonors);

module.exports = router;
