import express, { Request, Response } from "express";

async function fetchUsers(req: Request, res: Response) {
  try {
    return res.status(200).send({ value: "ok" });
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const nftRoute = express.Router();
  nftRoute.get("/fetch", fetchUsers);
  return nftRoute;
};
