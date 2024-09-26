const express = require("express");
const validateToken = require("../middleware/validateAuth");
const { createRestaurant, allRestaurant, updatedRestaurant, deleteOneRestaurant } = require("../controllers/restaurantCtrl");

const router = express.Router();

// create a new restaurant
router.post("/create-restaurants", validateToken, createRestaurant);

//get all restaurant
router.get("/all-restaurants", validateToken, allRestaurant);

// Update a restaurant
router.patch("/edit-restaurant/:id", validateToken, updatedRestaurant);

//Delete a restaurant
router.delete("/delete-restaurants/:id", validateToken, deleteOneRestaurant)

module.exports = router;