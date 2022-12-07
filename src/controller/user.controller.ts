import { nft } from "../db/schema/nft";

const getUser = async () => {
  const result = await user.find({});
  return result;
};

module.exports = {
  getUser,
};
