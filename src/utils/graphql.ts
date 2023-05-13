const NodeCache = require("node-cache");

export const fetchGraphQL = async (
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>
) => {
  const result = await fetch(process.env.GRAPHQL_URL!, {
    method: "POST",
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });

  return await result.json();
};

const operationsDoc = `
query listEvent($account_address: String, $type: String, $offset: Int) {
  events(
    offset: $offset
    order_by: {account_address: desc, event_index: asc, transaction_version: desc}
    where: {account_address: {_eq: $account_address}, type: {_eq: $type}}
  ) {
    data
    transaction_version
  }
}
`;

export const fetchListEvent = (
  account_address: string,
  type: string,
  offset: number
) => {
  return fetchGraphQL(operationsDoc, "listEvent", {
    account_address: account_address,
    type: type,
    offset: offset,
  });
};

export const convertURL = (_url: string) => {
  let arrayLength: string[];
  let image_Uri: string;
  arrayLength = _url.split("/ipfs/");
  if (arrayLength.length > 1) {
    image_Uri = `https://cloudflare-ipfs.com/ipfs/${arrayLength.pop()}`;
  } else {
    image_Uri = _url;
  }
  return image_Uri;
};

export const arrayFormat = (_arrary: any[]) => {
  return Object.values(
    _arrary.reduce((c, e) => {
      if (!c[e.trait_type]) c[e.trait_type] = e;
      return c;
    }, {})
  );
};

export const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME }); // Caching time (second) 5 mins = 300 second
