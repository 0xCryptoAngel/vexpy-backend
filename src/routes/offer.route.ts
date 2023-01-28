import express, { Request, Response } from "express";
import {
  handleMakeRequest,
  fetchMakeOffer,
  handleAcceptRequest,
  handleCancelRequest,
} from "../controller/offer.controller";
import { I_OFFER_REQUEST, I_TOKEN_ID_DATA } from "../types/interfaces";
async function updateOffer(req: Request, res: Response) {
  try {
    const body: I_OFFER_REQUEST = req.body;
    let result: any;
    switch (body.type) {
      case "REQUEST_MAKE":
        result = await handleMakeRequest(body.tokenId);
        break;
      case "REQUEST_ACCEPT":
        result = await handleAcceptRequest(body.tokenId);
        break;
      case "REQUEST_CANCEL":
        result = await handleCancelRequest(body.tokenId);
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
module.exports = () => {
  const offerRoute = express.Router();
  offerRoute.put("/update", updateOffer);
  offerRoute.put("/fetch", fetchOffer);
  return offerRoute;
};
