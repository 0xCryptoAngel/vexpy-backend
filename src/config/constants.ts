import "dotenv/config";
import {
  AptosClient,
  WalletClient,
  TokenClient,
} from "@martiandao/aptos-web3-bip44.js";
export const { APTOS_NODE_URL, MARKET_ADDRESS, APTOS_FAUCET_URL } = process.env;

export const aptosClient = new AptosClient(APTOS_NODE_URL!);
export const tokenClient = new TokenClient(aptosClient);
export const walletClient = new WalletClient(APTOS_NODE_URL, APTOS_FAUCET_URL);
