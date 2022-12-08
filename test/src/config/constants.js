"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletClient = exports.aptosClient = exports.APTOS_FAUCET_URL = exports.MARKET_ADDRESS = exports.APTOS_NODE_URL = void 0;
require("dotenv/config");
const aptos_web3_bip44_js_1 = require("@martiandao/aptos-web3-bip44.js");
_a = process.env, exports.APTOS_NODE_URL = _a.APTOS_NODE_URL, exports.MARKET_ADDRESS = _a.MARKET_ADDRESS, exports.APTOS_FAUCET_URL = _a.APTOS_FAUCET_URL;
exports.aptosClient = new aptos_web3_bip44_js_1.AptosClient(exports.APTOS_NODE_URL);
exports.walletClient = new aptos_web3_bip44_js_1.WalletClient(exports.APTOS_NODE_URL, exports.APTOS_FAUCET_URL);
