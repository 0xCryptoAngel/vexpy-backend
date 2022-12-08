require("dotenv").config();
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')
const PORT = process.env.PORT || 80;

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("./db/dbConfig");
const router = require('./routes')();
app.use('/api', router);

app.get('/', (req, res) => {
  res.send({value: "hello"});
});


app.listen(PORT, ()=>{
  console.log(`server is runing at port ${PORT}`)
});
