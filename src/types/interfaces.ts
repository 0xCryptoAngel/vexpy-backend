type T_REQUEST_TYPE =
  | "REQUEST_MINT"
  | "REQUEST_LIST"
  | "REQUEST_CANCEL"
  | "REQUEST_PURCHASE";

type O_REQUEST_TYPE =
  | "REQUEST_MAKE"
  | "REQUEST_ACCEPT"
  | "REQUEST_CANCEL"
  | "REQUEST_COLLECT_OFFER"
  | "REQUEST_COLLECTION_ACCEPT"
  | "REQUEST_COLLECTION_CANCEL";

interface I_TOKEN_ID_DATA {
  property_version: string;
  token_data_id: {
    collection: string;
    creator: string;
    name: string;
  };
}

interface I_TOKEN_SLUG {
  property_version: string;
  name: string;
  slug: string;
}
interface I_UPDATE_REQUEST {
  type: T_REQUEST_TYPE;
  tokenId: I_TOKEN_ID_DATA;
}

interface I_OFFER_REQUEST {
  type: O_REQUEST_TYPE;
  tokenId: I_TOKEN_ID_DATA;
  timestamp: number;
}

interface I_PROFILE {
  address: string;
  name: string;
  bio: string;
  email: string;
  website: string;
  twitter: string;
  instagram: string;
  coverImage: string;
  avatarImage: string;
}

export type {
  I_UPDATE_REQUEST,
  I_TOKEN_ID_DATA,
  I_OFFER_REQUEST,
  I_TOKEN_SLUG,
  I_PROFILE,
};
