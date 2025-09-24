import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Onboarding from "react-native-onboarding-swiper";
import { useNavigation } from "@react-navigation/native";
import LoadingComponent from "../components/structure/LoadingComponent";

const OnboardScreen = () => {
  // 1) Data
  const navigation = useNavigation();
  const [Loading, setLoading] = useState(true);

  // 2) useEffect
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    return;
  }, []);

  // 3) Function
  const nextLabelFunction = () => {
    return (
      <>
        <View className=" bg-Main-500 px-3 py-2 rounded-full">
          <Text className="text-white">Επόμενο</Text>
        </View>
      </>
    );
  };
  return (
    <React.Fragment>
      {Loading ? (
        <View className="flex-1 justify-center items-center">
          <LoadingComponent />
        </View>
      ) : (
        <Onboarding
          onSkip={() => navigation.replace("Login")}
          onDone={() => navigation.replace("Login")}
          nextLabel={nextLabelFunction()}
          pages={[
            {
              backgroundColor: "#fff",
              image: (
                <Image
                  source={require("../assets/images/onboard1.gif")}
                  className="w-32 h-32 object-contain"
                />
              ),
              title: "ΚΑΛΩΣ ΗΡΘΑΤΕ",
              subtitle:
                "Ας ξεκινήσουμε μαζί το ταξίδι για να αξιοποιήσετε στο έπακρο όλες τις δυνατότητες που προσφέρουμε.",
            },
            {
              backgroundColor: "#fff",
              image: (
                <Image
                  source={require("../assets/images/onboard2.gif")}
                  className="w-32 h-32 object-contain"
                />
              ),
              title: "ΕΝΗΜΕΡΩΣΗ",
              subtitle:
                "Μείνετε ενημερωμένοι για τα τελευταία νέα και τις εξελίξεις σε θέματα που σας απασχολούν.",
            },
            {
              backgroundColor: "#fff",
              image: (
                <Image
                  source={require("../assets/images/onboard3.gif")}
                  className="w-32 h-32 object-contain"
                />
              ),
              title: "ΣΥΜΒΟΥΛΕΥΤΙΚΗ ΚΑΛΥΨΗ",
              subtitle:
                "Επικοινωνήστε μαζί μας για κάθε σας απορία και ανάγκη για συμβουλή.",
            },
          ]}
        />
      )}
    </React.Fragment>
  );
};

export default OnboardScreen;
