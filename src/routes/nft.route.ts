import express, { Request, Response } from "express";

async function fetchUsers(req: Request, res: Response) {
  try {
    return res.status(200).send({ value: "ok" });
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const userRoute = express.Router();
  userRoute.get("/fetch", fetchUsers);
  return userRoute;
};
