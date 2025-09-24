import { returnUrl } from "./settings/returnUrl";
// Constants
const GetChat_url = "/message";

// Post a new Message
export async function postNewMessageApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetChat_url;

  //console.log("Token Send :", token);
  // console.log("url :", url);

  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(bodyObject),
  });
}
