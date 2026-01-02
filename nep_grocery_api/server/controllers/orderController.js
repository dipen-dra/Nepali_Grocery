
// Order Controller
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';


import { calculateOrderDetails } from '../utils/orderHelper.js';

export const createOrder = async (req, res) => {
  const { items, address, phone, applyDiscount } = req.body;

  if (!address || address.trim() === '') {
    return res.status(400).json({ success: false, message: "A delivery location is required." });
  }
  if (!phone || phone.trim() === '') {
    return res.status(400).json({ success: false, message: "A contact number is required." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const {
      orderItems,
      finalAmount,
      discountApplied,
      pointsToDeduct,
      productUpdates
    } = await calculateOrderDetails(items, user, applyDiscount);

    if (pointsToDeduct > 0) {
      user.groceryPoints -= pointsToDeduct;
    }

    const newOrder = new Order({
      customer: req.user._id,
      items: orderItems,
      amount: finalAmount,
      address,
      phone,
      paymentMethod: 'COD',
      discountApplied,
      pointsAwarded: 0,
    });

    await user.save();
    await newOrder.save();
    await Product.bulkWrite(productUpdates);

    let successMessage = `Order placed successfully!`;
    if (discountApplied) {
      successMessage += ' 25% discount was applied.';
    }

    res.status(201).json({
      success: true,
      message: successMessage,
      order: newOrder,
      updatedUser: user,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error("Order creation failed:", error);
    res.status(500).json({ success: false, message: "An unexpected error occurred." });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const originalStatus = order.status;
    if (originalStatus === status) {
      return res.json({ success: true, order });
    }

    const user = await User.findById(order.customer);
    if (!user) {
      console.error(`User with ID ${order.customer} not found for order ${order._id}`);
      order.status = status;
      await order.save();
      return res.json({ success: true, order });
    }

    if (status === 'Delivered' && originalStatus !== 'Delivered' && order.paymentMethod === 'COD') {
      const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (itemsTotal >= 2000 && order.pointsAwarded === 0) {
        const pointsToAward = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
        user.groceryPoints += pointsToAward;
        order.pointsAwarded = pointsToAward;
      }
    }

    if (status === 'Cancelled' && originalStatus !== 'Cancelled') {
      if (order.pointsAwarded > 0) {
        user.groceryPoints -= order.pointsAwarded;
      }
      if (order.discountApplied) {
        user.groceryPoints += 150;
      }
      user.groceryPoints = Math.max(0, user.groceryPoints);

      const productUpdates = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } },
        },
      }));

      await Product.bulkWrite(productUpdates);
    }

    await user.save();
    order.status = status;
    const updatedOrder = await order.save();

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(400).json({ success: false, message: 'Failed to update order status' });
  }
};


export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Pending Payment' } })
      .populate('customer', 'fullName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id,
      status: { $ne: 'Pending Payment' },
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'fullName email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching single order:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const paymentHistory = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, history: paymentHistory });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};