import express from "express";

module.exports = () => {
  const router = express.Router();
  const nftRoute = require("./nft.route")();
  router.use("/nft", nftRoute);
  return router;
};
