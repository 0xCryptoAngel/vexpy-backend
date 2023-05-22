import { Model, Schema, model } from "mongoose";
const CollectionItem: Schema = new Schema({
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
  volume: { type: Number, default: 0 },
  supply: { type: Number, default: 0 },
  listed: { type: Number, default: 0 },
  owner: { type: Number, default: 0 },
  floor: { type: Number, default: 0 },
  slug: { type: String, default: "" },
  name: { type: String, default: "" },
  topoffer: { type: Number, default: 0 },
  royalty: { type: Number, default: 0 },
  description: { type: String, default: "" },
  metadata_uri: { type: String, default: "" },
  image_uri: { type: String, default: "" },
  lastSoldAt: { type: Date, default: new Date(0) },
});
// Define schema of collection in mongoDB
export const collectionItem = model("CollectionItem", CollectionItem);
