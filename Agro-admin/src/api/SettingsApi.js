import { returnUrl } from "./settings/returnUrl";
// Constants
const Settings_url = "/settings";
const serverSettings_url = "/serverSettings/";
const resetPassword_url = "/resetPassword/adminResetPassword";

// //Get all Settings
export async function getSettingsApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Settings_url;

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

// Post Settings
export async function postSettingsApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Settings_url;

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

export async function getSpecificSettingsApi(apiUrl, id, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Settings_url + "/" + id;

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

export async function getPolicyApi(apiUrl, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + Settings_url + serverSettings_url + "1";

  //console.log("Token Send :", token);
  console.log("url :", url);

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
export async function resetPasswordApi(apiUrl, bodyObject, token) {
  let url_request = apiUrl;
  url_request = await returnUrl(url_request);
  let url = url_request + resetPassword_url;

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
