import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import dbConfig from "./src/db/dbConfig";
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer");
///enabled CORS
app.use(cors());

///node body parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

///Port configuration
const PORT = process.env.PORT ?? 80;

/// Database connect
dbConfig();

/// connect router
const router = require("./src/routes")();
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Well done!");
});

app.listen(PORT, () => {
  console.log(`Tasks server listening at http://localhost:${PORT}`);
});

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
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

// setup email data with unicode symbols
let mailOptions = {
  from: process.env.EMAIL_FROM, // sender address
  to: "topdev124@gmail.com", // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello world?", // plain text body
  html: "<b>Hello world?</b>", // html body
};

// send mail with defined transport object
// transporter.sendMail(mailOptions, (error: any, info: any) => {
//   if (error) {
//     return console.log(error);
//   }
//   console.log("Message sent: %s", info.messageId);
// });
