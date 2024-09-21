const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("../sendEmail");

const loginFn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User account not found" })
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.status(400).json({ message: "Incorrect password or email!" })
        }

        // Generating Tokens
        // Access Token

        const accessToken = jwt.sign({ user }, `${process.env.ACCESS_TOKEN}`, { expiresIn: "5m" });

        const refreshToken = jwt.sign({ user }, `${process.env.REFRESH_TOKEN}`, { expiresIn: "5m" })

        await sendUserEmail(email);

        return res.status(200).json({
            message: "Login Successful",
            accessToken,
            user
        })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    loginFn
}