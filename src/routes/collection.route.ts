import express, { Request, Response } from "express";
import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { updateItem, fetchItem } from "../controller/collection.controller";

async function updateCollection(req: Request, res: Response) {
  try {
    let { slug, amount } = req.params;
    const body: I_TOKEN_ID_DATA = req.body;
    let result = await updateItem(slug, amount, body);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchParams(req: Request, res: Response) {
  try {
    let { slug } = req.params;
    let result = await fetchItem(slug);
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const collectionRoute = express.Router();
  collectionRoute.put("/update/:slug/:amount", updateCollection);
  collectionRoute.get("/:slug", fetchParams);
  return collectionRoute;
};
