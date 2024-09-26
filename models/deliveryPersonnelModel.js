const mongoose = require("mongoose");

const deliveryPersonnelSchema = new mongoose.Schema({
    name: { type: String, require: true },
    contactInfo: {
        phoneNumber: { type: String, require: true },
        email: { type: String, require: true }
    },
    vehicleDetails: {
        type: { type: String, require: true },
        licesePlate: { type: String, require: true }
    },
    currentStatus: { type: String, enum: ["available", "assigned", "on_delivery", "completed"], default: "available" }
},
{ timestamps: true }
);

const DeliveryPersonnel = mongoose.model("DeliveryPersonnel", deliveryPersonnelSchema);

module.exports = DeliveryPersonnel;