import Finance from '../models/Finance.js';

export const getFinances = async (req, res) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    
    let query = { userId: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (category) query.category = category;

    const finances = await Finance.find(query).sort({ date: -1 });
    
    res.json({
      success: true,
      count: finances.length,
      data: finances
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createFinance = async (req, res) => {
  try {
    const finance = new Finance({
      ...req.body,
      userId: req.userId
    });
    await finance.save();

    res.status(201).json({
      success: true,
      message: 'Finance record created successfully',
      data: finance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateFinance = async (req, res) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!finance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Finance record not found' 
      });
    }

    res.json({
      success: true,
      message: 'Finance record updated successfully',
      data: finance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteFinance = async (req, res) => {
  try {
    const finance = await Finance.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!finance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Finance record not found' 
      });
    }

    res.json({
      success: true,
      message: 'Finance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getFinanceSummary = async (req, res) => {
  try {
    const summary = await Finance.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      income: 0,
      expense: 0,
      balance: 0,
      transactions: 0
    };

    summary.forEach(item => {
      if (item._id === 'income') {
        result.income = item.total;
        result.transactions += item.count;
      } else if (item._id === 'expense') {
        result.expense = item.total;
        result.transactions += item.count;
      }
    });

    result.balance = result.income - result.expense;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};