import express, { Request, Response } from "express";
import {
  handleMakeRequest,
  fetchMakeOffer,
  handleAcceptRequest,
  handleCancelRequest,
  handleCollectRequest,
  fetchCollectOffer,
  handleCollectAcceptRequest,
  handleCollectCancelRequest,
  OfferByAddress,
} from "../controller/offer.controller";
import { I_OFFER_REQUEST, I_TOKEN_ID_DATA } from "../types/interfaces";
async function updateOffer(req: Request, res: Response) {
  try {
    const body: I_OFFER_REQUEST = req.body;
    let timestamp: string = req.query.timestamp as string;
    let result: any;
    switch (body.type) {
      case "REQUEST_MAKE":
        result = await handleMakeRequest(body.tokenId);
        break;
      case "REQUEST_ACCEPT":
        result = await handleAcceptRequest(body.tokenId, parseFloat(timestamp));
        break;
      case "REQUEST_CANCEL":
        result = await handleCancelRequest(body.tokenId, parseFloat(timestamp));
        break;
      case "REQUEST_COLLECT_OFFER":
        result = await handleCollectRequest(body.tokenId);
        break;
      case "REQUEST_COLLECTION_ACCEPT":
        result = await handleCollectAcceptRequest(body.tokenId);
        break;
      case "REQUEST_COLLECTION_CANCEL":
        result = await handleCollectCancelRequest(
          body.tokenId,
          parseFloat(timestamp)
        );
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

async function fetchOffer(req: Request, res: Response) {
  try {
    const body: I_TOKEN_ID_DATA = req.body;
    let result: any = await fetchMakeOffer(body);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}
async function fetchCollectionOffer(req: Request, res: Response) {
  try {
    const body: I_TOKEN_ID_DATA = req.body;
    let result: any = await fetchCollectOffer(body);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchOfferByAddress(req: Request, res: Response) {
  try {
    let address: string = req.params.address;
    let result = await OfferByAddress(address);
    return res.status(200).send(result);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}
module.exports = () => {
  const offerRoute = express.Router();
  offerRoute.put("/update", updateOffer);
  offerRoute.put("/fetch", fetchOffer);
  offerRoute.put("/collection/fetch", fetchCollectionOffer);
  offerRoute.get("/:address", fetchOfferByAddress);
  return offerRoute;
};
