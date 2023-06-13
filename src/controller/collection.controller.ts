import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { collectionItem } from "../db/schema/collectionItem";
import { nftItem } from "../db/schema/nftItem";
import { activity } from "../db/schema/activity";

export const updateItem = async (
  slug: string,
  amount: string,
  tokenIdData: I_TOKEN_ID_DATA
) => {
  let item = await collectionItem
    .findOne({
      "key.token_data_id.collection": slug,
    })
    .lean()
    .exec();
  if (!item) return;
  item.volume += parseFloat(amount);
  await item.save();
  return item;
};

export const fetchItem = async (slug: string) => {
  let item = await collectionItem
    .findOne({
      slug: slug,
    })
    .lean()
    .exec();
  if (!item) return;
  return item;
};

export const fetchCollection = async (
  _period: number,
  _page: number,
  _pageSize: number
) => {
  let limitTime = new Date(new Date().getTime() - 3600 * _period * 1000);
  let item = await collectionItem
    .find({
      lastSoldAt: {
        $gte: limitTime,
      },
    })
    .sort({ volume: -1 })
    .skip(_page * _pageSize)
    .limit(_pageSize)
    .select({
      _id: 0,
      image_uri: 1,
      name: 1,
      floor: 1,
      owner: 1,
      supply: 1,
      volume: 1,
    })
    .lean()
    .exec();
  let count = await collectionItem
    .find({
      lastSoldAt: {
        $gte: limitTime,
      },
    })
    .count()
    .lean()
    .exec();

  if (!item) return;

  return { items: item, count: count };
};

export const fetchCollectionData = async (slug: string) => {
  let item = await nftItem
    .findOne({
      slug: slug,
    })
    .lean()
    .exec();
  if (!item) return;
  return item;
};

export const fetchActivity = async (slug: string, eventType: string) => {
  let item = await activity
    .find({
      slug: slug,
      buyer: { $exists: eventType == "0" ? true : false },
    })
    .sort({ timestamp: -1 })
    .lean()
    .exec();
  return item;
};
