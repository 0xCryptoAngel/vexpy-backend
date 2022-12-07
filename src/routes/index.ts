import express from "express";

module.exports = () => {
  const router = express.Router();
  const userRoute = require("./user.route")();
  router.use("/user", userRoute);
  return router;
};
