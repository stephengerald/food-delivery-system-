const express = require("express");
const validateToken = require("../middleware/validateAuth");
const { createOrder, singleOrder, allOrders, deleteOrder, updateOrder } = require("../controllers/orderCtrl");


const router = express.Router();

// create a order
router.post("/create-order", validateToken, createOrder);

//display an order
router.get("/order/:id", validateToken, singleOrder);

//display all orders
router.get("/all-orders", validateToken, allOrders);

//update an order
router.put("/order/:id/update-status", validateToken, updateOrder)

//delete an order
router.delete("/delete-order/:id", validateToken, deleteOrder);

module.exports = router;