require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { awsConfig, bedrockConfig, dynamoDBConfig } = require('./config/aws');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for frontend assets
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Swasthya Sathi Backend',
    region: awsConfig.region,
    models: {
      primary: bedrockConfig.modelIdSonnet,
      fallback: bedrockConfig.modelIdHaiku
    }
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const labReportRoutes = require('./routes/labReportRoutes');
const profileRoutes = require('./routes/profileRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const consultationRoutes = require('./routes/consultationRoutes');

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Swasthya Sathi API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      profile: '/api/profile',
      labReport: '/api/lab-report/*',
      chat: '/api/chat/*',
      medications: '/api/medications',
      consultations: '/api/consultations',
      doctors: '/api/doctors',
      notifications: '/api/notifications'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/lab-report', labReportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api', consultationRoutes); // For /api/doctors routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  // If it's an API request, return JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Endpoint not found',
      path: req.path,
      method: req.method
    });
  }
  
  // Otherwise, serve the frontend index.html for client-side routing
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Swasthya Sathi Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Region: ${awsConfig.region}`);
  console.log(`🤖 AI Model: ${bedrockConfig.modelIdSonnet}`);
  console.log(`📊 DynamoDB Tables:`, Object.keys(dynamoDBConfig.tables).length);
});

module.exports = app;
