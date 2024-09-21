const express = require("express");
const dotenv = require("dotenv").config();
const connectToDatabase = require("./dataBase");
const { validateRegistration, validateLogin } = require("./middleware/validations");
const validateToken = require("./middleware/validateAuth")
const Users = require("./models/userModel")
const Restaurants = require("./models/restaurantModel")
const Order = require("./models/orderModel")
const MenuItem = require("./models/menuItemModel");
const Menu = require("./models/menuModel")
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("./sendEmail");
const userRouter = require("./routes/userRoute")

const foodApp = express();

foodApp.use(express.json());

const PORT = process.env.PORT || 9000;

// ConnectTo DATABASE

connectToDatabase();

foodApp.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});


foodApp.get("/", (req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to FoodCorner!" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


//user registration endpoint

foodApp.post("/register", validateRegistration, async (req, res) => {
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
        return res.status(500).json({ message: "An error occurred during registration" });
    }
});

// find user by Id

foodApp.get("/user/:id", validateToken, async (req, res) => {
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
});

// Get all users

foodApp.get("/all-users", async (req, res) => {
    try {
        const allUsers = await Users.find();

        return res.status(200).json({ message: "Successful", count: allUsers.length, allUsers });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// login endpoint
foodApp.use(userRouter)
/*
foodApp.post("/login", validateLogin, async (req, res) => {
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
});
*/

// Update User
foodApp.put("/update-user/:id", validateToken, async (req, res) => {
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
})

//delete users

foodApp.delete("/delete-users/:id", validateToken, async (req, res) => {
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
})

// Protected Routes

foodApp.post("/auth", validateToken, (req, res) => {
    try {
        return res.status(200).json({ message: "Successful", user: req.user })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


// Restaurant Endpoints
// create a new restaurant

foodApp.post("/create-restaurants", validateToken, async (req, res) => {
    try {
        const { user_id, name, location, email, menu } = req.body

        const existingRestaurant = await Restaurants.findOne({ email, name });

        if (existingRestaurant) {
            return res.status(400).json({ message: "Restaurant name already exist!" });
        }

        // Link the menu to the restaurant
        const menuItems = await Menu.find({ _id: { $in: menu } });

        if (!menuItems.length) {
            return res.status(400).json({ message: "No valid menu items found" });
        }

        //create a new restaurant with the menu field
        const newRestaurant = new Restaurants({ owner: user_id, name, location, email, menu: menuItems.map(item => item._id) });

        // save new restaurant
        await newRestaurant.save();

        // Populate the menu details
        const populatedRestaurant = await Restaurants.findById(newRestaurant._id).populate({
            path: 'menu',
            select: '_id name description price'
        });

        // send Restaurant Email

        await sendUserEmail(email, name)

        return res.status(200).json({ message: "Successful", restaurant: populatedRestaurant });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


// Get all restaurants

foodApp.get("/all-restaurants", async (req, res) => {
    try {
        const restaurants = await Restaurants.find().populate({
            path: 'menu',
            select: '_id name description price'
        });

        return res.status(200).json({ message: "Successful", count: restaurants.length, restaurants });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// Update a restaurant

foodApp.patch("/edit-restaurant/:id", validateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { user_id, name, location, email, menu } = req.body;

        const updateData = { owner: user_id, name, location, email };

        // Link the menu to the restaurant
        if (menu && menu.length) {
            const menuItems = await Menu.find({ _id: { $in: menu } });

            if (!menuItems.length) {
                return res.status(400).json({ message: "No valid menu items found" });
            }

            updateData.menu = menuItems.map(item => item._id);
        }

        const updateRestaurant = await Restaurants.findByIdAndUpdate(id, updateData, { new: true }).populate({
            path: "menu",
            select: '_id name description price'
        });

        if (!updateRestaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        return res.status(200).json({ message: "Successful", restaurant: updateRestaurant });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

})

//Delete a Restaurant

foodApp.delete("/delete-restaurants/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the restaurant by ID
        const deleteRestaurant = await Restaurants.findByIdAndDelete(id);

        if (!deleteRestaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        };

        // Get the updated list of available restaurants
        const availableRestaurants = await Restaurants.find();

        return res.status(200).json({
            message: "Successful",
            count: availableRestaurants.length,
            deletedRestaurant: deleteRestaurant,
            availableRestaurants: availableRestaurants
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


//menu Endpoints
//New Menu 

foodApp.post("/create-menu", validateToken, async (req, res) => {

    try {
        const { name, description, price, availability, restaurant } = req.body;

        // Validate input data
        if (!name || !description || !price || !availability || !restaurant) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingmenu = await Menu.findOne({ name, description });

        if (existingmenu) {
            return res.status(400).json({ message: "Menu name already exist!" });
        }

        const newMenu = new Menu({ name, description, price, availability, restaurant });

        await newMenu.save();

        // Add menu to the restaurant's menus array

        const restaurantDoc = await Restaurants.findById(restaurant);

        if (!restaurantDoc) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        restaurantDoc.menu.push(newMenu);

        await restaurantDoc.save();

        return res.status(200).json({ message: "Successful", menuList: newMenu });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Get single menu endpoint
foodApp.get("/menu/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find the menu by ID
        const menu = await Menu.findById(id);

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        return res.status(200).json(menu);
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving menu', error: error.message });
    }
});


//Get all menu items
foodApp.get("/all-menu", async (req, res) => {
    try {
        const menu = await Menu.find().populate("restaurant", "_id name");

        return res.status(200).json({ message: "Successful", count: menu.length, menu })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

// Update menu endpoint
foodApp.put("/update-menu/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, availability, restaurant } = req.body;

        // Find the menu by ID and update with new data
        const updatedMenu = await Menu.findByIdAndUpdate(id, { name, description, price, availability, restaurant }, { new: true });

        if (!updatedMenu) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        return res.status(200).json({ message: 'Menu updated successfully', menu: updatedMenu });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Delete menu endpoint
foodApp.delete("/delete-menu/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find the menu by ID and delete it
        const deletedMenu = await Menu.findByIdAndDelete(id);

        if (!deletedMenu) {
            return res.status(404).json({ message: "Menu not found" });
        }

        const availableMenu = await Menu.find();

        return res.status(200).json({ message: "Menu deleted successfully", deleted_Menu: deletedMenu, count: availableMenu.length, Available_Menu: availableMenu });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


//Order endpoints
//Place an order
foodApp.post("/create-order", async (req, res) => {
    try {
        const { userId, restaurantId, orderedItems } = req.body;

        const exitingUser = await Users.findOne({ userId });

        if (!exitingUser) {
            return res.status(400).json({ message: "You do not have an account yet, Please register!" });
        }

        // ... (other validations)

        const validItemsWithPrices = await Promise.all(orderedItems.map(async (item) => {
            const menuItem = await Menu.findById(item.itemId);
            if (!menuItem) {
                throw new Error('Item not found');
            }
            return { ...item, price: menuItem.price };
        }));

        // Await here to ensure validItems is populated
        await Promise.all(validItemsWithPrices);

        const totalCost = validItemsWithPrices.reduce((acc, item) => acc + item.quantity * item.price, 0);
        const newOrder = new Order({
            userId,
            restaurantId,
            orderedItems: validItemsWithPrices,
            totalCost,
        });
        await newOrder.save();

        return res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

});

foodApp.get("/order/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find the order by ID
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({ requestedOrder: order });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

foodApp.get("/all-orders", async (req, res) => {
    try {
        const allOrder = await Order.find();

        return res.status(200).json({ message: "Successful", count: allOrder.length, allOrder });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

//Delete an order by ID
foodApp.delete("/delete-order/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the order by ID
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const availableOrder = await Order.find();

        return res.status(200).json({
            message: "Order deleted successfully", RemainingOrder: availableOrder.length, availableOrder
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

foodApp.use((req, res) => {
    return res.status(404).json({ message: "This endpoint does not exist yet" });
});

