import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import colors from "../../../assets/Theme/colors";
import { useNavigation } from "@react-navigation/native";

const PostContent = ({ data, setShowModal }) => {
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);

  async function navigateToChat() {
    try {
      await navigation.navigate("Chat");
      await setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      {/* Show post image if exists */}
      {data?.imageUrl && (
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="large" color={colors.Main[500]} />
            </View>
          )}
          <Image
            source={{ uri: data.imageUrl }}
            style={styles.image}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </View>
      )}
      {/* Content */}
      <Text style={styles.contentText}>
        {data !== undefined ? data?.text : "Δεν βρέθηκε περιεχόμενο."}
      </Text>

      {/* Published from */}
      {data?.republished && (
        <View style={styles.republishedContainer}>
          <Text style={styles.republishedText}>Αναδημοσίευση από :</Text>
          <Text style={[styles.republishedSource, { color: colors.Main[700] }]}>
            {data.republished}
          </Text>
        </View>
      )}

      {/* Button to follow */}
      {data?.post_with_url && (
        <TouchableOpacity
          style={[styles.readMoreButton, { backgroundColor: colors.Main[700] }]}
          onPress={() => Linking.openURL(data.republished)}
        >
          <Text style={styles.readMoreButtonText}>
            Διαβάστε ολόκληρο το άρθρο εδώ
          </Text>
        </TouchableOpacity>
      )}

      {/* Ρωτήστε τον σύμβουλο */}
      <TouchableOpacity
        style={[styles.askButton, { borderColor: colors.Main[500] }]}
        onPress={navigateToChat}
      >
        <Text style={[styles.askButtonText, { color: colors.Main[500] }]}>
          Ρωτήστε τον Σύμβουλο
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  imageLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    resizeMode: "cover",
  },
  contentText: {
    fontSize: 16,
  },
  republishedContainer: {
    flex: 1,
    width: "100%",
    marginTop: 8,
    alignItems: "flex-end",
  },
  republishedText: {
    fontSize: 16,
    alignSelf: "flex-end",
  },
  republishedSource: {
    fontSize: 16,
    alignSelf: "flex-end",
  },
  readMoreButton: {
    borderRadius: 9999, // rounded-full
    padding: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  readMoreButtonText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  askButton: {
    borderRadius: 9999, // rounded-full
    padding: 8,
    marginTop: 20,
    borderWidth: 2,
  },
  askButtonText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default PostContent;
