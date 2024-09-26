const express = require("express");
const dotenv = require("dotenv").config();
const connectToDatabase = require("./dataBase");
const { validateRegistration, validateLogin } = require("./middleware/validations");
const validateToken = require("./middleware/validateAuth")
const Users = require("./models/userModel")
const Restaurants = require("./models/restaurantModel")
const Order = require("./models/orderModel")
const Menu = require("./models/menuModel")
const DeliveryPersonnel = require("./models/deliveryPersonnelModel")
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("./sendEmail");
const userRouter = require("./routes/userRoute");
const restaurantRouter = require("./routes/restaurantRoute");
const menuRouter = require("./routes/menuRoute");
const orderRouter = require("./routes/orderRoute");
const deliveryPersonnelRoute = require("./routes/deliveryPersonnelRoute")
const cors = require("cors")
const morgan = require("morgan")

const foodApp = express();

foodApp.use(express.json());
foodApp.use(cors());
foodApp.use(morgan("combined"));

const PORT = process.env.PORT || 9000;

// ConnectTo DATABASE

connectToDatabase();

foodApp.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});


foodApp.use("/api", userRouter);
foodApp.use("/api", restaurantRouter);
foodApp.use("/api", menuRouter);
foodApp.use("/api", orderRouter);
foodApp.use("/api", deliveryPersonnelRoute);

foodApp.use((req, res) => {
    return res.status(404).json({ message: "This endpoint does not exist yet" });
});

