const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.EMAIL_USERNAME, // sender's email address
    pass: process.env.EMAIL_PASS, // sender's email password
  },
});
