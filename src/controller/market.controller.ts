import { listToken } from "../db/schema/listToken";
import { aptosClient, walletClient, MARKET_ADDRESS } from "../config/constants";
import { ListTokenEventData } from "../types";
import { TokenData } from "../types/structs/TokenData";
import axios from "axios";
import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { nftItem } from "../db/schema/nftItem";
import { WalletClient } from "@martiandao/aptos-web3-bip44.js";

export const fetchListToken = async () => {
  const result = await nftItem.find({
    isForSale: true,
  });
  return result;
};

export const collectedNft = async (address: string) => {
  const result = await nftItem.find({
    owner: address,
  });
  return result;
};

export const updateListToken = async (token: any) => {
  const listEvents = await aptosClient.getEventsByEventHandle(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MarketEvents`,
    "list_token_events"
  );
  let _token_id = {
    collection: token[3],
    creator: token[2],
    name: token[4],
  };
  listEvents.sort((a, b) => a.data.timestamp - b.data.timestamp);

  const result = listEvents.find(({ data }) => {
    return (
      data.token_id.token_data_id.collection === token[3] &&
      data.token_id.token_data_id.creator === token[2] &&
      data.token_id.token_data_id.name === token[4]
    );
  });
  // listEvents?.map(async (item) => {
  //   const data = item.data as ListTokenEventData;
  //   const offerId = data?.offer_id;
  //   const price = data?.price;
  //   const seller = data?.seller;
  //   const createAt = new Date(parseInt(data.timestamp) / 1000);
  //   const tokenDataId = data?.token_id?.token_data_id;
  //   const creator = tokenDataId.creator;
  //   const propertyVersion = parseInt(data.token_id.property_version);
  //   const collection = tokenDataId.collection;
  //   const name = tokenDataId.name;
  //   const result = await listToken.find({
  //     propertyVersion: propertyVersion,
  //     creator: creator,
  //     collection: collection,
  //     name: name,
  //   });
  //   try {
  //     if (result.length == 0) {
  //       const { description, uri, maximum, supply } =
  //         (await walletClient.getToken(data?.token_id)) as TokenData;
  //       let imageUri: string;
  //       if (uri?.slice(-5).includes(".png" || ".jpeg" || ".jpg")) {
  //         imageUri = uri;
  //       } else {
  //         if (uri?.length > 0) {
  //           const test = await axios.get(uri, {
  //             headers: { "Accept-Encoding": "gzip,deflate,compress" },
  //           });
  //           imageUri = test.data?.image;
  //         }
  //       }
  //       let payload = {
  //         propertyVersion: propertyVersion,
  //         creator: creator,
  //         collectionName: collection,
  //         name: name,
  //         uri: imageUri!,
  //         description: description,
  //         maximum: maximum,
  //         supply: supply,
  //         id: offerId,
  //         price: price,
  //         seller: seller,
  //         createAt: createAt,
  //         lastSoldAmount: 0,
  //         lastSoldAt: new Date(),
  //       };
  //       let listed = new listToken(payload);
  //       listed.save();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });
};

export const handleNft = async (tokenIdData: I_TOKEN_ID_DATA) => {
  const item = await nftItem
    .findOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
    })
    .exec();
  return item;
};

export const handleNfts = async (tokenIdData: I_TOKEN_ID_DATA) => {
  const item = await nftItem.find({}).exec();
  return item;
};

export const handleMintRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  const token = await walletClient.getToken(tokenIdData);
  if (!token) return;
  let newItem = await nftItem.create({ key: tokenIdData });
  newItem.image_uri = token.uri;
  newItem.description = token.description;
  newItem.isForSale = false;
  newItem.owner = tokenIdData.token_data_id.creator;
  await newItem.save();
  return newItem;
};

export const handleListingRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  console.log("tokenIdData", tokenIdData);
  let item = await nftItem
    .findOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
    })
    .exec();
  if (!item) return;
  const listEvents = await aptosClient.getEventsByEventHandle(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MarketEvents`,
    "list_token_events",
    { start: 0, limit: 100 }
  );
  console.log("listEvents", listEvents);
  listEvents.sort((a, b) => b.data.timestamp - a.data.timestamp);
  const token = listEvents.find(({ data }) => {
    return (
      data.token_id.property_version == tokenIdData.property_version &&
      data.token_id.token_data_id.collection ===
        tokenIdData.token_data_id.collection &&
      data.token_id.token_data_id.creator ===
        tokenIdData.token_data_id.creator &&
      data.token_id.token_data_id.name === tokenIdData.token_data_id.name
    );
  });
  item.price = token?.data.price;
  item.offer_id = token?.data.offer_id;
  item.isForSale = true;
  await item.save();
  return item;
};

export const handleBuyRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  console.log("tokenIdData", tokenIdData);
  let item = await nftItem
    .findOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
    })
    .exec();
  if (!item) return;
  const listEvents = await aptosClient.getEventsByEventHandle(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MarketEvents`,
    "buy_token_events",
    { start: 0, limit: 100 }
  );
  console.log("listEvents", listEvents);
  listEvents.sort((a, b) => b.data.timestamp - a.data.timestamp);
  const token = listEvents.find(({ data }) => {
    return (
      data.token_id.property_version == tokenIdData.property_version &&
      data.token_id.token_data_id.collection ===
        tokenIdData.token_data_id.collection &&
      data.token_id.token_data_id.creator ===
        tokenIdData.token_data_id.creator &&
      data.token_id.token_data_id.name === tokenIdData.token_data_id.name
    );
  });
  if (!token) return;
  console.log("token", token);
  item.price = 0;
  item.offer_id = 0;
  item.isForSale = false;
  item.owner = token.data.buyer;
  await item.save();
  return item;
};

export const handleCancelRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  const item = await nftItem
    .findOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
    })
    .exec();
  if (!item) return;
  const listEvents = await aptosClient.getEventsByEventHandle(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MarketEvents`,
    "cancel_sale_events",
    { start: 0, limit: 100 }
  );
  listEvents.sort((a, b) => a.data.timestamp - b.data.timestamp);
  const token = listEvents.find(({ data }) => {
    return (
      data.token_id.property_version == tokenIdData.property_version &&
      data.token_id.token_data_id.collection ===
        tokenIdData.token_data_id.collection &&
      data.token_id.token_data_id.creator ===
        tokenIdData.token_data_id.creator &&
      data.token_id.token_data_id.name === tokenIdData.token_data_id.name
    );
  });
  if (!token) return;
  item.price = 0;
  item.offer_id = 0;
  item.isForSale = false;
  await item.save();
  return item;
};
