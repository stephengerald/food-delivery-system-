const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", require: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurants", require: true },
    orderedItems: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', require: true },
        quantity: { type: Number, require: true },
        price: { type: Number, require: true }
    }],
    totalCost: { type: Number, require: true },
    status: { type: String, enum: ["pending", "preparing", "out_for_delivery", "delivered"], default: "pending" }
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order