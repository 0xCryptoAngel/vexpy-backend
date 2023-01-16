import { Model, Schema, model } from "mongoose";
const NftItem: Schema = new Schema({
  key: {
    property_version: String,
    token_data_id: {
      collection: String,
      creator: String,
      name: String,
    },
  },

  isForSale: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  owner: { type: String, default: "" },
  offer_id: { type: Number, default: 0 },
  description: { type: String, default: "" },
  image_uri: { type: String, default: "" },
  metadata: [Schema.Types.Mixed],
  token_uri: {
    type: String,
    default: "",
  },
  collection_name: { type: String, default: "" },
  collection_description: { type: String, default: "" },
  collection_metadata_uri: { type: String, default: "" },
  volume: { type: Number, default: 0 },
});
// Define schema of collection in mongoDB
export const nftItem = model("NftItem", NftItem);
