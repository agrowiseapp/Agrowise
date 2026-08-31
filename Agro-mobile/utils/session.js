import { Alert } from "react-native";
import AsyncStorage from "./AsyncStorage";
import socketService from "../services/socketService";
import FirebaseAuthService from "../services/FirebaseAuthService";
import { resetTo } from "../navigation/navigationRef";

/**
 * Everything written during a signed-in session.
 *
 * Deliberately NOT cleared here:
 *   trialPeriod        - device-level guest preference, not user data
 *   rcEntitlementCache - device-level subscription cache (subscriptions are
 *                        tied to the store account, not the app account)
 *   ProMembership      - mirror of the above, owned by useRevenueCat
 *   deviceToken        - push token belongs to the device
 *   rememberedUsername - kept so the login field stays prefilled
 */
const SESSION_KEYS = [
  "userToken",
  "userInfo",
  "chatId",
  "firebaseUser",
  "googleUser",
  "googleTokens",
  "rememberedPassword",
  "initialFilter",
  "commentsNotifications",
  "chatNotifications",
];

/**
 * Tear down the whole session: storage, realtime socket and Firebase/Google.
 * Safe to call from anywhere, including outside React.
 *
 * @param {{ redirect?: boolean }} options
 */
export async function clearSession(options = {}) {
  const { redirect = true } = options;

  // 1) Kill the realtime connection first - it is authenticated with the
  //    outgoing user's token and would otherwise outlive the logout.
  try {
    socketService.disconnect();
  } catch (e) {
    // ignore
  }

  // 2) Sign out of Firebase / Google so the next user gets a fresh chooser.
  try {
    await FirebaseAuthService.signOut();
  } catch (e) {
    // ignore - a missing Google session is not an error here
  }

  // 3) Wipe stored session data.
  await Promise.all(
    SESSION_KEYS.map((key) => AsyncStorage.removeItem(key).catch(() => {}))
  );

  // 4) Send the user back to a clean Login stack (no signed-in screens left
  //    underneath, so hardware-back cannot walk into the old session).
  if (redirect) {
    resetTo("Login");
  }
}

/**
 * Called when the backend tells us the token is no longer valid.
 * Same teardown, but phrased as an expiry rather than a user action.
 */
export async function handleExpiredSession() {
  await clearSession({ redirect: true });
}

/** Only these mean "your token is dead". Everything else is a network issue. */
export function isAuthFailure(status) {
  return status === 401 || status === 403;
}

/**
 * Single place that decides what a failed request looks like to the user.
 *
 * Previously every failure - including a dropped packet - claimed the account
 * had been idle too long and pushed the user to the login screen.
 *
 * @param {number|undefined} status HTTP status, or undefined if the request
 *                                  never got a response (offline, timeout).
 */
export function reportApiFailure(status) {
  if (isAuthFailure(status)) {
    Alert.alert(
      "Η σύνδεση έληξε",
      "Για την ασφάλειά σας χρειάζεται να συνδεθείτε ξανά.",
      [{ text: "Σύνδεση", onPress: () => handleExpiredSession() }]
    );
    return;
  }

  Alert.alert(
    "Πρόβλημα σύνδεσης",
    "Ελέγξτε τη σύνδεσή σας στο internet και δοκιμάστε ξανά."
  );
}

export default clearSession;
