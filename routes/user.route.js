const express = require('express');
const userController = require('../controller/user.controller');
const user = require('../db/schema/user')
async function userRegister(req, res) {
  try {
    let result = await userController.saveUser(req.body)
    return res.status(200).send({value:"ok"})
  } catch (err) {
    return res.status(500).send({response: "Error", result: err})
  }
}
async function checkUser(req, res) {
  try {
    let result = await userController.checkUser(req.query)
    return res.status(200).send(result)
  } catch (err) {
    return res.status(500).send({response: "Error", result: err})
  }
}
async function fetchUsers(req, res) {
  try {
    let result = await userController.getUser()
    return res.status(200).send(JSON.stringify(result))
  } catch (err) {
    return res.status(500).send({response: "Error", result: err})
  }
}

module.exports = () => {
  const userRoute = express.Router();
  userRoute.post('/register', userRegister);
  userRoute.get('/fetch', fetchUsers);
  userRoute.get('/check', checkUser);
  return userRoute;
};