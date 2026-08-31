/**
 * Public store listings for AgroWise.
 *
 * iOS id comes from google-services.json ("app_store_id": "6451444453").
 * Android id is the applicationId in app.json ("aggro.application").
 * Update here if either ever changes - nothing else hardcodes them.
 */
export const APP_STORE_URL = "https://apps.apple.com/app/id6451444453";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=aggro.application";

/** Message the user sends to a friend, with the store link appended. */
export const buildShareMessage = (storeUrl) =>
  `Δες την εφαρμογή AgroWise! Ενημέρωση, συμβουλές και συζητήσεις για αγρότες και κτηνοτρόφους.\n\n${storeUrl}`;
