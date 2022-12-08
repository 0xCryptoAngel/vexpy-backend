"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nft = void 0;
const mongoose_1 = require("mongoose");
//list Schema
const Nft = new mongoose_1.Schema({
    address: {
        type: String,
    },
    date: {
        type: String,
    },
    isApproved: {
        type: Boolean,
    },
});
// Define schema of collection in mongoDB
exports.nft = (0, mongoose_1.model)("Nft", Nft);
