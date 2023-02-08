import express, { Request, Response } from "express";
import { I_UPDATE_REQUEST, I_TOKEN_ID_DATA } from "../types/interfaces";
import {
  fetchListToken,
  handleMintRequest,
  handleListingRequest,
  handleCancelRequest,
  handleBuyRequest,
  updateListToken,
  handleNft,
  handleNfts,
  handleCollectionNft,
  collectedNft,
  collection,
} from "../controller/nft.controller";

async function fetchUsers(req: Request, res: Response) {
  try {
    let data = await fetchListToken();
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
        break;
      case "REQUEST_LIST":
        result = await handleListingRequest(body.tokenId);
        break;
      case "REQUEST_CANCEL":
        result = await handleCancelRequest(body.tokenId);
        break;
      case "REQUEST_PURCHASE":
        result = await handleBuyRequest(body.tokenId);
        break;
      default:
        break;
    }
    // let data = await updateListToken(req.body);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchNft(req: Request, res: Response) {
  try {
    const body: I_TOKEN_ID_DATA = req.body;
    let result = await handleNft(body);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}
async function fetchCollectionData(req: Request, res: Response) {
  try {
    const body: I_TOKEN_ID_DATA = req.body;
    let result = await handleCollectionNft(body);
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
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}
async function fetchCollection(req: Request, res: Response) {
  try {
    let slug: string = req.params.slug;
    let isForSale: any = req.query?.isForSale! || false;
    let result = await collection(decodeURIComponent(slug), isForSale);
    // console.log("result", result);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const nftRoute = express.Router();
  nftRoute.get("/fetch", fetchUsers);
  nftRoute.put("/update", updateItem);
  nftRoute.put("/nft", fetchNft);
  nftRoute.put("/collection/nft", fetchCollectionData);
  nftRoute.get("/collected/:address", fetchCollectedNft);
  nftRoute.get("/collection/:slug", fetchCollection);
  return nftRoute;
};
