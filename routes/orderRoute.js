const express = require("express");
const validateToken = require("../middleware/validateAuth");
const { createOrder, singleOrder, allOrders, deleteOrder, updateOrder } = require("../controllers/orderCtrl");


const router = express.Router();

// create a order
router.post("/create-order", createOrder);

//display an order
router.get("/order/:id", singleOrder);

//display all orders
router.get("/all-orders", allOrders);

//update an order
router.put("/order/:id/update-status", updateOrder)

//delete an order
router.delete("/delete-order/:id", deleteOrder);

module.exports = router