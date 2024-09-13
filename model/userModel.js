const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, require: true, unique: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true, unique: true },
    role: { type: String, require: true }
}, {
    timestamps: true
}
)

const Users = new mongoose.model("Users", userSchema)


module.exports = Users