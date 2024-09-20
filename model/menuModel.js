const mongoose = require("mongoose")

const menuSchema = new mongoose.Schema({
    name: { type: String, require: true },
    availability: { type: Boolean, default: true },
    price: {type: String, require: true},
    description: { type: String, require: true },
    restaurant: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurants"}]
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;