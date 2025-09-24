import { returnUrl } from "./settings/returnUrl";
// Constants
const Login_url = "/user/login";
const Register_url = "/user/signup";
const UserInfo_url = "/user/userInfo";
const DeleteUser_url = "/user/delete";
const EditUser_url = "/user/edit";
const LoginWithGoogle_url = "/user/loginWithGoogle";

//Login Api
export async function loginUserApi(apiUrl, bodyObject) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + Login_url;

  //console.log("Object :", bodyObject);
  console.log("LOGIN url :", url);

  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyObject),
  });
}

//Register Api
export async function registerUserApi(apiUrl, bodyObject, key) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + Register_url;

  //console.log("Object :", bodyObject);
  //console.log("url :", url);

  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: key,
    },
    body: JSON.stringify(bodyObject),
  });
}

//User Info Api
export async function UserInfoApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + UserInfo_url;

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

//Delete user
export async function deleteUserApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + DeleteUser_url;

  //console.log("Token Send :", token);
  console.log("url :", url);

  return await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
}

//Edit user Api
export async function editUserApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + EditUser_url;

  //console.log("Object :", bodyObject);
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

//Login or Register with login
export async function googleLoginApi(apiUrl, bodyObject) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  url = url_request + LoginWithGoogle_url;

  console.log("Object :", bodyObject);
  console.log("url :", url);

  return await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyObject),
  });
}
