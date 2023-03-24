import express, { Request, Response } from "express";
import { fetchProfile, updateProfile } from "../controller/profile.controller";

async function updateUsers(req: Request, res: Response) {
  try {
    const address: string = req.query.address as string;
    let data = await updateProfile(address, req.body!);
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchUsers(req: Request, res: Response) {
  try {
    const address: string = req.query.address as string;
    let data = await fetchProfile(address);
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const profileRoute = express.Router();
  profileRoute.put("/user", updateUsers);
  profileRoute.get("/user", fetchUsers);
  return profileRoute;
};
