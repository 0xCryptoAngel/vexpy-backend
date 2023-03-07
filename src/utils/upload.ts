const FormData = require("form-data");
export async function upload(imageName: string) {
  // Upload image to Cloudflare Images
  // CF Images will download the image hosted at the provided URL and store it
  // Leverages Upload by URL and Custom ID features of Cloudflare Images
  // see https://developers.cloudflare.com/images/cloudflare-images/upload-images/custom-id/

  console.log(`Uploading to Cloudflare Images: ${imageName}`);
  let CF_IMAGES_ACCOUNT_ID = "8282baf15b7b5903c7de25b66dbbfaf6";
  let CF_IMAGES_API_KEY = "18tqmJW92iG6KJZC04ERTFjwpatWFb2JzhlCIknr";
  let CF_IMAGES_ACCOUNT_HASH = "ZmpB-bt757J-yUp9NyNi3A";
  const body = new FormData();
  body.append("url", imageName); // tell CF Images to fetch this URL for us
  body.append("id", imageName?.slice(8)); // tell CF Images that we want our image to have this ID (ie, its current name)

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_IMAGES_ACCOUNT_ID}/images/v1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${CF_IMAGES_API_KEY}` },
        body,
      }
    );

    if (res.status !== 200 && res.status !== 409) {
      throw new Error("HTTP " + res.status + " : " + (await res.text()));
    }

    if (res.status === 409) {
      // 409: image already exists, it must have been imported by a previous run
      console.log("Already exist: " + imageName);
    }
    return `https://imagedelivery.net/${CF_IMAGES_ACCOUNT_HASH}/${imageName?.slice(
      8
    )}/images`;
  } catch (e) {
    console.log("ERROR:" + e);
  }
}
