import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import colors from "../../assets/Theme/colors";

const Search = () => {
  return (
    <View className="bg-gray-200 mx-3 px-3 py-2 rounded-full flex-row items-center mb-3">
      <Text className="ml-1 mr-3">
        <AntDesign name="search1" size={24} color={colors.Main[800]} />
      </Text>
      <TextInput
        style={{ color: colors.Main[800] }}
        className=" flex-1 flex-row items-center text-lg"
        placeholder="Aναζήτηση"
      />
    </View>
  );
};

export default Search;
