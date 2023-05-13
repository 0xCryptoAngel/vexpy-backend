import { Model, Schema, model } from "mongoose";
const Activity: Schema = new Schema({
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
  // amount: { type: Number, default: 0 },
  // leftAmount: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  timestamp: { type: Number, default: 0 },
  seller: { type: String, default: "" },
  image: { type: String, default: "" },
  buyer: { type: String, default: "" },
  slug: { type: String, default: "" },
  version: { type: Number, default: 0 },
});
// Define schema of collection in mongoDB
export const activity = model("Activity", Activity);
