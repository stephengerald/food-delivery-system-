const express = require("express");
const validateToken = require("../middleware/validateAuth");
const { createMenu, singleMenu, allMenu, updateMenu, deleteMenu } = require("../controllers/menuCtrl");


const router = express.Router();

//create new Menu 
router.post("/create-menu", validateToken, createMenu);

//Display a single Menu
router.get("/menu/:id", validateToken, singleMenu);

//display all menu
router.get("/all-menu", validateToken, allMenu);

//update menu
router.put("/update-menu/:id", validateToken, updateMenu);

//delete menu
router.delete("/delete-menu/:id", validateToken, deleteMenu);





module.exports = router;