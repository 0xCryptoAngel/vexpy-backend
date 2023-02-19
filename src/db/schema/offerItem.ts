import { Model, Schema, model } from "mongoose";
const OfferItem: Schema = new Schema({
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
  price: { type: Number, default: 0 },
  owner: { type: String, default: "" },
  offerer: { type: String, default: "" },
  timestamp: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  isforitem: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
  leftAmount: { type: Number, default: 0 },
  slug: { type: String, default: "" },
});
// Define schema of collection in mongoDB
export const offerItem = model("OfferItem", OfferItem);
