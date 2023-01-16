import express, { Request, Response } from "express";
import { I_UPDATE_REQUEST, I_TOKEN_ID_DATA } from "../types/interfaces";

async function fetchUsers(req: Request, res: Response) {
  try {
    return res.status(200).send({ value: "ok" });
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const collectionRoute = express.Router();
  collectionRoute.get("/fetch", fetchUsers);
  return collectionRoute;
};
