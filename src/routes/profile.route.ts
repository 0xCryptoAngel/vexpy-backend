import express, { Request, Response } from "express";
import {
  fetchProfile,
  fetchUser,
  updateProfile,
  allUsers,
  sendVerification,
} from "../controller/profile.controller";
import { cache } from "../utils/graphql";

async function updateUsers(req: Request, res: Response) {
  try {
    const address: string = req.query.address as string;
    let data = cache.get(address + "updateUsers");
    if (!data) {
      data = await updateProfile(address, req.body!);
      cache.set(address + "updateUsers");
    }
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
      let data = cache.get(address + "fetchUserbyId");
      if (!data) {
        data = await fetchProfile(address);
        cache.set(address + "fetchUserbyId");
      }
      return res.status(200).send(data);
    }
    if (name) {
      let data = cache.get(name + "fetchUserbyId");
      if (!data) {
        data = await fetchUser(name);
        cache.set(name + "fetchUserbyId");
      }
      return res.status(200).send(data);
    }
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchUsers(req: Request, res: Response) {
  try {
    let data = cache.get("fetchUsers");
    if (!data) {
      data = await allUsers();
      cache.set("fetchUsers");
    }
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function emailSend(req: Request, res: Response) {
  try {
    const email: string = req.query.email as string;
    const address: string = req.query.address as string;
    let data = cache.get(email + address + "emailSend");
    if (!data) {
      data = await sendVerification(email, address);
      cache.set(email + address + "emailSend");
    }
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
  profileRoute.get("/email", emailSend);
  return profileRoute;
};
