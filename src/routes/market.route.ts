import express, { Request, Response } from "express";
import { I_UPDATE_REQUEST, I_TOKEN_ID_DATA } from "../types/interfaces";
import {
  fetchListToken,
  handleMintRequest,
  handleListingRequest,
  updateListToken,
  handleNft,
  handleNfts,
  handleCancelRequest,
  collectedNft,
} from "../controller/market.controller";

async function fetchUsers(req: Request, res: Response) {
  try {
    let data = await fetchListToken();
    console.log("data", data);
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}
async function updateItem(req: Request, res: Response) {
  try {
    const body: I_UPDATE_REQUEST = req.body;
    let result: any;
    switch (body.type) {
      case "REQUEST_MINT":
        result = await handleMintRequest(body.tokenId);
      case "REQUEST_LIST":
        result = await handleListingRequest(body.tokenId);
      case "REQUEST_CANCEL":
        result = await handleCancelRequest(body.tokenId);
      default:
        break;
    }
    // let data = await updateListToken(req.body);

    return res.status(200).send(body);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchNft(req: Request, res: Response) {
  try {
    const body: I_TOKEN_ID_DATA = req.body;
    let result = await handleNft(body);
    console.log("result", result);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchCollectedNft(req: Request, res: Response) {
  try {
    let address: string = req.params.address;
    let result = await collectedNft(address);
    // console.log("result", result);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const marketRoute = express.Router();
  marketRoute.get("/fetch", fetchUsers);
  marketRoute.put("/update", updateItem);
  marketRoute.put("/nft", fetchNft);
  marketRoute.get("/collected/:address", fetchCollectedNft);
  return marketRoute;
};
