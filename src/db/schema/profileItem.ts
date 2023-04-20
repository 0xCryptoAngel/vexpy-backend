import { Model, Schema, model } from "mongoose";
const ProfileItem: Schema = new Schema({
  address: { type: String, default: "" },
  name: {
    type: String,
    default: "",
  },
  bio: { type: String, default: "" },
  email: { type: String, default: "" },
  website: { type: String, default: "" },
  twitter: { type: String, default: "" },
  instagram: { type: String, default: "" },
  coverImage: { type: String, default: "" },
  avatarImage: { type: String, default: "" },
  isVerifeid: { type: Boolean, default: false },
  code: { type: String, default: "" },
});
// Define schema of collection in mongoDB
export const profileItem = model("profileItem", ProfileItem);
