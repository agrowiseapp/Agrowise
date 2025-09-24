import { returnUrl } from "./settings/returnUrl";
// Constants
const GetPosts_url = "/posts";
const GetPostsWithComments_url = "/posts/userCommented";

//Get all posts Info
export async function getPostsApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetPosts_url;

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

//Get specific posts
export async function getSpecificPostApi(apiUrl, postId, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetPosts_url + "/" + postId;

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

//Get posts with Comments
export async function getPostsWithUserCommentsApi(apiUrl, userId, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetPostsWithComments_url + "/" + userId;

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
