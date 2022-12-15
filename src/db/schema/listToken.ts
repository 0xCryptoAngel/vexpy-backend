import { Model, Schema, model } from "mongoose";
import { token } from "../../types";
const ListToken: Schema = new Schema({
  propertyVersion: {
    type: Number,
  },
  creator: { type: String },
  collectionName: { type: String },
  name: { type: String },
  uri: { type: String },
  description: { type: String },
  maximum: { type: String },
  supply: { type: String },
});
// Define schema of collection in mongoDB
export const listToken: Model<token> = model<token>("listToken", ListToken);
