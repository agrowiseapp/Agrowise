import { createNavigationContainerRef, CommonActions } from "@react-navigation/native";

/**
 * Lets code outside React components (push-notification handlers, the session
 * helper) drive navigation.
 */
export const navigationRef = createNavigationContainerRef();

/** Queue for taps that arrive before the navigator has mounted. */
let pendingAction = null;

const runOrQueue = (action) => {
  if (navigationRef.isReady()) {
    action();
  } else {
    pendingAction = action;
  }
};

/** Call once the navigator is ready to flush anything that arrived early. */
export const flushPendingNavigation = () => {
  if (pendingAction && navigationRef.isReady()) {
    const action = pendingAction;
    pendingAction = null;
    action();
  }
};

export const navigate = (name, params) => {
  runOrQueue(() => navigationRef.navigate(name, params));
};

/**
 * Navigate to a tab inside the "Main" bottom-tab navigator.
 */
export const navigateToTab = (tabName, params) => {
  runOrQueue(() =>
    navigationRef.navigate("Main", { screen: tabName, params })
  );
};

/** Wipe the whole history and land on a single screen (used by logout). */
export const resetTo = (name) => {
  runOrQueue(() =>
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name }] })
    )
  );
};
