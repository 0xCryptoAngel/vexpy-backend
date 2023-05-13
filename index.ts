import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import dbConfig from "./src/db/dbConfig";
import { collectionItem } from "./src/db/schema/collectionItem";
import { CronJob } from "cron";
import {
  activitybySlug,
  cronCollectionMetabySlug,
} from "./src/controller/nft.controller";
import { fetchListEvent } from "./src/utils/graphql";
import { MARKET_ADDRESS } from "./src/config/constants";
const cors = require("cors");
const app = express();
///enabled CORS
app.use(cors());

///node body parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

///Port configuration
const PORT = process.env.PORT ?? 80;

/// Database connect
dbConfig();

/// connect router
const router = require("./src/routes")();
app.use("/api", router);

let eventType = [
  "ListTokenEvent",
  "BuyTokenEvent",
  "AcceptOfferEvent",
  "SellCollectionOfferEvent",
];
let _cronJob = new CronJob("*/30 * * * * *", async () => {
  try {
    let test = await collectionItem.find({});
    test.map(async (item: any, i: number) => {
      await cronCollectionMetabySlug(item.slug);
    });
    eventType.map(async (type: string, i: number) => {
      const typeEvent = await fetchListEvent(
        MARKET_ADDRESS!,
        `${MARKET_ADDRESS}::marketplace::${type}`,
        0
      );
      typeEvent.data.events.map(async (item: any, i: number) => {
        await activitybySlug(item);
      });
    });
    const d = new Date();
    console.log("Every Tenth Minute:", d);
  } catch (e) {
    console.error(e);
  }
});

// Start job
if (!_cronJob.running) {
  _cronJob.start();
}

app.get("/", (req, res) => {
  res.send("Well done!");
});

app.listen(PORT, () => {
  console.log(`Tasks server listening at http://localhost:${PORT}`);
});
