import express, { Request, Response } from "express";
import {
  fetchProfile,
  fetchUser,
  updateProfile,
  allUsers,
} from "../controller/profile.controller";

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

module.exports = () => {
  const profileRoute = express.Router();
  profileRoute.put("/user", updateUsers);
  profileRoute.get("/user", fetchUserbyId);
  profileRoute.get("/users", fetchUsers);
  return profileRoute;
};
