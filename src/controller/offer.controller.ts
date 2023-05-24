import { MARKET_ADDRESS } from "../config/constants";
import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { nftItem } from "../db/schema/nftItem";
import { offerItem } from "../db/schema/offerItem";
import { collectionOffer } from "../db/schema/collectionOffer";
import { profileItem } from "../db/schema/profileItem";
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
    newItem.slug = `${tokenIdData.token_data_id.collection?.replace(
      /[^A-Z0-9]+/gi,
      "-"
    )}-${tokenIdData.token_data_id.creator.substring(61)}`;
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
      collecteditem.lastSoldAt = new Date();
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
      collecteditem.lastSoldAt = new Date();
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
    `${MARKET_ADDRESS}::marketplace::AcceptOfferEvent`,
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

export const OfferByAddress = async (_address: string, _owner: string) => {
  let item;
  if (_owner) {
    item = await offerItem
      .find({
        owner: _owner,
      })
      .sort({ price: -1 })
      .exec();
  } else {
    item = await offerItem
      .find({
        offerer: _address,
      })
      .sort({ price: -1 })
      .exec();
  }

  return item;
};

export const CollectionOfferByAddress = async (
  _address: string,
  _owner: string
) => {
  let item;
  if (_owner) {
    item = await collectionOffer
      .find({
        owner: _owner,
      })
      .sort({ price: -1 })
      .exec();
  } else {
    item = await collectionOffer
      .find({
        offerer: _address,
        leftAmount: {
          $gte: 1,
        },
      })
      .sort({ price: -1 })
      .exec();
  }
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
    let _slug = `${tokenIdData.token_data_id.collection?.replace(
      /[^A-Z0-9]+/gi,
      "-"
    )}-${tokenIdData.token_data_id.creator.substring(61)}`;
    newItem.price = data.events[0].data.price_per_token;
    newItem.offerer = `0x${data.events[0].data.buyer
      .substring(2)
      .padStart(64, "0")}`;
    newItem.duration = data.events[0].data.expiry_time;
    newItem.timestamp = data.events[0].data.created_at;
    newItem.amount = data.events[0].data.amount;
    newItem.leftAmount = data.events[0].data.amount;

    newItem.slug = _slug;
    newItem.isforitem = false;
    await newItem.save();
    const topoffer = await collectionOffer
      .find({ slug: _slug })
      .sort({ price: -1 })
      .exec();
    if (!topoffer) return;
    const collectionData = await collectionItem
      .findOne({
        slug: `${tokenIdData.token_data_id.collection?.replace(
          /[^A-Z0-9]+/gi,
          "-"
        )}-${tokenIdData.token_data_id.creator.substring(61)}`,
      })
      .exec();

    if (!collectionData) return;
    collectionData.topoffer = topoffer[0]?.price / 100000000;
    await collectionData.save();
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
    let _item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .lean()
      .exec();
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
        .lean()
        .exec();
      let collecteditem = await collectionItem
        .findOne({
          "key.property_version": tokenIdData.property_version,
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
          "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        })
        .lean()
        .exec();
      if (!collecteditem) return;
      collecteditem.listed = listedItem.length;
      collecteditem.floor = listedItem[0]?.price;
      collecteditem.volume += parseFloat(data.events[0].data.price_per_item);
      collecteditem.lastSoldAt = new Date();
      let itemAmount = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        })
        .distinct("owner")
        .lean()
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
        .lean()
        .exec();
      if (!collecteditem) return;
      collecteditem.volume += parseFloat(data.events[0].data.price_per_item);
      collecteditem.lastSoldAt = new Date();
      let itemAmount = await nftItem
        .find({
          "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        })
        .distinct("owner")
        .lean()
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
      price: data.events[0].data.price_per_item,
    });
    if (!_collectionOffer) return;
    if (_collectionOffer.leftAmount > 0) {
      _collectionOffer.leftAmount = _collectionOffer.leftAmount - 1;
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
      .lean()
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
      .lean()
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
      leftAmount: {
        $gte: 1,
      },
    })
    .sort({ price: -1 })
    .lean()
    .exec();
  return item;
};

export const fetchCollectOfferBySlug = async (_slug: string) => {
  let item = await collectionOffer
    .aggregate([
      {
        $lookup: {
          from: "profileitems", //other table name
          localField: "offerer", //name of car table field
          foreignField: "address", //name of cardetails table field
          as: "profile", //alias for cardetails table
        },
      },
      {
        $match: {
          slug: _slug,
        },
      },
    ])
    .sort({ price: -1 })
    .exec();
  return item;
};

export const receivedByAddress = async (_owner: string) => {
  let ownedNfts = await nftItem
    .find({
      owner: _owner,
    })
    .sort({ price: -1 })
    .lean()
    .exec();
  const items = await Promise.all(
    ownedNfts.map(async (token: any, i: number) => {
      let item = await collectionOffer
        .find({
          slug: token.slug,
          leftAmount: {
            $gte: 1,
          },
        })
        .sort({ price: -1 })
        .lean()
        .exec();
      let _item = item?.map((item) => Object.assign(item, { key: token.key }));

      return [..._item];
    })
  );
  return items;
};

export const receivedItemByAddress = async (_owner: string) => {
  let ownedNfts = await nftItem
    .find({
      owner: _owner,
    })
    .sort({ price: -1 })
    .lean()
    .exec();
  const items = await Promise.all(
    ownedNfts.map(async (token: any, i: number) => {
      let item = await offerItem
        .find({
          slug: token.slug,
          "key.token_data_id.name": token?.key?.token_data_id.name,
        })
        .sort({ price: -1 })
        .lean()
        .exec();
      return item;
    })
  );
  return items;
};
