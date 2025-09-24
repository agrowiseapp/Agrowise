import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import SimpleIcons from "../icons/SimpleIcons";

function IconButton({ name, size, color, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <SimpleIcons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 12,
    marginTop: 20,
    borderRadius: 9999, // Corresponds to rounded-full
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    padding: 12, // Corresponds to p-3
  },
});

export default IconButton;
