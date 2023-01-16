import { Model, Schema, model } from "mongoose";
const CollectionItem: Schema = new Schema({
  collection: String,
  volume: { type: Number, default: 0 },
});
// Define schema of collection in mongoDB
export const collectionItem = model("CollectionItem", CollectionItem);
