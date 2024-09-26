const express = require("express");
const validateToken = require("../middleware/validateAuth");
const { createDeliveryPersonnel, getAllDeliveryPersonnel, getSingleDeliveryPersonnel, updateDeliveryPersonnel, deleteDeliveryPersonnel } = require("../controllers/deliveryPersonnelCtrl");


const router = express.Router();

// create delivery personnel
router.post("/create-delivery-personnel", createDeliveryPersonnel);

//get all delivery personnel
router.get("/all-delivery-personnel", getAllDeliveryPersonnel);

//get a delivery personnel 
router.get("/single-delivery-personnel/:id", getSingleDeliveryPersonnel);

//update delivery personnel details
router.put("/update-delivery-personnel/:id", updateDeliveryPersonnel);

//delete delivery personnel
router.delete("/delete-delivery-personnel/:id", deleteDeliveryPersonnel);


module.exports = router