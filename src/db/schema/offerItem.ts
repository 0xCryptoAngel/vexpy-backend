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
  isforAccept: { type: Boolean, default: false },
});
// Define schema of collection in mongoDB
export const offerItem = model("OfferItem", OfferItem);
