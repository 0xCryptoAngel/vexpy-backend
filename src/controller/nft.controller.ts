import { aptosClient, tokenClient, MARKET_ADDRESS } from "../config/constants";
import axios from "axios";
import { I_TOKEN_ID_DATA, I_TOKEN_SLUG } from "../types/interfaces";
import { nftItem } from "../db/schema/nftItem";
import { collectionItem } from "../db/schema/collectionItem";
import { arrayFormat, fetchGraphQL, fetchListEvent } from "../utils/graphql";
import { delay } from "../utils/delay";
import { convertURL } from "../utils/graphql";
import { metaData } from "../db/schema/metaData";
import { uploadImage } from "../utils/cloudinary";
import { collectionFilter } from "../db/schema/collectionFilter";
const fetch = require("node-fetch");
export const fetchListToken = async () => {
  const result = await nftItem.find({
    isForSale: true,
  });
  return result;
};

export const collectedNft = async (
  address: string,
  slug: string | undefined
) => {
  const operation = `
  query CurrentTokens($owner_address: String, $offset: Int) {
    current_token_ownerships(
      where: {owner_address: {_eq: $owner_address}, amount: {_gt: "0"}, table_type: {_eq: "0x3::token::TokenStore"}}
      order_by: {last_transaction_version: desc}
      offset: $offset
    ) {
      name
      collection_name
      property_version
      creator_address
      amount
      owner_address
      current_token_data {
        metadata_uri
        description
        royalty_points_denominator
        royalty_points_numerator
        royalty_mutable
        default_properties
      }
      current_collection_data {
        collection_name
        description
        metadata_uri
        supply
      }
    }
  }
`;

  const fetchCurrentTokens = (owner_address: string, offset: number) => {
    return fetchGraphQL(operation, "CurrentTokens", {
      owner_address: owner_address,
      offset: offset,
    });
  };
  const startFetchCurrentTokens = async (
    owner_address: string,
    offset: number
  ) => {
    const { errors, data } = await fetchCurrentTokens(owner_address, offset);
    if (errors) {
      console.error(errors);
    }
    const newNfts = await Promise.all(
      data.current_token_ownerships.map(async (token: any, i: number) => {
        const item = await nftItem.findOne({
          "key.property_version": token.property_version,
          "key.token_data_id.collection": token.collection_name,
          "key.token_data_id.creator": token.creator_address,
          "key.token_data_id.name": token.name,
        });
        if (!item) {
          return token;
        }
      })
    );
    const sortedNewNfts = newNfts.filter((item) => item);
    if (sortedNewNfts.length > 0) {
      await Promise.all(
        sortedNewNfts?.map(async (token: any, i: number) => {
          let imageUri: string;
          let _metaData: any[] = [];
          let _metadata_uri = token.current_token_data.metadata_uri?.slice(-5);
          if (
            _metadata_uri.includes(".png") ||
            _metadata_uri.includes(".jpeg") ||
            _metadata_uri.includes(".jpg") ||
            _metadata_uri.includes(".webp") ||
            _metadata_uri.includes(".gif")
          ) {
            imageUri = token.current_token_data.metadata_uri
              .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
              .replace(
                "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
                "https://cloudflare-ipfs.com/ipfs/"
              )
              .replace(
                "https://ipfs.io/ipfs/",
                "https://cloudflare-ipfs.com/ipfs/"
              );
            const fixedArray = Object.entries(
              token?.current_token_data?.default_properties
            ).map(([trait_type, value]): [string, string] => [
              trait_type,
              value as string,
            ]);

            _metaData = fixedArray.map(function ([trait_type, value]: [
              string,
              string
            ]) {
              const val = Buffer.from(value.slice(2), "hex").toString();
              return { trait_type, value: val };
            });
          } else {
            if (token.current_token_data.metadata_uri?.length > 0) {
              try {
                const str = `{"method":"GET","uri": "${token.current_token_data.metadata_uri
                  .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
                  .replace(
                    "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )
                  .replace(
                    "https://ipfs.io/ipfs/",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )}","headers":{},"auth":{"_t":"None"}}`;
                const buffer = Buffer.from(str);
                const base64 = buffer.toString("base64");

                const result = await fetch("https://restninja.io/in/proxy", {
                  headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    request: base64,
                    "sec-ch-ua":
                      '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    cookie:
                      "_gid=GA1.2.504598292.1683143371; twk_idm_key=iBr3OE0hO0X27d6GpPBRG; sc_is_visitor_unique=rx12865986.1683143462.D63B037B39CA4F220058691E0234DE36.1.1.1.1.1.1.1.1.1; _gat_gtag_UA_2652919_3=1; _ga_JQXWSK7VEK=GS1.1.1683143370.1.1.1683143461.0.0.0; _ga=GA1.1.1030511354.1683143371; TawkConnectionTime=0; twk_uuid_5ae071e9227d3d7edc24b9dc=%7B%22uuid%22%3A%221.SwoXUkJcFEhb6z7ddQwy6V3WPjWccTAuWMmxyc3f2kJzjxMY6u1v8LOAHWcbqOFjq1smhV2S60R3j5aBqlz0T5KuXPXYmLRjNXvregFLXGPzGshnNmcV2%22%2C%22version%22%3A3%2C%22domain%22%3A%22restninja.io%22%2C%22ts%22%3A1683143463669%7D",
                    Referer: "https://restninja.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                  },
                  body: null,
                  method: "POST",
                });

                let test = await result.json();

                //In this case, URL is json
                if (typeof test == "object") {
                  imageUri = test?.image
                    ?.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
                    .replace(
                      "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
                      "https://cloudflare-ipfs.com/ipfs/"
                    )
                    .replace(
                      "https://ipfs.io/ipfs/",
                      "https://cloudflare-ipfs.com/ipfs/"
                    );
                  if (test?.attributes?.length > 0) {
                    _metaData = test?.attributes;
                  } else {
                    const fixedArray = Object.entries(
                      token?.current_token_data?.default_properties
                    ).map(([trait_type, value]): [string, string] => [
                      trait_type,
                      value as string,
                    ]);

                    _metaData = fixedArray.map(function ([trait_type, value]: [
                      string,
                      string
                    ]) {
                      const val = Buffer.from(value.slice(2), "hex").toString();
                      return { trait_type, value: val };
                    });
                  }
                }
              } catch (error: any) {
                if (error.type == "invalid-json") {
                  imageUri = token.current_token_data.metadata_uri
                    ?.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
                    .replace(
                      "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
                      "https://cloudflare-ipfs.com/ipfs/"
                    )
                    .replace(
                      "https://ipfs.io/ipfs/",
                      "https://cloudflare-ipfs.com/ipfs/"
                    );
                  const fixedArray = Object.entries(
                    token?.current_token_data?.default_properties
                  ).map(([trait_type, value]): [string, string] => [
                    trait_type,
                    value as string,
                  ]);

                  _metaData = fixedArray.map(function ([trait_type, value]: [
                    string,
                    string
                  ]) {
                    const val = Buffer.from(value.slice(2), "hex").toString();
                    return { trait_type, value: val };
                  });
                }
              }
            }
          }
          let newItem = await nftItem.create({
            key: {
              property_version: token.property_version,
              token_data_id: {
                collection: token.collection_name,
                creator: token.creator_address,
                name: token.name,
              },
            },
          });

          // let newItem = await nftItem.findOne({
          //   "key.property_version": token.property_version,
          //   "key.token_data_id.collection": token.collection_name,
          //   "key.token_data_id.creator": token.creator_address,
          //   "key.token_data_id.name": token.name,
          // });
          // if (!newItem) return;
          newItem.image_uri = await uploadImage(imageUri!);
          newItem.description = token.current_token_data.description;
          newItem.isForSale = false;
          newItem.metadata = _metaData;
          console.log("newItem", newItem);
          newItem.owner = token.owner_address;
          newItem.slug = `${token.collection_name?.replace(
            /[^A-Z0-9]+/gi,
            "-"
          )}-${token.creator_address.substring(61)}`;
          newItem.token_uri = token.current_token_data.metadata_uri
            .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
            .replace(
              "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
              "https://cloudflare-ipfs.com/ipfs/"
            )
            .replace(
              "https://ipfs.io/ipfs/",
              "https://cloudflare-ipfs.com/ipfs/"
            );
          newItem.collection_name =
            token.current_collection_data.collection_name;
          newItem.collection_description =
            token.current_collection_data.description;
          newItem.collection_metadata_uri =
            token.current_collection_data.metadata_uri
              .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
              .replace(
                "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
                "https://cloudflare-ipfs.com/ipfs/"
              )
              .replace(
                "https://ipfs.io/ipfs/",
                "https://cloudflare-ipfs.com/ipfs/"
              );
          await newItem.save();

          /******/
          let _collectionItem = await collectionItem.findOne({
            "key.token_data_id.collection": token.collection_name,
          });
          let _royalty =
            token.current_token_data.royalty_points_numerator /
            token.current_token_data.royalty_points_denominator;
          const imageUrlRegex = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;

          function isImageUrl(url: string) {
            return imageUrlRegex.test(url);
          }

          if (_collectionItem == null) {
            let collecteditem = await collectionItem.create({
              key: {
                property_version: token.property_version,
                token_data_id: {
                  collection: token.collection_name,
                  creator: token.creator_address,
                  name: "",
                },
              },
            });
            collecteditem.supply = token.current_collection_data.supply;
            let itemAmount = await nftItem
              .find({
                "key.token_data_id.collection": token.collection_name,
              })
              .distinct("owner")
              .exec();
            if (!itemAmount) return;
            collecteditem.owner = itemAmount.length;
            collecteditem.slug = `${token.collection_name?.replace(
              /[^A-Z0-9]+/gi,
              "-"
            )}-${token.creator_address.substring(61)}`;

            collecteditem.name = token.current_collection_data.collection_name;
            collecteditem.description =
              token.current_collection_data.description;
            collecteditem.royalty = isNaN(_royalty) ? 0 : _royalty;
            collecteditem.metadata_uri =
              token.current_collection_data.metadata_uri
                .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
                .replace(
                  "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
                  "https://cloudflare-ipfs.com/ipfs/"
                )
                .replace(
                  "https://ipfs.io/ipfs/",
                  "https://cloudflare-ipfs.com/ipfs/"
                );
            let image_uri: string;
            if (
              isImageUrl(
                convertURL(token.current_collection_data.metadata_uri).replace(
                  "ipfs://",
                  "https://cloudflare-ipfs.com/ipfs/"
                )
              )
            ) {
              try {
                image_uri = convertURL(
                  token.current_collection_data.metadata_uri.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )
                );
              } catch (error) {
                console.log(error);
              }
            } else {
              let test: any;
              try {
                const str = `{"method":"GET","uri": "${convertURL(
                  token.current_collection_data.metadata_uri.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )
                )}","headers":{},"auth":{"_t":"None"}}`;
                const buffer = Buffer.from(str);
                const base64 = buffer.toString("base64");

                const result = await fetch("https://restninja.io/in/proxy", {
                  headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    request: base64,
                    "sec-ch-ua":
                      '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    cookie:
                      "_gid=GA1.2.504598292.1683143371; twk_idm_key=iBr3OE0hO0X27d6GpPBRG; sc_is_visitor_unique=rx12865986.1683143462.D63B037B39CA4F220058691E0234DE36.1.1.1.1.1.1.1.1.1; _gat_gtag_UA_2652919_3=1; _ga_JQXWSK7VEK=GS1.1.1683143370.1.1.1683143461.0.0.0; _ga=GA1.1.1030511354.1683143371; TawkConnectionTime=0; twk_uuid_5ae071e9227d3d7edc24b9dc=%7B%22uuid%22%3A%221.SwoXUkJcFEhb6z7ddQwy6V3WPjWccTAuWMmxyc3f2kJzjxMY6u1v8LOAHWcbqOFjq1smhV2S60R3j5aBqlz0T5KuXPXYmLRjNXvregFLXGPzGshnNmcV2%22%2C%22version%22%3A3%2C%22domain%22%3A%22restninja.io%22%2C%22ts%22%3A1683143463669%7D",
                    Referer: "https://restninja.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                  },
                  body: null,
                  method: "POST",
                });

                test = await result.json();
              } catch (error: any) {
                if (error.type == "invalid-json") {
                  image_uri = convertURL(
                    token.current_collection_data.metadata_uri.replace(
                      "ipfs://",
                      "https://cloudflare-ipfs.com/ipfs/"
                    )
                  );
                }
              }

              if (typeof test == "object") {
                image_uri = convertURL(
                  test?.image.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )
                );
              }
            }
            collecteditem.image_uri = await uploadImage(image_uri!);
            await collecteditem.save();
            /******/
          } else {
            _collectionItem.supply = token.current_collection_data.supply;
            _collectionItem.royalty = isNaN(_royalty) ? 0 : _royalty;

            let itemAmount = await nftItem
              .find({
                "key.token_data_id.collection": token.collection_name,
              })
              .distinct("owner")
              .exec();
            if (!itemAmount) return;
            _collectionItem.owner = itemAmount.length;
            _collectionItem.slug = `${token.collection_name?.replace(
              /[^A-Z0-9]+/gi,
              "-"
            )}-${token.creator_address.substring(61)}`;

            _collectionItem.name =
              token.current_collection_data.collection_name;
            _collectionItem.description =
              token.current_collection_data.description;
            _collectionItem.metadata_uri =
              token.current_collection_data.metadata_uri
                .replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
                .replace(
                  "https://green-elegant-opossum-682.mypinata.cloud/ipfs/",
                  "https://cloudflare-ipfs.com/ipfs/"
                )
                .replace(
                  "https://ipfs.io/ipfs/",
                  "https://cloudflare-ipfs.com/ipfs/"
                );
            let _image_uri: string;
            if (
              isImageUrl(
                convertURL(
                  token.current_collection_data.metadata_uri.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )
                )
              )
            ) {
              _image_uri = convertURL(
                token.current_collection_data.metadata_uri.replace(
                  "ipfs://",
                  "https://cloudflare-ipfs.com/ipfs/"
                )
              );
            } else {
              let test: any;
              try {
                const str = `{"method":"GET","uri": "${convertURL(
                  token.current_collection_data.metadata_uri.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )
                )}","headers":{},"auth":{"_t":"None"}}`;
                const buffer = Buffer.from(str);
                const base64 = buffer.toString("base64");

                const result = await fetch("https://restninja.io/in/proxy", {
                  headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    request: base64,
                    "sec-ch-ua":
                      '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    cookie:
                      "_gid=GA1.2.504598292.1683143371; twk_idm_key=iBr3OE0hO0X27d6GpPBRG; sc_is_visitor_unique=rx12865986.1683143462.D63B037B39CA4F220058691E0234DE36.1.1.1.1.1.1.1.1.1; _gat_gtag_UA_2652919_3=1; _ga_JQXWSK7VEK=GS1.1.1683143370.1.1.1683143461.0.0.0; _ga=GA1.1.1030511354.1683143371; TawkConnectionTime=0; twk_uuid_5ae071e9227d3d7edc24b9dc=%7B%22uuid%22%3A%221.SwoXUkJcFEhb6z7ddQwy6V3WPjWccTAuWMmxyc3f2kJzjxMY6u1v8LOAHWcbqOFjq1smhV2S60R3j5aBqlz0T5KuXPXYmLRjNXvregFLXGPzGshnNmcV2%22%2C%22version%22%3A3%2C%22domain%22%3A%22restninja.io%22%2C%22ts%22%3A1683143463669%7D",
                    Referer: "https://restninja.io/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                  },
                  body: null,
                  method: "POST",
                });

                test = await result.json();
              } catch (error: any) {
                console.log(error);
                if (error.type == "invalid-json") {
                  _image_uri = convertURL(
                    token.current_collection_data.metadata_uri.replace(
                      "ipfs://",
                      "https://cloudflare-ipfs.com/ipfs/"
                    )
                  );
                }
              }
              if (typeof test == "object") {
                _image_uri = convertURL(
                  test?.image.replace(
                    "ipfs://",
                    "https://cloudflare-ipfs.com/ipfs/"
                  )
                );
              }
            }
            _collectionItem.image_uri = await uploadImage(_image_uri!);
            await _collectionItem.save();
            /******/
          }
        })
      );
    }
  };

  await startFetchCurrentTokens(address, 0);

  let query: any = {
    owner: address,
  };

  if (slug) {
    query.slug = slug;
  }

  const result = await nftItem.aggregate([
    {
      $lookup: {
        from: "collectionitems", //other table name
        localField: "slug", //name of car table field
        foreignField: "slug", //name of cardetails table field
        as: "collection", //alias for cardetails table
      },
    },
    {
      $match: query,
    },
  ]);
  return result;
};

export const collection = async (
  slug: string,
  _isForSale: any,
  _filter: string
) => {
  let query: any = {
    slug: slug,
  };
  if (_isForSale === "true") {
    query.isForSale = true;
  }
  if (_filter != undefined && JSON.parse(_filter).length > 0) {
    query.metadata = { $elemMatch: { $or: JSON.parse(_filter) } };
  }
  let result = await nftItem.find(query).sort({ isForSale: -1, price: 1 });
  return result;
};

export const updateListToken = async (token: any) => {
  const listEvents = await aptosClient.getEventsByEventHandle(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::MarketEvents`,
    "list_token_events"
  );
  let _token_id = {
    collection: token[3],
    creator: token[2],
    name: token[4],
  };
  listEvents.sort((a, b) => a.data.timestamp - b.data.timestamp);

  const result = listEvents.find(({ data }) => {
    return (
      data.token_id.token_data_id.collection === token[3] &&
      data.token_id.token_data_id.creator === token[2] &&
      data.token_id.token_data_id.name === token[4]
    );
  });
};

export const handleNft = async (tokenIdData: I_TOKEN_SLUG) => {
  // const item = await nftItem
  //   .findOne({
  //     "key.property_version": tokenIdData?.property_version,
  //     "key.token_data_id.name": tokenIdData?.name,
  //     slug: tokenIdData?.slug,
  //   })
  //   .exec();

  let item = await nftItem
    .aggregate([
      {
        $lookup: {
          from: "collectionitems", //other table name
          localField: "slug", //name of car table field
          foreignField: "slug", //name of cardetails table field
          as: "collection", //alias for cardetails table
        },
      },
      {
        $match: {
          "key.property_version": tokenIdData?.property_version,
          "key.token_data_id.name": tokenIdData?.name,
          slug: tokenIdData?.slug,
        },
      },
      {
        $lookup: {
          from: "profileitems", //other table name
          localField: "owner", //name of car table field
          foreignField: "address", //name of cardetails table field
          as: "profile", //alias for cardetails table
        },
      },
    ])
    .exec();

  return item;
};

export const handleCollectionNft = async (tokenIdData: I_TOKEN_SLUG) => {
  let item;
  if (tokenIdData?.name?.length > 0) {
    item = await nftItem
      .find({
        "key.property_version": tokenIdData?.property_version,
        "key.token_data_id.name": tokenIdData?.name,
        slug: tokenIdData?.slug,
      })
      .exec();
  } else {
    item = await nftItem
      .find({
        "key.property_version": tokenIdData?.property_version,
        slug: tokenIdData?.slug,
      })
      .exec();
  }

  return item[0];
};

export const handleNfts = async (tokenIdData: I_TOKEN_ID_DATA) => {
  const item = await nftItem.find({}).exec();
  return item;
};

export const handleMintRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  const token = await tokenClient.getTokenData(
    tokenIdData.token_data_id.creator,
    tokenIdData.token_data_id.collection,
    tokenIdData.token_data_id.name
  );
  if (!token) return;
  let newItem = await nftItem.create({
    key: {
      property_version: tokenIdData.property_version,
      token_data_id: {
        collection: tokenIdData.token_data_id.collection,
        creator: tokenIdData.token_data_id.creator,
        name: tokenIdData.token_data_id.name,
      },
    },
  });
  newItem.image_uri = token.uri;
  newItem.description = token.description;
  newItem.isForSale = false;
  newItem.owner = tokenIdData.token_data_id.creator;
  await newItem.save();
  return newItem;
};

export const handleListingRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  async function startFetchListEvent(
    account_address: string,
    type: string,
    offset: number
  ) {
    await delay(5000);
    const { errors, data } = await fetchListEvent(
      account_address,
      type,
      offset
    );

    if (errors) {
      console.error(errors);
    }
    let item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    if (!item) return;
    const token = data.events[0];
    item.price = token?.data.price;
    item.offer_id = token?.data.offer_id;
    item.isForSale = true;
    await item.save();

    /*update listed items*/
    let listedItem = await nftItem
      .find({
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        isForSale: true,
      })
      .sort({ price: 1 })
      .exec();
    if (!listedItem) return;
    let collecteditem = await collectionItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      })
      .exec();
    if (!collecteditem) return;
    collecteditem.listed = listedItem.length;
    collecteditem.floor = listedItem[0]?.price;
    await collecteditem.save();
    /* end */
    return item;
  }

  let item = startFetchListEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::ListTokenEvent`,
    0
  );
  return item;
};

export const handleBuyRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  async function startFetchListEvent(
    account_address: string,
    type: string,
    offset: number
  ) {
    await delay(5000);
    const { errors, data } = await fetchListEvent(
      account_address,
      type,
      offset
    );

    if (errors) {
      console.error(errors);
    }
    let item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    if (!item) return;
    const token = data.events[0];
    item.price = 0;
    item.offer_id = 0;
    item.isForSale = false;
    item.owner = `0x${token.data.buyer.substring(2).padStart(64, "0")}`;
    await item.save();
    /*update listed items*/
    let listedItem = await nftItem
      .find({
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        isForSale: true,
      })
      .sort({ price: 1 })
      .exec();
    if (!listedItem) return;

    let collecteditem = await collectionItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      })
      .exec();
    if (!collecteditem) return;
    collecteditem.listed = listedItem.length;
    collecteditem.floor = listedItem[0]?.price;
    collecteditem.volume += parseFloat(token.data.price);
    collecteditem.lastSoldAt = new Date();

    let itemAmount = await nftItem
      .find({
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
      })
      .distinct("owner")
      .exec();
    if (!itemAmount) return;
    collecteditem.owner = itemAmount.length;
    await collecteditem.save();
    /* end */

    return item;
  }

  let item = startFetchListEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::BuyTokenEvent`,
    0
  );
  return item;
};

export const handleCancelRequest = async (tokenIdData: I_TOKEN_ID_DATA) => {
  async function startFetchListEvent(
    account_address: string,
    type: string,
    offset: number
  ) {
    await delay(5000);
    const { errors, data } = await fetchListEvent(
      account_address,
      type,
      offset
    );

    if (errors) {
      console.error(errors);
    }
    let item = await nftItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
        "key.token_data_id.name": tokenIdData.token_data_id.name,
      })
      .exec();
    if (!item) return;
    item.price = 0;
    item.offer_id = 0;
    item.isForSale = false;
    await item.save();

    /*update listed items*/
    let listedItem = await nftItem
      .find({
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        isForSale: true,
      })
      .sort({ price: 1 })
      .exec();
    if (!listedItem) return;

    let collecteditem = await collectionItem
      .findOne({
        "key.property_version": tokenIdData.property_version,
        "key.token_data_id.collection": tokenIdData.token_data_id.collection,
        "key.token_data_id.creator": tokenIdData.token_data_id.creator,
      })
      .exec();
    if (!collecteditem) return;
    collecteditem.listed = listedItem.length;
    collecteditem.floor = listedItem[0]?.price;
    await collecteditem.save();
    /* end */

    return item;
  }

  let item = startFetchListEvent(
    MARKET_ADDRESS!,
    `${MARKET_ADDRESS}::marketplace::CancelSaleEvent`,
    0
  );
  return item;
};

export const metaDatabySlug = async (slug: string) => {
  let collectionMetaData = await metaData.findOne({
    slug: slug,
  });
  if (collectionMetaData) return collectionMetaData;
  else {
    let result: any = await nftItem.find({
      slug: slug,
    });
    let collectionType: { [key: string]: any } = {};
    let testType: any[] = [];

    result.map((item: any, i: number) => {
      testType = [...testType, ...item["metadata"]];
    });
    arrayFormat(testType)?.map((_item: any, j: number) => {
      console.log("_item", (collectionType[_item.trait_type] = []));
    });
    result.map((item: any, i: number) => {
      item["metadata"]?.map(
        (_item: { trait_type: string; value: string }, j: number) => {
          if (
            !collectionType[_item.trait_type].includes(_item.value) &&
            _item.value != "None"
          ) {
            collectionType[_item.trait_type].push(_item.value);
          }
        }
      );
    });
    let _test = await metaData.create({
      slug: slug,
    });
    _test.metadata = collectionType;
    _test.save();
    return result;
  }
};

export const collectionMetabySlug = async (slug: string) => {
  const _metaData = await collectionFilter.aggregate([
    {
      $lookup: {
        from: "collectionitems", //other table name
        localField: "slug", //name of car table field
        foreignField: "slug", //name of cardetails table field
        as: "collection", //alias for cardetails table
      },
    },
    {
      $match: { slug: slug },
    },
  ]);

  if (!_metaData) return;
  // if (!_metaData) return;

  // const traits = _metaData["metadata"];

  // let response: any = {};
  // let promises = Object.keys(traits).map((key) => {
  //   return Promise.all(
  //     traits[key].map((val: any) => {
  //       return nftItem
  //         .find({
  //           slug: slug,
  //           metadata: { $elemMatch: { trait_type: key, value: val } },
  //         })
  //         .count();
  //     })
  //   );
  // });

  // let result = await Promise.all(promises);
  // let i = 0;
  // for (const key in traits) {
  //   response[key] = {};
  //   for (const [j, val] of traits[key].entries()) {
  //     response[key][val] = result[i][j];
  //   }
  //   i++;
  // }
  console.log("_metaData", _metaData);
  return _metaData;
};

export const cronCollectionMetabySlug = async (slug: string) => {
  let __metaData = await metaData.findOne({
    slug: slug,
  });

  let _metaData: any;

  if (__metaData) {
    _metaData = __metaData;
  } else {
    let result: any = await nftItem.find({
      slug: slug,
    });
    let collectionType: { [key: string]: any } = {};
    let testType: any[] = [];

    result.map((item: any, i: number) => {
      testType = [...testType, ...item["metadata"]];
    });
    arrayFormat(testType)?.map((_item: any, j: number) => {
      console.log("_item", (collectionType[_item.trait_type] = []));
    });
    result.map((item: any, i: number) => {
      item["metadata"]?.map(
        (_item: { trait_type: string; value: string }, j: number) => {
          if (
            !collectionType[_item.trait_type].includes(_item.value) &&
            _item.value != "None"
          ) {
            collectionType[_item.trait_type].push(_item.value);
          }
        }
      );
    });
    let _test = await metaData.create({
      slug: slug,
    });
    _test.metadata = collectionType;
    _test.save();
    _metaData = _test;
  }

  const traits = _metaData["metadata"];

  let response: any = {};
  let promises = Object.keys(traits).map((key) => {
    return Promise.all(
      traits[key].map((val: any) => {
        return nftItem
          .find({
            slug: slug,
            metadata: { $elemMatch: { trait_type: key, value: val } },
          })
          .count();
      })
    );
  });

  let result = await Promise.all(promises);
  let i = 0;
  for (const key in traits) {
    response[key] = {};
    for (const [j, val] of traits[key].entries()) {
      response[key][val] = result[i][j];
    }
    i++;
  }
  await collectionFilter.findOneAndUpdate(
    {
      slug: slug,
    },
    { metadata: response },
    { new: true, upsert: true }
  );
  return response;
};
