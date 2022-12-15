import { TokenId } from "@martiandao/aptos-web3-bip44.js";
import { MarketId } from "../structs";

export interface ListTokenEventData {
  market_id: MarketId;
  price: string;
  token_id: TokenId;
  seller: string;
  timestamp: string;
  offer_id: string;
}

export interface token {
  propertyVersion: number;
  creator: string;
  collectionName: string;
  name: string;
  uri: string;
  description: string;
  maximum: string;
  supply: string;
}
