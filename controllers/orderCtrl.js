const Order = require("../models/orderModel")
const Restaurants = require("../models/restaurantModel");
const Menu = require("../models/menuModel")
const Users = require("../models/userModel")
const DeliveryPersonnel = require("../models/deliveryPersonnelModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("../sendEmail");
const mongoose = require("mongoose");



const createOrder = async (req, res) => {
  try {
    const { userId, restaurantId, orderedItems } = req.body;

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

    // Find available delivery personnel
    const availableDeliveryPersonnel = await DeliveryPersonnel.findOne({ currentStatus: 'available' });

    const newOrder = new Order({
      userId,
      restaurantId,
      orderedItems: validItemsWithPrices,
      totalCost,
      deliveryPersonnel: availableDeliveryPersonnel ? availableDeliveryPersonnel._id : null
    });

    await newOrder.save();

    if (availableDeliveryPersonnel) {
      availableDeliveryPersonnel.currentStatus = 'assigned';
      await availableDeliveryPersonnel.save();
    }

    res.status(201).json({ message: "Order placed successfully", A_new_order: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*
    const createOrder = async (req, res) => {
        try {
          const { userId, restaurantId, orderedItems } = req.body;
      
          // Validate user ID (Optional)
          if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
          }
      
          const existingUser = await Users.findById(userId);
          if (!existingUser) {
            return res.status(400).json({ message: "User not found" });
          }
      
          const validItemsWithPrices = [];
          for (const item of orderedItems) {
            const menuItem = await Menu.findById(item.itemId);
            if (!menuItem) {
              return res.status(400).json({ message: `Menu item with ID ${item.itemId} not found` });
            }
            validItemsWithPrices.push({ ...item, price: menuItem.price });
          }
      
          const totalCost = validItemsWithPrices.reduce((acc, item) => acc + item.quantity * item.price, 0);
          const newOrder = new Order({
            userId,
            restaurantId,
            orderedItems: validItemsWithPrices,
            totalCost,
          });
          await newOrder.save();
      
          return res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
        } catch (error) {
          console.error(error); // Log the error for debugging
          return res.status(500).json({ message: "Error creating order" }); // Generic error message for user
        }
      };
      */
    
//Display a single order
const singleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the order by ID
        const order = await Order.findById(id).populate('restaurant').populate('deliveryPersonnel');

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
        const allOrder = await Order.find().populate('restaurant').populate('deliveryPersonnel');

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
    singleOrder,
    allOrders,
    deleteOrder,
    updateOrder
}