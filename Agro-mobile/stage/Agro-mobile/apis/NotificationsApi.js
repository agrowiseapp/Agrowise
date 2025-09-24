import { returnUrl } from "./settings/returnUrl";
// Constants

const Comments_notifications_api = "/notifications/comments";
const chat_notifications_api = "/notifications/chat";

// Get Comments Notifications
export async function getCommentsNotificationApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Comments_notifications_api;

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

// Get Comments Notifications
export async function getChatNotificationApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + chat_notifications_api + "?user=user";

  //console.log("Token Send :", token);
  //console.log("url :", url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}
