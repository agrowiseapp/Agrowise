import { returnUrl } from "./settings/returnUrl";
// Constants
const PostComment_url = "/comments";
const ReplyComment_url = "/comments/reply/";
const ReportComments_url = "/comments/reported";

//Post new comment
export async function postNewCommentApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + PostComment_url;

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

//Delete Post
export async function deleteSpecificCommentApi(apiUrl, commentId, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + PostComment_url + "/" + commentId;

  //console.log("Token Send :", token);
  // console.log("url :", url);

  return await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

//Reply to comment
export async function replyCommentApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + ReplyComment_url;

  console.log("BodyObject :", bodyObject);
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

//Delete reply comment
export async function deleteSpecificReplyCommentApi(
  apiUrl,
  commentId,
  replyId,
  token
) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + ReplyComment_url + commentId + "/" + replyId;

  //console.log("Token Send :", token);
  // console.log("url :", url);

  return await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

export async function getReportComments(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + ReportComments_url;

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

// Get group chat reported messages
export async function getGroupChatReports(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + "/groupchat/reports";

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

// Update group chat report status
export async function updateGroupChatReportStatus(apiUrl, reportId, status, reviewNotes, reviewedBy, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + `/groupchat/reports/${reportId}`;

  return await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      status,
      reviewNotes,
      reviewedBy,
    }),
  });
}

// Admin delete group chat message
export async function adminDeleteGroupChatMessage(apiUrl, messageId, adminId, reason, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + `/groupchat/admin/${messageId}`;

  return await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      adminId,
      reason,
    }),
  });
}
