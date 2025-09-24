import AsyncStorage from "../../utils/AsyncStorage";
import React from "react";

async function CheckIsPro({ value }) {
  let result = await AsyncStorage.getItem("isPro", "true");
  console.log("Checking result if is pro from function :", result);
  return result;
}

export default CheckIsPro;
