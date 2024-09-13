const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    itemName: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    availability: { type: Boolean, default: true },
    restaurantId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurants" }]
}, {
    timestamps: true
})

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;