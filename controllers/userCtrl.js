const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("../sendEmail");
const mongoose = require("mongoose");

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
};

const registerFn = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const exitingUser = await Users.findOne({ email });

        if (exitingUser) {
            return res.status(400).json({ message: "User account already exist!" });
        }

        // Hash password

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({ username, email, password: hashedPassword, role });

        await newUser.save();

        // send Users Email

        await sendUserEmail(email)

        return res.status(200).json({ message: "Successful", user: newUser });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const singleUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ObjectId' });
        }

        const user = await Users.findById(id);

        return res.status(200).json({
            message: "Successful",
            user
        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const allUser = async (req, res) => {
    try {
        const allUsers = await Users.find();

        return res.status(200).json({ message: "Successful", count: allUsers.length, allUsers });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        const exitingUser = await Users.findById(id);
        if (!exitingUser) {
            return res.status(400).json({ message: "User not found!" })
        }

        hashedPassword = await bcrypt.hash(password, 12)
        const updatedUser = await Users.findByIdAndUpdate(id, { username, email, password: hashedPassword, role }, { new: true });

        if (password.length < 8) {
            return res.status(400).json({ message: "Password should be more than eight characters!" })
        }
        return res.status(200).json({ message: "Successful", user: updatedUser })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const welcome = async(req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to FoodCorner!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deletedUser = async (req, res) => {
    try {
        const { id } = req.params;

        const { username, email, password, role } = req.body;

        const deleteUser = await Users.findByIdAndDelete(
            id,
            {
                username,
                email,
                password,
                role
            },
            { new: true });

        const availableUsers = await Users.find();

        return res.status(200).json({
            message: "Successful",
            count: availableUsers.length,
            users: { deleteUser, availableUsers }
        })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    loginFn,
    registerFn,
    singleUser,
    allUser,
    updateUser,
    welcome,
    deletedUser
}