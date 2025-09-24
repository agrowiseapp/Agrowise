import { returnUrl } from "./settings/returnUrl";
// Constants
const Login_url = "/user/login";
const Register_url = "/user/signup";
const UserInfo_url = "/user/userInfo";
const UserStats_url = "/user/userStats";
const User_url = "/user";
const EditAdmin_Url = "/user/editAdmin";
const Delete_user = "/deleteUser";

//Login Api
export async function loginUserApi(apiUrl, bodyObject) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Login_url;

  //console.log("Object :", bodyObject);
  //console.log("url :", url);

  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyObject),
  });
}

// //Register Api
export async function registerUserApi(apiUrl, bodyObject) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Register_url;

  //console.log("Object :", bodyObject);
  //console.log("url :", url);
  let authAppKey = "@gr0w1s3Application!@#123";

  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authAppKey,
    },
    body: JSON.stringify(bodyObject),
  });
}

// //User Info Api
export async function UserInfoApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + UserInfo_url;

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

// //User Stats
export async function UserStatsApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + UserStats_url;

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

// All users
export async function getAllUsersApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + User_url;

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

// Edit Admin
export async function editAdminApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + EditAdmin_Url;

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

// Delete user
export async function deleteUserApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + User_url + Delete_user;

  //console.log("Token Send :", token);
  //console.log("url :", url);

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
