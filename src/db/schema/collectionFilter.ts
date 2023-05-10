import { Model, Schema, model } from "mongoose";
export const CollectionFilter: Schema = new Schema({
  slug: { type: String, default: "" },
  metadata: Schema.Types.Mixed,
});
// Define schema of collection in mongoDB
export const collectionFilter = model("CollectionFilter", CollectionFilter);
