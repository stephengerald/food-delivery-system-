const Order = require("../models/orderModel")
const Restaurants = require("../models/restaurantModel");
const Menu = require("../models/menuModel")
const Users = require("../models/userModel")
const DeliveryPersonnel = require("../models/deliveryPersonnelModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("../sendEmail");
const mongoose = require("mongoose");
const axios = require('axios');


/*
const createOrder = async (req, res) => {
  try {
    const { userId, restaurantId, orderedItems } = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingUser = await Users.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const restaurant = await Restaurants.findById(restaurantId);
    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant not found" });
    }

    const validItemsWithPrices = [];
    let totalCost = 0;
    for (const item of orderedItems) {
      const menuItem = await Menu.findById(item.itemId);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item with ID ${item.itemId} not found` });
      }
      validItemsWithPrices.push({ ...item, price: menuItem.price });
      totalCost += item.quantity * menuItem.price;
    }

    // Create a payment request to Paystack
    const paymentData = {
      email: existingUser.email,
      amount: totalCost * 100, // Convert amount to kobo
      metadata: {
        userId: userId,
        restaurantId: restaurantId,
        orderedItems: validItemsWithPrices
      }
    };

    const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', paymentData, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const { authorization_url, reference } = paymentResponse.data.data;

    // Find available delivery personnel
    const availableDeliveryPersonnel = await DeliveryPersonnel.findOne({ currentStatus: 'available' });

    const newOrder = new Order({
      userId,
      restaurantId,
      orderedItems: validItemsWithPrices,
      totalCost,
      deliveryPersonnel: availableDeliveryPersonnel ? availableDeliveryPersonnel._id : null,
      paymentIntentId: reference,
      paymentStatus: 'pending',
      amount: totalCost
    });

    await newOrder.save();

    if (availableDeliveryPersonnel) {
      availableDeliveryPersonnel.currentStatus = 'assigned';
      await availableDeliveryPersonnel.save();
    }

    res.status(201).json({ message: "Order placed successfully", order: newOrder, paymentUrl: authorization_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/

const createOrder = async (req, res) => {
  try {
    const { userId, restaurantId, orderedItems, email } = req.body;

    // Validate user ID (Optional)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingUser = await Users.findById(userId);
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const restaurant = await Restaurants.findById(restaurantId);
    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant not found" });
    }

    const validItemsWithPrices = [];
    let totalCost = 0;
    for (const item of orderedItems) {
      const menuItem = await Menu.findById(item.itemId);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item with ID ${item.itemId} not found` });
      }
      validItemsWithPrices.push({ ...item, price: menuItem.price });
      totalCost += item.quantity * menuItem.price;
    }

    // Create a payment request to Paystack
    const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email,
      amount: totalCost * 100, // amount in kobo
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (paymentResponse.data.status !== true) {
      return res.status(400).json({ message: 'Payment initialization failed' });
    }

    const paymentData = paymentResponse.data.data;
    const { authorization_url, reference } = paymentData;

    // Find available delivery personnel
    const availableDeliveryPersonnel = await DeliveryPersonnel.findOne({ currentStatus: 'available' });

    const newOrder = new Order({
      userId,
      restaurantId,
      orderedItems: validItemsWithPrices,
      totalCost,
      deliveryPersonnel: availableDeliveryPersonnel ? availableDeliveryPersonnel._id : null,
      paymentReference: reference,
      paymentStatus: 'pending',
      amount: totalCost
    });

    await newOrder.save();

    if (availableDeliveryPersonnel) {
      availableDeliveryPersonnel.currentStatus = 'assigned';
      await availableDeliveryPersonnel.save();
    }

    res.status(201).json({ message: "Order placed successfully", order: newOrder, paymentUrl: authorization_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
const verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const { status, data } = response.data;
    if (status === 'success') {
      // Update order status in the database
      const order = await Order.findOneAndUpdate({ paymentIntentId: reference }, { paymentStatus: 'paid' }, { new: true });
      res.send('Payment successful');
    } else {
      res.status(400).send('Payment verification failed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred during payment verification');
  }
};
*/

const verifyPayment = async (req, res) => {
  const { reference } = req.query;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const { status, data } = response.data;
    if (data.status === 'success') {
      // Update order status in the database
      const order = await Order.findOneAndUpdate({ paymentReference: reference }, { paymentStatus: 'paid' }, { new: true });
      res.status(200).json({ message: 'Payment successful', order });
    } else {
      console.error('Payment verification failed:', data);
      res.status(400).json({ message: 'Payment verification failed', data });
    }
  } catch (error) {
    console.error('Error during payment verification:', error);
    res.status(500).json({ message: 'An error occurred during payment verification', error });
  }
};


//app.get('/verify-payment', verifyPayment);

    
//Display a single order
const singleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the order by ID
        const order = await Order.findById(id).populate('restaurantId').populate('deliveryPersonnel');

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({ requestedOrder: order });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const allOrders = async (req, res) => {
    try {
        const allOrder = await Order.find().populate('restaurantId').populate('deliveryPersonnel');

        return res.status(200).json({ message: "Successful", count: allOrder.length, allOrder });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if(status === 'completed' && !order.deliveryPersonnel) {
      return res.status(400).json({ message: 'Order cannot be completed without a delivery personnel' });
    }

    order.status = status;
    await order.save();

    if (status === 'completed') {
      const deliveryPersonnel = await DeliveryPersonnel.findById(order.deliveryPersonnel);
      deliveryPersonnel.currentStatus = 'available';
      await deliveryPersonnel.save();
    }

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the order by ID
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const availableOrder = await Order.find();

        return res.status(200).json({
            message: "Order deleted successfully", RemainingOrder: availableOrder.length, availableOrder
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createOrder,
    verifyPayment,
    singleOrder,
    allOrders,
    deleteOrder,
    updateOrder
}