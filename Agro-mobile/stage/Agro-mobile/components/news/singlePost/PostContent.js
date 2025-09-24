import { View, Text, TouchableOpacity, Linking, Image } from "react-native";
import React from "react";
import colors from "../../../assets/Theme/colors";
import { useNavigation } from "@react-navigation/native";

const PostContent = ({ data, setShowModal }) => {
  // 1) Data
  const navigation = useNavigation();

  // 3) Functions
  async function navigateToChat() {
    try {
      await navigation.navigate("Chat");
      await setShowModal(false);
    } catch (error) {}
  }

  return (
    <View className="mt-5 px-1">
      {/* Show post image if exists */}
      {data?.imageUrl && (
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Image
            source={{ uri: data.imageUrl }}
            style={{
              width: "100%",
              height: 220,
              borderRadius: 12,
              resizeMode: "cover",
            }}
          />
        </View>
      )}
      {/* Content */}
      <Text className="text-base">
        {data !== undefined ? data?.text : "Δεν βρέθηκε περιεχόμενο."}
      </Text>

      {/* Published from */}
      {data?.republished !== undefined && data?.republished !== null && (
        <View className="flex w-full  mt-2">
          <Text className="text-base self-end">Αναδημοσίευση από :</Text>
          <Text
            className="text-base  self-end"
            style={{ color: colors.Main[700] }}
          >
            {data?.republished}
          </Text>
        </View>
      )}

      {/* Button to follow */}
      {data?.post_with_url !== null && data?.post_with_url !== undefined && (
        <TouchableOpacity
          className="rounded-full p-2 mt-5 shadow-sm"
          style={{ backgroundColor: colors.Main[700] }}
          onPress={() => {
            Linking.openURL(data?.republished);
          }}
        >
          <Text className="text-base text-white  text-center font-semibold">
            Διαβάστε ολόκληρο το άρθρο εδώ
          </Text>
        </TouchableOpacity>
      )}

      {/* Ρωτήστε τον σύμβουλο */}
      <TouchableOpacity
        className="rounded-full p-2 mt-5 border-2"
        style={{ borderColor: colors.Main[500] }}
        onPress={navigateToChat}
      >
        <Text
          className="text-base  text-center font-semibold"
          style={{ color: colors.Main[500] }}
        >
          Ρωτήστε τον Σύμβουλο
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PostContent;
