import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Share,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SimpleIcons from "../icons/SimpleIcons";
import colors from "../../assets/Theme/colors";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  buildShareMessage,
} from "../../constants/storeLinks";

/**
 * "Recommend our app" card for the Home screen.
 *
 * The card itself looks and behaves like the other Home cards. Tapping it
 * opens a bottom sheet holding the explanation and the two store buttons.
 *
 * Each store button opens the native share sheet with that store's link, so
 * the user can send it to a friend. Opening the store page directly would be
 * pointless - whoever taps already has the app installed.
 */
const ShareAppCard = () => {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareLink = async (storeUrl) => {
    // The share sheet is modal; guard against a double tap opening two.
    if (isSharing) return;
    setIsSharing(true);
    try {
      const result = await Share.share({
        message: buildShareMessage(storeUrl),
        title: "AgroWise",
      });
      if (result.action === Share.sharedAction) {
        setIsOpen(false);
      }
    } catch (error) {
      // Dismissing the sheet is not an error worth surfacing.
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Μοιράσου το AgroWise"
        style={styles.card}
      >
        <View style={styles.cardRow}>
          <View style={styles.badge}>
            <SimpleIcons name="share" size={24} color={colors.Main[600]} />
          </View>

          {/* No chevron here on purpose - it frees the width the subtitle
              needs to stay on a single line. */}
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>ΜΟΙΡΑΣΟΥ ΤΟ AGROWISE</Text>
            <Text style={styles.cardSub}>Πρότεινέ την σε κάποιον φίλο.</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalRoot}>
          {/* Sibling rather than parent, so taps on the sheet never reach it. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsOpen(false)}
            accessibilityLabel="Κλείσιμο"
          />

          <View style={[styles.sheet, { paddingBottom: 28 + insets.bottom }]}>
            <View style={styles.grabber} />

            <View style={styles.sheetHead}>
              <View style={[styles.badge, styles.sheetBadge]}>
                <SimpleIcons name="share" size={24} color={colors.Main[600]} />
              </View>
              <Text style={styles.sheetTitle}>ΜΟΙΡΑΣΟΥ ΤΟ AGROWISE</Text>
            </View>

            <Text style={styles.sheetBody}>
              Σου αρέσει η εφαρμογή; Στείλε την σε έναν φίλο και βοήθησέ τον να
              μένει ενημερωμένος. Διάλεξε κατάστημα ανάλογα με το κινητό που
              έχει.
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                onPress={() => shareLink(APP_STORE_URL)}
                disabled={isSharing}
                accessibilityRole="button"
                accessibilityLabel="Μοιράσου τον σύνδεσμο για iPhone"
                style={[styles.storeBtn, isSharing && styles.storeBtnDisabled]}
              >
                <SimpleIcons
                  name="apple"
                  size={16}
                  color={colors.Text.inverse}
                />
                <Text style={styles.storeBtnText}>iOS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => shareLink(PLAY_STORE_URL)}
                disabled={isSharing}
                accessibilityRole="button"
                accessibilityLabel="Μοιράσου τον σύνδεσμο για Android"
                style={[styles.storeBtn, isSharing && styles.storeBtnDisabled]}
              >
                <SimpleIcons
                  name="playstore"
                  size={16}
                  color={colors.Text.inverse}
                />
                <Text style={styles.storeBtnText}>Android</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              accessibilityRole="button"
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Κλείσιμο</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Matches the other Home cards exactly.
  card: {
    backgroundColor: colors.Surface.primary,
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
    shadowColor: colors.Shadow.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.Border.light,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 45,
    height: 45,
    borderRadius: 16,
    backgroundColor: colors.Main[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.Text.primary,
    marginBottom: 5,
  },
  cardSub: {
    fontSize: 16,
    color: colors.Text.secondary,
    lineHeight: 18,
  },

  // Bottom sheet
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  sheet: {
    backgroundColor: colors.Surface.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 24,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.Border.medium,
    alignSelf: "center",
    marginBottom: 18,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetBadge: {
    marginRight: 12,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.Text.primary,
  },
  sheetBody: {
    fontSize: 15,
    color: colors.Text.secondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  storeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.Main[600],
    borderRadius: 10,
    paddingVertical: 9,
  },
  storeBtnDisabled: {
    opacity: 0.6,
  },
  storeBtnText: {
    color: colors.Text.inverse,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },
  closeBtn: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.Text.tertiary,
  },
});

export default ShareAppCard;
