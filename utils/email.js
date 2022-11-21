const nodemailer = require("nodemailer");


const sendEmail = async options =>{
    // create transporter
    const transporter = nodemailer.createTransport({
        service : "gmail",
        auth :{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD // USE APP PASSWORD
        }
        
    })
    //define email option
 const mailOptions = {
    from:"<ismailoladokun1982@gmail.com>",
    to :options.email,
    subject:options.subject,
    text :options.message
    //html
 }
    //send actual email
  await  transporter.sendMail(mailOptions)
}

module.exports = sendEmail