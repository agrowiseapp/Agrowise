import { returnUrl } from "./settings/returnUrl";
// Constants
const PostComment_url = "/comments";
const ReplyComment_url = "/comments/reply/";

//Post new comment
export async function postNewCommentApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + PostComment_url;

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

//Delete Comment
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

//Report Comment
export async function reportCommentApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + PostComment_url + "/" + bodyObject.commentId;

  //  console.log("Token Send :", token);
  //console.log("url :", url);

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

//Report Reply Comment
export async function reportReplyApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url =
    url_request +
    ReplyComment_url +
    bodyObject.commentId +
    "/" +
    bodyObject.replyId;

  console.log("Body Send :", bodyObject);
  console.log("url :", url);

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
