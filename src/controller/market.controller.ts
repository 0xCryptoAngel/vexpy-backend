import { aptosClient, tokenClient, MARKET_ADDRESS } from "../config/constants";
import axios from "axios";
import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { nftItem } from "../db/schema/nftItem";
import { fetchGraphQL, fetchListEvent } from "../utils/graphql";
export const fetchListToken = async () => {
  const result = await nftItem.find({
    isForSale: true,
  });
  return result;
};

export const collectedNft = async (address: string) => {
  const operation = `
    query CurrentTokens($owner_address: String, $offset: Int) {
      current_token_ownerships(
        where: {owner_address: {_eq: $owner_address}, amount: {_gt: "0"}, table_type: {_eq: "0x3::token::TokenStore"}}
        order_by: {last_transaction_version: desc}
        offset: $offset
      ) {
        name
        collection_name
        property_version
        creator_address
        amount
        owner_address
        current_token_data {
          metadata_uri
          description
          royalty_points_denominator
          royalty_points_numerator
          royalty_mutable
          default_properties
        }
      }
    }
`;

  const fetchCurrentTokens = (owner_address: string, offset: number) => {
    return fetchGraphQL(operation, "CurrentTokens", {
      owner_address: owner_address,
      offset: offset,
    });
  };
  const startFetchCurrentTokens = async (
    owner_address: string,
    offset: number
  ) => {
    const { errors, data } = await fetchCurrentTokens(owner_address, offset);
    if (errors) {
      console.error(errors);
    }

    await Promise.all(
      data.current_token_ownerships.map(async (token: any, i: number) => {
        const item = await nftItem
          .findOne({
            "key.property_version": token.property_version,
            "key.token_data_id.collection": token.collection_name,
            "key.token_data_id.creator": token.creator_address,
            "key.token_data_id.name": token.name,
          })
          .exec();
        if (item == null) {
          let imageUri: string;
          if (
            token.current_token_data.metadata_uri
              ?.slice(-5)
              .includes(".png" || ".jpeg" || ".jpg")
          ) {
            imageUri = token.current_token_data.metadata_uri;
          } else {
            if (token.current_token_data.metadata_uri?.length > 0) {
              const test = await axios.get(
                token.current_token_data.metadata_uri,
                {
                  headers: { "Accept-Encoding": "gzip,deflate,compress" },
                }
              );
              imageUri = test.data?.image;
            }
          }
          let newItem = await nftItem.create({
            key: {
              property_version: token.property_version,
              token_data_id: {
                collection: token.collection_name,
                creator: token.creator_address,
                name: token.name,
              },
            },
          });
          newItem.image_uri = imageUri!;
          newItem.description = token.current_token_data.description;
          newItem.isForSale = false;
          newItem.owner = token.owner_address;
          newItem.token_uri = token.current_token_data.metadata_uri;
          // newItem.metadata = token.default_properties.map.data;
          // console.log("-----------", token.default_properties.map.data);
          // console.log("*************", newItem.metadata);
          await newItem.save();
        }
      })
    );
  };

  startFetchCurrentTokens(address, 0);

  const result = await nftItem.find({
    owner: address,
  });
  return result;
};
export const collection = async (slug: string) => {
  const result = await nftItem
    .find({
      "key.token_data_id.collection": slug,
      isForSale: true,
    })
    .sort({ price: 1 });
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
};

export const handleNft = async (tokenIdData: I_TOKEN_ID_DATA) => {
  const item = await nftItem
    .findOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
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
  const token = await tokenClient.getTokenData(
    tokenIdData.token_data_id.creator,
    tokenIdData.token_data_id.collection,
    tokenIdData.token_data_id.name
  );
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
  async function startFetchListEvent(
    account_address: string,
    type: string,
    offset: number
  ) {
    const { errors, data } = await fetchListEvent(
      account_address,
      type,
      offset
    );

    if (errors) {
      console.error(errors);
    }
    let item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    if (!item) return;
    const token = data.events.find(
      (token: any) =>
        token.data.token_id.property_version == tokenIdData.property_version &&
        token.data.token_id.token_data_id.collection ==
          tokenIdData.token_data_id.collection &&
        token.data.token_id.token_data_id.name == tokenIdData.token_data_id.name
    );
    item.price = token?.data.price;
    item.offer_id = token?.data.offer_id;
    item.isForSale = true;
    await item.save();
    return item;
  }

  startFetchListEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::ListTokenEvent`,
    0
  );
};

export const handleBuyRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  async function startFetchListEvent(
    account_address: string,
    type: string,
    offset: number
  ) {
    const { errors, data } = await fetchListEvent(
      account_address,
      type,
      offset
    );

    if (errors) {
      console.error(errors);
    }
    let item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    if (!item) return;
    const token = data.events.find(
      (token: any) =>
        token.data.token_id.property_version == tokenIdData.property_version &&
        token.data.token_id.token_data_id.collection ==
          tokenIdData.token_data_id.collection &&
        token.data.token_id.token_data_id.name == tokenIdData.token_data_id.name
    );
    if (!token) return;
    item.price = 0;
    item.offer_id = 0;
    item.isForSale = false;
    item.owner = `0x${token.data.buyer.str.substring(2).padStart(64, "0")}`;
    await item.save();
    return item;
  }

  startFetchListEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::BuyTokenEvent`,
    0
  );
};

export const handleCancelRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  async function startFetchListEvent(
    account_address: string,
    type: string,
    offset: number
  ) {
    const { errors, data } = await fetchListEvent(
      account_address,
      type,
      offset
    );

    if (errors) {
      console.error(errors);
    }
    let item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    if (!item) return;
    const token = data.events.find(
      (token: any) =>
        token.data.token_id.property_version == tokenIdData.property_version &&
        token.data.token_id.token_data_id.collection ==
          tokenIdData.token_data_id.collection &&
        token.data.token_id.token_data_id.name == tokenIdData.token_data_id.name
    );
    if (!token) return;
    item.price = 0;
    item.offer_id = 0;
    item.isForSale = false;
    await item.save();
    return item;
  }

  startFetchListEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::CancelSaleEvent`,
    0
  );
};
