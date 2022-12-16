import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import dbConfig from "./src/db/dbConfig";
import { listToken } from "./src/db/schema/listToken";
import { buyToken } from "./src/db/schema/buyToken";
import { TokenData } from "./src/types/structs/TokenData";
const cors = require("cors");
const app = express();
import { MARKET_ADDRESS } from "./src/config/constants";
import { aptosClient, walletClient } from "./src/config/constants";
import { ListTokenEventData } from "./src/types";
import axios from "axios";
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

app.get("/", (req, res) => {
  res.send("Well done!");
});

app.listen(PORT, () => {
  console.log(`Tasks server listening at http://localhost:${PORT}`);
});

async function main() {
  const listEvents = await aptosClient.getEventsByEventHandle(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MarketEvents`,
    "list_token_events"
  );

  listEvents?.map(async (item) => {
    let seq: bigint;
    const data = item.data as ListTokenEventData;
    const tokenDataId = data?.token_id?.token_data_id;
    const creator = tokenDataId.creator;
    const propertyVersion = parseInt(data.token_id.property_version);
    const collection = tokenDataId.collection;
    const name = tokenDataId.name;
    const result = await listToken.find({
      propertyVersion: propertyVersion,
      creator: creator,
      collection: collection,
      name: name,
    });
    try {
      if (result.length == 0) {
        const { description, uri, maximum, supply } =
          (await walletClient.getToken(data?.token_id)) as TokenData;
        let imageUri;
        if (uri?.slice(-5).includes(".")) {
          imageUri = uri;
        } else {
          const res = await axios.get(uri);
          imageUri = res.data?.image;
        }
        let payload = {
          propertyVersion: propertyVersion,
          creator: creator,
          collectionName: collection,
          name: name,
          uri: imageUri,
          description: description,
          maximum: maximum,
          supply: supply,
        };
        let listed = new listToken(payload);
        listed.save();
      }
    } catch (error) {
      console.log(error);
    }
  });

  const buyEvents = await aptosClient.getEventsByEventHandle(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MarketEvents`,
    "buy_token_events",
    { start: BigInt(1), limit: 100 }
  );
  console.log("buyEvents", buyEvents);
  // buyEvents?.map((item) => {
  //   // let buyed = new buyToken(item.data);
  //   // buyed.save();
  // });
}
main();
