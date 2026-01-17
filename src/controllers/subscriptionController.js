import Subscription from '../models/Subscription.js';

export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    const totalMonthlyCost = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);

    res.json({
      success: true,
      count: subscriptions.length,
      totalMonthlyCost,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { name, cost } = req.body;

    if (!name || !cost) {
      return res.status(400).json({
        success: false,
        message: 'Name and cost are required'
      });
    }

    const subscription = new Subscription({
      userId: req.userId,
      name,
      cost
    });

    await subscription.save();
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { name, cost } = req.body;

    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, cost },
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
