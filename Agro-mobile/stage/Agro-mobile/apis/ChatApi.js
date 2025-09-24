import { returnUrl } from "./settings/returnUrl";
// Constants
const Chat_url = "/chat";
const Message_url = "/message";
const readChat_url = "/read";

//Send a new Message
export async function postSendMessageApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Message_url;

  //console.log("Body Send :", bodyObject);
  console.log("url :", url);

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

// Create new Chatroom
export async function postCreateNewChatApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Chat_url;

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

//Get specific chat
export async function getSpecificChatApi(apiUrl, chat, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + Chat_url + "/" + chat;

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
  let url = url_request + Chat_url + readChat_url;

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
