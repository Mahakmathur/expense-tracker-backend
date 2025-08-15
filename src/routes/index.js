const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const expenseRoutes = require('./expenses');

router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Expense Tracker API v1.0',
    endpoints: {
      auth: '/api/auth',
      expenses: '/api/expenses'
    }
  });
});

module.exports = router;

