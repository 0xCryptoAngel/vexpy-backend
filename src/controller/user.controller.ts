import { nft } from "../db/schema/nft";

const getUser = async () => {
  const result = await nft.find({});
  return result;
};

module.exports = {
  getUser,
};
