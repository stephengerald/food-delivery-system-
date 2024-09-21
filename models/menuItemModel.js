const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    itemName: { type: String, require: true },
    description: { type: String, require: true },
    price: { type: Number, require: true },
    restaurantId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurants"}]
}, {
    timestamps: true
})

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;