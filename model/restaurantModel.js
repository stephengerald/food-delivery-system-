const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    username: { type: String, required: true },
    location: { type: String, required: true },
    email: { type: String, required: true },
    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Menu" }]
  }, {
    timestamps: true
  });

  const Restaurants = mongoose.model("Restaurants", restaurantSchema);

  module.exports = Restaurants;