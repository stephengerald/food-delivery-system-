const express = require("express");
const { loginFn, registerFn, singleUser, allUser, updateUser, welcome, deletedUser } = require("../controllers/userCtrl");
const { validateLogin, validateRegistration } = require("../middleware/validations");
const validateToken = require("../middleware/validateAuth");

const router = express.Router();

//Welcome
router.get("/", welcome);
// login router
router.post("/login", validateLogin, loginFn);

//user registration router
router.post("/register", validateRegistration, registerFn);

// find user by Id
router.get("/user/:id", validateToken, singleUser);

// Get all users
router.get("/all-users", allUser);

//Update user
router.put("/update-user/:id", validateToken, updateUser);

//delete user
router.delete("/delete-users/:id", validateToken, deletedUser);



module.exports = router;