import { MARKET_ADDRESS } from "../config/constants";
import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { nftItem } from "../db/schema/nftItem";
import { offerItem } from "../db/schema/offerItem";
import { collectionOffer } from "../db/schema/collectionOffer";
import { collectionItem } from "../db/schema/collectionItem";
import { fetchListEvent } from "../utils/graphql";
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
    newItem.offerer = `0x${data.events[0].data.buyer
      .substring(2)
      .padStart(64, "0")}`;
    newItem.duration = data.events[0].data.expiry_time;
    newItem.timestamp = data.events[0].data.timestamp;
    newItem.isforitem = true;
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
export const handleAcceptRequest = async (
  tokenIdData: I_TOKEN_ID_DATA,
  _timestamp: number
) => {
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
    let _item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    console.log("_item", _item);
    let _isForSale = _item?.isForSale;
    if (!_item) return;
    _item.price = 0;
    _item.offer_id = 0;
    _item.isForSale = false;
    _item.owner = `0x${data.events[0].data.buyer
      .substring(2)
      .padStart(64, "0")}`;
    await _item.save();
    if (_isForSale) {
      let listedItem = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
          isForSale: true,
        })
        .sort({ price: 1 })
        .exec();
      let collecteditem = await collectionItem
        .findOne({
          "key.property_version": tokenIdData.property_version,
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
          "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        })
        .exec();
      if (!collecteditem) return;
      collecteditem.listed = listedItem.length;
      collecteditem.floor = listedItem[0]?.price;
      collecteditem.volume += parseFloat(data.events[0].data.price);
      let itemAmount = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        })
        .distinct("owner")
        .exec();
      if (!itemAmount) return;
      collecteditem.owner = itemAmount.length;
      await collecteditem.save();
    } else {
      let collecteditem = await collectionItem
        .findOne({
          "key.property_version": tokenIdData.property_version,
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
          "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        })
        .exec();
      if (!collecteditem) return;
      collecteditem.volume += parseFloat(data.events[0].data.price);
      let itemAmount = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        })
        .distinct("owner")
        .exec();
      if (!itemAmount) return;
      collecteditem.owner = itemAmount.length;
      await collecteditem.save();
    }
    await offerItem.deleteOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
      timestamp: _timestamp,
    });
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
    `${MARKET_ADDRESS}::marketplace::SellCollectionOfferEvent`,
    0
  );
  return item;
};

export const handleCancelRequest = async (
  tokenIdData: I_TOKEN_ID_DATA,
  _timestamp: number
) => {
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

    await offerItem.deleteOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
      timestamp: _timestamp,
    });
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
    `${MARKET_ADDRESS}::marketplace::CancelOfferEvent`,
    0
  );
  return item;
};

export const fetchMakeOffer = async (tokenIdData: I_TOKEN_ID_DATA) => {
  let item = await offerItem
    .find({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
    })
    .sort({ price: -1 })
    .exec();
  return item;
};

export const OfferByAddress = async (_address: string) => {
  let item = await offerItem
    .find({
      offerer: _address,
    })
    .sort({ price: -1 })
    .exec();
  return item;
};

export const CollectionOfferByAddress = async (_address: string) => {
  let item = await collectionOffer
    .find({
      offerer: _address,
    })
    .sort({ price: -1 })
    .exec();
  return item;
};

export const handleCollectRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
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
    console.log("data", data);
    let newItem = await collectionOffer.create({
      key: {
        property_version: tokenIdData.property_version,
        token_data_id: {
          collection: tokenIdData.token_data_id.collection,
          creator: tokenIdData.token_data_id.creator,
          name: tokenIdData.token_data_id.name,
        },
      },
    });
    newItem.price = data.events[0].data.price_per_token;
    newItem.offerer = `0x${data.events[0].data.buyer
      .substring(2)
      .padStart(64, "0")}`;
    newItem.duration = data.events[0].data.expiry_time;
    newItem.timestamp = data.events[0].data.created_at;
    newItem.amount = data.events[0].data.amount;
    newItem.isforitem = false;
    await newItem.save();
    // let item = await offerItem
    //   .find({
    //     "key.property_version": tokenIdData.property_version,
    //     "key.token_data_id.collection": tokenIdData.token_data_id.collection,
    //     "key.token_data_id.creator": tokenIdData.token_data_id.creator,
    //     "key.token_data_id.name": tokenIdData.token_data_id.name,
    //   })
    //   .exec();
    return newItem;
  }
  let item = startFetchMakeEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::CreateCollectionOfferEvent`,
    0
  );
  return item;
};
export const handleCollectAcceptRequest = async (
  tokenIdData: I_TOKEN_ID_DATA
) => {
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
    console.log("data", data.events[0]);
    let _item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    console.log("_item", _item);
    let _isForSale = _item?.isForSale;
    if (!_item) return;
    _item.price = 0;
    _item.offer_id = 0;
    _item.isForSale = false;
    _item.owner = `0x${data.events[0].data.buyer
      .substring(2)
      .padStart(64, "0")}`;
    await _item.save();
    if (_isForSale) {
      let listedItem = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
          isForSale: true,
        })
        .sort({ price: 1 })
        .exec();
      let collecteditem = await collectionItem
        .findOne({
          "key.property_version": tokenIdData.property_version,
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
          "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        })
        .exec();
      if (!collecteditem) return;
      collecteditem.listed = listedItem.length;
      collecteditem.floor = listedItem[0]?.price;
      collecteditem.volume += parseFloat(data.events[0].data.price_per_item);
      let itemAmount = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        })
        .distinct("owner")
        .exec();
      if (!itemAmount) return;
      collecteditem.owner = itemAmount.length;
      await collecteditem.save();
    } else {
      let collecteditem = await collectionItem
        .findOne({
          "key.property_version": tokenIdData.property_version,
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
          "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        })
        .exec();
      if (!collecteditem) return;
      collecteditem.volume += parseFloat(data.events[0].data.price_per_item);
      let itemAmount = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        })
        .distinct("owner")
        .exec();
      if (!itemAmount) return;
      collecteditem.owner = itemAmount.length;
      await collecteditem.save();
    }
    let _collectionOffer = await collectionOffer.findOne({
      key: {
        property_version: tokenIdData.property_version,
        token_data_id: {
          collection: tokenIdData.token_data_id.collection,
          creator: tokenIdData.token_data_id.creator,
          name: "",
        },
      },
    });
    if (!_collectionOffer) return;
    if (_collectionOffer.amount > 0) {
      _collectionOffer.leftAmount = _collectionOffer.leftAmount + 1;
    }
    await _collectionOffer.save();
    // await offerItem.deleteOne({
    //   "key.property_version": tokenIdData.property_version,
    //   "key.token_data_id.collection": tokenIdData.token_data_id.collection,
    //   "key.token_data_id.creator": tokenIdData.token_data_id.creator,
    //   "key.token_data_id.name": tokenIdData.token_data_id.name,
    // });
    let item = await collectionOffer
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
    `${MARKET_ADDRESS}::marketplace::SellCollectionOfferEvent`,
    0
  );
  return item;
};

export const handleCollectCancelRequest = async (
  tokenIdData: I_TOKEN_ID_DATA,
  _timestamp: number
) => {
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

    await collectionOffer.deleteOne({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      timestamp: _timestamp,
    });
    let item = await collectionOffer
      .find({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      })
      .exec();
    return item;
  }
  let item = startFetchMakeEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::CancelCollectionOfferEvent`,
    0
  );
  return item;
};

export const fetchCollectOffer = async (tokenIdData: I_TOKEN_ID_DATA) => {
  let item = await collectionOffer
    .find({
      "key.property_version": tokenIdData.property_version,
      "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      "key.token_data_id.name": tokenIdData.token_data_id.name,
    })
    .sort({ price: -1 })
    .exec();
  return item;
};
