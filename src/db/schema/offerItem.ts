import { Model, Schema, model } from "mongoose";
const OfferItem: Schema = new Schema({
  key: {
    property_version: String,
    token_data_id: {
      collection: {
        type: String,
        trim: true,
      },
      creator: String,
      name: {
        type: String,
        trim: true,
      },
    },
  },
  price: { type: Number, default: 0 },
  owner: { type: String, default: "" },
  offer_id: { type: Number, default: 0 },
  offerer: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  isforAccept: { type: Boolean, default: false },
});
// Define schema of collection in mongoDB
export const offerItem = model("OfferItem", OfferItem);
