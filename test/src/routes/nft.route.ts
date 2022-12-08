import express, { Request, Response } from "express";
import { nft } from "../db/schema/nft";
async function fetchUsers(req: Request, res: Response) {
  try {
    let payload = {
      address: "0xertyuirtyuio",
      date: "qweqwe",
      isApproved: true,
    };
    let myData = new nft(payload);
    myData.save();
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
