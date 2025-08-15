const Expense = require('../models/Expense');
const User = require('../models/User');

// Create Expense
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, paymentMethod } = req.body;
    
    const expense = await Expense.create({
      user: req.user.userId,
      title,
      amount,
      category,
      description,
      date: date || new Date(),
      paymentMethod
    });

    // Populate user info
    await expense.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
};

// Get All Expenses for User
exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = { user: req.user.userId };
    
    if (category) {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const expenses = await Expense.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    // Get total count
    const total = await Expense.countDocuments(filter);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expenses',
      error: error.message
    });
  }
};

// Get Single Expense
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('user', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });

  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense',
      error: error.message
    });
  }
};

// Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, paymentMethod } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, amount, category, description, date, paymentMethod },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
};

// Get Expense Statistics
exports.getExpenseStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user.userId;

    // Build date filter
    let dateFilter = {};
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      dateFilter = { date: { $gte: startDate, $lte: endDate } };
    }

    // Get total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: { user: userId, ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Get category-wise expenses
    const categoryStats = await Expense.aggregate([
      { $match: { user: userId, ...dateFilter } },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { total: -1 } }
    ]);

    // Get monthly stats for the year
    const monthlyStats = await Expense.aggregate([
      { $match: { user: userId, ...dateFilter } },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalAmount: totalExpenses[0]?.total || 0,
          totalCount: totalExpenses[0]?.count || 0
        },
        categoryBreakdown: categoryStats,
        monthlyBreakdown: monthlyStats
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense statistics',
      error: error.message
    });
  }
};