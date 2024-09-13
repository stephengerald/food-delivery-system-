const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurants", required: true },
    orderedItems: [{type: String, require: true}],
    totalCost: { type: Number, required: true },
    status: { type: String, enum: ["pending", "preparing", "out_for_delivery", "delivered"], default: "pending" }
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order