type T_REQUEST_TYPE =
  | "REQUEST_MINT"
  | "REQUEST_LIST"
  | "REQUEST_CANCEL"
  | "REQUEST_PURCHASE";

interface I_TOKEN_ID_DATA {
  property_version: string;
  token_data_id: {
    collection: string;
    creator: string;
    name: string;
  };
}
interface I_UPDATE_REQUEST {
  type: T_REQUEST_TYPE;
  tokenId: I_TOKEN_ID_DATA;
}

export type { I_UPDATE_REQUEST, I_TOKEN_ID_DATA };
