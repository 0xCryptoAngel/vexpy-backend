import { aptosClient, tokenClient, MARKET_ADDRESS } from "../config/constants";
import axios from "axios";
import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { nftItem } from "../db/schema/nftItem";
import { offerItem } from "../db/schema/offerItem";
import { collectionItem } from "../db/schema/collectionItem";
import { fetchGraphQL, fetchListEvent } from "../utils/graphql";
import { delay } from "../utils/delay";

export const handleMakeRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  async function startFetchMakeEvent(
    account_address: string,
    type: string,
    offset: number
  ) {
    await delay(5000);
    const { errors, data } = await fetchListEvent(
      account_address,
      type,
      offset
    );

    if (errors) {
      console.error(errors);
    }
    let newItem = await offerItem.create({
      key: {
        property_version: tokenIdData.property_version,
        token_data_id: {
          collection: tokenIdData.token_data_id.collection,
          creator: tokenIdData.token_data_id.creator,
          name: tokenIdData.token_data_id.name,
        },
      },
    });
    newItem.price = data.events[0].data.price;
    newItem.owner = `0x${data.events[0].data.seller
      .substring(2)
      .padStart(64, "0")}`;
    newItem.offer_id = data.events[0].data.offer_id;
    newItem.offerer = data.events[0].data.buyer;
    newItem.isforAccept = true;
    await newItem.save();
    let item = await offerItem
      .find({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    return item;
  }
  let item = startFetchMakeEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MakeOfferEvent`,
    0
  );
  return item;
};
export const fetchMakeOffer = async (tokenIdData: I_TOKEN_ID_DATA) => {
  console.log("tokenIdData", tokenIdData);
  let item = await offerItem
    .find({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
    })
    .exec();
  return item;
};
