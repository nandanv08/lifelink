/**
 * LifeLink - User Controller
 * Handles user registration (donor/hospital), login, profile, and admin operations
 */

const User = require('../models/User');
const Donor = require('../models/Donor');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 */
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// @desc    Register a new user (donor or hospital)
// @route   POST /api/users/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role,
      hospitalName, hospitalAddress, hospitalCity, hospitalState, hospitalRegistrationId
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Build user data based on role
    const userData = { name, email, password, phone };

    // Only allow donor or hospital registration (admin created manually)
    if (role === 'hospital') {
      userData.role = 'hospital';
      userData.hospitalName = hospitalName;
      userData.hospitalAddress = hospitalAddress;
      userData.hospitalCity = hospitalCity;
      userData.hospitalState = hospitalState;
      userData.hospitalRegistrationId = hospitalRegistrationId;
      userData.isVerified = false; // Hospitals must be verified by admin
    } else {
      userData.role = 'donor';
    }

    const user = await User.create(userData);

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: user.role === 'hospital'
        ? 'Hospital account created! Awaiting admin verification.'
        : 'Account created successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    // Get donor profile if linked
    let donorProfile = null;
    if (user.role === 'donor' && user.donorProfile) {
      donorProfile = await Donor.findById(user.donorProfile);
    }

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        donorProfile: donorProfile ? donorProfile._id : null,
        hospitalName: user.hospitalName || null,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('donorProfile');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Link donor profile to user account
// @route   POST /api/users/link-donor
// @access  Private (donors only)
exports.linkDonorProfile = async (req, res) => {
  try {
    const { donorId } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user || user.role !== 'donor') {
      return res.status(403).json({
        success: false,
        message: 'Only donor accounts can link donor profiles'
      });
    }

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found'
      });
    }

    // Link both ways
    user.donorProfile = donor._id;
    donor.userId = user._id;
    await user.save();
    await donor.save();

    res.json({
      success: true,
      message: 'Donor profile linked successfully',
      data: { donorId: donor._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ========================
// Admin-only user management
// ========================

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, verified, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (verified === 'true') filter.isVerified = true;
    if (verified === 'false') filter.isVerified = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify a hospital account (admin)
// @route   PATCH /api/users/:id/verify
// @access  Admin
exports.verifyHospital = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'hospital') {
      return res.status(400).json({
        success: false,
        message: 'Only hospital accounts can be verified'
      });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verifiedBy = req.user.userId;
    await user.save();

    res.json({
      success: true,
      message: `Hospital "${user.hospitalName}" has been verified successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Revoke hospital verification (admin)
// @route   PATCH /api/users/:id/revoke
// @access  Admin
exports.revokeHospital = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'hospital') {
      return res.status(404).json({
        success: false,
        message: 'Hospital account not found'
      });
    }

    user.isVerified = false;
    user.verifiedAt = null;
    user.verifiedBy = null;
    await user.save();

    res.json({
      success: true,
      message: `Hospital "${user.hospitalName}" verification revoked`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Deactivate a user (admin)
// @route   PATCH /api/users/:id/deactivate
// @access  Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
