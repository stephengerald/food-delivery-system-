const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurants", required: true },
    orderedItems: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalCost: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentReference: { type: String },
    deliveryPersonnel: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPersonnel" },
    status: { type: String, enum: ["pending", "preparing", "out_for_delivery", "delivered"], default: "pending" },
    amount: { type: Number, required: true } // Field for amount
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
