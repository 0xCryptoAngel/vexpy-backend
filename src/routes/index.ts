import express from "express";

module.exports = () => {
  const router = express.Router();
  const nftRoute = require("./nft.route")();
  const collectionRoute = require("./collection.route")();
  router.use("/market", nftRoute);
  router.use("/collection", collectionRoute);
  return router;
};
