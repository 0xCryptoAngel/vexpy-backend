import express, { Request, Response } from "express";
import { I_TOKEN_ID_DATA } from "../types/interfaces";

import {
  updateItem,
  fetchItem,
  fetchCollection,
  fetchCollectionData,
  fetchActivity,
} from "../controller/collection.controller";
import { cache } from "../utils/graphql";

async function fetchTopCollection(req: Request, res: Response) {
  try {
    let period: any = req.query?.period;
    let data = cache.get(period + "fetchTopCollection");
    if (!data) {
      data = await fetchCollection(parseInt(period));
      cache.set(period + "fetchTopCollection", data);
    }
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

// async function updateCollection(req: Request, res: Response) {
//   try {
//     let { slug, amount } = req.params;
//     const body: I_TOKEN_ID_DATA = req.body;
//     let data = cache.get(slug + amount + "updateCollection");
//     if (!data) {
//       data = await updateItem(slug, amount, body);
//       cache.set(slug + amount + "updateCollection", data);
//     }
//     return res.status(200).send(data);
//   } catch (err) {
//     return res.status(500).send({ response: "Error", result: err });
//   }
// }

async function fetchParams(req: Request, res: Response) {
  try {
    let { slug } = req.params;
    let data = cache.get(slug + "fetchParams");
    if (!data) {
      data = await fetchItem(slug);
      cache.set(slug + "fetchParams", data);
    }
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchCollectionDataBySlug(req: Request, res: Response) {
  try {
    let { slug } = req.params;
    let data = cache.get(slug + "fetchCollectionDataBySlug");
    if (!data) {
      data = await fetchCollectionData(slug);
      cache.set(slug + "fetchCollectionDataBySlug", data);
    }
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

async function fetchActivityBySlug(req: Request, res: Response) {
  try {
    let { slug, eventType } = req.params;
    // let data = cache.get(slug + eventType + "fetchActivityBySlug");
    // if (!data) {
    let data = await fetchActivity(slug, eventType);
    //   cache.set(slug + eventType + "fetchActivityBySlug", data);
    // }
    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send({ response: "Error", result: err });
  }
}

module.exports = () => {
  const collectionRoute = express.Router();
  collectionRoute.get("/collection/fetch", fetchTopCollection);
  // collectionRoute.put("/update/:slug/:amount", updateCollection);
  collectionRoute.get("/:slug", fetchParams);
  collectionRoute.get("/collection/:slug", fetchCollectionDataBySlug);
  collectionRoute.get("/activity/:eventType/:slug", fetchActivityBySlug);
  return collectionRoute;
};
