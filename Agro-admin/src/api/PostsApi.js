import { returnUrl } from "./settings/returnUrl";
import imageCompression from "browser-image-compression";
// Constants
const GetPosts_url = "/posts";
const PostCreatePost = "/posts";
const UploadImage = "/upload/image";

// //Get all posts Info
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

// Get specific posts
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

//Publish a new post
export async function postCreateNewPostApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + PostCreatePost;

  //console.log("Token Send :", token);
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
export async function deleteSpecificPostApi(apiUrl, postId, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetPosts_url + "/" + postId;

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

export async function getPostsNumber(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetPosts_url + "/number";

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

export async function getImagesNumber(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + GetPosts_url + "/images/number";

  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

//Upload image to ImgBB
export async function uploadImageApi(apiUrl, imageData, filename, token) {
  let url = apiUrl + "/upload/image";
  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      imageData: imageData,
      filename: filename,
    }),
  });
}
