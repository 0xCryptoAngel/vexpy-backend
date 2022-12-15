import { Model, Schema, model } from "mongoose";
import { BuyTokenEventData } from "../../types";
const BuyToken: Schema = new Schema({
  market_id: {
    type: {
      market_address: String,
      market_name: String,
    },
  },
  price: { type: String },
  token_id: {
    type: {
      property_version: Number,
      token_data_id: {
        collection: String,
        creator: String,
        name: String,
      },
    },
  },
  seller: { type: String },
  buyer: { type: String },
  offer_id: { type: String },
  timestamp: { type: String },
});
// Define schema of collection in mongoDB
export const buyToken: Model<BuyTokenEventData> = model<BuyTokenEventData>(
  "buyToken",
  BuyToken
);
