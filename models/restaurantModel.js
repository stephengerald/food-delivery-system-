const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', require: true },
    name: { type: String, require: true },
    location: { type: String, require: true },
    email: { type: String, require: true },
    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }]
  }, {
    timestamps: true
  });

  const Restaurants = mongoose.model("Restaurants", restaurantSchema);

  module.exports = Restaurants;