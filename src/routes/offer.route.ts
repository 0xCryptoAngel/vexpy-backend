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
  CollectionOfferByAddress,
  receivedByAddress,
  receivedItemByAddress,
  fetchCollectOfferBySlug,
} from "../controller/offer.controller";
import { I_OFFER_REQUEST, I_TOKEN_ID_DATA } from "../types/interfaces";
import { cache } from "../utils/graphql";
async function updateOffer(req: Request, res: Response) {
  try {
    const body: I_OFFER_REQUEST = req.body;
    let timestamp: string = req.query.timestamp as string;
    let data = cache.get(body.type + "updateOffer");
    if (!data) {
      switch (body.type) {
        case "REQUEST_MAKE":
          data = await handleMakeRequest(body.tokenId);
          cache.set(body.type + "updateOffer");
          break;
        case "REQUEST_ACCEPT":
          data = await handleAcceptRequest(body.tokenId, parseFloat(timestamp));
          cache.set(body.type + "updateOffer");
          break;
        case "REQUEST_CANCEL":
          data = await handleCancelRequest(body.tokenId, parseFloat(timestamp));
          cache.set(body.type + "updateOffer");
          break;
        case "REQUEST_COLLECT_OFFER":
          data = await handleCollectRequest(body.tokenId);
          cache.set(body.type + "updateOffer");
          break;
        case "REQUEST_COLLECTION_ACCEPT":
          data = await handleCollectAcceptRequest(body.tokenId);
          cache.set(body.type + "updateOffer");
          break;
        case "REQUEST_COLLECTION_CANCEL":
          data = await handleCollectCancelRequest(
            body.tokenId,
            parseFloat(timestamp)
          );
          cache.set(body.type + "updateOffer");
          break;
        default:
          break;
      }
    }
    // let data = await updateListToken(req.body);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchOffer(req: Request, res: Response) {
  try {
    const body: I_TOKEN_ID_DATA = req.body;
    let data = cache.get(JSON.stringify(body) + "fetchOffer");
    if (!data) {
      data = await fetchMakeOffer(body);
      cache.set(JSON.stringify(body) + "fetchOffer");
    }
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}
async function fetchCollectionOfferByKey(req: Request, res: Response) {
  try {
    const body: I_TOKEN_ID_DATA = req.body;
    let data = cache.get(JSON.stringify(body) + "fetchCollectionOfferByKey");
    if (!data) {
      data = await fetchCollectOffer(body);
      cache.set(JSON.stringify(body) + "fetchCollectionOfferByKey");
    }
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchCollectionOfferBySlug(req: Request, res: Response) {
  try {
    const body: string = req.body.slug;
    let data = cache.get(JSON.stringify(body) + "fetchCollectionOfferBySlug");
    if (!data) {
      data = await fetchCollectOfferBySlug(body);
      cache.set(JSON.stringify(body) + "fetchCollectionOfferBySlug");
    }
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchOfferByAddress(req: Request, res: Response) {
  try {
    let address: string = req.params.address;
    let owner: string = req.query?.owner as string;
    let data = cache.get(address + owner + "fetchOfferByAddress");
    if (!data) {
      data = await OfferByAddress(address, owner);
      cache.set(address + owner + "fetchOfferByAddress");
    }
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchCollectionOfferByAddress(req: Request, res: Response) {
  try {
    let address: string = req.params.address;
    let owner: string = req.query?.owner as string;
    let data = cache.get(address + owner + "fetchCollectionOfferByAddress");
    if (!data) {
      data = await CollectionOfferByAddress(address, owner);
      cache.set(address + owner + "fetchCollectionOfferByAddress");
    }
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}
async function receivedCollectionOfferByAddress(req: Request, res: Response) {
  try {
    let owner: string = req.params.address;
    let data = cache.get(owner + "receivedCollectionOfferByAddress");
    if (!data) {
      data = await receivedByAddress(owner);
      cache.set(owner + "receivedCollectionOfferByAddress");
    }
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}
async function receivedItemOfferByAddress(req: Request, res: Response) {
  try {
    let owner: string = req.params.address;
    let data = cache.get(owner + "receivedItemOfferByAddress");
    if (!data) {
      data = await receivedItemByAddress(owner);
      cache.set(owner + "receivedItemOfferByAddress");
    }
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const offerRoute = express.Router();
  offerRoute.put("/update", updateOffer);
  offerRoute.put("/fetch", fetchOffer);
  offerRoute.put("/collection/fetch", fetchCollectionOfferByKey);
  offerRoute.put("/collection/offer", fetchCollectionOfferBySlug);
  offerRoute.get("/:address", fetchOfferByAddress);
  offerRoute.get("/collection/:address", fetchCollectionOfferByAddress);
  offerRoute.get(
    "/collection/received/:address",
    receivedCollectionOfferByAddress
  );
  offerRoute.get("/item/received/:address", receivedItemOfferByAddress);

  return offerRoute;
};
