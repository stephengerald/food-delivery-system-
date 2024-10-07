const Restaurants = require("../models/restaurantModel");
const Menu = require("../models/menuModel")
const Users = require("../models/userModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("../sendEmail");
const mongoose = require("mongoose");
const { pagination } = require("../utilities");

const createRestaurant = async (req, res) => {
    try {
        const { user_id, name, location, email, menu } = req.body;

        // Check if the user_id exists and is a registered user
        const existingUser = await Users.findById(user_id);

        if (!existingUser) {
            return res.status(400).json({ message: "You do not have an account yet, Please register!" });
        }

        // Check if the user has the 'restaurant_owner' role
        if (existingUser.role !== 'restaurant_owner') {
            return res.status(403).json({ message: "Only restaurant owners can create restaurants" });
        }

        const existingRestaurant = await Restaurants.findOne({ email, name });

        if (existingRestaurant) {
            return res.status(400).json({ message: "Restaurant name already exist!" });
        }

        // Link the menu to the restaurant
        const menuItems = await Menu.find({ _id: { $in: menu } });

        if (!menuItems.length) {
            return res.status(400).json({ message: "No valid menu items found" });
        }

        //create a new restaurant with the menu field
        const newRestaurant = new Restaurants({ owner: user_id, name, location, email, menu: menuItems.map(item => item._id) });

        // save new restaurant
        await newRestaurant.save();

        // Populate the menu details
        const populatedRestaurant = await Restaurants.findById(newRestaurant._id).populate({
            path: 'menu',
            select: '_id name description price'
        });

        // send Restaurant Email

        await sendUserEmail(email, name)

        return res.status(200).json({ message: "Successful", restaurant: populatedRestaurant });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const singleRestaurant = async (req, res) => {
    try {
      const { id } = req.params;
  
      const restaurant = await Restaurants.findById(id).populate({
        path: "menu",
        select: "_id name description price"
      });
  
      if(!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      return res.status(200).json({ message: "Successful", restaurant });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

const allRestaurant = async (req, res) => {
    try {
        const { page, limit, skip } = pagination(req)
        const restaurants = await Restaurants.find().sort({createdAt: -1}).populate({
            path: 'menu',
            select: '_id name description price'
        });

        return res.status(200).json({ message: "Successful", count: restaurants.length, page, restaurants });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updatedRestaurant = async (req, res) => {

    try {
        const { id } = req.params;

        const { user_id, name, location, email, menu } = req.body;

        const updateData = { owner: user_id, name, location, email };

        // Link the menu to the restaurant
        if (menu && menu.length) {
            const menuItems = await Menu.find({ _id: { $in: menu } });

            if (!menuItems.length) {
                return res.status(400).json({ message: "No valid menu items found" });
            }

            updateData.menu = menuItems.map(item => item._id);
        }

        const updateRestaurant = await Restaurants.findByIdAndUpdate(id, updateData, { new: true }).populate({
            path: "menu",
            select: '_id name description price'
        });

        if (!updateRestaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        return res.status(200).json({ message: "Successful", restaurant: updateRestaurant });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }    
};

const deleteOneRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the restaurant by ID
        const deleteRestaurant = await Restaurants.findByIdAndDelete(id);

        if (!deleteRestaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Get the updated list of available restaurants
        const availableRestaurants = await Restaurants.find();

        return res.status(200).json({
            message: "Successful",
            count: availableRestaurants.length,
            deletedRestaurant: deleteRestaurant,
            availableRestaurants: availableRestaurants
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createRestaurant,
    allRestaurant,
    updatedRestaurant,
    deleteOneRestaurant,
    singleRestaurant
}