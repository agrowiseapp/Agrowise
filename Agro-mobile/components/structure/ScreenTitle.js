import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Header } from "@rneui/base";

const ScreenTitle = ({ title, back, navigation }) => {
  return (
    <View style={styles.Container}>
      {back && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          className=" p-2"
        >
          <Ionicons
            style={styles.Icon}
            name="chevron-back"
            size={30}
            color="black"
          />
        </TouchableOpacity>
      )}
      <Text style={styles.Header}>{title}</Text>
    </View>
  );
};

export default ScreenTitle;

const styles = {
  Container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  Header: {
    padding: 0,
    margin: 0,
    color: "black",
    fontSize: 25,
    fontWeight: "bold",
  },
  Icon: {
    alignSelf: "center",
  },
};
