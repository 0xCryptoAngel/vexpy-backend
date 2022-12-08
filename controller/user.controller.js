
const axios = require('axios')
const user = require('../db/schema/user')

const getUser = async () => {
  const result = await user.find({});
  return result;
}

const checkUser = async (query) => {
  const result = await user.find(query);
  if(result.length > 0) {
    return result;
  } else {
    return "ok";
  }
}

const saveUser = async (query) => {
  const result = await user.find({ address: query.address }).lean().exec();
  if(result.length > 0) {
    return ;
  } else {
    let myData = new user(query);
    myData.save();
    return "ok";
  }
}

module.exports = {
  getUser,
  saveUser,
  checkUser,
}