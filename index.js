const express = require("express");
const dotenv = require("dotenv").config();
const connectToDatabase = require("./dataBase");
const { validateRegistration, validateLogin } = require("./middleware/validations");
const validateToken = require("./middleware/validateAuth")
const Users = require("./model/userModel")
const Restaurants = require("./model/restaurantModel")
const Order = require("./model/orderModel")
const Menu = require("./model/menuModel")
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("./sendEmail");

const foodApp = express();

foodApp.use(express.json());

const PORT = process.env.PORT || 9000;

// ConnectTo DATABASE

connectToDatabase();

foodApp.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`);
});


foodApp.get("/", (req, res)=>{
    try {
        return res.status(200).json({ message: "Welcome to FoodCorner!" })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
});


//user registration endpoint

foodApp.post("/register", validateRegistration, async (req, res)=>{
    try {
        const { username, email, password, role } = req.body;

        const exitingUser = await Users.findOne({ email });

        if(exitingUser){
            return res.status(400).json({message: "User account already exist!"});
        }

        // Hash password

        const hashedPassword = await bcrypt.hash(password, 15);

        const newUser = new Users({ username, email, password: hashedPassword, role});

        await newUser.save();

        // send Users Email

        await sendUserEmail(email)

        return res.status(200).json({message: "Successful", user: newUser});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// find user by Id

foodApp.get("/user/:id", async (req, res)=>{
    try {
        const { id } = req.params;

        const user = await Users.findById(id);

        return res.status(200).json({
            message: "Successful",
            user
        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// login endpoint

foodApp.post("/login", validateLogin, async (req, res)=>{
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({email});

        if(!user){
            return res.status(404).json({message: "User account not found"})
        }

        const isMatched = bcrypt.compare(password, user.password);

        if(!isMatched){
            return res.status(400).json({message: "Incorrect password or email!"})
        }

        // Generating Tokens
        // Access Token

        const accessToken = jwt.sign({user}, `${process.env.ACCESS_TOKEN}`, {expiresIn: "5m"});

        const refreshToken = jwt.sign({user}, `${process.env.REFRESH_TOKEN}`, {expiresIn: "5m"})

        await sendUserEmail(email);

        return res.status(200).json({
            message: "Login Successful",
            accessToken,
            user
        })
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// Protected Routes

foodApp.post("/auth", validateToken, (req, res)=>{
    try {
        return res.status(200).json({message: "Successful", user: req.user})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// Restaurant Endpoints
// create a new restaurant

foodApp.post("/restaurants", async (req, res)=>{
    try {
        const { username, location, email, menu } = req.body

        const existingRestaurant = await Restaurants.findOne({ username });

        if(existingRestaurant){
            return res.status(400).json({message: "Restaurant name already exist!"});
        }

        const newRestaurant = new Restaurants({ username, location, email, menu });

        await newRestaurant.save();

        // send Restaurant Email

        await sendUserEmail(email, username)

        return res.status(200).json({message: "Successful", restaurant: newRestaurant});
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// Get all restaurants

foodApp.get("/restaurants", async (req, res)=>{
    try {
        const restaurants = await Restaurants.find();

        return res.status(200).json({message: "Successful", count: restaurants.length, restaurants});

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// Update a restaurant

foodApp.patch("/edit-restaurant/:id", async (req, res)=>{
    try {
        const { id } = req.params;

        const { username, location, email, menu } = req.body;

        const updateRestaurant = await Restaurants.findByIdAndUpdate(id, { username, location, email, menu }, {new: true});

        return res.status(200).json({message: "Successful", restaurant: updateRestaurant});

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

})

//Delete a Restaurant

foodApp.delete("/delete-restaurants/:id", async (req, res)=>{
    try {
        const { id } = req.params;

    const { username, location, email, menu } = req.body;

    const deleteRestaurant = await Restaurants.findByIdAndDelete(
        id,
        {
            username,
            location,
            email,
            menu
        },
        {new: true});

    const availableRestaurants = await Restaurants.find();

    return res.status(200).json({
        message: "Successful",

        count: availableRestaurants.length,
        restaurant: {deleteRestaurant, availableRestaurants}
    })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


//Order endpoints
//Place an order
foodApp.post("/orders", validateToken, async (req, res)=>{
    try {
        const { userId, restaurantId, orderedItems, totalCost, status } = req.body;

        const existingOrder = await Order.findOne({ userId, restaurantId, orderedItems, totalCost, status });

        if(existingOrder){
            return res.status(400).json({message: "Order has bee placed already!"});
        }

        const newOrder = new Order({ userId, restaurantId, orderedItems, totalCost, status });

        await newOrder.save();

        return res.status(200).json({message: "Order placed successfully!", order: newOrder});

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

})