/**
 * LifeLink - Database Configuration
 * Connects to MongoDB using Mongoose with retry logic
 */

const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    // Try to connect to the provided URI first
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // Shorter timeout for fallback
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Local MongoDB connection failed: ${error.message}`);
    console.log('🔄 Falling back to in-memory MongoDB (mongodb-memory-server) for demonstration purposes...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      // Update env var so seed script and other parts use it
      process.env.MONGODB_URI = mongoUri;
    } catch (memError) {
      console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }

  // Handle connection events
  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });
};

module.exports = connectDB;
