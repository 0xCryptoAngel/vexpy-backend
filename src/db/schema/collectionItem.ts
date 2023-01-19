import { Model, Schema, model } from "mongoose";
const CollectionItem: Schema = new Schema({
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
  volume: { type: Number, default: 0 },
  supply: { type: Number, default: 0 },
  listed: { type: Number, default: 0 },
  owner: { type: Number, default: 0 },
  floor: { type: Number, default: 0 },
});
// Define schema of collection in mongoDB
export const collectionItem = model("CollectionItem", CollectionItem);
