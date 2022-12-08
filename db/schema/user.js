const mongoose = require('mongoose');

//list Schema
const User = new mongoose.Schema({
  address:{
    type: String
  },
  date: {
    type: String
  },
  isApproved: {
    type: Boolean
  }
  // amount: {
  //   type: String
  // },
  // timestamp: {
  //   type: String
  // }
});
// Define schema of collection in mongoDB
const user = mongoose.model('User', User);

module.exports = user;
