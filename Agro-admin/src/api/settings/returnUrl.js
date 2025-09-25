const Use_Localhost_BaseUrl = false;

export const returnUrl = (url) => {
  //console.log("called");
  if (Use_Localhost_BaseUrl) {
    url = "http://localhost:3001";
    //url = "http://192.168.2.7:3001";
    //url = "http://192.168.1.77:3001";
    //url = "http://192.168.1.178:3001";
    //url = "http://192.168.1.177:3001";
  } else {
    url = "https://agrowise-production.up.railway.app";
  }
  return url;
};
