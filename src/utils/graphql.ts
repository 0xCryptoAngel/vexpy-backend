export const fetchGraphQL = async (
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>
) => {
  const result = await fetch(
    "https://indexer.mainnet.aptoslabs.com/v1/graphql",
    {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    }
  );

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
