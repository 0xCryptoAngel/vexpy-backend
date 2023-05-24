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
    .exec();
  if (!item) return;
  return item;
};

export const fetchCollection = async (_period: number) => {
  let item = await collectionItem
    .find({
      lastSoldAt: {
        $gte: new Date(new Date().getTime() - 3600 * _period * 1000),
      },
    })
    .sort({ volume: -1 })
    .limit(30)
    .lean()
    .exec();
  if (!item) return;
  return item;
};

export const fetchCollectionData = async (slug: string) => {
  let item = await nftItem
    .findOne({
      slug: slug,
    })
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
    .exec();
  return item;
};
