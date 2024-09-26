const DeliveryPersonnel = require("../models/deliveryPersonnelModel");
const Order = require("../models/orderModel");
const Restaurants = require("../models/restaurantModel");
const Menu = require("../models/menuModel");
const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("../sendEmail");
const mongoose = require("mongoose");


const createDeliveryPersonnel = async(req, res)=>{
    try {
        const { name, contactInfo, vehicleDetails } = req.body;

        const existingDeliveryPerson = await DeliveryPersonnel.findOne({name, contactInfo});

        if(existingDeliveryPerson){
            return res.status(400).json({message: "User info already exist!"})
        };

        const newDeliveryPersonnel = new DeliveryPersonnel({
            name,
            contactInfo,
            vehicleDetails
        });

        await newDeliveryPersonnel.save();

        return res.status(200).json({message: "Delivery personnel created successfully!", deliveryPersonnel: newDeliveryPersonnel})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAllDeliveryPersonnel = async(req, res)=>{
    try {
        const allDeliveryPersonnel = await DeliveryPersonnel.find();

        return res.status(200).json({message: "successful", All_delivery_personnel: allDeliveryPersonnel})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getSingleDeliveryPersonnel = async(req, res)=>{
    try {
        const { id } = req.params;

        const singleDeliveryPersonnel = await DeliveryPersonnel.findById(id);

        if(!singleDeliveryPersonnel){
            return res.status(400).json({message: "Id do not match. Please check and try again!"});
        }

        return res.status(200).json({message: "Successful", delivery_personnel: singleDeliveryPersonnel})
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

const updateDeliveryPersonnel = async(req, res)=>{
    try {
        const { id } = req.params;
        const { name, contactInfo, vehicleDetails } = req.body;

        const updatedDeliveryPersonnel = await DeliveryPersonnel.findByIdAndUpdate(id, { name, contactInfo, vehicleDetails }, { new: true });

        if(!updatedDeliveryPersonnel){
            return res.status(400).json({message: "Delivery personnel not found"});
        }

        return res.status(200).json({message: "Successful", Updated_delivery_personnel: updatedDeliveryPersonnel});

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

const deleteDeliveryPersonnel = async(req, res)=>{
    try {
        const { id } = req.params;
        const { name, contactInfo, vehicleDetails } = req.body;

        const deletedDeliveryPresonnel = await DeliveryPersonnel.findByIdAndDelete(id, { name, contactInfo, vehicleDetails });

        if(!deletedDeliveryPresonnel){
            return res.status(400).json({message: "Delivery personnel not found!"});
        };

        const availableDeliveryPersonnel = await DeliveryPersonnel.find();

        return res.status(200).json({message: "Successful", deleted_delivery_personnel: deletedDeliveryPresonnel, available_delivery_personnel: availableDeliveryPersonnel.length});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}



module.exports = {
    createDeliveryPersonnel,
    getAllDeliveryPersonnel,
    getSingleDeliveryPersonnel,
    updateDeliveryPersonnel,
    deleteDeliveryPersonnel
}