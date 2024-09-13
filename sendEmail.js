const nodemailer = require("nodemailer");
const User = require("./model/restaurantModel")

//info@sterux.com
// zoho, sendgrid, gsuite, microsoft360

const sendUserEmail =  async (userEmail, username)=>{
    try {
        // Login Details

        const mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: `${process.env.Email}`,
                pass: `${process.env.Email_PASSWORD}`
            }
        })

        // Details to send

        const detailsToSend = {
            from: process.env.Email,
            to: userEmail,
            subject: "Your Login Details",
            html: `<div>
                <h1>Hello ${username}</h1>
                <h1>Password: fgjutyrujd</h1>
                <h1>Email: ${userEmail}</h1>
                <h1>Thanks</h1>
            </div>`
        }

        const result = await mailTransporter.sendMail(detailsToSend)

    } catch (error) {
        console.log(error)
    }
}

module.exports = sendUserEmail