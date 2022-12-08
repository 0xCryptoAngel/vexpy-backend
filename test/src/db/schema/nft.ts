import { Model, Schema, model } from "mongoose";

export interface INft {
  address: string;
  date: string;
  isApproved: boolean;
}
//list Schema
const Nft: Schema = new Schema({
  address: {
    type: String,
  },
  date: {
    type: String,
  },
  isApproved: {
    type: Boolean,
  },
});
// Define schema of collection in mongoDB
export const nft: Model<INft> = model<INft>("Nft", Nft);
