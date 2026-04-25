/**
 * LifeLink - Donor Controller
 * Handles all donor-related operations including
 * CRUD, smart matching, emergency filtering, eligibility checking,
 * and state/city based real-time search
 */

const Donor = require('../models/Donor');

/**
 * Calculate smart match score for a donor
 * Scoring: availability (50) + location match (30) + recency (20) + eligibility (10)
 */
function calculateMatchScore(donor, queryCity, queryState) {
  let score = 0;

  // Availability bonus (+50)
  if (donor.isAvailable) score += 50;

  // Location match (+30)
  if (queryCity && donor.city.toLowerCase() === queryCity.toLowerCase()) {
    score += 30;
  } else if (queryState && donor.state && donor.state.toLowerCase() === queryState.toLowerCase()) {
    score += 15; // State match is worth less than exact city match
  }

  // Recency of activity (+0 to +20)
  const daysSinceActive = (Date.now() - new Date(donor.lastActive || donor.updatedAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceActive < 7) score += 20;
  else if (daysSinceActive < 14) score += 15;
  else if (daysSinceActive < 30) score += 10;
  else if (daysSinceActive < 90) score += 5;

  // Donation eligibility bonus (+10) - can donate if last donation > 90 days ago
  if (donor.lastDonationDate) {
    const daysSinceDonation = (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceDonation >= 90) score += 10;
  } else {
    score += 10; // Never donated, eligible
  }

  // Response rate bonus (+0 to +10)
  score += Math.floor((donor.responseRate || 100) / 10);

  return score;
}

// @desc    Register a new donor
// @route   POST /api/donors
// @access  Public
exports.registerDonor = async (req, res) => {
  try {
    const {
      name, email, phone, age, gender, bloodGroup,
      city, state, address, lastDonationDate, weight,
      hasMedicalConditions, medicalNotes
    } = req.body;

    // Check if phone already exists
    const existingDonor = await Donor.findOne({ phone });
    if (existingDonor) {
      return res.status(400).json({
        success: false,
        message: 'A donor with this phone number already exists'
      });
    }

    const donor = await Donor.create({
      name, email, phone, age, gender, bloodGroup,
      city, state, address, lastDonationDate, weight,
      hasMedicalConditions, medicalNotes
    });

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully!',
      data: donor
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while registering donor',
      error: error.message
    });
  }
};

// @desc    Get all donors with filtering and smart sorting
// @route   GET /api/donors
// @access  Public
exports.getDonors = async (req, res) => {
  try {
    const {
      bloodGroup, city, state, available, search,
      page = 1, limit = 12, sort = 'smart'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (available === 'true') filter.isAvailable = true;
    if (available === 'false') filter.isAvailable = false;

    // Search by name or city
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { state: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Donor.countDocuments(filter);

    let donors = await Donor.find(filter)
      .select('-medicalNotes -hasMedicalConditions -healthRecords') // Privacy: hide medical details
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Smart sorting: calculate match scores
    if (sort === 'smart') {
      donors = donors.map(donor => ({
        ...donor,
        matchScore: calculateMatchScore(donor, city, state)
      }));
      donors.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sort === 'newest') {
      donors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'name') {
      donors.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Privacy: mask phone numbers for public listing
    donors = donors.map(donor => ({
      ...donor,
      phone: donor.phone.substring(0, 3) + '****' + donor.phone.substring(7),
      email: donor.email ? donor.email.split('@')[0].substring(0, 3) + '***@' + donor.email.split('@')[1] : undefined
    }));

    res.json({
      success: true,
      data: donors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching donors',
      error: error.message
    });
  }
};

// @desc    Get a single donor by ID (full details for authorized requests)
// @route   GET /api/donors/:id
// @access  Public (limited) / Admin (full)
exports.getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Return limited info for public, full info for admin
    const isAdmin = req.query.admin === 'true'; // Simplified admin check
    const donorData = donor.toObject();

    if (!isAdmin) {
      // Mask sensitive information
      donorData.phone = donorData.phone.substring(0, 3) + '****' + donorData.phone.substring(7);
      if (donorData.email) {
        donorData.email = donorData.email.split('@')[0].substring(0, 3) + '***@' + donorData.email.split('@')[1];
      }
      delete donorData.medicalNotes;
      delete donorData.hasMedicalConditions;
      delete donorData.healthRecords;
    }

    res.json({
      success: true,
      data: donorData
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Donor not found' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update donor information
// @route   PUT /api/donors/:id
// @access  Public
exports.updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActive: new Date() },
      { new: true, runValidators: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.json({
      success: true,
      message: 'Donor updated successfully',
      data: donor
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle donor availability
// @route   PATCH /api/donors/:id/availability
// @access  Public
exports.toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    donor.isAvailable = !donor.isAvailable;
    donor.lastActive = new Date();
    await donor.save();

    res.json({
      success: true,
      message: `Availability ${donor.isAvailable ? 'enabled' : 'disabled'}`,
      data: { isAvailable: donor.isAvailable }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a donor (soft delete)
// @route   DELETE /api/donors/:id
// @access  Admin
exports.deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.json({
      success: true,
      message: 'Donor removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get emergency donors (top priority, available, sorted by smart score)
// @route   GET /api/donors/emergency/:bloodGroup
// @access  Public
exports.getEmergencyDonors = async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const { city, state } = req.query;

    // Find available donors with matching blood group
    const compatibleGroups = getCompatibleBloodGroups(bloodGroup);

    const filter = {
      bloodGroup: { $in: compatibleGroups },
      isAvailable: true,
      isActive: true
    };

    // Filter donors who donated in last 90 days (not eligible)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    filter.$or = [
      { lastDonationDate: null },
      { lastDonationDate: { $lte: ninetyDaysAgo } }
    ];

    let donors = await Donor.find(filter)
    .select('-medicalNotes -hasMedicalConditions -healthRecords')
    .lean();

    // Calculate match scores and sort
    donors = donors.map(donor => ({
      ...donor,
      matchScore: calculateMatchScore(donor, city, state),
      isExactMatch: donor.bloodGroup === bloodGroup
    }));

    // Sort: exact matches first, then by score
    donors.sort((a, b) => {
      if (a.isExactMatch !== b.isExactMatch) return b.isExactMatch - a.isExactMatch;
      return b.matchScore - a.matchScore;
    });

    // Return top 20 for emergency
    donors = donors.slice(0, 20);

    res.json({
      success: true,
      data: donors,
      total: donors.length,
      bloodGroup,
      compatibleGroups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during emergency search',
      error: error.message
    });
  }
};

// @desc    Check donation eligibility
// @route   POST /api/donors/check-eligibility
// @access  Public
exports.checkEligibility = async (req, res) => {
  try {
    const { age, weight, lastDonationDate, hasMedicalConditions } = req.body;
    const issues = [];
    let isEligible = true;

    // Age check (18-65)
    if (age < 18) {
      issues.push('Must be at least 18 years old');
      isEligible = false;
    } else if (age > 65) {
      issues.push('Maximum age for donation is 65');
      isEligible = false;
    }

    // Weight check (>= 45 kg)
    if (weight && weight < 45) {
      issues.push('Minimum weight for donation is 45 kg');
      isEligible = false;
    }

    // Last donation check (>= 90 days)
    if (lastDonationDate) {
      const daysSince = (Date.now() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24);
      if (daysSince < 90) {
        issues.push(`Last donation was ${Math.floor(daysSince)} days ago. Must wait at least 90 days between donations (${Math.ceil(90 - daysSince)} days remaining)`);
        isEligible = false;
      }
    }

    // Medical conditions check
    if (hasMedicalConditions) {
      issues.push('Please consult with a medical professional about your conditions before donating');
      isEligible = false;
    }

    res.json({
      success: true,
      data: {
        isEligible,
        issues,
        message: isEligible
          ? '✅ You are eligible to donate blood! Thank you for your willingness to save lives.'
          : '❌ You may not be eligible to donate at this time. Please review the issues below.'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during eligibility check',
      error: error.message
    });
  }
};

// @desc    Add health record to donor profile
// @route   POST /api/donors/:id/health-record
// @access  Private (donor owner)
exports.addHealthRecord = async (req, res) => {
  try {
    const { hemoglobin, bloodPressureSystolic, bloodPressureDiastolic, pulseRate, notes } = req.body;

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    donor.healthRecords.push({
      date: new Date(),
      hemoglobin,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      pulseRate,
      notes
    });

    await donor.save();

    res.json({
      success: true,
      message: 'Health record added',
      data: donor.healthRecords[donor.healthRecords.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get donor profile with full health records (for donor dashboard)
// @route   GET /api/donors/:id/profile
// @access  Private
exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.json({
      success: true,
      data: donor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get compatible blood groups for a given blood group
 * Returns groups that can donate TO the given blood group
 */
function getCompatibleBloodGroups(bloodGroup) {
  const compatibility = {
    'A+':  ['A+', 'A-', 'O+', 'O-'],
    'A-':  ['A-', 'O-'],
    'B+':  ['B+', 'B-', 'O+', 'O-'],
    'B-':  ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+':  ['O+', 'O-'],
    'O-':  ['O-']
  };
  return compatibility[bloodGroup] || [bloodGroup];
}
