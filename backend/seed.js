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

    // Create sample donors (40 donors)
    const donors = [];
    for (let i = 0; i < 40; i++) {
      const firstName = randomFrom(firstNames);
      const lastName = randomFrom(lastNames);
      const gender = i < 25 ? (i % 3 === 2 ? 'Female' : 'Male') : randomFrom(genders);
      const hasLastDonation = Math.random() > 0.3;
      const lastDonationDate = hasLastDonation
        ? randomDate(new Date('2024-01-01'), new Date())
        : null;
      const city = randomFrom(cities);

      donors.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: randomPhone(),
        age: Math.floor(Math.random() * (55 - 18) + 18),
        gender,
        bloodGroup: randomFrom(bloodGroups),
        city,
        state: cityStateMap[city],
        address: `${Math.floor(Math.random() * 500) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
        isAvailable: Math.random() > 0.2, // 80% available
        lastDonationDate,
        totalDonations: Math.floor(Math.random() * 15),
        weight: Math.floor(Math.random() * (90 - 45) + 45),
        hasMedicalConditions: Math.random() > 0.9, // 10% have conditions
        isVerified: Math.random() > 0.3,
        responseRate: Math.floor(Math.random() * (100 - 60) + 60),
        lastActive: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        createdAt: randomDate(new Date('2024-06-01'), new Date()),
        // Add some health records for demo
        healthRecords: Math.random() > 0.5 ? [{
          date: randomDate(new Date('2024-08-01'), new Date()),
          hemoglobin: Math.floor(Math.random() * (17 - 12) + 12 * 10) / 10,
          bloodPressureSystolic: Math.floor(Math.random() * (140 - 100) + 100),
          bloodPressureDiastolic: Math.floor(Math.random() * (90 - 60) + 60),
          pulseRate: Math.floor(Math.random() * (100 - 60) + 60),
          notes: 'Routine check'
        }] : []
      });
    }

    const createdDonors = await Donor.insertMany(donors);
    console.log(`🩸 ${createdDonors.length} donors created`);

    // Link first donor to donor user account
    donorUser.donorProfile = createdDonors[0]._id;
    await donorUser.save();
    await Donor.findByIdAndUpdate(createdDonors[0]._id, { userId: donorUser._id });

    // Create sample blood requests (15 requests)
    const statuses = ['pending', 'pending', 'pending', 'accepted', 'accepted', 'completed', 'completed', 'completed'];
    const urgencyLevels = ['normal', 'normal', 'urgent', 'urgent', 'critical'];
    const requests = [];

    for (let i = 0; i < 15; i++) {
      const status = randomFrom(statuses);
      const city = randomFrom(cities);
      const bloodGroup = randomFrom(bloodGroups);

      const request = {
        patientName: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
        patientAge: Math.floor(Math.random() * (70 - 5) + 5),
        hospital: randomFrom(hospitals),
        city,
        bloodGroup,
        unitsNeeded: Math.floor(Math.random() * 4) + 1,
        urgencyLevel: randomFrom(urgencyLevels),
        status,
        requesterName: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
        requesterPhone: randomPhone(),
        requesterEmail: `requester${i}@email.com`,
        notes: i % 3 === 0 ? 'Urgent surgery scheduled' : '',
        isEmergency: Math.random() > 0.7,
        createdAt: randomDate(new Date('2024-08-01'), new Date())
      };

      if (status === 'accepted' || status === 'completed') {
        request.acceptedAt = randomDate(new Date(request.createdAt), new Date());
        request.assignedDonor = randomFrom(createdDonors)._id;
      }

      if (status === 'completed') {
        request.completedAt = randomDate(new Date(request.acceptedAt || request.createdAt), new Date());
      }

      requests.push(request);
    }

    const createdRequests = await Request.insertMany(requests);
    console.log(`📋 ${createdRequests.length} blood requests created`);

    console.log(`
    ╔══════════════════════════════════════════════╗
    ║                                              ║
    ║   🩸 LifeLink Database Seeded!               ║
    ║                                              ║
    ║   Donors: ${createdDonors.length}                                ║
    ║   Requests: ${createdRequests.length}                              ║
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
