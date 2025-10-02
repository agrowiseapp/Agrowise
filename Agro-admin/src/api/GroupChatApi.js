import { returnUrl } from "./settings/returnUrl";

// Constants
const groupChat_url = "/groupchat";
const reports_url = "/reports";
const reportsCount_url = "/reports/count";

// Get count of pending reported messages
export async function getPendingReportsCountApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + groupChat_url + reportsCount_url;

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

// Get all reported messages for admin review
export async function getReportedMessagesApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + groupChat_url + reports_url;

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

// Update report status (admin action)
export async function updateReportStatusApi(apiUrl, reportId, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + groupChat_url + reports_url + "/" + reportId;

  return await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(bodyObject),
  });
}

// Admin delete message
export async function adminDeleteMessageApi(apiUrl, messageId, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + groupChat_url + "/admin/" + messageId;

  return await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(bodyObject),
  });
}
