import express, { Request, Response } from "express";
const marketController = require("../controller/market.controller");

async function fetchUsers(req: Request, res: Response) {
  try {
    let data = await marketController.fetchListToken();
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const marketRoute = express.Router();
  marketRoute.get("/fetch", fetchUsers);
  return marketRoute;
};
