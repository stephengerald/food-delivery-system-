const express = require("express");
const dotenv = require("dotenv").config();
const connectToDatabase = require("./dataBase");
const { validateRegistration, validateLogin } = require("./middleware/validations");
const validateToken = require("./middleware/validateAuth")
const Users = require("./models/userModel")
const Restaurants = require("./models/restaurantModel")
const Order = require("./models/orderModel")
const Menu = require("./models/menuModel")
const DeliveryPersonnel = require("./models/deliveryPersonnelModel")
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendUserEmail = require("./sendEmail");
const userRouter = require("./routes/userRoute");
const restaurantRouter = require("./routes/restaurantRoute");
const menuRouter = require("./routes/menuRoute");
const orderRouter = require("./routes/orderRoute");
const deliveryPersonnelRoute = require("./routes/deliveryPersonnelRoute")
const cors = require("cors");
const morgan = require("morgan");
const pdfkit = require("pdfkit");
const fs = require('fs');
const nodemailer = require("nodemailer")

const foodApp = express();

foodApp.use(express.json());
foodApp.use(cors());
foodApp.use(morgan("combined"));

const PORT = process.env.PORT || 9000;

// ConnectTo DATABASE

connectToDatabase();

foodApp.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});


foodApp.use("/api", userRouter);
foodApp.use("/api", restaurantRouter);
foodApp.use("/api", menuRouter);
foodApp.use("/api", orderRouter);
foodApp.use("/api", deliveryPersonnelRoute);

/*
foodApp.post('/issue-certificate/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { email, username } = req.body;
  
      // Check if the user exists in your database (replace with your database logic)
      const user = await Users.findById(id);
      if (!user) {
        return res.status(400).json({ message: "Invalid user!" });
      }
  
      // Generate certificate content
      const certificateText = `Name: ${username}`;
  
      // Generate the PDF
      const pdfDoc = new pdfkit();
      const pdfPath = 'C:\\Users\\OKPALA STEPHEN\\OneDrive\\Desktop\\food_delivery_system\\certificate.pdf';
      pdfDoc.pipe(fs.createWriteStream('certificate.pdf'));
      pdfDoc.text('Certificate of Completion', { align: 'center', size: 20 });
      pdfDoc.text(certificateText, { align: 'center', size: 16 });
      pdfDoc.end();
  
      const mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const detailsToSend = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your Certificate",
        attachments: [
          {
            filename: "certificate.pdf",
            content: fs.readFileSync('certificate.pdf'),
          },
        ],
      };
  
      const result = await mailTransporter.sendMail(detailsToSend);
  
      // Clean up (optional): Delete the temporary file after sending
      try {
        await fs.promises.unlink('certificate.pdf'); // Use fs.promises for async deletion
      } catch (error) {
        console.error('Error deleting certificate.pdf:', error);
        // Log the error but don't prevent the response
      }
  
      return res.status(200).json({ message: "Certificate sent successfully" });
    } catch (error) {
       return res.status(400).json({ message: error.message });
      }
    }
  );
*/

foodApp.use((req, res) => {
    return res.status(404).json({ message: "This endpoint does not exist yet" });
});
