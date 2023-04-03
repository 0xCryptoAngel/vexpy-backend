import express, { Request, Response } from "express";
import {
  fetchProfile,
  fetchUser,
  updateProfile,
  allUsers,
} from "../controller/profile.controller";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function updateUsers(req: Request, res: Response) {
  try {
    const address: string = req.query.address as string;
    let data = await updateProfile(address, req.body!);
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchUserbyId(req: Request, res: Response) {
  try {
    const address: string = req.query.address as string;
    const name: string = req.query.name as string;
    if (address) {
      let data = await fetchProfile(address);
      return res.status(200).send(data);
    }
    if (name) {
      let data = await fetchUser(name);
      return res.status(200).send(data);
    }
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchUsers(req: Request, res: Response) {
  try {
    let data = await allUsers();
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function emailVerify(req: Request, res: Response) {
  try {
    const email: string = req.query.email as string;
    console.log("address", email);
    const msg = {
      to: "liangjin381345@gmail.com",
      from: email, // Use the email address or domain you verified above
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    (async () => {
      try {
        console.log("email", msg);
        await sgMail.send(msg);
      } catch (error) {
        console.error(error);

        // if (error.response) {
        //   console.error(error.response.body);
        // }
      }
    })();

    return res.status(200).send({ value: "Ok" });
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const profileRoute = express.Router();
  profileRoute.put("/user", updateUsers);
  profileRoute.get("/user", fetchUserbyId);
  profileRoute.get("/users", fetchUsers);
  profileRoute.get("/verify", emailVerify);
  return profileRoute;
};
