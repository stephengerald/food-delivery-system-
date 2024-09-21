const express = require("express");
const { loginFn } = require("../controllers/userCtrl");
const { validateLogin } = require("../middleware/validations");

const router = express.Router();

router.post("/login", validateLogin, loginFn);

module.exports = router;