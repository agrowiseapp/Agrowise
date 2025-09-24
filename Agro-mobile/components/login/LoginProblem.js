import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { Overlay } from "@rneui/base";
import colors from "../../assets/Theme/colors";

const LoginProblem = () => {
  //1) Data
  const [showOverlay, setshowOverlay] = useState(false);
  return (
    <View style={{ marginTop: 20 }}>
      <TouchableOpacity
        onPress={() => {
          setshowOverlay(true);
        }}
      >
        <Text style={{ marginLeft: 20, color: "#fff" }}>
          Πρόβλημα Σύνδεσης;
        </Text>
      </TouchableOpacity>

      {/* Terms & Policy modal */}
      <Overlay isVisible={showOverlay} onClose={() => setshowOverlay(false)}>
        <SafeAreaView style={{ backgroundColor: "#ffffff", flex: 1 }}>
          <ScrollView style={{ padding: 20 }}>
            {/* Terms of Use */}
            <View>
              <Text style={{fontSize: 20, fontWeight: 'bold'}}>Πρόβλημα Σύνδεσης</Text>

              {/* ΠΡΩΤΟ */}
              <View>
                <Text style={{ fontSize: 18, marginTop: 10 }}>
                  1) Έχω πρόβλημα με τον κωδικό μου :
                </Text>
                <Text style={{marginTop: 12}}>
                  Εαν έχετε ξεχάσει τον κωδικό σας, ή θέλετε να τον αλλάξετε ,
                  παρακαλώ επικοινωνήστε μαζί μας. Η ομάδα μας θα σας βοηθήσει
                  να λύσετε το πρόβλημα ή να αλλάξετε τον κωδικό σας άμεσα.
                </Text>
                <Text style={{marginTop: 12, marginBottom: 8}}>Στοιχεία επικοινωνίας :</Text>
                <Text>Τηλέφωνο : +30 6989593525 </Text>
                <Text>Ηλ. Ταχυδρομείο : Peroulakis@infoagro.gr</Text>
                <Text>Website : www.infoagro.gr</Text>
              </View>

              {/* ΔΕΥΤΕΡΟ */}
              <View>
                <Text style={{ fontSize: 18, marginTop: 10 }}>
                  2) Μεγάλοι χρόνοι φόρτωσης :
                </Text>
                <Text style={{marginTop: 12}}>
                  Η εφαρμογή της Agrowise κάνει συχνά αναβαθμίσεις και συντήρηση
                  της βάσης δεδομένων. Θα υπάρξουν στιγμές όπου οι χρόνοι
                  απόκρισης να είναι μεγαλύτεροι από το αναμενόμενο. Μην
                  ανησυχείτε, δεν υπάρχει πρόβλήμα με την λειτουργία της
                  εφαρμογής, πολύ γρήγορα οι χρόνοι θα επανέρθουν στα
                  φυσιολογικά.
                </Text>
                <Text style={{marginTop: 12, marginBottom: 8}}>
                  Σας ευχαριστούμε για την υπομονή σας.
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 30,
                marginBottom: 50,
              }}
            >
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: colors.Main[500],
                }}
                onPress={() => setshowOverlay(false)}
              >
                <Text
                  style={{
                    color: colors.Main[500],
                    fontWeight: "500",
                    fontSize: 16,
                  }}
                >
                  Πίσω
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Overlay>
    </View>
  );
};

export default LoginProblem;
