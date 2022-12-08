const mongoose = require('mongoose');
require("dotenv").config();
// const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;
// MongoDB connect
mongoose.connect('mongodb+srv://tiger:tiger%401024@cluster0.v6zl6pe.mongodb.net/defi');
