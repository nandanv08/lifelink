/**
 * LifeLink - Database Seeder
 * Populates MongoDB with realistic sample data for demonstration
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Donor = require('./models/Donor');
const Request = require('./models/Request');
const User = require('./models/User');



const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const cityStateMap = {
  'Mumbai': 'Maharashtra', 'Delhi': 'Delhi', 'Bangalore': 'Karnataka',
  'Chennai': 'Tamil Nadu', 'Hyderabad': 'Telangana', 'Pune': 'Maharashtra',
  'Kolkata': 'West Bengal', 'Ahmedabad': 'Gujarat', 'Jaipur': 'Rajasthan',
  'Lucknow': 'Uttar Pradesh'
};
const cities = Object.keys(cityStateMap);
const genders = ['Male', 'Female', 'Other'];

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Priya', 'Riya', 'Saanvi', 'Aanya',
  'Kavya', 'Isha', 'Navya', 'Aditi', 'Rohan', 'Rahul', 'Amit', 'Vikram',
  'Suresh', 'Neha', 'Pooja', 'Meera', 'Sneha', 'Divya', 'Raj', 'Karan',
  'Manish', 'Deepak', 'Ankita', 'Swati', 'Nisha', 'Sakshi', 'Tanvi', 'Pallavi'
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Gupta', 'Joshi',
  'Verma', 'Mehta', 'Shah', 'Das', 'Rao', 'Iyer', 'Mukherjee', 'Chatterjee',
  'Desai', 'Pillai', 'Mishra', 'Bhat'
];

const hospitals = [
  'Apollo Hospital', 'Fortis Hospital', 'Max Super Speciality', 'AIIMS',
  'Medanta Hospital', 'Kokilaben Hospital', 'Narayana Health', 'Manipal Hospital',
  'Lilavati Hospital', 'Breach Candy Hospital', 'Tata Memorial', 'CMC Vellore'
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Donor.deleteMany({});
    await Request.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@lifelink.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
      isVerified: true
    });
    console.log('👤 Admin user created (admin@lifelink.com / admin123)');

    // Create hospital users (some verified, some pending)
    const hospitalUsers = [];
    for (let i = 0; i < 5; i++) {
      const city = cities[i];
      const hospital = hospitals[i];
      const isVerified = i < 3; // First 3 hospitals are verified
      
      const hospitalUser = await User.create({
        name: `${hospital} Admin`,
        email: `hospital${i + 1}@lifelink.com`,
        password: 'hospital123',
        role: 'hospital',
        phone: randomPhone(),
        hospitalName: hospital,
        hospitalAddress: `${Math.floor(Math.random() * 500) + 1}, Main Road`,
        hospitalCity: city,
        hospitalState: cityStateMap[city],
        hospitalRegistrationId: `HOSP-${city.substring(0, 3).toUpperCase()}-${1000 + i}`,
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? adminUser._id : null
      });
      hospitalUsers.push(hospitalUser);
    }
    console.log(`🏥 ${hospitalUsers.length} hospital users created (hospital1@lifelink.com / hospital123)`);

    // Create donor user account
    const donorUser = await User.create({
      name: 'Demo Donor',
      email: 'donor@lifelink.com',
      password: 'donor123',
      role: 'donor',
      phone: '9876543210'
    });
    console.log('👤 Donor user created (donor@lifelink.com / donor123)');

    // Create 1 Donor profile for the Demo Donor user
    const sampleDonor = await Donor.create({
      name: 'Demo Donor',
      email: 'donor@lifelink.com',
      phone: '9876543210',
      userId: donorUser._id,
      age: 25,
      gender: 'Male',
      bloodGroup: 'O+',
      city: 'Bangalore',
      state: 'Karnataka',
      isAvailable: true,
      totalDonations: 0
    });
    console.log(`🩸 1 base donor created`);

    // Link donor to user account
    donorUser.donorProfile = sampleDonor._id;
    await donorUser.save();

    console.log(`📋 0 blood requests created`);

    console.log(`
    ╔══════════════════════════════════════════════╗
    ║                                              ║
    ║   🩸 LifeLink Database Seeded!               ║
    ║                                              ║
    ║   Donors: 1                                ║
    ║   Requests: 0                              ║
    ║   Hospitals: ${hospitalUsers.length}                              ║
    ║                                              ║
    ║   Login Credentials:                         ║
    ║   Admin:    admin@lifelink.com / admin123     ║
    ║   Hospital: hospital1@lifelink.com / hospital123 ║
    ║   Donor:    donor@lifelink.com / donor123     ║
    ║                                              ║
    ╚══════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
