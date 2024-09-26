const Restaurants = require("../models/restaurantModel");
const Menu = require("../models/menuModel")
const Users = require("../models/userModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("../sendEmail");
const mongoose = require("mongoose");

const createMenu = async (req, res) => {

    try {
        const { name, description, price, availability, restaurant } = req.body;

        // Validate input data
        if (!name || !description || !price || !availability || !restaurant) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingmenu = await Menu.findOne({ name, description });

        if (existingmenu) {
            return res.status(400).json({ message: "Menu name already exist!" });
        }

        const newMenu = new Menu({ name, description, price, availability, restaurant });

        await newMenu.save();

        // Add menu to the restaurant's menus array

        const restaurantDoc = await Restaurants.findById(restaurant);

        if (!restaurantDoc) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        restaurantDoc.menu.push(newMenu);

        await restaurantDoc.save();

        return res.status(200).json({ message: "Successful", menuList: newMenu });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const singleMenu = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the menu by ID
        const menu = await Menu.findById(id);

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        return res.status(200).json(menu);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving menu', error: error.message });
    }
};

const allMenu = async (req, res) => {
    try {
        const menu = await Menu.find().populate("restaurant", "_id name");

        return res.status(200).json({ message: "Successful", count: menu.length, menu })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, availability, restaurant } = req.body;

        // Find the menu by ID and update with new data
        const updatedMenu = await Menu.findByIdAndUpdate(id, { name, description, price, availability, restaurant }, { new: true }).populate('restaurant', 'name _id');

        if(!updatedMenu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        return res.status(200).json({ message: 'Menu updated successfully', menu: updatedMenu });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the menu by ID and delete it
        const deletedMenu = await Menu.findByIdAndDelete(id);

        if (!deletedMenu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        const availableMenu = await Menu.find();

        return res.status(200).json({ message: "Menu deleted successfully", deleted_Menu: deletedMenu, count: availableMenu.length, Available_Menu: availableMenu });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createMenu,
    singleMenu,
    allMenu,
    updateMenu,
    deleteMenu
}