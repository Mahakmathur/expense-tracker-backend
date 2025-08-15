const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Basic routes only
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Tracker API is working!',
    status: 'OK'
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API endpoints coming soon...',
    version: '1.0.0'
  });
});

// Connect to MongoDB (will fix this after server works)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.log('⚠️  MongoDB not connected (this is OK for now)'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});