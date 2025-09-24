import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import SimpleIcons from "../icons/SimpleIcons";
import React from "react";
import colors from "../../assets/Theme/colors";

const Search = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.iconWrapper}>
        <SimpleIcons name="search" size={24} color={colors.Main[800]} />
      </Text>
      <TextInput
        style={[styles.textInput, { color: colors.Main[800] }]}
        placeholder="Aναζήτηση"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e5e7eb", // Corresponds to bg-gray-200
    marginHorizontal: 12, // Corresponds to mx-3
    paddingHorizontal: 12, // Corresponds to px-3
    paddingVertical: 8, // Corresponds to py-2
    borderRadius: 9999, // Corresponds to rounded-full
    flexDirection: "row", // Corresponds to flex-row
    alignItems: "center", // Corresponds to items-center
    marginBottom: 12, // Corresponds to mb-3
  },
  iconWrapper: {
    marginLeft: 4, // Corresponds to ml-1
    marginRight: 12, // Corresponds to mr-3
  },
  textInput: {
    flex: 1, // Corresponds to flex-1
    flexDirection: "row", // Corresponds to flex-row
    alignItems: "center", // Corresponds to items-center
    fontSize: 18, // Corresponds to text-lg
    backgroundColor: "transparent",
  },
});

export default Search;
