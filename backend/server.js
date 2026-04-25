/**
 * LifeLink - Express Server
 * Main entry point for the backend API
 * Follows MVC architecture with proper middleware setup
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ========================
// Middleware Configuration
// ========================

// CORS - Allow frontend to connect
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ========================
// API Routes
// ========================

app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LifeLink API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🩸 Welcome to LifeLink API',
    version: '1.0.0',
    description: 'Intelligent Blood Donation Platform',
    endpoints: {
      donors: '/api/donors',
      requests: '/api/requests',
      analytics: '/api/analytics',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// ========================
// Error Handling
// ========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================
// Server Startup
// ========================

const PORT = process.env.PORT || 5000;
const Donor = require('./models/Donor');
const User = require('./models/User');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Auto-seed if database is empty
  try {
    const adminCount = await User.countDocuments();
    if (adminCount === 0) {
      console.log('🌱 Database is empty. Running auto-seed for demonstration...');
      require('child_process').execSync('node seed.js', { stdio: 'inherit', env: { ...process.env, MONGODB_URI: process.env.MONGODB_URI } });
    }
  } catch (error) {
    console.error('Failed to auto-seed database:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║                                          ║
    ║   🩸 LifeLink API Server                 ║
    ║   Running on port ${PORT}                    ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
    ║                                          ║
    ║   API: http://localhost:${PORT}/api          ║
    ║                                          ║
    ╚══════════════════════════════════════════╝
    `);
  });
};

startServer();
