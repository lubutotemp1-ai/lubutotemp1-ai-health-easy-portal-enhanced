const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// Use MongoDB database
const db = require('../../db/database-mongo');

console.log('🚀 Initializing serverless API...');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

// Load routes with error handling
try {
  console.log('📚 Loading routes...');
  app.use('/api/auth', require('../../routes/auth'));
  app.use('/api/appointments', require('../../routes/appointments'));
  app.use('/api/health', require('../../routes/health'));
  app.use('/api/education', require('../../routes/education'));
  app.use('/api/admin', require('../../routes/admin'));
  app.use('/api/doctor', require('../../routes/doctor'));
  app.use('/api/doctors', require('../../routes/doctors'));
  app.use('/api/chat', require('../../routes/chat'));
  app.use('/api/diagnosis', require('../../routes/diagnosis'));
  app.use('/api/schedules', require('../../routes/schedules'));
  console.log('✅ All routes loaded successfully');
} catch (err) {
  console.error('❌ Error loading routes:', err.message);
  console.error(err.stack);
}

// Health check endpoint
app.get('/', (req, res) => {
  console.log('🏥 Health check request');
  res.json({ message: '✅ Health Easy Portal API running', version: '3.0.0' });
});

// 404 handler
app.use((req, res) => {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ API Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong: ' + err.message });
});

console.log('🎯 Exporting serverless handler...');
module.exports.handler = serverless(app);
