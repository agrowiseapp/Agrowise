import { returnUrl } from "./settings/returnUrl";
// Constants
const GetChat_url = "/chat";
const readChat_url = "/read";
const getOrCreateChat_url = "/createOrGetChat";

// //Get all chats
export async function getChatsApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetChat_url;

  //console.log("Token Send :", token);
  // console.log("url :", url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

export async function getSelectedChatApi(apiUrl, id, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetChat_url + "/" + id;

  //console.log("Token Send :", token);
  // console.log("url :", url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

//Read the chat
export async function readChatApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetChat_url + readChat_url;

  //console.log("BodyObject :", bodyObject);
  //console.log("url :", url);

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

export async function getChatsNumber(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetChat_url + "/number";

  //console.log("Token Send :", token);
  // console.log("url :", url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

export async function getOrCreateChatApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetChat_url + getOrCreateChat_url;

  //console.log("BodyObject :", bodyObject);
  //console.log("url :", url);

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
