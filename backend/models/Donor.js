/**
 * LifeLink - Donor Model
 * Represents a blood donor with all relevant information
 * including smart matching fields and eligibility tracking
 */

const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18 years old to donate'],
    max: [65, 'Maximum age for donation is 65']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },

  // Blood Information
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: '{VALUE} is not a valid blood group'
    }
  },

  // Location (enhanced with state for state-level search)
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true
  },

  // GPS Coordinates (Future Enhancement: Google Maps API integration)
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },

  // Donation Details
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  totalDonations: {
    type: Number,
    default: 0,
    min: 0
  },

  // Health Information for Eligibility
  weight: {
    type: Number,
    min: [45, 'Minimum weight for donation is 45 kg'],
    default: 60
  },
  hasMedicalConditions: {
    type: Boolean,
    default: false
  },
  medicalNotes: {
    type: String,
    trim: true,
    default: ''
  },

  // Health Records (new: donor profile management)
  healthRecords: [{
    date: { type: Date, default: Date.now },
    hemoglobin: { type: Number },
    bloodPressureSystolic: { type: Number },
    bloodPressureDiastolic: { type: Number },
    pulseRate: { type: Number },
    notes: { type: String, trim: true, default: '' }
  }],

  // Donation History log
  donationHistory: [{
    date: { type: Date, required: true },
    hospital: { type: String, trim: true },
    city: { type: String, trim: true },
    unitsdonated: { type: Number, default: 1 },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null }
  }],

  // Smart Matching Fields
  lastActive: {
    type: Date,
    default: Date.now
  },
  responseRate: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  matchScore: {
    type: Number,
    default: 0
  },

  // Privacy & Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: ''
  },

  // Linked user account (for donor dashboard access)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: Check if donor is eligible (last donation > 90 days ago)
donorSchema.virtual('isEligible').get(function() {
  if (!this.lastDonationDate) return true;
  const daysSinceDonation = (Date.now() - new Date(this.lastDonationDate)) / (1000 * 60 * 60 * 24);
  return daysSinceDonation >= 90;
});

// Virtual: Days since last donation
donorSchema.virtual('daysSinceLastDonation').get(function() {
  if (!this.lastDonationDate) return null;
  return Math.floor((Date.now() - new Date(this.lastDonationDate)) / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
donorSchema.index({ bloodGroup: 1, city: 1, isAvailable: 1 });
donorSchema.index({ bloodGroup: 1, state: 1, isAvailable: 1 });
donorSchema.index({ isAvailable: 1, lastActive: -1 });
donorSchema.index({ userId: 1 });

// Pre-save middleware to update lastActive
donorSchema.pre('save', function(next) {
  this.lastActive = new Date();
  next();
});

module.exports = mongoose.model('Donor', donorSchema);
