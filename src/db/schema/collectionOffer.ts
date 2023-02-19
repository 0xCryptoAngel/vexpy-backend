import { Model, Schema, model } from "mongoose";
const CollectionOffer: Schema = new Schema({
  key: {
    property_version: String,
    token_data_id: {
      collection: {
        type: String,
      },
      creator: String,
      name: {
        type: String,
      },
    },
  },
  amount: { type: Number, default: 0 },
  leftAmount: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  timestamp: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  owner: { type: String, default: "" },
  offerer: { type: String, default: "" },
  isforitem: { type: Boolean, default: false },
  slug: { type: String, default: "" },
});
// Define schema of collection in mongoDB
export const collectionOffer = model("CollectionOffer", CollectionOffer);
