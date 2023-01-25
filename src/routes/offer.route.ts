import express, { Request, Response } from "express";
import { handleMakeRequest } from "../controller/offer.controller";
import { I_OFFER_REQUEST } from "../types/interfaces";
async function updateOffer(req: Request, res: Response) {
  try {
    const body: I_OFFER_REQUEST = req.body;
    let result: any;
    switch (body.type) {
      case "REQUEST_MAKE":
        result = await handleMakeRequest(body.tokenId);
        break;
      // case "REQUEST_ACCEPT":
      //   result = await handleListingRequest(body.tokenId);
      //   break;
      // case "REQUEST_CANCEL":
      //   result = await handleCancelRequest(body.tokenId);
      //   break;
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
module.exports = () => {
  const offerRoute = express.Router();
  offerRoute.put("/update", updateOffer);
  return offerRoute;
};
