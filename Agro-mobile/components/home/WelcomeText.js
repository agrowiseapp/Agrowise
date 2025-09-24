import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";

const WelcomeText = () => {
  // 1) Data
  const [welcome, setwelcome] = useState(null);

  // 2) UseEffect
  useEffect(() => {
    let text = generateGreetings();
    setwelcome(text);

    return;
  }, []);

  function generateGreetings() {
    var currentHour = moment().format("HH");

    if (currentHour >= 0 && currentHour < 12) {
      return "Καλημέρα";
    } else if (currentHour >= 12 && currentHour < 24) {
      return "Καλησπέρα";
    } else {
      return "Γεια σας";
    }
  }

  return (
    <>
      <View
        //style={{ color: colors.Main[100] }}
        className=" absolute bottom-14 ml-5 "
      >
        <Text className="text-4xl  text-white font-light"> {welcome},</Text>
      </View>
      <View className=" absolute bottom-5 font-semibold ml-5 ">
        <Text className="text-4xl  text-white"> Γιώργο</Text>
      </View>
    </>
  );
};

export default WelcomeText;
