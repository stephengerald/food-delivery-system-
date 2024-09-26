const express = require("express");
const validateToken = require("../middleware/validateAuth");
const { createDeliveryPersonnel, getAllDeliveryPersonnel, getSingleDeliveryPersonnel, updateDeliveryPersonnel, deleteDeliveryPersonnel } = require("../controllers/deliveryPersonnelCtrl");


const router = express.Router();

// create delivery personnel
router.post("/create-delivery-personnel", validateToken, createDeliveryPersonnel);

//get all delivery personnel
router.get("/all-delivery-personnel", validateToken, getAllDeliveryPersonnel);

//get a delivery personnel 
router.get("/single-delivery-personnel/:id", validateToken, getSingleDeliveryPersonnel);

//update delivery personnel details
router.put("/update-delivery-personnel/:id", validateToken, updateDeliveryPersonnel);

//delete delivery personnel
router.delete("/delete-delivery-personnel/:id", validateToken, deleteDeliveryPersonnel);


module.exports = router