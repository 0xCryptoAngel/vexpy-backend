import { I_TOKEN_ID_DATA } from "../types/interfaces";
import { collectionItem } from "../db/schema/collectionItem";
import { nftItem } from "../db/schema/nftItem";
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

export const fetchCollection = async () => {
  let item = await collectionItem.find({}).sort({ volume: -1 }).exec();
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
