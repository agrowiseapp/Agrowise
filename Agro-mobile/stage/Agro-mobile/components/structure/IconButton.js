import React from "react";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

function IconButton({ name, size, color }) {
  return (
    <>
      <TouchableOpacity className="text-xl font-semibold mr-3 mt-5  rounded-full shadow-md p-3">
        <FontAwesome name={name} size={size} color={color} />
      </TouchableOpacity>
    </>
  );
}

export default IconButton;
