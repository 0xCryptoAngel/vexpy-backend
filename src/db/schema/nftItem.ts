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
  metadata: [
    {
      key: String,
      value: {
        type: String,
        value: String,
      },
    },
  ],
});
// Define schema of collection in mongoDB
export const nftItem = model("NftItem", NftItem);
