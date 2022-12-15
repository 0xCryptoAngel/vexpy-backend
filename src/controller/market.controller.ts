import { listToken } from "../db/schema/listToken";

const fetchListToken = async () => {
  const result = await listToken.find({});
  return result;
};

module.exports = {
  fetchListToken,
};
