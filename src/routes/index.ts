import express from "express";

module.exports = () => {
  const router = express.Router();
  const marketRoute = require("./market.route")();
  router.use("/market", marketRoute);
  return router;
};
