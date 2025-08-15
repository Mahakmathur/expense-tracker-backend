const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/expenseController');
const { validateExpense } = require('../middleware/validation');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', validateExpense, createExpense);
router.get('/', getExpenses);
router.get('/stats', getExpenseStats);
router.get('/:id', getExpense);
router.put('/:id', validateExpense, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;