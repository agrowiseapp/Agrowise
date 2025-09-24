import { returnUrl } from "./settings/returnUrl";

// Constants
const GroupChat_url = "/groupchat";
const Recent_url = "/recent";

// Get recent group chat messages (for initial loading)
export async function getRecentGroupMessagesApi(apiUrl, token, limit = 100) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GroupChat_url + Recent_url + `?limit=${limit}`;

  console.log("Fetching recent group messages from:", url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

// Get group chat messages with pagination
export async function getGroupMessagesApi(apiUrl, token, page = 1, limit = 50) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GroupChat_url + `?page=${page}&limit=${limit}`;

  console.log("Fetching group messages from:", url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

// Send a new group message
export async function sendGroupMessageApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GroupChat_url;

  console.log("Sending group message to:", url);
  console.log("Message body:", bodyObject);

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

// Delete a group message (optional feature)
export async function deleteGroupMessageApi(apiUrl, messageId, userId, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GroupChat_url + "/" + messageId;

  console.log("Deleting group message:", url);

  return await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ userId }),
  });
}

// Report a group message
export async function reportGroupMessageApi(apiUrl, reportData, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GroupChat_url + "/report";

  console.log("Reporting group message:", url);
  console.log("Report data:", reportData);

  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(reportData),
  });
}